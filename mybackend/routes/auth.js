const controller = require('../controllers/auth');
const validator = require("../validators/auth");

const router = require("express").Router();

router.route("/signup").put(validator.signup, controller.signup);

router.route("/login").post(controller.login);

module.exports = router;

