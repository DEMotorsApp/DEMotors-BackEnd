const sql = require('mssql')
const config = require('../../configs/sqlServerConfig')

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
                        cc.ADDRESS_CLIENT,
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
                    AND ces.DESCRIPTION_SERIE = @no_serie 
                    AND cc.ENTRY_DATE BETWEEN CONVERT(datetime, @start_date, 21) AND CONVERT(datetime, @end_date, 21)
                    FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER
                ) AS results
            `)

            const data = result.recordset.map((item) => {
                return JSON.parse(item.results)
            })
            res.status(200).json({
                response : data
            })
    } catch (err){ 
        console.log(err)
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener los detalles de los equipos'
        })
    }
}