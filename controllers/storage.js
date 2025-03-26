const { storageModel } = require("../models/storageModel");

const createItem = async (req, res) => {
    const { file } = req;

    if (!file) {
        return res.status(400).send("Por favor, sube una imagen válida.");
    }

    const fileData = {
        filename: file.filename,
        url: `/storage/${file.filename}` // Ruta para servir el archivo desde el front
    };

    const data = await storageModel.create(fileData);
    res.status(201).json({
        message: "Archivo subido correctamente",
        data
    });
};

module.exports = { createItem };