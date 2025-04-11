const UserModel = require("../models/User");
const { verifyToken } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return handleHttpError(res, "NOT_TOKEN", 401);
    }

    const token = req.headers.authorization.split(" ").pop();
    const dataToken = await verifyToken(token);

    if (!dataToken || !(dataToken._id || dataToken.id)) {
      return handleHttpError(res, "INVALID_TOKEN", 401);
    }

    const user = await UserModel.findById(dataToken._id || dataToken.id);
    if (!user) {
      return handleHttpError(res, "USER_NOT_FOUND", 404);
    }

    req.user = user;
    next();
  } catch (e) {
    handleHttpError(res, "NOT_SESSION", 401);
  }
};

module.exports = authMiddleware;