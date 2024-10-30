const sql = require('mssql')
const config = require('../../configs/sqlServerConfig')

exports.getServicesOrders = async (req, res) => {
    const { idClient, startDate, endDate } = req.params
    try 
    {
        console.log(idClient, startDate, endDate)
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('id_client', sql.Int, idClient)
        .input('start_date', sql.VarChar, startDate)
        .input('end_date', sql.VarChar, endDate)
        .query(`
            SELECT
                pso.NO_ORDER,
                cc.FULL_NAME as CLIENT,
                cc.ADDRESS_CLIENT,
                ces.DESCRIPTION_SERIE as NO_SERIE,
                FORMAT(cc.ENTRY_DATE, 'dd/MM/yyyy') AS DATE,
                CASE
                    WHEN pso.WORK_DONE = 1 THEN 'Trabajo Realizado'
                    ELSE 'Trabajo No Realizado'
                END AS WORK_DONE
            FROM DB_DEMOTORS_DESARROLLO.dbo.PRO_SERVICE_ORDER pso
            INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_CLIENT cc ON cc.ID_CLIENT =  pso.ID_CLIENT
            INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT ce ON ce.ID_EQUIPMENT = pso.ID_EQUIPMENT
            INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT_SERIE ces on ces.ID_SERIE = ce.ID_SERIE
            WHERE cc.ID_CLIENT = @id_client
            AND cc.ENTRY_DATE BETWEEN CONVERT(datetime, @start_date, 21) AND CONVERT(datetime, @end_date, 21)  
        `);
        console.log(result.recordset)
        res.status(200).json({response : result.recordset});
    }
    catch (err) 
    {
        res.status(500).json({
            status: 'ERROR',
            message: `Error al obtener Ordenes de servicio. ${err}`
        });
    }
};

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