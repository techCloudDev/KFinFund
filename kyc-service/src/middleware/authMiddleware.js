const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
      
      return next();
    } catch (error) {
      return res.status(401).json({ error: "Not authorized, token invalid or expired" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, missing token" });
  }
};

module.exports = protect;