const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        // Guardamos los archivos en la carpeta "storage" local
        const pathStorage = __dirname + "/../storage";
        callback(null, pathStorage);
    },
    filename: function (req, file, callback) {
        // Creamos un nombre único con timestamp conservando la extensión original
        const ext = file.originalname.split(".").pop();
        const filename = `${file.fieldname}-${Date.now()}.${ext}`;
        callback(null, filename);
    }
});

const uploadMiddleware = multer({ 
    storage, 
    limits: { fileSize: 2 * 1024 * 1024 } // Límite de tamaño por archivo
});

module.exports = { uploadMiddleware };