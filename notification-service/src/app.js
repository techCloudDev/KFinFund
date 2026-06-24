require("dotenv").config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  process.env.EMAIL_PASS
    ? "PASS FOUND"
    : "PASS MISSING"
);
const express = require("express");
const cors = require("cors");

const connectDB =
  require("./config/db");

const notificationRoutes =
  require("./routes/notificationRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use(
  "/api/notifications",
  notificationRoutes
);

app.get("/", (req, res) => {
  res.json({
    message:
      "Notification Service Running"
  });
});

const PORT =
  process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(
    `✅ Notification Service running on port ${PORT}`
  );
});