const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @desc    Inscrire un nouvel utilisateur
 * @route   POST /api/auth/signup
 * @access  Public
 */

const signup = async (req, res) => {
  try {
    // 1. Retrieve form data
    const { username, email, password, userImage } = req.body;

    // 2. Validation: check that all fields are completed
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    // 3. Check if the email or username already exists in the database
    const emailExists = await User.findOne({ email });
    const usernameExists = await User.findOne({ username });
    if (emailExists) {
      return res.status(409).json({ message: "Email already exists" });
    }
    if (usernameExists) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // 4. PASSWORD HASHING (Security)
    // Step 1: Generate a "salt" - a random string
    // The number 10 = the "cost" of the hash (the higher it is, the more secure it is but slower)
    const passwordSalt = await bcrypt.genSalt(10);

    // Step 2: Hash the password with this salt
    // The resulting hash is a long string that cannot be unhashed
    const hashedPassword = await bcrypt.hash(password, passwordSalt);

    // 5. Create the user in MongoDB with the hashed password
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      userImage,
    });

    // 6. If creation was successful, generate a JWT token
    if (newUser) {
      // jwt.sign() creates a three-part token:
      // - Payload: the data to encode (here, the user ID)
      // - Secret: the secret key to sign the token (must be kept private)
      // - Options: validity period, algorithm, etc.
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "3d",
      });

      // 7. Return user info + token to the frontend
      return res.status(201).json({
        username: newUser.username,
        email: newUser.email,
        coverImage: newUser.coverImage,
        token,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data." });
    }
  } catch (error) {
    console.error("error creating registration.", error);
    res.status(500).json({
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

/**
 * @desc    Authentifier un utilisateur (connexion)
 * @route   POST /api/auth/login
 * @access  Public
 */

const login = async (req, res) => {
  try {
    // 1. Retrieve email and password from the form
    const { email, password } = req.body;
    // 2. Search the user by email in the database
    const userExists = await User.findOne({ email });

    // 3. Check if the user exists AND if the password is correct
    // bcrypt.compare() compares the plaintext password with the stored hash
    if (userExists && bcrypt.compare(password, userExists.password)) {
      // 4. Connection successful: generate a new token
      const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET, {
        expiresIn: "3d",
      });

      // 5. Return info + token
      res.status(200).json({
        _id: userExists._id,
        username: userExists.username,
        email: userExists.email,
        token,
      });
    } else {
      // If the email address doesn't exist OR the password is incorrect
      // We don't specify which one for security reasons
      return res.status(404).json({ message: "Incorrect email or password" });
    }
  } catch (error) {
    console.error("Error while login. ", error);
    res.status(500).json({ message: "Server Error while login" });
  }
};

module.exports = { signup, login };
