const jwt = require("jsonwebtoken");

validateToken = (req, res, next) => {
  try {
    const header = req.get("Authorization");

    if (!header) {
      const error = new Error("Not authenticated.")
      error.statusCode = 401;
      throw error;
    }

    const token = header.split(" ")[1];
    const decodedToken = jwt.verify(token, "secret");

    if (!decodedToken) {
      const error = new Error("Not authenticated.")
      error.statusCode = 401;
      throw error;
    }

    req.userId = decodedToken.userId;

    next();
  } catch (e) {
    e.statusCode = 500;
    throw e;
  }
}

module.exports = { validateToken };