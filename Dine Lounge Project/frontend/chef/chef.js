// Chef Dashboard JavaScript - FIXED VERSION

// Global variables
let allOrders = [];
let currentFilter = "All";
let selectedOrderId = null;
let selectedNewStatus = null;
let isAuthenticated = false;

const statusColors = {
    "Pending": "#FFA500",
    "Preparing": "#0066CC",
    "Ready": "#28A745",
    "Served": "#006400",
    "Cancelled": "#DC3545"
};

const statusIcons = {
    "Pending": "🕐",
    "Preparing": "👨‍🍳",
    "Ready": "✅",
    "Served": "🎉",
    "Cancelled": "❌"
};

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log('=== Chef Dashboard Loading ===');
    
    setTimeout(function() {
        initializeChef();
    }, 50);
});

function initializeChef() {
    console.log('Initializing chef...');
    
    if (!checkAuthentication()) {
        console.log('Authentication failed, redirecting...');
        return;
    }
    
    console.log('Authentication successful');
    
    updateUserInfo();
    fetchOrders();
    setupEventListeners();
    startAutoRefresh();
}

function checkAuthentication() {
    console.log('Checking authentication...');
    
    const token = localStorage.getItem('dinelounge_token');
    const role = localStorage.getItem('dinelounge_role');
    const loginTime = localStorage.getItem('dinelounge_loginTime');
    
    console.log('Token exists:', !!token);
    console.log('Role:', role);
    
    if (!token) {
        console.error('No token found');
        redirectToLogin();
        return false;
    }
    
    if (role !== 'chef') {
        console.error('Wrong role:', role);
        showToast('Access denied. Chef only.', 'error');
        clearAuthData();
        setTimeout(redirectToLogin, 1500);
        return false;
    }
    
    if (loginTime) {
        const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
        if (hoursSinceLogin > 24) {
            console.error('Session expired');
            showToast('Session expired. Please login again.', 'error');
            clearAuthData();
            setTimeout(redirectToLogin, 1500);
            return false;
        }
    }
    
    isAuthenticated = true;
    return true;
}

function updateUserInfo() {
    const username = localStorage.getItem('dinelounge_username') || 'Chef';
    const userNameEl = document.getElementById('chefUserName');
    if (userNameEl) {
        userNameEl.textContent = '👤 ' + username;
    }
}

function redirectToLogin() {
    window.location.replace('../../index.html');
}

function clearAuthData() {
    localStorage.removeItem('dinelounge_token');
    localStorage.removeItem('dinelounge_role');
    localStorage.removeItem('dinelounge_username');
    localStorage.removeItem('dinelounge_loginTime');
}

function logout() {
    console.log('Logging out...');
    clearAuthData();
    showToast('Logged out successfully', 'success');
    setTimeout(redirectToLogin, 1000);
}

