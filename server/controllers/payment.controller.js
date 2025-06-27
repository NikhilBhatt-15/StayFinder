import razorpayInstance from "../razorpay/index.js";

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;

    // Validate amount and currency
    if (!amount || !currency) {
      return res.status(400).json({
        status: "error",
        message: "Amount and currency are required",
      });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `receipt_${new Date().getTime()}`, // Unique receipt ID
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create Razorpay order",
      });
    }

    return res.status(200).json({
      status: "success",
      success: true,
      message: "Razorpay order created successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};
