const controller = require("../controllers/user");
const middleware = require("../middleware/auth")

const router = require("express").Router();

router.route("/status").get(middleware.validateToken, controller.getStatus);

module.exports = router;