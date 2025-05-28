import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided." });
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Ensure we have a properly formatted user object
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };
    
    console.log('User data set for request:', req.user);
    
    if (!req.user.id) {
      return res.status(401).json({ success: false, message: "Invalid token: missing user ID." });
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
}; 