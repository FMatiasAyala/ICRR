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
    const folderPath = "C:/CMMS_Folder/ICRR/Servidor/contratos"; // Ruta donde guardar los archivos
    createFolderIfNotExists(folderPath);
    cb(null, folderPath); // Usar la carpeta especificada
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Mantener el nombre original del archivo
  },
});

// Configuración del middleware de multer
const contrato = multer({ storage: storage });

module.exports = { contrato };
