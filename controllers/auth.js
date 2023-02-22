const { User } = require("../models/user");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const { SECRET_KEY } = process.env;

const { ctrlWrapper, HttpError } = require("../helpers");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashPassword });
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

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  setSubscription: ctrlWrapper(setSubscription),
};
