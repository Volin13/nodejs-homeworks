const { isValidObjectId } = require("mongoose");
const { HttpError } = require("../helpers");

const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) next(HttpError(404, `${id} - ID is not valid.`));
  next();
};

module.exports = validateId;
