const sql = require('mssql');
const config = require('../../configs/sqlServerConfig');


// GET ALL EQUIPMENT SERIES //
exports.getAllEquipmentSeries = async (req, res) => {
    try 
    {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM CAT_EQUIPMENT_SERIE');
        res.status(200).json({response : result.recordset});
    }
    catch (err) 
    {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener series de equipo.'
        });
    }
};


// CREATE EQUIPMENT SERIE //
exports.createEquipmentSerie = async (req, res) => {
    const jsonInput = req.body;
    try 
    {
        const pool = await sql.connect(config);
        console.log(jsonInput)
        const result = await pool.request()
            .input('jsonInput', sql.NVarChar(sql.MAX), JSON.stringify(jsonInput))
            .execute('sp_insert_equipment_serie');
            console.log(result)
            const response = result.recordset[0];
            const { JsonResponse } = response;
            res.status(200).json({response : JSON.parse(JsonResponse)});

    } 
    catch (err) 
    {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al insertar serie de equipo.'
        });
    }
};