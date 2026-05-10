const jwt = require('jsonwebtoken');

const authUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Not authorized, Login again" });
    }

    const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: token_decoded.id };
    next();
  } catch(error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = { authUser };