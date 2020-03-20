const User = require("../models/user");

module.exports.getStatus = async function (req, res, next) {
  try {
    const user = await User.findById(req.userId);

    return res.status(200).json({ status: user.status });
  } catch (e) {
    e.statusCode = 500;
    throw (e);
  }
}