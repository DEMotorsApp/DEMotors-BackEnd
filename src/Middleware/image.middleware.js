const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'C:/uploads'
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const timestamp = Date.now()
    const fileExtension = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}-${timestamp}${fileExtension}`)
  }
})

const upload = multer({ storage })

module.exports = {
  upload
}