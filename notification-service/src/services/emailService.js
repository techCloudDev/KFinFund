const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"KFinFund" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
          <div style="background-color: #1a73e8; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">KFinFund</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333;">${text}</p>
            <hr style="border: none; border-top: 1px solid #ddd;"/>
            <small style="color: #999;">This is an automated email from KFinFund. Please do not reply to this email.</small>
          </div>
        </div>
      `
    });
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email Error:", error);
    throw error;
  }
};

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail Server Error:", error);
  } else {
    console.log("✅ Mail Server Ready");
  }
});

module.exports = sendEmail;
