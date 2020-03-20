const { body } = require("express-validator");

const User = require("../models/user");

module.exports.signup = [
  body("email")
    .isEmail().withMessage("Please enter a valid email.")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });

      if (user) return new Error("User already exists.")
    }),

  body("password")
    .trim()
    .isLength({ min: 5 }),

  body("name")
    .trim()
    .not()
    .isEmpty(),
];