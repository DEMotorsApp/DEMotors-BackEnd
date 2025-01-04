const sql = require('mssql')
const config = require('../../configs/sqlServerConfig')

exports.createClient = async (req, res) => {
    const {
    } = req.body
    const jsonInput = req.body
    try {
        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('jsonInput', sql.NVarChar(sql.MAX), JSON.stringify(jsonInput))
            .execute('sp_insert_client')
            const response = result.recordset[0]
            const { JsonResponse } = response
            res.status(200).json({ response: JSON.parse(JsonResponse) })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al insertar los datos del cliente'
        })
    }
}

exports.getClients = async (req, res) => {
    try {
        const pool = await sql.connect(config)
        const result = await pool.request().query('SELECT ID_CLIENT, FULL_NAME AS NAME_CLIENT FROM CAT_CLIENT cc')
        res.status(200).json({ response: result.recordset })
    } catch (err) {
        res.status(500).json({
            status: 'ERROR',
            message: `Error al obtener Clientes ${err}`
        });
    }
}

exports.getReportClientsEquipment = async (req, res) => {
    const { idClient, startDate, endDate } = req.params
    try {
        const pool = await sql.connect(config)
        const result = await pool.request()
        .input('id_client', sql.Int, idClient)
        .input('start_date', sql.VarChar, startDate)
        .input('end_date', sql.VarChar, endDate)
        .query(`
            SELECT (
                SELECT
                    cc.FULL_NAME as CLIENT,
                    cc.ADDRESS_CLIENT,
                    ces.DESCRIPTION_SERIE as NO_SERIE,
                    FORMAT(cc.ENTRY_DATE, 'dd/MM/yyyy') AS DATE,
                    CASE
                        WHEN pso.WORK_DONE = 1 THEN 'Trabajo Realizado'
                        ELSE 'Trabajo No Realizado'
                    END AS WORK_DONE,
                    CASE
                        WHEN pso.NO_ORDER IS NULL THEN 'No Existe'
                        ELSE pso.NO_ORDER
                    END AS NO_ORDER
                FROM DB_DEMOTORS_DESARROLLO.dbo.PRO_SERVICE_ORDER pso
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_CLIENT cc ON cc.ID_CLIENT =  pso.ID_CLIENT
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT ce ON ce.ID_EQUIPMENT = pso.ID_EQUIPMENT
                INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT_SERIE ces on ces.ID_SERIE = ce.ID_SERIE
                WHERE cc.ID_CLIENT = @id_client
                AND cc.ENTRY_DATE BETWEEN CONVERT(datetime, @start_date, 21) AND CONVERT(datetime, @end_date, 21)
                FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER
            ) AS results
        `)

        const data  = result.recordset.map((item) => {
                console.log('item => ', item)
                return JSON.parse(item.results)
        })

        res.status(200).json({ response: data })
    } catch (err) {
        res.status(500).json({
            status: 'ERROR',
            message: `Error al obtener Clientes ${err}`
        });
    }
}