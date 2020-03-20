const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");

module.exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");

    error.statusCode = 422;
    error.data = errors.array();

    next(error);
  }

  const { email, name, password } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 12);
  const user = new User({ email, name, password: encryptedPassword });
  const result = await user.save();

  res.status(201).json({ message: "User created!", id: result._id });
}

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found.");

    error.statusCode = 401;

    next(error);
  }

  const checkPassword = bcrypt.compareSync(password, user.password);

  if (checkPassword) {
    const token = jwt.sign({ email: user.email, userId: user._id.toString() }, 'secret', { expiresIn: "1h" });

    res.status(200).json({ token, userId: user._id.toString() });
  } else {
    const error = new Error("Wrong password.");

    error.statusCode = 401;

    next(error);
  }

}