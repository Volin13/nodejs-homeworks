const express = require("express");

const ctrl = require("../../controllers/contacts");

const { validateBody, validateId } = require("../../middlewares");

const { schemas } = require("../../models/contacts");

const router = express.Router();

router.get("/", ctrl.getAll);

router.get("/:id", validateId, ctrl.geById);

router.post("/", validateBody(schemas.addSchema), ctrl.add);

router.put(
  "/:id",
  validateId,
  validateBody(schemas.addSchema),
  ctrl.updateById
);

router.patch(
  "/:id/favorite",
  validateId,
  validateBody(schemas.updateFavoriteSchema),
  ctrl.updateFavoriteById
);

router.delete("/:id", validateId, ctrl.deleteById);

module.exports = router;
