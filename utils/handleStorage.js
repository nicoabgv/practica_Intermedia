const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // Si el campo es "signature", guardar en /storage/firmas
    const folder = file.fieldname === "signature" ? "firmas" : "";
    const pathStorage = path.join(__dirname, `../storage/${folder}`);
    callback(null, pathStorage);
  },
  filename: function (req, file, callback) {
    // Mantener extensión original y añadir timestamp
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    callback(null, filename);
  }
});

const uploadMiddleware = multer({ 
  storage, 
  limits: { fileSize: 2 * 1024 * 1024 } // Límite: 2 MB
});

module.exports = { uploadMiddleware };