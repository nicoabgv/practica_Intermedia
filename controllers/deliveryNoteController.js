const { matchedData } = require("express-validator");
const ProjectModel = require("../models/projectModel");
const { handleHttpError } = require("../utils/handleError");
const DeliveryNoteModel = require("../models/deliveryNoteModel");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const createNote = async (req, res) => {
  try {
    const body = matchedData(req);
    const user = req.user;

    const project = await ProjectModel.findOne({
      _id: body.project,
      $or: [{ user: user._id }, { company: user._id }],
    });

    if (!project) return handleHttpError(res, "PROJECT_NOT_FOUND", 404);

    const note = await DeliveryNoteModel.create({
      ...body,
      user: user._id,
      company: user._id,
    });

    res.status(201).send(note);
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_NOTE");
  }
};

const getNotes = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return handleHttpError(res, "USER_NOT_AUTHENTICATED", 401);

    const filter = { $or: [{ user: user._id }, { company: user._id }] };
    const notes = await DeliveryNoteModel.find(filter).populate("project");

    res.send(notes);
  } catch (e) {
    handleHttpError(res, "ERROR_GET_NOTES");
  }
};

const getNote = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = req.user;

    const note = await DeliveryNoteModel.findOne({
      _id: id,
      $or: [{ user: user._id }, { company: user._id }],
    })
      .populate({
        path: "project",
        populate: { path: "client", model: "clients" },
      });

    if (!note) return handleHttpError(res, "NOTE_NOT_FOUND", 404);
    res.send(note);
  } catch (e) {
    handleHttpError(res, "ERROR_GET_NOTE");
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = req.user;

    const note = await DeliveryNoteModel.findOne({
      _id: id,
      signed: false,
      $or: [{ user: user._id }, { company: user._id }],
    });

    if (!note) return handleHttpError(res, "NOTE_NOT_FOUND_OR_SIGNED", 400);

    await note.delete();
    res.send({ deleted: true });
  } catch (e) {
    handleHttpError(res, "ERROR_DELETE_NOTE");
  }
};

const signNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Debes subir una firma en formato imagen con el campo 'signature'" });
    }

    const note = await DeliveryNoteModel.findOne({
      _id: id,
      $or: [{ user: user._id }, { company: user._id }],
    });

    if (!note) return handleHttpError(res, "NOTE_NOT_FOUND", 404);
    if (note.signed) return handleHttpError(res, "NOTE_ALREADY_SIGNED", 400);

    note.signed = true;
    note.signature = `/storage/firmas/${file.filename}`;
    await note.save();

    res.status(200).json({
      message: "Albarán firmado correctamente",
      note,
    });
  } catch (e) {
    handleHttpError(res, "ERROR_SIGN_NOTE", 500);
  }
};

const generatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const note = await DeliveryNoteModel.findOne({
      _id: id,
      $or: [{ user: user._id }, { company: user._id }],
    })
      .populate({
        path: "project",
        populate: { path: "client", model: "clients" },
      })
      .populate("user");

    if (!note) return handleHttpError(res, "NOTE_NOT_FOUND", 404);

    const pdfPath = path.join(__dirname, `../storage/pdfs/albaran-${note._id}.pdf`);
    const doc = new PDFDocument();

    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(20).text("Albarán de Trabajo", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Usuario: ${note.user.email}`);
    doc.text(`Fecha: ${note.createdAt.toLocaleDateString()}`);
    doc.moveDown();

    doc.text(`Cliente: ${note.project.client.name}`);
    doc.text(`Proyecto: ${note.project.name}`);
    doc.text(`Descripción: ${note.project.description}`);
    doc.moveDown();

    if (note.type === "hours") {
      doc.text("Técnicos:");
      note.persons.forEach((p) => {
        doc.text(`- ${p.name}: ${p.hours} horas`);
      });
    } else if (note.type === "materials") {
      doc.text("Materiales:");
      note.materials.forEach((m) => {
        doc.text(`- ${m.name}: ${m.quantity} uds`);
      });
    }

    doc.moveDown();

    if (note.signature) {
      const signaturePath = path.join(__dirname, `../${note.signature}`);
      if (fs.existsSync(signaturePath)) {
        doc.text("Firma:", { underline: true });
        const ext = path.extname(signaturePath).toLowerCase();
        if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
          doc.image(signaturePath, { fit: [200, 100] });
        } else {
          doc.text("Firma: formato de imagen no soportado.");
        }
      } else {
        doc.text("Firma no disponible.");
      }
    }

    doc.end();

    writeStream.on("finish", () => {
      const publicUrl = `/storage/pdfs/albaran-${note._id}.pdf`;

      note.pdfUrl = publicUrl;
      note.save();

      res.status(200).json({
        message: "PDF generado correctamente",
        url: publicUrl,
      });
    });
  } catch (e) {
    handleHttpError(res, "ERROR_GENERATE_PDF", 500);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNote,
  deleteNote,
  signNote,
  generatePdf,
};