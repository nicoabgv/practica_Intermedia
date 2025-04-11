const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  validatorCreateProject,
  validatorUpdateProject,
  validatorId,
} = require("../validators/project");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getArchivedProjects,
  restoreProject,
} = require("../controllers/projectController");

router.use(authMiddleware);

router.get("/", getProjects);
router.get("/archived", getArchivedProjects);
router.get("/:id", validatorId, getProject);
router.delete("/:id", validatorId, deleteProject);
router.post("/", validatorCreateProject, createProject);
router.patch("/:id/recover", validatorId, restoreProject);
router.put("/:id", validatorUpdateProject, updateProject);

module.exports = router;