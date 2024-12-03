exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No se subió ningún archivo.' });
  }

  res.status(200).json({ response: 'Imagen subida exitosamente.', filePath: req.file.path })
}

exports.getImages = async (req, res) => {
  const image = [
    {
      id: 1, url: 'http://localhost:3000/uploads/1732662436229-164768132-prueba.jpeg'
    }
  ]

  res.status(200).json(image)
}