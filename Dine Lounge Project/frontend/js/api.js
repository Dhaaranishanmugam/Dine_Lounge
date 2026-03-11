// API Functions with Auth Support

// Get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Headers with auth
const getHeaders = (contentType = true) => {
    const headers = {};
    if (contentType) headers['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// Create Order (Public - No auth required for customers)
async function createOrderAPI(orderData) {
    try {
        const response = await fetch(API_ENDPOINTS.orders.create, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create order");

        return data;
    } catch (error) {
        console.error("Create Order Error:", error);
        showToast(error.message, "error");
        throw error;
    }
}

// Get All Orders (Protected - Admin/Chef only)
async function getOrdersAPI() {
    try {
        const response = await fetch(API_ENDPOINTS.orders.getAll, {
            headers: getHeaders(false)
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '../../index.html';
            throw new Error('Session expired. Please login again.');
        }
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch orders");

        return data.orders;
    } catch (error) {
        console.error("Get Orders Error:", error);
        showToast(error.message, "error");
        throw error;
    }
}

// Get Single Order (Protected)
async function getOrderByIdAPI(orderId) {
    try {
        const response = await fetch(API_ENDPOINTS.orders.getById(orderId), {
            headers: getHeaders(false)
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '../../index.html';
            throw new Error('Session expired. Please login again.');
        }
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch order");

        return data.order;
    } catch (error) {
        console.error("Get Order Error:", error);
        showToast(error.message, "error");
        throw error;
    }
}

// Update Order Status (Protected - Admin/Chef only)
async function updateOrderStatusAPI(orderId, status, notes = "") {
    try {
        const response = await fetch(API_ENDPOINTS.orders.update(orderId), {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ orderStatus: status, specialNotes: notes })
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '../../index.html';
            throw new Error('Session expired. Please login again.');
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to update order");

        showToast("Order updated successfully", "success");
        return data.order;
    } catch (error) {
        console.error("Update Order Error:", error);
        showToast(error.message, "error");
        throw error;
    }
}

// Delete Order (Protected - Admin only)
async function deleteOrderAPI(orderId) {
    try {
        const response = await fetch(API_ENDPOINTS.orders.delete(orderId), {
            method: "DELETE",
            headers: getHeaders(false)
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '../../index.html';
            throw new Error('Session expired. Please login again.');
        }

        if (response.status === 403) {
            throw new Error('Access denied. Admin only.');
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to delete order");

        showToast("Order deleted successfully", "success");
        return data;
    } catch (error) {
        console.error("Delete Order Error:", error);
        showToast(error.message, "error");
        throw error;
    }
}

// Get Order Statistics (Protected - Admin only)
async function getOrderStatsAPI() {
    try {
        const response = await fetch(API_ENDPOINTS.orders.getStats, {
            headers: getHeaders(false)
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '../../index.html';
            throw new Error('Session expired. Please login again.');
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch stats");

        return data.stats;
    } catch (error) {
        console.error("Get Stats Error:", error);
        throw error;
    }
}

// Auth API Functions
async function loginAPI(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');

        return data;
    } catch (error) {
        console.error('Login Error:', error);
        throw error;
    }
}

async function logoutAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: getHeaders()
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Logout Error:', error);
        throw error;
    }
}