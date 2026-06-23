const bcrypt = require("bcryptjs");
const { createUser } = require("../models/userModel");

const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

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

module.exports = {
  registerUser
};
