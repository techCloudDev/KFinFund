const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  createUser,
  getUserByEmail
} = require("../models/userModel");

const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;
    const existingUser = await getUserByEmail(email);

if (existingUser) {
  return res.status(400).json({
    error: "Email already registered"
  });
}

    

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
      full_name,
      email,
      hashedPassword,
      phone
    );

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

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
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

module.exports = {
  registerUser,
  loginUser
};

