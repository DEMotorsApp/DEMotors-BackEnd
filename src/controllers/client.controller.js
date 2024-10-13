const sql = require('mssql')
const config = require('../../configs/sqlServerConfig')

exports.createClient = async (req, res) => {
    const {
        FULL_NAME
    } = req.body
    const jsonInput = req.body
    try {
        const pool = await sql.connect(config)
        const exitsClient = await pool.request()
        .input('full_name', sql.NVarChar(100), FULL_NAME)
        .query('SELECT COUNT(*) AS count FROM CAT_CLIENT WHERE full_name = @full_name')

        if (exitsClient.recordset[0].count > 0)
            g

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