const { User } = require("../models/user");

const path = require("path");

const jimp = require("jimp");

const fs = require("fs/promises");

const jwt = require("jsonwebtoken");

const gravatar = require("gravatar");

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const bcrypt = require("bcryptjs");

const { SECRET_KEY } = process.env;

const { ctrlWrapper, HttpError } = require("../helpers");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const user = await User.create({
    name,
    email,
    password: hashPassword,
    avatarURL,
  });
  res.json({
    user: {
      email: user.email,
      subscription: "starter",
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(500, "Email or password is wrong");
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw HttpError(500, "Email or password is wrong");
  }
  const payload = { id: user._id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { token: null });
  res.status(204).json({});
};

const setSubscription = async (req, res) => {
  const { subscription } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { subscription },
    { new: true }
  );
  res.json({
    user: {
      name: user.name,
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const setAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "Avatar is required");
  }
  const { path: tempUpload, originalname } = req.file;

  try {
    const avatarImg = await jimp.read(tempUpload);
    avatarImg.resize(250, 250).write(tempUpload);
  } catch (err) {
    throw HttpError(500);
  }
  const { _id } = req.user;
  const fileName = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, fileName);
  const avatarURL = path.join("avatars", fileName);
  await fs.rename(tempUpload, resultUpload);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  setSubscription: ctrlWrapper(setSubscription),
  setAvatar: ctrlWrapper(setAvatar),
};
