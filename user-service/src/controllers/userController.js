const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserProfile,
  updatePassword
} = require("../models/userModel");

const registerUser = async (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  try {
    const { full_name, email, password, phone } = req.body;

    // Input validation
    if (!full_name || !email || !password || !phone) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(full_name, email, hashedPassword, phone);

    res.status(201).json({
      message: "User registered successfully",
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Registration failed"
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Login failed"
    });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch profile"
    });
  }
};
const updateProfile = async (req, res) => {
  try {

    const { full_name, phone } = req.body;

    const updatedUser =
      await updateUserProfile(
        req.user.id,
        full_name,
        phone
      );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Profile update failed"
    });
  }
};
const changePassword = async (req, res) => {
  try {

    const { oldPassword, newPassword } = req.body;

    const user = await getUserById(req.user.id);

    const dbUser = await getUserByEmail(user.email);

    const isMatch = await bcrypt.compare(
      oldPassword,
      dbUser.password
    );

    if (!isMatch) {
      return res.status(400).json({
        error: "Current password is incorrect"
      });
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await updatePassword(
      req.user.id,
      hashedPassword
    );

    res.json({
      message: "Password updated successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Password update failed"
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword
};



