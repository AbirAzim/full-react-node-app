const { body } = require("express-validator");

module.exports.post = [
  body("title")
    .trim()
    .isLength({ min: 5 }),

  body("content")
    .trim()
    .isLength({ min: 5 }),
];

module.exports.put = [
  body("title")
    .trim()
    .isLength({ min: 5 }),

  body("content")
    .trim()
    .isLength({ min: 5 }),
];