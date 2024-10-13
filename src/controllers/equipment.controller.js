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