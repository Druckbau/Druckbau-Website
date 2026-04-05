// js/checkout.js
import { state, SHIPPING_COST, saveCartToStorage } from './store.js';
import { calculateDiscount, renderCart, updateCartIcon } from './cart.js';
import { showWarning, showError, setSuccess, setError, showSuccess, showNotification, t } from './utils.js';
import { logOrder } from './admin.js';
import { saveOrderToDB } from './db.js';

let currentCheckoutStep = 1;

export function checkout() {
    if (state.cart.length === 0) {
        showWarning(t('cart_empty'));
        return;
    }

    currentCheckoutStep = 1;

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error', 'success'));

    // Reset inputs
    ['checkout-name', 'checkout-email', 'checkout-address', 'checkout-zip', 'checkout-city'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.add('show');
    showCheckoutStep(1);
}

export function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('show');
}

export function showCheckoutStep(step) {
    currentCheckoutStep = step;

    document.querySelectorAll('.checkout-step').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });

    const targetStep = document.getElementById(`checkout-step-${step}`);
    if (targetStep) {
        targetStep.style.display = 'block';
        targetStep.classList.add('active');

        const modalContent = targetStep.closest('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    } else {
        showError('Ein technischer Fehler ist aufgetreten. Bitte laden Sie die Seite neu.');
    }

    document.querySelectorAll('.progress-step').forEach(el => {
        const stepNum = parseInt(el.getAttribute('data-step'));
        el.classList.remove('active', 'completed');
        if (stepNum === step) {
            el.classList.add('active');
        } else if (stepNum < step) {
            el.classList.add('completed');
        }
    });

    if (step === 3) {
        renderCheckoutSummary();
    }
}

export function nextCheckoutStep() {
    if (validateCheckoutStep(currentCheckoutStep)) {
        showCheckoutStep(currentCheckoutStep + 1);
    }
}

export function prevCheckoutStep() {
    if (currentCheckoutStep > 1) {
        showCheckoutStep(currentCheckoutStep - 1);
    }
}

function validateCheckoutStep(step) {
    let isValid = true;

    if (step === 1) {
        const nameInput = document.getElementById('checkout-name');
        const emailInput = document.getElementById('checkout-email');

        if (nameInput && nameInput.value.trim().length < 2) {
            setError(nameInput, 'Bitte geben Sie Ihren Namen ein (min. 2 Zeichen).');
            isValid = false;
        } else if (nameInput) {
            setSuccess(nameInput);
        }

        if (emailInput && (!emailInput.value.includes('@') || emailInput.value.length < 5)) {
            setError(emailInput, 'Bitte eine gültige E-Mail-Adresse eingeben.');
            isValid = false;
        } else if (emailInput) {
            setSuccess(emailInput);
        }
    } else if (step === 2) {
        const addressInput = document.getElementById('checkout-address');
        const zipInput = document.getElementById('checkout-zip');
        const cityInput = document.getElementById('checkout-city');

        if (addressInput && addressInput.value.trim().length < 5) {
            setError(addressInput, 'Bitte Ihre Adresse eingeben (min. 5 Zeichen).');
            isValid = false;
        } else if (addressInput) {
            setSuccess(addressInput);
        }

        if (zipInput && !/^[0-9]{4,5}$/.test(zipInput.value.trim())) {
            setError(zipInput, 'Gültige PLZ eingeben.');
            isValid = false;
        } else if (zipInput) {
            setSuccess(zipInput);
        }

        if (cityInput && cityInput.value.trim().length < 2) {
            setError(cityInput, 'Bitte Ihren Ort eingeben.');
            isValid = false;
        } else if (cityInput) {
            setSuccess(cityInput);
        }
    }

    if (!isValid) {
        showWarning('Bitte füllen Sie alle markierten Felder korrekt aus.');
    }
    return isValid;
}

