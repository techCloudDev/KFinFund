const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    full_name: {
      type: String,
      required: true,
      trim: true
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
    documents: {
      selfie_url: {
        type: String,
        required: true
      },
      signature_url: {
        type: String,
        required: true
      }
    },
    financials: {
      bank_account_number: {
        type: String,
        required: true
      },
      ifsc_code: {
        type: String,
        required: true,
        uppercase: true
      },
      income_bracket: {
        type: String,
        enum: ["NOT_DECLARED", "BELOW_1L", "1L_5L", "5L_10L", "ABOVE_10L"],
        default: "NOT_DECLARED"
      },
      pep_status: {
        type: Boolean,
        default: false
      }
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
