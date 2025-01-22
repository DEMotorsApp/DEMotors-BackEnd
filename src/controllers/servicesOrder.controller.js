const sql = require('mssql')
const config = require('../../configs/sqlServerConfig')
const { default: axios } = require('axios')
const https = require('https')

const instance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
})

const getImages64 = async ({ idClient, startDate, endDate }) => {
    const images = []
    try {
        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('id_client', sql.Int, idClient)
            .input('start_date', sql.VarChar, startDate)
            .input('end_date', sql.VarChar, endDate)
            .query(`
                SELECT
                    psoi.IMAGE_NAME,
                    pso.NO_ORDER
                FROM DB_DEMOTORS_DESARROLLO.dbo.PRO_SERVICE_ORDER pso
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.PRO_SERVICE_ORDER_IMAGE psoi ON psoi.ID_SERVICE_ORDER = pso.ID_SERVICE_ORDER
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_CUSTOMER cc ON cc.ID_CUSTOMER =  pso.ID_CUSTOMER
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT ce ON ce.ID_EQUIPMENT = pso.ID_EQUIPMENT
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT_SERIE ces on ces.ID_SERIE = ce.ID_SERIE
                WHERE cc.ID_CUSTOMER = @id_client
                AND pso.DATE_CREATED BETWEEN CONVERT(datetime, @start_date, 21) AND CONVERT(datetime, @end_date, 21)    
            `)

        if (result.recordset && result.recordset.length > 0) {
            for await (const obj of result.recordset) {
                const response = await instance.get(`https://app.demotorsguatemala.com:3000/bucket/uploads/serviceOrderImages/${obj.NO_ORDER}/${obj.IMAGE_NAME}`, {
                    responseType: 'arraybuffer'
                })
                const imageBuffer = Buffer.from(response.data, 'binary')
                const base64Image = imageBuffer.toString('base64')
                const image64 = `data:${response.headers['content-type']};base64,${base64Image}`
                images.push(image64)
            }
        }
        return images
    } catch (e) {
        return []
    }
}

exports.getServicesOrders = async (req, res) => {
    const { idClient, startDate, endDate } = req.params
    try {
        console.log(idClient, startDate, endDate)
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id_client', sql.Int, idClient)
            .input('start_date', sql.VarChar, startDate)
            .input('end_date', sql.VarChar, endDate)
            .query(`
            SELECT (
                SELECT
                    cc.FULL_NAME as CLIENT,
                    cc.ADDRESS,
                    ces.DESCRIPTION_SERIE as NO_SERIE,
                    FORMAT(pso.DATE_CREATED, 'dd/MM/yyyy') AS DATE,
                    CASE
                        WHEN pso.WORK_DONE = 1 THEN 'Trabajo Realizado'
                        ELSE 'Trabajo No Realizado'
                    END AS WORK_DONE,
                    CASE
                        WHEN pso.NO_ORDER IS NULL THEN 'No Existe'
                        ELSE pso.NO_ORDER
                    END AS NO_ORDER
                FROM DB_DEMOTORS_DESARROLLO.dbo.PRO_SERVICE_ORDER pso
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_CUSTOMER cc ON cc.ID_CUSTOMER =  pso.ID_CUSTOMER
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT ce ON ce.ID_EQUIPMENT = pso.ID_EQUIPMENT
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT_SERIE ces on ces.ID_SERIE = ce.ID_SERIE
                WHERE cc.ID_CUSTOMER = @id_client
                AND pso.DATE_CREATED BETWEEN CONVERT(datetime, @start_date, 21) AND CONVERT(datetime, @end_date, 21) 
                FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER
            ) AS results
        `);
        const data = result.recordset.map((item) => {
            console.log('item => ', item)
            return JSON.parse(item.results)
        })
        const images = await getImages64({ idClient, startDate, endDate })

        res.status(200).json({ response: {
            info: data,
            images
        }})
    }
    catch (err) {
        res.status(500).json({
            status: 'ERROR',
            message: `Error al obtener Ordenes de servicio. ${err}`
        });
    }
};

exports.getClientServices = async (req, res) => {
    const { servicesOrder } = req.params
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('services_order', sql.VarChar, servicesOrder)
            .query(`
            SELECT
                cc.ID_CLIENT,
                cc.EMAIL,
                cc.ADDRESS_CLIENT,
                cc.PHONE_NUMBER,
                cc.NIT,
                cc.FULL_NAME,
                cc.ENTRY_DATE
            FROM PRO_SERVICE_ORDER_CLIENT psoc
            INNER JOIN CAT_CLIENT cc ON cc.ID_CLIENT = psoc.ID_CLIENT
            INNER JOIN PRO_SERVICE_ORDER pso ON pso.ID_SERVICE_ORDER = psoc.ID_SERVICE_ORDER
            WHERE pso.NO_ORDER = @services_order
        `);
        res.status(200).json({ response: result.recordset })
    }
    catch (err) {
        res.status(500).json({
            status: 'ERROR',
            message: `Error al obtener Ordenes de servicio. ${err}`
        });
    }
}

exports.createServicesOrder = async (req, res) => {
    const jsonInput = req.body
    try {
        console.log(jsonInput)
        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('jsonInput', sql.NVarChar(sql.MAX), JSON.stringify(jsonInput))
            .execute('sp_insert_services_order')
        console.log(result)
        const response = result.recordset[0]
        const { JsonResponse } = response
        res.status(200).json({ response: JSON.parse(JsonResponse) })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al inserte los datos de la orden de servicios'
        })
    }
}

exports.deleteClientServices = async (req, res) => {
    const { servicesOrder, idClient } = req.params
    try {
        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('services_order', sql.NVarChar(sql.MAX), servicesOrder)
            .input('id_client', sql.Int, idClient)
            .execute('sp_delete_client_services')
        const response = result.recordset[0]
        const { JsonResponse } = response
        res.status(200).json({ response: JSON.parse(JsonResponse) })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al eliminar datos del cliente en la orden de servicio'
        })
    }
}

exports.createClientServices = async (req, res) => {
    const jsonInput = req.body
    try {
        console.log(jsonInput)
        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('jsonInput', sql.NVarChar(sql.MAX), JSON.stringify(jsonInput))
            .execute('sp_insert_client_services')
        console.log(result)
        const response = result.recordset[0]
        const { JsonResponse } = response
        res.status(200).json({ response: JSON.parse(JsonResponse) })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al inserte los datos de la orden de servicios'
        })
    }
}

exports.validateServicesOrder = async (req, res) => {
    const { idServiceOrder } = req.params

    try {
        console.log('Entro la validacion')
        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('servicesOrder', sql.VarChar, idServiceOrder)
            .query(`
                SELECT COUNT(*) AS VALIDATE_SERVICES FROM PRO_SERVICE_ORDER pso WHERE NO_ORDER = @servicesOrder
            `)
        console.log('result => ', result)
        res.status(200).json({ response: result.recordset })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al validar las ordenes de servicio'
        })
    }
}