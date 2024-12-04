const sql = require('mssql')
const config = require('../../configs/sqlServerConfig')

exports.uploadImage = async (req, res) => {
  const {
    idServiceOrder
  } = req.body
  try {
    const pool = await sql.connect(config)
    const result = await pool.request()
      .input('idServiceOrder', sql.Int, idServiceOrder)
      .input('namePath', sql.VarChar(sql.MAX), req.file.filename)
      .query('INSERT INTO CAT_IMAGE_SERVICE (ID_SERVICES_ORDER, NAME_PATH) VALUES (@idServiceOrder, @namePath)')

    res.status(200).json({ response: 'Imagen subida exitosamente.', filePath: req.file.path })

  } catch (e) {
    console.log(e)
    res.status(500).json({
      status: 'ERROR',
      message: 'Error al insertar los datos de la imagen'
    })
  }
  if (!req.file) {
    return res.status(400).send({ message: 'No se subió ningún archivo.' });
  }
}

exports.getImages = async (req, res) => {
  const { idServiceOrder } = req.params
  try {
    let image = []
    const pool = await sql.connect(config)
    const result = await pool.request()
      .input('idServiceOrder', sql.Int, idServiceOrder)
      .query(`
          SELECT
            pso.NO_ORDER,
            cis.NAME_PATH,
            cc.FULL_NAME AS CLIENT,
            ce.ENGINE,
            ce.MODEL_1,
            ce.MODEL_2,
            ces.DESCRIPTION_SERIE AS SERIE
          FROM PRO_SERVICE_ORDER pso
          INNER JOIN CAT_IMAGE_SERVICE cis ON cis.ID_SERVICES_ORDER = pso.ID_SERVICE_ORDER
          INNER JOIN CAT_CLIENT cc ON pso.ID_CLIENT = cc.ID_CLIENT
          INNER JOIN CAT_EQUIPMENT ce ON pso.ID_EQUIPMENT = ce.ID_EQUIPMENT
          INNER JOIN CAT_EQUIPMENT_SERIE ces ON ce.ID_SERIE = ces.ID_SERIE
          WHERE cis.ID_SERVICES_ORDER = @idServiceOrder
        `)

    console.log('result => ', result)

    if (result.recordset && result.recordset.length > 0) {
      image = result.recordset.map((item) => ({
        ...item,
        NAME_PATH: `http://localhost:3200/api/image/static/${item.NAME_PATH}`
      }))
    }
        
    res.status(200).json({ response: image })
  } catch (e) {
    res.status(500).json({
      status: 'ERROR',
      message: `Error al obtener las imagenes ${e}`
    })
  }
  /* const image = [
    {
      id: 1, url: 'http://localhost:3000/uploads/1732662436229-164768132-prueba.jpeg'
    }
  ]

  res.status(200).json(image) */
}