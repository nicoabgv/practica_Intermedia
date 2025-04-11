const { matchedData } = require("express-validator");
const ProjectModel = require("../models/projectModel");
const { handleHttpError } = require("../utils/handleError");

const createProject = async (req, res) => {
  try {
    const body = matchedData(req);
    const user = req.user;

    const alreadyExists = await ProjectModel.findOne({
      name: body.name,
      client: body.client,
      $or: [{ user: user._id }, { company: user._id }]
    });

    if (alreadyExists) return handleHttpError(res, "PROJECT_ALREADY_EXISTS", 409);

    const data = await ProjectModel.create({
      ...body,
      user: user._id,
      company: user._id,
    });

    res.status(201).send(data);
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_PROJECT");
  }
};

const getProjects = async (req, res) => {
  try {
    const user = req.user;
    const projects = await ProjectModel.find({
      $or: [{ user: user._id }, { company: user._id }],
    }).populate("client");
    res.send(projects);
  } catch (e) {
    handleHttpError(res, "ERROR_GET_PROJECTS");
  }
};

const getProject = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = req.user;

    const project = await ProjectModel.findOne({
      _id: id,
      $or: [{ user: user._id }, { company: user._id }],
    }).populate("client");

    if (!project) return handleHttpError(res, "PROJECT_NOT_FOUND", 404);
    res.send(project);
  } catch (e) {
    handleHttpError(res, "ERROR_GET_PROJECT");
  }
};

const updateProject = async (req, res) => {
  try {
    const { id, ...body } = matchedData(req);
    const user = req.user;

    const updated = await ProjectModel.findOneAndUpdate(
      { _id: id, $or: [{ user: user._id }, { company: user._id }] },
      body,
      { new: true }
    );

    if (!updated) return handleHttpError(res, "PROJECT_NOT_FOUND", 404);
    res.send(updated);
  } catch (e) {
    handleHttpError(res, "ERROR_UPDATE_PROJECT");
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const { type } = req.query;
    const user = req.user;

    const project = await ProjectModel.findOne({
      _id: id,
      $or: [{ user: user._id }, { company: user.company }]
    });

    if (!project) return handleHttpError(res, "PROJECT_NOT_FOUND", 404);

    if (type === "hard") {
      await ProjectModel.deleteOne({ _id: id });
      return res.send({ deleted: true, type: "hard" });
    }

    await project.delete();
    res.send({ deleted: true, type: "soft" });

  } catch (e) {
    handleHttpError(res, "ERROR_DELETE_PROJECT");
  }
};

const getArchivedProjects = async (req, res) => {
  try {
    const user = req.user;
    const projects = await ProjectModel.findWithDeleted({
      deleted: true,
      $or: [{ user: user._id }, { company: user._id }],
    });
    res.send(projects);
  } catch (e) {
    handleHttpError(res, "ERROR_GET_ARCHIVED_PROJECTS");
  }
};

const restoreProject = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = req.user;

    const project = await ProjectModel.findOneWithDeleted({
      _id: id,
      deleted: true,
      $or: [{ user: user._id }, { company: user._id }],
    });

    if (!project) return handleHttpError(res, "PROJECT_NOT_FOUND", 404);

    await project.restore();
    res.send({ restored: true });
  } catch (e) {
    handleHttpError(res, "ERROR_RESTORE_PROJECT");
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getArchivedProjects,
  restoreProject,
};