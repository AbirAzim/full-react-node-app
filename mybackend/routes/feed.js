const controller = require('../controllers/feed');
const validator = require("../validators/feed");
const middleware = require("../middleware/auth");

const router = require("express").Router();

router.route("/posts")
  .get(middleware.validateToken, controller.get)
  .post(middleware.validateToken, validator.post, controller.post);

router.route("/posts/:id")
  .get(middleware.validateToken, controller.getOne)
  .put(middleware.validateToken, validator.put, controller.put)
  .delete(middleware.validateToken, controller.delete);

module.exports = router;

