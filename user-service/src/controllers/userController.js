const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  createUser, getUserByEmail, getUserById,
  updateUserProfile, updatePassword
} = require("../models/userModel");

const pool = require("../config/db");

// ✅ Ensure refresh_tokens table exists
const initRefreshTokensTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Refresh tokens table ready");
  } catch (err) {
    console.error("❌ Failed to create refresh_tokens table:", err.message);
  }
};
initRefreshTokensTable();

// ✅ Generate tokens
const generateAccessToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "15m" } // 15 minutes
);

const generateRefreshToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
  { expiresIn: "24h" } // 24 hours — auto logout after 24hrs inactivity
);

const registerUser = async (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  try {
    const { full_name, email, password, phone, state, city } = req.body;
    if (!full_name || !email || !password || !phone)
      return res.status(400).json({ error: "All fields are required" });

    const existingUser = await getUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(full_name, email, hashedPassword, phone, state, city);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await getUserByEmail(email);
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password" });

    // ✅ Generate both tokens
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ✅ Save refresh token to DB with 24hr expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (token) DO NOTHING`,
      [user.id, refreshToken, expiresAt]
    );

    // ✅ Clean up expired tokens for this user
    await pool.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at < NOW()`,
      [user.id]
    );

    res.json({
      message: "Login successful",
      token: accessToken,           // ← frontend uses this as "token"
      refreshToken,
      expiresIn: 15 * 60,           // 15 minutes in seconds
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ Refresh token endpoint — called automatically by frontend
const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ error: "Refresh token required" });

    // Check if refresh token exists in DB and not expired
    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`,
      [refreshToken]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid or expired session. Please login again." });

    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh"
    );

    // ✅ Issue new access token
    const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

    // ✅ Update last activity — reset 24hr timer on activity
    await pool.query(
      `UPDATE refresh_tokens SET expires_at = $1 WHERE token = $2`,
      [new Date(Date.now() + 24 * 60 * 60 * 1000), refreshToken]
    );

    res.json({
      token: newAccessToken,
      expiresIn: 15 * 60,
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    return res.status(401).json({ error: "Invalid or expired session. Please login again." });
  }
};

// ✅ Logout — delete refresh token from DB
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [refreshToken]);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Logout failed" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const updatedUser = await updateUserProfile(req.user.id, full_name, phone);
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Profile update failed" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await getUserById(req.user.id);
    const dbUser = await getUserByEmail(user.email);
    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(req.user.id, hashedPassword);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Password update failed" });
  }
};

module.exports = { registerUser, loginUser, refreshTokenHandler, logoutUser, getProfile, updateProfile, changePassword };