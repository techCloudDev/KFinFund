const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Resend } = require("resend");
const {
  createUser, getUserByEmail, getUserById,
  updateUserProfile, updatePassword
} = require("../models/userModel");

const pool = require("../config/db");
const resend = new Resend(process.env.RESEND_API_KEY);

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

// ✅ Ensure password_reset_tokens table exists
const initPasswordResetTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Password reset tokens table ready");
  } catch (err) {
    console.error("❌ Failed to create password_reset_tokens table:", err.message);
  }
};

initRefreshTokensTable();
initPasswordResetTable();

// ✅ Generate tokens
const generateAccessToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "15m" }
);

const generateRefreshToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
  { expiresIn: "24h" }
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

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (token) DO NOTHING`,
      [user.id, refreshToken, expiresAt]
    );

    await pool.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at < NOW()`,
      [user.id]
    );

    res.json({
      message: "Login successful",
      token: accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ error: "Refresh token required" });

    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`,
      [refreshToken]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid or expired session. Please login again." });

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh"
    );

    const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

    await pool.query(
      `UPDATE refresh_tokens SET expires_at = $1 WHERE token = $2`,
      [new Date(Date.now() + 24 * 60 * 60 * 1000), refreshToken]
    );

    res.json({ token: newAccessToken, expiresIn: 15 * 60 });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    return res.status(401).json({ error: "Invalid or expired session. Please login again." });
  }
};

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

// ✅ Forgot Password — generates a secure token, stores it in DB,
// sends a reset link to the user's email via Resend.
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await getUserByEmail(email);

    // ✅ Always return success even if email not found — prevents user enumeration
    // (an attacker shouldn't be able to discover which emails are registered)
    if (!user) {
      return res.status(200).json({ message: "If this email is registered, a reset link has been sent." });
    }

    // Generate a cryptographically secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user, then insert new one
    await pool.query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [user.id]);
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt]
    );

    // ✅ Build reset link — uses the frontend URL from env, falls back to localhost
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email via Resend
    await resend.emails.send({
      from: "KFinFund <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your KFinFund Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6C3AED, #8B5CF6); padding: 28px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">KFinFund</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your trusted mutual fund platform</p>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; margin: 0 0 12px;">Reset Your Password</h2>
            <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              We received a request to reset the password for your KFinFund account.
              Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}"
                style="background: linear-gradient(135deg, #6C3AED, #8B5CF6); color: white; padding: 14px 32px;
                border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 15px;
                display: inline-block;">
                Reset Password →
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0; text-align: center;">
              If you didn't request a password reset, you can safely ignore this email.<br/>
              Your password will not change.
            </p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            © 2025 KFinFund. All rights reserved.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ message: "If this email is registered, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({ error: "Failed to send reset email. Please try again." });
  }
};

// ✅ Reset Password — validates the token, updates the password, deletes the token.
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ error: "Token and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    // Look up the token — must exist and not be expired
    const result = await pool.query(
      `SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });

    const { user_id } = result.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(user_id, hashedPassword);

    // Delete the used token so it can't be reused
    await pool.query(`DELETE FROM password_reset_tokens WHERE token = $1`, [token]);

    // Also invalidate all refresh tokens so existing sessions are logged out
    await pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [user_id]);

    return res.status(200).json({ message: "Password reset successfully. Please login with your new password." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
};

module.exports = {
  registerUser, loginUser, refreshTokenHandler, logoutUser,
  getProfile, updateProfile, changePassword,
  forgotPassword, resetPassword,
};