const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from "Bearer <token>"
  console.log(token);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key'); // Use your JWT secret
    console.log(decoded);
    req.user = decoded; // Store the user details in request object
    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = verifyToken;
