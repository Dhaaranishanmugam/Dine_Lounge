const validateOrder = (req, res, next) => {
  const { customerName, items, total } = req.body;

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: "Customer name is required" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must contain at least one item" });
  }

  if (!total || total <= 0) {
    return res.status(400).json({ error: "Invalid order total" });
  }

  next();
};

const validatePayment = (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment verification details" });
  }

  next();
};

module.exports = { validateOrder, validatePayment };