function getAuthHeaders() {
    const token = localStorage.getItem('dinelounge_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    };
}

async function fetchOrders() {
    if (!isAuthenticated) return;
    
    try {
        console.log('Fetching orders...');
        
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        console.log('Orders fetched:', data.orders?.length || 0);
        
        allOrders = data.orders || [];
        updateStatsCounts();
        renderOrders(currentFilter === "All" ? allOrders : allOrders.filter(o => o.orderStatus === currentFilter));
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        
        if (error.message === 'Unauthorized') {
            showToast('Session expired. Please login again.', 'error');
            clearAuthData();
            setTimeout(redirectToLogin, 2000);
        } else {
            showToast('Failed to fetch orders', 'error');
        }
    }
}

function updateStatsCounts() {
    const pending = allOrders.filter(o => o.orderStatus === "Pending").length;
    const preparing = allOrders.filter(o => o.orderStatus === "Preparing").length;
    const ready = allOrders.filter(o => o.orderStatus === "Ready").length;

    const pendingEl = document.getElementById("pendingCount");
    const preparingEl = document.getElementById("preparingCount");
    const readyEl = document.getElementById("readyCount");
    
    if (pendingEl) pendingEl.textContent = pending;
    if (preparingEl) preparingEl.textContent = preparing;
    if (readyEl) readyEl.textContent = ready;
}

function setupEventListeners() {
    // Filter buttons are handled via onclick in HTML
}

function filterOrders(status) {
    currentFilter = status;
    
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    
    if (event && event.target) {
        event.target.classList.add("active");
    }
    
    let filtered = allOrders;
    if (status !== "All") {
        filtered = allOrders.filter(o => o.orderStatus === status);
    }
    
    renderOrders(filtered);
}

function getTimeElapsed(createdAt) {
    if (!createdAt) return 'Unknown';
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    return `${Math.floor(diffHours / 24)} days ago`;
}

function renderOrders(orders) {
    const container = document.getElementById("ordersContainer");
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <h4>📭 No orders found</h4>
                <p>Check back soon!</p>
            </div>
        `;
        return;
    }

    let html = "";
    orders.forEach(order => {
        const statusColor = statusColors[order.orderStatus] || "#666";
        const statusIcon = statusIcons[order.orderStatus] || "📦";
        const timeElapsed = getTimeElapsed(order.createdAt);
        const statusClass = (order.orderStatus || 'pending').toLowerCase();

        const itemsList = (order.items || []).map(item => `
            <li>
                <span>${item.name || 'Unknown'}</span>
                <span class="item-qty">x${item.quantity || 0}</span>
            </li>
        `).join("");

        const notesHTML = order.specialNotes ? `
            <div class="special-notes mt-3">
                <strong>📝 Notes:</strong>
                <p>${order.specialNotes}</p>
            </div>
        ` : "";

        html += `
            <div class="order-card order-card-${statusClass}">
                <div class="order-card-header">
                    <div>
                        <h5 class="order-name">${order.customerName || 'Guest'}</h5>
                        <small>Order #${order.orderId || 'N/A'}</small>
                        ${order.tableNumber ? `<br><small class="text-muted">Table: ${order.tableNumber}</small>` : ''}
                    </div>
                    <span class="status-badge status-${statusClass}">
                        ${statusIcon} ${order.orderStatus || 'Unknown'}
                    </span>
                </div>
                <div class="order-card-body">
                    <div class="order-time">⏱️ ${timeElapsed}</div>
                    <div class="order-items mt-3">
                        <strong>Items (${(order.items || []).length}):</strong>
                        <ul class="items-list">${itemsList}</ul>
                    </div>
                    ${notesHTML}
                    <div class="order-meta mt-3 pt-3">
                        <div class="meta-row">
                            <span>🍽️ Mode:</span>
                            <strong>${order.diningMode || 'N/A'}</strong>
                        </div>
                        <div class="meta-row">
                            <span>💵 Total:</span>
                            <strong>₹${order.total || 0}</strong>
                        </div>
                    </div>
                </div>
                <div class="order-card-footer">
                    <button class="btn btn-update" onclick="openUpdateModal('${order._id}')">
                        📋 Update Status
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function openUpdateModal(orderId) {
    selectedOrderId = orderId;
    const order = allOrders.find(o => o._id === orderId);

    if (!order) {
        showToast("Order not found", "error");
        return;
    }

    const detailsHtml = `
        <div>
            <p><strong>👤 ${order.customerName || 'Guest'}</strong></p>
            <p>📋 Order ID: <code>${order.orderId || 'N/A'}</code></p>
            ${order.tableNumber ? `<p>🪑 Table: <strong>${order.tableNumber}</strong></p>` : ''}
            <p>📊 Current Status: <strong style="color: #0066CC;">${order.orderStatus || 'Unknown'}</strong></p>
            <p>💵 Total: <strong>₹${order.total || 0}</strong></p>
        </div>
    `;
    
    const orderDetailsModal = document.getElementById("orderDetailsModal");
    if (orderDetailsModal) {
        orderDetailsModal.innerHTML = detailsHtml;
    }
    
    const specialNotes = document.getElementById("specialNotes");
    if (specialNotes) {
        specialNotes.value = order.specialNotes || "";
    }

    const modal = new bootstrap.Modal(document.getElementById("updateModal"));
    modal.show();
}

function updateStatus(status) {
    selectedNewStatus = status;
    document.querySelectorAll(".status-btn").forEach(btn => {
        btn.classList.remove("selected");
    });
    if (event && event.target) {
        event.target.classList.add("selected");
    }
}

async function confirmStatusUpdate() {
    if (!selectedOrderId || !selectedNewStatus) {
        showToast("Please select a status", "error");
        return;
    }

    const notes = document.getElementById("specialNotes")?.value.trim() || "";

    try {
        const response = await fetch(`http://localhost:5000/api/orders/${selectedOrderId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ orderStatus: selectedNewStatus, specialNotes: notes })
        });

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            throw new Error('Failed to update order');
        }

        const data = await response.json();
        const updatedOrder = data.order;

        const orderIndex = allOrders.findIndex(o => o._id === selectedOrderId);
        if (orderIndex > -1) {
            allOrders[orderIndex] = updatedOrder;
        }

        showToast(`✅ Order updated to ${selectedNewStatus}`, "success");

        const modal = bootstrap.Modal.getInstance(document.getElementById("updateModal"));
        if (modal) modal.hide();

        updateStatsCounts();
        renderOrders(currentFilter === "All" ? allOrders : allOrders.filter(o => o.orderStatus === currentFilter));

        selectedOrderId = null;
        selectedNewStatus = null;

    } catch (error) {
        if (error.message === 'Unauthorized') {
            showToast('Session expired', 'error');
            clearAuthData();
            setTimeout(redirectToLogin, 1500);
        } else {
            showToast(error.message, 'error');
        }
    }
}

let refreshInterval;
function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    
    refreshInterval = setInterval(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, 10000);
}

function showToast(message, type) {
    const toast = document.createElement("div");
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8"};
        color: white;
        font-weight: bold;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}