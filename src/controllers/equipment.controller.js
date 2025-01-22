const sql = require('mssql')
const config = require('../../configs/sqlServerConfig')
const { default: axios } = require('axios')
const https = require('https')

const instance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
})

exports.createEquipment = async (req, res) => {
    const jsonInput = req.body
    try {
        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('jsonInput', sql.NVarChar(sql.MAX), JSON.stringify(jsonInput))
            .execute('sp_insert_equipment')
            const response = result.recordset[0]
            const { JsonResponse } = response
            res.status(200).json({ response: JSON.parse(JsonResponse) })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al inserte los datos del equipo'
        })
    }
}

const getImages64 = async ({ idClient, noSerie, startDate, endDate }) => {
    const images = []
    try {
        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('id_client', sql.Int, idClient)
            .input('no_serie', sql.VarChar, noSerie)
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
                AND ces.DESCRIPTION_SERIE = @no_serie
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

exports.getDetailsEquipment = async (req, res) => {
    const { idClient, noSerie, startDate, endDate } = req.params
    console.log(req.params)
    try {
        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('id_client', sql.Int, idClient)
            .input('no_serie', sql.VarChar, noSerie)
            .input('start_date', sql.VarChar, startDate)
            .input('end_date', sql.VarChar, endDate)
            .query(`
                SELECT (
                    SELECT
                        ces.DESCRIPTION_SERIE,
                        cc.ADDRESS,
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
                    AND ces.DESCRIPTION_SERIE = @no_serie 
                    AND cc.DATE_CREATED BETWEEN CONVERT(datetime, @start_date, 21) AND CONVERT(datetime, @end_date, 21)
                    FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER
                ) AS results
            `)

            const data = result.recordset.map((item) => {
                return JSON.parse(item.results)
            })

            const images = await getImages64({ idClient, noSerie, startDate, endDate })

            res.status(200).json({
                response : {
                    info: data,
                    images
                }
            })
    } catch (err){ 
        console.log(err)
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener los detalles de los equipos'
        })
    }
}