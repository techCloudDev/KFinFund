const express = require("express");
const verifyToken =
  require("../middleware/authMiddleware");

const router = express.Router();

const {
  createSipController,
  getAllSipsController,
  getSipByIdController,
  updateSipController,
  cancelSipController,
  getMySipsController
} = require("../controllers/sipController");

router.post(
  "/",
  verifyToken,
  createSipController
);

router.get("/", getAllSipsController);

router.get(
  "/my-sips",
  verifyToken,
  getMySipsController
);

router.patch(
  "/:id/cancel",
  verifyToken,
  cancelSipController
);

router.get(
  "/:id",
  verifyToken,
  getSipByIdController
);

router.put(
  "/:id",
  verifyToken,
  updateSipController
);

module.exports = router;

