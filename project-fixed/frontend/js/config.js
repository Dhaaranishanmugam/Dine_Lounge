// API Configuration
const API_BASE_URL = "http://localhost:5000/api";

// API Endpoints
const API_ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        me: `${API_BASE_URL}/auth/me`,
        logout: `${API_BASE_URL}/auth/logout`
    },
    orders: {
        create: `${API_BASE_URL}/orders/create`,
        getAll: `${API_BASE_URL}/orders`,
        getById: (id) => `${API_BASE_URL}/orders/${id}`,
        update: (id) => `${API_BASE_URL}/orders/${id}`,
        delete: (id) => `${API_BASE_URL}/orders/${id}`,
        getStats: `${API_BASE_URL}/orders/stats/overview`
    }
};