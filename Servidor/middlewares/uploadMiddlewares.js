const multer = require("multer");
const fs = require("fs");
const path = require("path");


// Middleware para crear la carpeta si no existe
const createFolderIfNotExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  };
  
  // Configuración de multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const authorId = req.body.authorId;
      const folderPath = path.join("C:/htdocs/Matias/ICRR/Servidor/uploads", authorId.toString());
      createFolderIfNotExists(folderPath);
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const originalName = path.parse(file.originalname).name; // Obtiene el nombre original del archivo sin la extensión
      const extension = path.extname(file.originalname); // Obtiene la extensión del archivo
  
      cb(null, `${originalName}${extension}`);
    },
  });
  
  const upload = multer({ storage: storage });

  module.exports = {upload};