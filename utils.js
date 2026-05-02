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

export function showNotification(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('Toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    if (!title) {
        if (type === 'success') title = 'Erfolg';
        else if (type === 'error') title = 'Fehler';
        else if (type === 'warning') title = 'Warnung';
        else title = 'Info';
    }

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    };

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

export function showSuccess(msg, title = 'Erfolg') { showNotification(msg, 'success', title); }
export function showError(msg, title = 'Fehler') { showNotification(msg, 'error', title); }
export function showWarning(msg, title = 'Warnung') { showNotification(msg, 'warning', title); }
export function showInfo(msg, title = 'Info') { showNotification(msg, 'info', title); }

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
