const mongoose = require('mongoose');

const StorageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
}, { timestamps: true });

const storageModel = mongoose.model('Storage', StorageSchema);
module.exports = { storageModel };