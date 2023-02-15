const express = require("express");
const ctrl = require("../../controllers/contacts");
const router = express.Router();

const { validateBody, validateId } = require("../../middlewares");

const { schemas } = require("../../models/contacts");

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
const {
  listContacts,
  addContact,
  getContactById,
  removeContact,
  updateContact,
} = require("../../contacts/contacts");
const HttpError = require("../../helpers/HttpError");
const Joi = require("joi");

const schemaContact = Joi.object({
  name: Joi.string().required().min(3).max(30),
  email: Joi.string()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
  phone: Joi.string().required().min(14).max(14),
});

router.get("/", async (_, res, next) => {
  try {
    const result = await listContacts();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);
    if (!contact) throw HttpError(404, `Contact ${contactId} not found`);
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = schemaContact.validate(body);
    if (error) throw HttpError(400, error.message);
    const contact = await addContact(body);
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await removeContact(contactId);
    if (!result) throw HttpError(404, `Contact ${contactId} not found`);
    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = schemaContact.validate(body);
    if (error) throw HttpError(400, error.message);

    const { contactId } = req.params;
    const contact = await updateContact({ id: contactId, ...body });
    if (!contact) throw HttpError(404, `Contact ${contactId} not found`);

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
