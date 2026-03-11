// Admin Dashboard JavaScript - FIXED VERSION

// Global variables
let allOrders = [];
let filteredOrders = [];
let selectedOrderId = null;
let isAuthenticated = false;

// Wait for DOM to be fully loaded before running any auth checks
document.addEventListener("DOMContentLoaded", function() {
    console.log('=== Admin Dashboard Loading ===');
    
    // Small delay to ensure localStorage is ready
    setTimeout(function() {
        initializeAdmin();
    }, 50);
});

function initializeAdmin() {
    console.log('Initializing admin...');
    
    // Check authentication
    if (!checkAuthentication()) {
        console.log('Authentication failed, redirecting to login...');
        return;
    }
    
    console.log('Authentication successful, loading dashboard...');
    
    // Update UI with user info
    updateUserInfo();
    
    // Load initial data
    loadOrders();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start auto-refresh
    startAutoRefresh();
}

function checkAuthentication() {
    console.log('Checking authentication...');
    
    // Get auth data from localStorage
    const token = localStorage.getItem('dinelounge_token');
    const role = localStorage.getItem('dinelounge_role');
    const loginTime = localStorage.getItem('dinelounge_loginTime');
    
    console.log('Token exists:', !!token);
    console.log('Role:', role);
    console.log('Login time:', loginTime);
    
    // Check if token exists
    if (!token) {
        console.error('No token found');
        redirectToLogin();
        return false;
    }
    
    // Check if role is correct
    if (role !== 'admin') {
        console.error('Wrong role:', role);
        showToast('Access denied. Admin only.', 'error');
        clearAuthData();
        setTimeout(redirectToLogin, 1500);
        return false;
    }
    
    // Check if session is expired (24 hours)
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
    console.log('Authentication check passed');
    return true;
}

function updateUserInfo() {
    const username = localStorage.getItem('dinelounge_username') || 'Admin';
    const userNameEl = document.getElementById('adminUserName');
    if (userNameEl) {
        userNameEl.textContent = '👤 ' + username;
    }
}

function redirectToLogin() {
    console.log('Redirecting to login page...');
    window.location.replace('../../index.html');
}

function clearAuthData() {
    localStorage.removeItem('dinelounge_token');
    localStorage.removeItem('dinelounge_role');
    localStorage.removeItem('dinelounge_username');
    localStorage.removeItem('dinelounge_loginTime');
}

// Logout function
function logout() {
    console.log('Logging out...');
    clearAuthData();
    showToast('Logged out successfully', 'success');
    setTimeout(redirectToLogin, 1000);
}

// API helper with auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('dinelounge_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    };
}

// Fetch orders
async function loadOrders() {
    if (!isAuthenticated) return;
    
    try {
        console.log('Fetching orders...');
        
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        console.log('Orders response status:', response.status);
        
        if (response.status === 401) {
            throw new Error('Unauthorized - Session expired');
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        console.log('Orders fetched:', data.orders?.length || 0);
        
        allOrders = data.orders || [];
        filteredOrders = allOrders;
        
        renderOrdersTable(filteredOrders);
        loadStats();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        
        if (error.message.includes('Unauthorized') || error.message.includes('Session expired')) {
            showToast('Session expired. Please login again.', 'error');
            clearAuthData();
            setTimeout(redirectToLogin, 2000);
        } else {
            showToast('Failed to load orders: ' + error.message, 'error');
        }
    }
}

// Load statistics
async function loadStats() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/orders/stats/overview', {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        const stats = data.stats;
        
        document.getElementById("totalOrders").textContent = stats.totalOrders || 0;
        document.getElementById("paidOrders").textContent = stats.paidOrders || 0;
        document.getElementById("pendingOrders").textContent = stats.pendingOrders || 0;
        document.getElementById("totalRevenue").textContent = formatPrice(stats.totalRevenue || 0);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search and filters
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const paymentFilter = document.getElementById("paymentFilter");
    
    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }
    if (statusFilter) {
        statusFilter.addEventListener("change", applyFilters);
    }
    if (paymentFilter) {
        paymentFilter.addEventListener("change", applyFilters);
    }
}

