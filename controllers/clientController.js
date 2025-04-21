const ClientModel = require("../models/clientModel");
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");

const createClient = async (req, res) => {
  try {
    const body = matchedData(req);
    const user = req.user;

    const alreadyExists = await ClientModel.findOne({
      name: body.name,
      $or: [{ user: user._id }, { company: user.companyInfo }],
    });

    if (alreadyExists) return handleHttpError(res, "CLIENT_ALREADY_EXISTS", 409);

    const data = await ClientModel.create({
      ...body,
      user: user._id,
      company: user.companyInfo?.name || null,
    });

    res.status(201).send(data);
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_CLIENT");
  }
};

const getClients = async (req, res) => {
  try {
    const user = req.user;
    const clients = await ClientModel.find({
      $or: [{ user: user._id }, { company: user.companyInfo }],
    });
    res.send(clients);
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CLIENTS");
  }
};

const getClient = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = req.user;
    const client = await ClientModel.findOne({
      _id: id,
      $or: [{ user: user._id }, { company: user.companyInfo }],
    });
    if (!client) return handleHttpError(res, "CLIENT_NOT_FOUND", 404);
    res.send(client);
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CLIENT");
  }
};

const updateClient = async (req, res) => {
  try {
    const { id, ...body } = matchedData(req);
    const user = req.user;

    const client = await ClientModel.findOneAndUpdate(
      { _id: id, $or: [{ user: user._id }, { company: user.company }] },
      body,
      { new: true }
    );

    if (!client) return handleHttpError(res, "CLIENT_NOT_FOUND", 404);
    res.send(client);
  } catch (e) {
    handleHttpError(res, "ERROR_UPDATE_CLIENT");
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { type } = req.query;
    const user = req.user;

    const client = await ClientModel.findOne({
      _id: id,
      $or: [{ user: user._id }, { company: user.company }]
    });

    if (!client) return handleHttpError(res, "CLIENT_NOT_FOUND", 404);

    if (type === "hard") {
      await ClientModel.deleteOne({ _id: id });
      return res.send({ deleted: true, type: "hard" });
    }

    await client.delete();
    res.send({ deleted: true, type: "soft" });

  } catch (e) {
    handleHttpError(res, "ERROR_DELETE_CLIENT");
  }
};

const getArchivedClients = async (req, res) => {
  try {
    const user = req.user;
    const clients = await ClientModel.findWithDeleted({
      deleted: true,
      $or: [{ user: user._id }, { company: user.companyInfo }],
    });
    res.send(clients);
  } catch (e) {
    handleHttpError(res, "ERROR_GET_ARCHIVED_CLIENTS");
  }
};

const restoreClient = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = req.user;

    const client = await ClientModel.findOneWithDeleted({
      _id: id,
      deleted: true,
      $or: [{ user: user._id }, { company: user.companyInfo }],
    });

    if (!client) return handleHttpError(res, "CLIENT_NOT_FOUND", 404);

    await client.restore();
    res.send({ restored: true });
  } catch (e) {
    handleHttpError(res, "ERROR_RESTORE_CLIENT");
  }
};

module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  getArchivedClients,
  restoreClient,
};