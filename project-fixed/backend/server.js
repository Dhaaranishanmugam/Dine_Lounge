require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Health Check
app.get("/", (req, res) => {
    res.json({
        message: "🍽️ Dine Lounge Backend Running",
        timestamp: new Date(),
        endpoints: {
            auth: {
                login: "POST /api/auth/login",
                me: "GET /api/auth/me",
                logout: "POST /api/auth/logout"
            },
            orders: {
                create: "POST /api/orders/create",
                getAll: "GET /api/orders",
                getById: "GET /api/orders/:id",
                update: "PUT /api/orders/:id",
                delete: "DELETE /api/orders/:id",
                stats: "GET /api/orders/stats/overview"
            }
        }
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});