// Apply filters
function applyFilters() {
    const searchTerm = (document.getElementById("searchInput")?.value || '').toLowerCase();
    const statusFilter = document.getElementById("statusFilter")?.value || '';
    const paymentFilter = document.getElementById("paymentFilter")?.value || '';

    filteredOrders = allOrders.filter(order => {
        const matchSearch = 
            (order.customerName || '').toLowerCase().includes(searchTerm) ||
            (order.orderId || '').toLowerCase().includes(searchTerm);
        
        const matchStatus = !statusFilter || order.orderStatus === statusFilter;
        const matchPayment = !paymentFilter || order.paymentStatus === paymentFilter;

        return matchSearch && matchStatus && matchPayment;
    });

    renderOrdersTable(filteredOrders);
}

// Render orders table
function renderOrdersTable(orders) {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-5">No orders found</td>
            </tr>
        `;
        return;
    }

    let html = "";
    orders.forEach(order => {
        const statusBadge = getStatusBadge(order.orderStatus);
        const paymentBadge = getStatusBadge(order.paymentStatus);
        const timeFormatted = formatDate(order.createdAt);

        html += `
            <tr>
                <td><code>${order.orderId || 'N/A'}</code></td>
                <td>
                    <strong>${order.customerName || 'Guest'}</strong>
                    ${order.tableNumber ? `<br><small class="text-muted">Table: ${order.tableNumber}</small>` : ""}
                </td>
                <td><small>${(order.items || []).length} items</small></td>
                <td><strong>${formatPrice(order.total || 0)}</strong></td>
                <td>${statusBadge}</td>
                <td>${paymentBadge}</td>
                <td><small>${timeFormatted}</small></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-info" onclick="viewOrderDetails('${order._id}')">👁️ View</button>
                        <button class="btn btn-danger" onclick="openDeleteModal('${order._id}', '${order.orderId}')">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// View order details
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (!order) {
        showToast("Order not found", "error");
        return;
    }

    const itemsHtml = (order.items || []).map(item => `
        <tr>
            <td>${item.name || 'Unknown'}</td>
            <td class="text-center">${item.quantity || 0}</td>
            <td class="text-end">${formatPrice(item.price || 0)}</td>
            <td class="text-end"><strong>${formatPrice((item.price || 0) * (item.quantity || 0))}</strong></td>
        </tr>
    `).join("");

    const detailsHtml = `
        <div class="row mb-3">
            <div class="col-md-6">
                <h6>Customer Information</h6>
                <p><strong>Name:</strong> ${order.customerName || 'Guest'}</p>
                <p><strong>Table:</strong> ${order.tableNumber || 'N/A'}</p>
                <p><strong>Dining Mode:</strong> ${order.diningMode || 'N/A'}</p>
            </div>
            <div class="col-md-6">
                <h6>Order Information</h6>
                <p><strong>Order ID:</strong> <code>${order.orderId || 'N/A'}</code></p>
                <p><strong>Status:</strong> ${getStatusBadge(order.orderStatus)}</p>
                <p><strong>Payment:</strong> ${getStatusBadge(order.paymentStatus)}</p>
            </div>
        </div>
        <div class="mb-3">
            <h6>Order Items</h6>
            <table class="table table-sm">
                <thead>
                    <tr><th>Item</th><th class="text-center">Qty</th><th class="text-end">Price</th><th class="text-end">Total</th></tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr class="table-active"><td colspan="2"><strong>Subtotal</strong></td><td class="text-end" colspan="2"><strong>${formatPrice(order.subtotal || 0)}</strong></td></tr>
                    <tr class="table-active"><td colspan="2"><strong>Tax (5%)</strong></td><td class="text-end" colspan="2"><strong>${formatPrice(order.tax || 0)}</strong></td></tr>
                    <tr class="table-active"><td colspan="2"><strong>Total</strong></td><td class="text-end" colspan="2"><strong class="fs-5">${formatPrice(order.total || 0)}</strong></td></tr>
                </tbody>
            </table>
        </div>
    `;

    const contentEl = document.getElementById("orderDetailsContent");
    if (contentEl) {
        contentEl.innerHTML = detailsHtml;
        const modal = new bootstrap.Modal(document.getElementById("orderDetailsModal"));
        modal.show();
    }
}

