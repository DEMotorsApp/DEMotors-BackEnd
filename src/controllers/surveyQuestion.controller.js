const sql = require('mssql');
const config = require('../../configs/sqlServerConfig');


// GET ALL QUESTIONS //
exports.getAllQuestion = async (req, res) => {
    try 
    {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM CAT_SURVEY_QUESTIONS');
        res.status(200).json({response : result.recordset});
    }
    catch (err) 
    {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al obtener preguntas de encuesta.'
        });
    }
};


// CREATE QUESTION //
exports.createSurveyQuestion = async (req, res) => {
    const jsonInput = req.body;
    try 
    {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('jsonInput', sql.NVarChar(sql.MAX), JSON.stringify(jsonInput))
            .execute('sp_insert_survey_question');
            const response = result.recordset[0];
            const { JsonResponse } = response;
            res.status(200).json({response : JSON.parse(JsonResponse)});

    } 
    catch (err) 
    {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al insertar pregunta de encuesta.'
        });
    }
};