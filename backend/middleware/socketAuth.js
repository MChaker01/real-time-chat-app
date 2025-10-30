const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 ** Route Protection Middleware
 ** This middleware checks if the user is authenticated before accessing a protected route.
 ** It extracts the JWT token from the handshake.auth, verifies it, and attaches the user to socket.
 **/

const protectSocket = async (socket, next) => {
  // 1. Extract token from socket.handshake.auth.token
  const token = socket.handshake.auth.token;

  // 2. Check if token exists
  if (token) {
    try {
      // 3. Verify and decode the token with our secret key
      // decoded contains the payload: { id: "user_id", iat: ..., exp: ... }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Retrieve the user from MongoDB using the payload ID
      // .select("-password") excludes the hashed password for security
      // The user is attached to req so that it is accessible in subsequent routes
      socket.user = await User.findById(decoded.id).select("-password");

      // 5. Everything is OK, proceed to the next middleware/route
      // The return statement stops the execution of this function
      return next();
    } catch (error) {
      // If jwt.verify() fails (invalid, expired, or malformed token)
      // We send a 401 error and STOP execution with return
      console.error(error);
      next(new Error("Unauthorized, invalid token"));
    }
  }

  // 6. If we arrive here, it means there is no token at all.
  // No need to check "if (!token)" because if a token existed, we would have already exited the function.
  return next(new Error("Unauthorized, no token"));
};

module.exports = { protectSocket };
