const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    pan_number: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    aadhaar_number: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kyc", kycSchema);