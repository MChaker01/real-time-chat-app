const User = require("../models/User");
const jwt = require("jsonwebtoken");

const protectRest = async (req, res, next) => {
  // 1. Check if the Authorization header exists and starts with "Bearer"
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Extract the token by removing the "Bearer" prefix
      // split(" ") divides the string into an array: ["Bearer", "token"]
      // [1] retrieves the second element (the token)
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify and decode the token with our secret key
      // decoded contains the payload: { id: "user_id", iat: ..., exp: ... }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Retrieve the user from MongoDB using the payload ID
      // .select("-password") excludes the hashed password for security
      // We attach the user to req so that it is accessible in subsequent routes
      req.user = await User.findById(decoded.id).select("-password");

      // 5. Everything is OK, proceed to the next middleware/route
      return next();
    } catch (error) {
      console.error(error);

      // If jwt.verify() fails (invalid, expired, or malformed token)
      // We send a 401 error and STOP execution with return
      return res.status(401).json({ message: "Unauthorized, invalid token" });
    }
  }

  // 6. If we arrive here, it means there is no Authorization header at all.
  // No need to check "if (!token)" because if a token existed, we would have already exited the function.
  return res.status(401).json({ message: "Unauthorized, no token." });
};

module.exports = { protectRest };
