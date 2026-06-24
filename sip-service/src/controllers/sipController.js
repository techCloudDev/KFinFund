const {
  createSip,
  getAllSips,
  getSipById,
  updateSip,
  cancelSip,
  getUserSips
} = require("../models/sipModel");
const createSipController = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized user"
      });
    }

    const user_id = req.user.id;

const {
  fund_name,
  amount,
  frequency,
  start_date
} = req.body || {};

console.log("Request Body:", req.body);

if (
  !fund_name ||
  amount === undefined ||
  !frequency ||
  !start_date
) {
  return res.status(400).json({
    success: false,
    error: "All fields are required"
  });
}
if (amount <= 0) {
  return res.status(400).json({
    success: false,
    error: "Amount must be greater than 0"
  });
}
const validFrequencies = [
  "MONTHLY",
  "QUARTERLY",
  "YEARLY"
];

if (
  !validFrequencies.includes(
    frequency.toUpperCase()
  )
) {
  return res.status(400).json({
    success: false,
    error:
      "Frequency must be MONTHLY, QUARTERLY or YEARLY"
  });
}

if (
  new Date(start_date) <= new Date()
) {
  return res.status(400).json({
    success: false,
    error:
      "Start date must be a future date"
  });
}
    {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    const sip = await createSip(
      user_id,
      fund_name,
      amount,
      frequency,
      start_date
    );

    return res.status(201).json({
      success: true,
      message: "SIP created successfully",
      sip
    });

  } catch (error) {

    console.error("❌ Controller Error:");
    console.error(error.message);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }
};
const getAllSipsController = async (
  req,
  res
) => {

  try {

    const sips =
      await getAllSips();

    res.status(200).json({
      success: true,
      count: sips.length,
      sips
    });

  } catch (error) {

    console.error(
      "❌ Fetch SIP Error:"
    );

    console.error(
      error.message
    );

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};
const getSipByIdController = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const sip =
      await getSipById(id);
    
    if (!req.user) {
  return res.status(401).json({
    success: false,
    error: "Unauthorized user"
  });
}

if (
  sip &&
  sip.user_id !== req.user.id
) {
  return res.status(403).json({
    success: false,
    error: "Access denied"
  });
}

    if (!sip) {
      return res.status(404).json({
        success: false,
        error: "SIP not found"
      });
    }

    res.status(200).json({
      success: true,
      sip
    });

  } catch (error) {

    console.error(
      "❌ Get SIP Error:"
    );

    console.error(
      error.message
    );

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};
const updateSipController = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const {
      fund_name,
      amount,
      frequency,
      start_date
    } = req.body;

    if (
      !fund_name ||
      !amount ||
      !frequency ||
      !start_date
    ) 
    if (amount <= 0) {
  return res.status(400).json({
    success: false,
    error: "Amount must be greater than 0"
  });
}

const validFrequencies = [
  "MONTHLY",
  "QUARTERLY",
  "YEARLY"
];

if (
  !validFrequencies.includes(
    frequency.toUpperCase()
  )
) {
  return res.status(400).json({
    success: false,
    error:
      "Frequency must be MONTHLY, QUARTERLY or YEARLY"
  });
}

if (
  new Date(start_date) <= new Date()
) {
  return res.status(400).json({
    success: false,
    error:
      "Start date must be a future date"
  });
}
    {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    const existingSip =
      await getSipById(id);

    if (!existingSip) {
      return res.status(404).json({
        success: false,
        error: "SIP not found"
      });
    }

    // Ownership Validation
    if (
      existingSip.user_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    const updatedSip =
      await updateSip(
        id,
        fund_name,
        amount,
        frequency,
        start_date
      );

    res.status(200).json({
      success: true,
      message: "SIP updated successfully",
      sip: updatedSip
    });

  } catch (error) {

    console.error(
      "❌ Update SIP Error:"
    );

    console.error(
      error.message
    );

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};
const cancelSipController = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const existingSip =
      await getSipById(id);

    if (!existingSip) {
      return res.status(404).json({
        success: false,
        error: "SIP not found"
      });
    }

    // Ownership Validation
    if (
      existingSip.user_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    const sip =
      await cancelSip(id);

    res.status(200).json({
      success: true,
      message: "SIP cancelled successfully",
      sip
    });

  } catch (error) {

    console.error(
      "❌ Cancel SIP Error:"
    );

    console.error(
      error.message
    );

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};
const getMySipsController = async (
  req,
  res
) => {

  try {

    const user_id = req.user.id;

    const sips =
      await getUserSips(user_id);

    return res.status(200).json({
      success: true,
      count: sips.length,
      sips
    });

  } catch (error) {

    console.error(
      "❌ My SIPs Error:"
    );

    console.error(
      error.message
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });

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

