const express = require("express");

const { validateBody, authenticate, upload } = require("../../middlewares/");

const { schemas } = require("../../models/user");

const ctrl = require("../../controllers/auth");

const router = express.Router();
router.post("/register", validateBody(schemas.registerSchema), ctrl.register);
router.get("/verify/:verificationToken", ctrl.verify);
router.post(
  "/verify",
  validateBody(schemas.emailSchema),
  ctrl.resendVerificationToken
);
router.post("/login", validateBody(schemas.loginSchema), ctrl.login);
router.post("/logout", authenticate, ctrl.logout);
router.get("/current", authenticate, ctrl.getCurrent);
router.patch(
  "/",
  authenticate,
  validateBody(schemas.subscriptionSchema),
  ctrl.setSubscription
);
router.patch("/avatars", authenticate, upload.single("avatar"), ctrl.setAvatar);

module.exports = router;
