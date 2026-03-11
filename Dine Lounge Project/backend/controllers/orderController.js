const Order = require("../models/Order");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { customerName, tableNumber, items, total, diningMode, menuType, phone, email } = req.body;

    const newOrder = new Order({
      customerName,
      tableNumber,
      items,
      subtotal: total,
      total: Math.round(total * 1.05), // 5% tax
      tax: Math.round(total * 0.05),
      diningMode,
      menuType,
      phone,
      email,
      paymentStatus: "Paid", // Auto-mark as paid for cash
      paymentMode: "Cash",
      orderStatus: "Pending"
    });

    await newOrder.save();
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get All Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, specialNotes } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus,
        specialNotes: specialNotes || "",
        ...(orderStatus === "Ready" && { preparedAt: new Date() }),
        ...(orderStatus === "Served" && { servedAt: new Date() })
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Order Statistics (for Admin)
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: "Paid" });
    const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });
    const completedOrders = await Order.countDocuments({ orderStatus: "Served" });
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        paidOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};