const sql = require('mssql');
const config = require('../../configs/sqlServerConfig'); // Asegúrate de tener tu archivo de configuración de la base de datos


// GET ALL EMPLOYE TYPES //
exports.getAllEmployeeTypes = async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM CAT_TIPO_EMPLEADO');
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error al obtener tipos de empleados:', err);
        res.status(500).send('Error al obtener tipos de empleados');
    }
};


// CREATE EMPLOYEE TYPE //
exports.createEmployeeType = async (req, res) => {
    const { tipo_empleado } = req.body;
    try 
    {
        const pool = await sql.connect(config);
        const checkResult = await pool.request()
            .input('tipo_empleado', sql.VarChar(50), tipo_empleado)
            .query('SELECT COUNT(*) AS count FROM CAT_TIPO_EMPLEADO WHERE tipo_empleado = @tipo_empleado');

        if (checkResult.recordset[0].count > 0) 
        {
            return res.status(400).json({ message: 'El tipo de empleado ya existe' });
        }
        const result = await pool.request()
            .input('tipo_empleado', sql.VarChar(50), tipo_empleado)
            .query('INSERT INTO CAT_TIPO_EMPLEADO (tipo_empleado) VALUES (@tipo_empleado); SELECT SCOPE_IDENTITY() AS id');

        res.status(200).json({ message: 'Tipo de Empleado creado Exitosamente.', id: result.recordset[0].id, tipo_empleado });
    }
    catch (err) 
    {
        console.error('Error al crear tipo de empleado:', err);
        res.status(500).send('Error al crear tipo de empleado');
    }
};


// GET TYPE EMPLOYEE FOR ID//
exports.getEmployeeTypeById = async (req, res) => 
{
    const { idEmployee } = req.params;
    try 
    {
        const pool = await sql.connect(config);
        const result = await pool.request().input('id_tipo_empleado', sql.Int, idEmployee)
            .query('SELECT * FROM CAT_TIPO_EMPLEADO WHERE id_tipo_empleado = @id_tipo_empleado');
        if (result.recordset.length === 0) 
        {
            return res.status(404).send('Tipo de empleado no encontrado');
        }
        res.json(result.recordset[0]);
    } catch (err) 
    {
        console.error('Error al obtener tipo de empleado:', err);
        res.status(500).send('Error al obtener tipo de empleado');
    }
};


// UPDATE TYPE EMPLOYEE //
exports.updateEmployeeType = async (req, res) => {
    const { idT } = req.params;
    const { tipo } = req.body;
    try {
        const pool = await sql.connect(config);
        await pool.request().input('id_tipo_empleado', sql.Int, id)
            .input('tipo', sql.VarChar(50), tipo)
            .query('UPDATE CAT_TIPO_EMPLEADO SET tipo = @tipo WHERE id_tipo_empleado = @id_tipo_empleado');
        res.send('Tipo de empleado actualizado correctamente');
    } catch (err) {
        console.error('Error al actualizar tipo de empleado:', err);
        res.status(500).send('Error al actualizar tipo de empleado');
    }
};

// DELETE TYPE EMPLOYEE //
exports.deleteEmployeeType = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(config);
        await pool.request().query('DELETE FROM CAT_TIPO_EMPLEADO');
        res.send('Tipo de empleado eliminado correctamente');
    } catch (err) {
        console.error('Error al eliminar tipo de empleado:', err);
        res.status(500).send('Error al eliminar tipo de empleado');
    }
};


exports.createSurveyQuestion = async (req, res) => {
    const jsonInput = req.body;
    try 
    {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('jsonInput', sql.NVarChar(sql.MAX), JSON.stringify(jsonInput))
            .execute('sp_insert_survey_question');
            const response = result.recordset[0];
        if (response) 
        {
            const jsonResponse = JSON.parse(Object.values(response)[0]);
            res.status(200).json(jsonResponse);
        } else 
        {
            res.status(500).json({ status: 'ERROR', message: 'No response received' });
        }
    } catch (err) 
    {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al insertar pregunta de encuesta'
        });
    }
};