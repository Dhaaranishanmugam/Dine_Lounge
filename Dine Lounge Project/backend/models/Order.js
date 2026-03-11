const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      default: () => "ORD-" + Date.now()
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    tableNumber: {
      type: String,
      default: ""
    },
    diningMode: {
      type: String,
      enum: ["Dine-In", "Takeaway", "Delivery"],
      default: "Dine-In"
    },
    menuType: {
      type: String,
      enum: ["Veg", "Non-Veg"],
      default: "Veg"
    },
    items: [
      {
        itemId: Number,
        name: String,
        category: String,
        veg: Boolean,
        quantity: Number,
        price: Number,
        _id: false
      }
    ],
    subtotal: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Google Pay", "PhonePe"],
      default: "Cash"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    razorpayOrderId: {
      type: String,
      default: ""
    },
    razorpayPaymentId: {
      type: String,
      default: ""
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Served", "Cancelled"],
      default: "Pending"
    },
    specialNotes: {
      type: String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    preparedAt: {
      type: Date,
      default: null
    },
    servedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);