function renderCheckoutSummary() {
    const summary = document.getElementById('checkout-summary');
    if (!summary) return;

    const name = document.getElementById('checkout-name')?.value || '';
    const email = document.getElementById('checkout-email')?.value || '';
    const address = document.getElementById('checkout-address')?.value || '';
    const zip = document.getElementById('checkout-zip')?.value || '';
    const city = document.getElementById('checkout-city')?.value || '';

    let itemsHtml = state.cart.map(item => {
        if (item.isCustom) {
            return `<li>[${t('nav_more')}] ${item.name} (${item.customDesc})</li>`;
        } else {
            return `<li>${item.qty}x ${item.name} (${item.colorName}) - ${(item.price * item.qty).toFixed(2)}€</li>`;
        }
    }).join('');

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = calculateDiscount(subtotal);
    const total = subtotal - discount + SHIPPING_COST;

    const shippingAddrHeader = t('summary_shipping_address');
    const orderPreviewHeader = t('summary_order_preview');
    const shippingLabel = t('cart_shipping');
    const totalLabel = t('cart_total');
    const discountLabel = t('cart_discount');

    summary.innerHTML = `
        <div style="margin-bottom: 1rem; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;">
            <strong>${shippingAddrHeader}</strong><br>
            ${name}<br>
            ${address}<br>
            ${zip} ${city}<br>
            E-Mail: ${email}
        </div>
        <div>
            <strong>${orderPreviewHeader}</strong>
            <ul style="padding-left: 1.2rem; margin: 0.5rem 0;">${itemsHtml}</ul>
            <div style="border-top: 1px solid #ddd; margin-top: 0.5rem; padding-top: 0.5rem;">
                ${discount > 0 ? `${discountLabel} -${discount.toFixed(2)}€<br>` : ''}
                ${shippingLabel} ${SHIPPING_COST.toFixed(2)}€ (${t('price_hint')})<br>
                <strong>${totalLabel} ${total.toFixed(2)}€ (${t('price_hint')})</strong>
            </div>
        </div>
    `;
}

export async function submitCheckout() {
    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const addressInput = document.getElementById('checkout-address');
    const zipInput = document.getElementById('checkout-zip');
    const cityInput = document.getElementById('checkout-city');

    if (!nameInput || !emailInput || !addressInput || !zipInput || !cityInput) {
        console.error('One or more checkout input elements missing');
        return;
    }

    const btn = document.querySelector('.submit-checkout-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Bitte warten...';
    }

    const name = nameInput.value;
    const email = emailInput.value;
    const address = addressInput.value;
    const zip = zipInput.value;
    const city = cityInput.value;
    const orderId = generateOrderId();

    let body = `Hallo Druckbau Team,\n\nIch möchte folgende Bestellung aufgeben:\nBestellnummer: ${orderId}\n\nKundendaten:\nName: ${name}\nAdresse: ${address}\nOrt: ${zip} ${city}\nE-Mail: ${email}\n\nBestellung:\n`;

    state.cart.forEach(item => {
        if (item.isCustom) {
            body += `- [AUFTRAGSARBEIT] ${item.name}\n  Von: ${item.customFrom}\n  Zu: ${item.customTo}\n  Info: ${item.customDesc}\n`;
            if (item.files && item.files.length > 0) {
                body += `  !! BITTE ANHÄNGEN !! Dateien: ${item.files.join(', ')}\n`;
            }
        } else {
            body += `- ${item.qty}x ${item.name} (${item.colorName}) - ${(item.price * item.qty).toFixed(2)}€\n`;
        }
    });

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = calculateDiscount(subtotal);
    const total = subtotal - discount + SHIPPING_COST;

    body += `\nZwischensumme: ${subtotal.toFixed(2)}€\n`;
    if (discount > 0) body += `Rabatt: -${discount.toFixed(2)}€\n`;
    body += `Versand: ${SHIPPING_COST.toFixed(2)}€\n`;
    body += `Gesamt: ${total.toFixed(2)}€\n`;

    if (state.appliedCoupon) {
        body += `\nGutschein: ${state.appliedCoupon.code}\n`;
    }

    body += `\nVielen Dank!`;

    const orderData = {
        order_id: orderId,
        customer_name: name,
        customer_email: email,
        total_price: total,
        status: 'Eingegangen',
        order_data: { cart: state.cart, address, zip, city, message: body, discount, coupon: state.appliedCoupon ? state.appliedCoupon.code : null, subtotal, shipping_cost: SHIPPING_COST }
    };
    await saveOrderToDB(orderData);

    logOrder(name, email, orderId, body, state.appliedCoupon ? { code: state.appliedCoupon.code, discount: discount } : null, total, state.cart);

    // Provide mailto fallback immediately for now, pending DB integration
    const mailtoLink = `mailto:druckbau.info@gmail.com?subject=Bestellung ${orderId}&body=${encodeURIComponent(body)}`;
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    state.cart = [];
    saveCartToStorage();
    updateCartIcon();
    renderCart();
    closeCheckoutModal();

    showSuccess(t('checkout_prepare_success'));

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = t('checkout_submit');
    }
}

function generateOrderId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DB-${dateStr}-${randomSuffix}`;
}
