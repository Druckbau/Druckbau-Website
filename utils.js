// js/utils.js

export function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '1rem 2rem';
    toast.style.borderRadius = '8px';
    toast.style.color = 'white';
    toast.style.zIndex = '100000';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.transform = 'translateY(100%)';
    toast.style.opacity = '0';

    if (type === 'success') toast.style.backgroundColor = 'var(--primary-blue)';
    else if (type === 'error') toast.style.backgroundColor = '#d9534f';
    else if (type === 'warning') toast.style.backgroundColor = '#f0ad4e';
    else toast.style.backgroundColor = '#2563eb';

    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 6000);
}

export function showSuccess(msg) { showNotification(msg, 'success'); }
export function showError(msg) { showNotification(msg, 'error'); }
export function showWarning(msg) { showNotification(msg, 'warning'); }
export function showInfo(msg) { showNotification(msg, 'info'); }

export function setError(input, message) {
    if (!input) return;
    input.classList.add('error');
    input.classList.remove('success');
    const errorSpan = input.parentElement.querySelector('.form-error');
    if (errorSpan) errorSpan.textContent = message;
}

export function setSuccess(input) {
    if (!input) return;
    input.classList.remove('error');
    input.classList.add('success');
    const errorSpan = input.parentElement.querySelector('.form-error');
    if (errorSpan) errorSpan.textContent = '';
}

