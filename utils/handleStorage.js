const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const pathStorage = __dirname + "/../storage";
        callback(null, pathStorage);
    },
    filename: function (req, file, callback) {
        const ext = file.originalname.split(".").pop();
        const filename = `${file.fieldname}-${Date.now()}.${ext}`;
        callback(null, filename);
    }
});

const uploadMiddleware = multer({ 
    storage, 
    limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = { uploadMiddleware };