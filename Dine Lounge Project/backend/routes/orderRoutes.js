const express = require("express");
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
} = require("../controllers/orderController");
const { validateOrder } = require("../middleware/validation");
const { authMiddleware, requireRole } = require("../middleware/auth");

// Public route - Customer can create order without auth
router.post("/create", validateOrder, createOrder);

// Protected routes - Admin and Chef only
router.get("/", authMiddleware, requireRole(['admin', 'chef']), getOrders);
router.get("/stats/overview", authMiddleware, requireRole(['admin']), getOrderStats);
router.get("/:id", authMiddleware, requireRole(['admin', 'chef']), getOrderById);
router.put("/:id", authMiddleware, requireRole(['admin', 'chef']), updateOrderStatus);
router.delete("/:id", authMiddleware, requireRole(['admin']), deleteOrder);

module.exports = router;