// Open delete modal
function openDeleteModal(orderId, orderCode) {
    selectedOrderId = orderId;
    const deleteOrderIdEl = document.getElementById("deleteOrderId");
    if (deleteOrderIdEl) {
        deleteOrderIdEl.textContent = `Order: ${orderCode || orderId}`;
    }
    const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
    modal.show();
}

// Confirm delete
async function confirmDelete() {
    if (!selectedOrderId) return;

    try {
        const response = await fetch(`http://localhost:5000/api/orders/${selectedOrderId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            throw new Error('Failed to delete order');
        }

        // Remove from local array
        allOrders = allOrders.filter(o => o._id !== selectedOrderId);
        filteredOrders = filteredOrders.filter(o => o._id !== selectedOrderId);

        const modal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
        if (modal) modal.hide();

        loadStats();
        renderOrdersTable(filteredOrders);
        selectedOrderId = null;
        
        showToast('Order deleted successfully', 'success');

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

// Download report
function downloadReport() {
    try {
        const csv = generateCSVReport(filteredOrders);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dine-lounge-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast("Report downloaded successfully", "success");
    } catch (error) {
        showToast("Failed to download report", "error");
    }
}

// Generate CSV report
function generateCSVReport(orders) {
    let csv = "Order ID,Customer Name,Table,Items Count,Subtotal,Tax,Total,Status,Payment Status,Payment Mode,Dining Mode,Created At\n";
    orders.forEach(order => {
        csv += `"${order.orderId || ''}","${order.customerName || ''}","${order.tableNumber || ''}",${(order.items || []).length},${order.subtotal || 0},${order.tax || 0},${order.total || 0},"${order.orderStatus || ''}","${order.paymentStatus || ''}","${order.paymentMode || ''}","${order.diningMode || ''}","${formatDate(order.createdAt)}"\n`;
    });
    return csv;
}

// Auto-refresh
let refreshInterval;
function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    
    refreshInterval = setInterval(() => {
        if (isAuthenticated) {
            loadOrders();
        }
    }, 30000);
}

// Utility functions
function formatPrice(price) {
    return "₹" + (price || 0).toFixed(2);
}

function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function getStatusBadge(status) {
    const colors = {
        "Pending": "#FFA500",
        "Preparing": "#0066CC",
        "Ready": "#28A745",
        "Served": "#006400",
        "Cancelled": "#DC3545",
        "Paid": "#28A745",
        "Failed": "#DC3545"
    };
    const color = colors[status] || "#666";
    return `<span style="background: ${color}; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 0.9rem;">${status || 'Unknown'}</span>`;
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
// ── Post-load hook: render dashboard after orders arrive ──
const _origLoadStats = loadStats;
async function loadStats() {
  await _origLoadStats.call(this);
  if(typeof renderDashboard === 'function') setTimeout(renderDashboard, 100);
}

function showToast(message, type) {
  const c = {
    success:{bg:'#E8F5EE',border:'#86EFAC',c:'#15803D'},
    error:{bg:'#FDE8E9',border:'#fca5a5',c:'#c1121f'},
    info:{bg:'#EFF6FF',border:'#93C5FD',c:'#2563EB'}
  };
  const s = c[type] || c.info;
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;top:20px;right:20px;padding:13px 20px;border-radius:12px;font-family:'Inter',sans-serif;font-size:.83rem;font-weight:600;z-index:9999;background:${s.bg};border:1.5px solid ${s.border};color:${s.c};box-shadow:0 8px 24px rgba(0,0,0,.09);min-width:220px;`;
  t.textContent = message; document.body.appendChild(t); setTimeout(()=>t.remove(), 3500);
}
function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true });
}
function getStatusBadge(status) {
  const map = { Pending:'sp-pending', Preparing:'sp-preparing', Ready:'sp-ready', Served:'sp-served', Paid:'sp-paid', Failed:'sp-failed', Cancelled:'sp-cancelled' };
  const cls = map[status] || 'sp-default';
  return `<span class="spill ${cls}">${status||'Unknown'}</span>`;
}
