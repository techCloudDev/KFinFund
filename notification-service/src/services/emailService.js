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
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};
transporter.verify((error, success) => {
  if (error) {
    console.log("Verify Error:", error);
  } else {
    console.log("Mail Server Ready");
  }
});
module.exports = sendEmail;