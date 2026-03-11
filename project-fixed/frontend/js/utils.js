// Utility Functions

// Format Price
function formatPrice(price) {
  return "₹" + price.toFixed(2);
}

// Generate Order Code
function generateOrderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Show Toast Notification
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  const style = `
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
  
  toast.style.cssText = style;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// Format Date
function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

// Get Status Badge Color
function getStatusColor(status) {
  const colors = {
    "Pending": "#FFA500",
    "Preparing": "#0066CC",
    "Ready": "#28A745",
    "Served": "#006400",
    "Cancelled": "#DC3545",
    "Paid": "#28A745",
    "Failed": "#DC3545"
  };
  return colors[status] || "#666";
}

// Validate Email
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validate Phone
function validatePhone(phone) {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone);
}

// Get Status Badge HTML
function getStatusBadge(status) {
  const color = getStatusColor(status);
  return `<span style="background: ${color}; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 0.9rem;">${status}</span>`;
}