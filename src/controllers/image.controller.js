const sql = require('mssql')
const config = require('../../configs/sqlServerConfig')
const path = require('path')
const { default: axios } = require('axios')
const https = require('https')

const instance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
})

const moveFile = (file, uploadPath) => {
  return new Promise((resolve, reject) => {
    file.mv(uploadPath, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

exports.uploadImage = async (req, res) => {
  const {
    idServiceOrder
  } = req.body
  try {
    const {
      file
    } = req.files

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const newFileName = `${uniqueSuffix}-${timestamp}${fileExtension}`

    const uploadPath = path.join('/var/app/uploads', newFileName)

    await moveFile(file, uploadPath)

    const pool = await sql.connect(config)
    const result = await pool.request()
      .input('servicesOrder', sql.VarChar, idServiceOrder)
      .input('namePath', sql.VarChar(sql.MAX), newFileName)
      .execute('sp_insert_image')

    const response = result.recordset[0]
    const { JsonResponse } = response
    res.status(200).json({ response: JSON.parse(JsonResponse) })

  } catch (e) {
    console.log(e)
    res.status(500).json({
      status: 'ERROR',
      message: 'Error al insertar los datos de la imagen'
    })
  }
}

exports.getImagesReportEquipment = async (req, res) => {
  const { idClient, noSerie, startDate, endDate } = req.params
  try {
    const pool = await sql.connect(config)
    const result = await pool.request()
      .input('idClient', sql.Int, idClient)
      .input('no_serie', sql.VarChar, noSerie)
      .input('start_date', sql.VarChar, startDate)
      .input('end_date', sql.VarChar, endDate)
      .query(`
          SELECT
            NAME_PATH
          FROM CAT_IMAGE_SERVICE cis
          INNER JOIN PRO_SERVICE_ORDER pro ON pro.ID_SERVICE_ORDER = cis.ID_SERVICES_ORDER
          INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_CLIENT cc ON cc.ID_CLIENT =  pro.ID_CLIENT
          INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT ce ON ce.ID_EQUIPMENT = pro.ID_EQUIPMENT
          INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_EQUIPMENT_SERIE ces on ces.ID_SERIE = ce.ID_SERIE
          WHERE pro.ID_CLIENT = @idClient
          AND ces.DESCRIPTION_SERIE = @no_serie
          AND cc.ENTRY_DATE BETWEEN CONVERT(datetime, @start_date, 21) AND CONVERT(datetime, @end_date, 21)
      `)
      if (result.recordset && result.recordset.length > 0) {
        dataImagenes = result.recordset.map((item) => ({
          NOMBRE_IMAGEN: `http://localhost:3200/api/image/static/${item.NAME_PATH}`
        }))
      }
  
    res.status(200).json({ response: dataImagenes })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: 'ERROR',
      message: 'Error al obtener los detalles de los equipos'
    })
  }
}

exports.getImagesReportClient = async (req, res) => {
  const { idClient, startDate, endDate } = req.params
  try {
    let dataImagenes = []
    const pool = await sql.connect(config)
    const result = await pool.request()
      .input('idClient', sql.VarChar, idClient)
      .input('start_date', sql.VarChar, startDate)
      .input('end_date', sql.VarChar, endDate)
      .query(`
        SELECT
          NAME_PATH
        FROM CAT_IMAGE_SERVICE cis
        INNER JOIN PRO_SERVICE_ORDER pro ON pro.ID_SERVICE_ORDER = cis.ID_SERVICES_ORDER
        INNER JOIN DB_DEMOTORS_DESARROLLO.dbo.CAT_CLIENT cc ON cc.ID_CLIENT =  pro.ID_CLIENT
        WHERE pro.ID_CLIENT = @idClient
        AND cc.ENTRY_DATE BETWEEN CONVERT(datetime, @start_date, 21) AND CONVERT(datetime, @end_date, 21)
      `)

    if (result.recordset && result.recordset.length > 0) {
      dataImagenes = result.recordset.map((item) => ({
        NOMBRE_IMAGEN: `http://localhost:3200/api/image/static/${item.NAME_PATH}`
      }))
    }

    res.status(200).json({ response: dataImagenes })
  } catch (e) {
    res.status(500).json({
      status: 'ERROR',
      message: `Error al obtener las imagenes ${e}`
    })
  }
}

exports.getImages = async (req, res) => {
  const { idServiceOrder } = req.params
  try {
    let image = []
    const pool = await sql.connect(config)
    const result = await pool.request()
      .input('servicesOrder', sql.VarChar, idServiceOrder)
      .query(`
          SELECT
            pso.NO_ORDER,
            cis.IMAGE_NAME,
            cc.FULL_NAME AS CLIENT,
            ce.ENGINE,
            ce.MODEL_1,
            ce.MODEL_2,
            ces.DESCRIPTION_SERIE AS SERIE
          FROM PRO_SERVICE_ORDER pso
          INNER JOIN PRO_SERVICE_ORDER_IMAGE cis ON cis.ID_SERVICE_ORDER = pso.ID_SERVICE_ORDER
          LEFT OUTER JOIN CAT_CLIENT cc ON pso.ID_CUSTOMER = cc.ID_CLIENT
          LEFT OUTER JOIN CAT_EQUIPMENT ce ON pso.ID_EQUIPMENT = ce.ID_EQUIPMENT
          LEFT OUTER JOIN CAT_EQUIPMENT_SERIE ces ON ce.ID_SERIE = ces.ID_SERIE
          WHERE pso.NO_ORDER = @servicesOrder
        `)

    console.log('result => ', result)

    if (result.recordset && result.recordset.length > 0) {
      for await (const obj of result.recordset) {
        console.log(`https://app.demotorsguatemala.com:3000/bucket/uploads/serviceOrderImages/${obj.NO_ORDER}/${obj.IMAGE_NAME}`)
        const response = await instance.get(`https://app.demotorsguatemala.com:3000/bucket/uploads/serviceOrderImages/${obj.NO_ORDER}/${obj.IMAGE_NAME}`, {
          responseType: 'arraybuffer'
        })
        const imageBuffer = Buffer.from(response.data, 'binary')
        const base64Image = imageBuffer.toString('base64')
        const image64 = `data:${response.headers['content-type']};base64,${base64Image}`
        console.log('image64 => ', image64)
        image.push(image64)
        // ximage.push([...image, {...obj, prueba: image64}])
      }
    }
    delete result.recordset[0].IMAGE_NAME
    res.status(200).json({ response: {
      ...result.recordset[0],
      image
    } })
  } catch (e) {
    console.log(e)
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