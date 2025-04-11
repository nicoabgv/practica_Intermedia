const handleHttpError = (res, message = "ERROR", code = 403) => {
    res.status(code).json({ error: message });
  };
  
  module.exports = { handleHttpError };