const sql = require('mssql');
const config = require('../../configs/sqlServerConfig');

// GET ALL EMPLOYEE TYPES //
exports.getAllEmployeeTypes = async (req, res) => {
    try 
    {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM CAT_EMPLOYEE_TYPE');
        res.status(200).json({response : result.recordset});
    }
    catch (err) 
    {
        res.status(500).json({
            status: 'ERROR',
            message: `Error al obtener Tipos de Empleado. ${err}`
        });
    }
};

// CREATE EMPLOYEE TYPE //
exports.createEmployeeType = async (req, res) => {
    const { EMPLOYEE_TYPE } = req.body;
    try 
    {
        const pool = await sql.connect(config);
        const existEmployeeType = await pool.request()
            .input('employee_type', sql.VarChar(50), EMPLOYEE_TYPE)
            .query('SELECT COUNT(*) AS count FROM CAT_EMPLOYEE_TYPE WHERE employee_type = @employee_type');

        if (existEmployeeType.recordset[0].count > 0) 
            return res.status(400).json({ message: 'El Tipo de Empleado ya existe'});
        
        const result = await pool.request()
            .input('jsonInput', sql.NVarChar(sql.MAX), JSON.stringify(jsonInput))
            .execute('sp_insert_employee_type');
            const response = result.recordset[0];
            const { JsonResponse } = response;
            res.status(200).json({response : JSON.parse(JsonResponse)});
    }
    catch (err) 
    {
        console.error('Error al crear tipo de empleado:', err);
        res.status(500).json({
            status: 'ERROR',
            message: `Error al crear el Tipo de Empleado. ${err}`
        });
    }
};

// UPDATE EMPLOYEE TYPE //
exports.updateEmployeeType = async (req, res) => {
    const { EMPLOYEE_TYPE } = req.body;
    try 
    {
        const pool = await sql.connect(config);
        const existEmployeeType = await pool.request()
            .input('employee_type', sql.VarChar(50), EMPLOYEE_TYPE)
            .query('SELECT COUNT(*) AS count FROM CAT_EMPLOYEE_TYPE WHERE employee_type = @employee_type');

        if (existEmployeeType.recordset[0].count > 0) 
            return res.status(400).json({ message: 'El Tipo de Empleado ya existe'});
        
        const result = await pool.request()
            .input('jsonInput', sql.NVarChar(sql.MAX), JSON.stringify(jsonInput))
            .execute('sp_update_employee_type');
            const response = result.recordset[0];
            const { JsonResponse } = response;
            res.status(200).json({response : JSON.parse(JsonResponse)});
    }
    catch (err) 
    {
        console.error('Error al crear tipo de empleado:', err);
        res.status(500).json({
            status: 'ERROR',
            message: `Error al crear el Tipo de Empleado. ${err}`
        });
    }
};