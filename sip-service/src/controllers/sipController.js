const {
  createSip,
  getAllSips,
  getSipById,
  updateSip,
  cancelSip,
  getUserSips
} = require("../models/sipModel");

const validFrequencies = ["MONTHLY", "QUARTERLY", "YEARLY"];

const validateSipInputs = (body) => {
  const { fund_name, amount, frequency, start_date } = body;

  if (!fund_name || amount === undefined || !frequency || !start_date) {
    return "All fields are required";
  }
  if (amount <= 0) {
    return "Amount must be greater than 0";
  }
  if (!validFrequencies.includes(frequency.toUpperCase())) {
    return "Frequency must be MONTHLY, QUARTERLY or YEARLY";
  }
  if (new Date(start_date) <= new Date()) {
    return "Start date must be a future date";
  }
  return null;
};

// Create SIP
const createSipController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { fund_name, amount, frequency, start_date } = req.body || {};

    const validationError = validateSipInputs({ fund_name, amount, frequency, start_date });
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const sip = await createSip(user_id, fund_name, amount, frequency, start_date);

    return res.status(201).json({
      success: true,
      message: "SIP created successfully",
      sip
    });
  } catch (error) {
    console.error("❌ Create SIP Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get All SIPs (Admin only)
const getAllSipsController = async (req, res) => {
  try {
    const sips = await getAllSips();
    res.status(200).json({
      success: true,
      count: sips.length,
      sips
    });
  } catch (error) {
    console.error("❌ Fetch All SIPs Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get SIP by ID
const getSipByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const sip = await getSipById(id);

    if (!sip) {
      return res.status(404).json({ success: false, error: "SIP not found" });
    }

    if (sip.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    res.status(200).json({ success: true, sip });
  } catch (error) {
    console.error("❌ Get SIP Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update SIP
const updateSipController = async (req, res) => {
  try {
    const { id } = req.params;
    const { fund_name, amount, frequency, start_date } = req.body;

    const validationError = validateSipInputs({ fund_name, amount, frequency, start_date });
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const existingSip = await getSipById(id);

    if (!existingSip) {
      return res.status(404).json({ success: false, error: "SIP not found" });
    }

    if (existingSip.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const updatedSip = await updateSip(id, fund_name, amount, frequency, start_date);

    res.status(200).json({
      success: true,
      message: "SIP updated successfully",
      sip: updatedSip
    });
  } catch (error) {
    console.error("❌ Update SIP Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cancel SIP
const cancelSipController = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSip = await getSipById(id);

    if (!existingSip) {
      return res.status(404).json({ success: false, error: "SIP not found" });
    }

    if (existingSip.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const sip = await cancelSip(id);

    res.status(200).json({
      success: true,
      message: "SIP cancelled successfully",
      sip
    });
  } catch (error) {
    console.error("❌ Cancel SIP Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get My SIPs
const getMySipsController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const sips = await getUserSips(user_id);

    return res.status(200).json({
      success: true,
      count: sips.length,
      sips
    });
  } catch (error) {
    console.error("❌ My SIPs Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createSipController,
  getAllSipsController,
  getSipByIdController,
  updateSipController,
  cancelSipController,
  getMySipsController
};
