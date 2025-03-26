const mongoose = require('mongoose');

// Modelo para guardar archivos subidos
const StorageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Guarda automáticamente createdAt y updatedAt

const storageModel = mongoose.model('Storage', StorageSchema);
module.exports = { storageModel };