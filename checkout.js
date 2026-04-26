// js/checkout.js
import { state, SHIPPING_COST, saveCartToStorage } from './store.js';
import { calculateDiscount, renderCart, updateCartIcon } from './cart.js';
import { showWarning, showError, setSuccess, setError, showSuccess, showNotification, t } from './utils.js';
import { logOrder } from './admin.js';
import { saveOrderToDB } from './db.js';

let currentCheckoutStep = 1;

export function checkout() {
    console.log("Checkout initiated. Cart items:", state.cart.length);
    if (state.cart.length === 0) {
        console.warn("Checkout aborted: Cart is empty.");
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

    if (step === 4) {
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
    } else if (step === 3) {
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!paymentMethod) {
            isValid = false;
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

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'email';
    const paymentLabel = paymentMethod === 'stripe' ? 'Kreditkarte / Apple / Google Pay' : 'Manuelle Zahlung / E-Mail';

    summary.innerHTML = `
        <div style="margin-bottom: 1rem; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;">
            <strong>${shippingAddrHeader}</strong><br>
            ${name}<br>
            ${address}<br>
            ${zip} ${city}<br>
            E-Mail: ${email}
        </div>
        <div style="margin-bottom: 1rem; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;">
            <strong>Zahlungsart:</strong><br>
            ${paymentLabel}
        </div>
        <div>
            <strong>${orderPreviewHeader}</strong>
            <ul style="padding-left: 1.2rem; margin: 0.5rem 0;">${itemsHtml}</ul>
            <div style="border-top: 1px solid #ddd; margin-top: 0.5rem; padding-top: 0.5rem;">
                ${discount > 0 ? `${discountLabel} -${discount.toFixed(2)}€<br>` : ''}
                ${shippingLabel} ${SHIPPING_COST.toFixed(2)}€ (${t('price_hint')})<br>
            </div>
        </div>
    `;

}

export async function submitCheckout() {
    // Background processing only (Mail trigger moved to script.js for synchronicity)
    const finalBtn = document.getElementById('final-checkout-btn');
    const orderId = finalBtn?.dataset.orderId || generateOrderId();
    
    // Get all necessary data
    const name = document.getElementById('checkout-name')?.value || '';
    const email = document.getElementById('checkout-email')?.value || '';
    const address = document.getElementById('checkout-address')?.value || '';
    const zip = document.getElementById('checkout-zip')?.value || '';
    const city = document.getElementById('checkout-city')?.value || '';
    
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = calculateDiscount(subtotal);
    const total = subtotal - discount + SHIPPING_COST;

    // 1. Mark coupon as used
    if (state.appliedCoupon) {
        const usedCoupons = JSON.parse(localStorage.getItem('druckbau_used_coupons') || '[]');
        if (!usedCoupons.includes(state.appliedCoupon.code)) {
            usedCoupons.push(state.appliedCoupon.code);
            localStorage.setItem('druckbau_used_coupons', JSON.stringify(usedCoupons));
        }
    }

    // 2. Prepare Order Data for background save
    const orderData = {
        order_id: orderId,
        customer_name: name,
        customer_email: email,
        total_price: total,
        status: 'Eingegangen',
        created_at: new Date().toISOString(),
        order_data: { 
            cart: state.cart,
            address, zip, city,
            payment_method: 'email'
        }
    };

    // 3. Background tasks
    try {
        await saveOrderToDB(orderData);
    } catch (dbErr) {
        console.warn("DB save failed (background):", dbErr);
    }

    logOrder(name, email, orderId, "E-Mail Bestellung", null, total, state.cart);

    // 4. Delay UI cleanup to ensure mail app had time to register
    setTimeout(() => {
        state.cart = [];
        saveCartToStorage();
        updateCartIcon();
        renderCart();
        closeCheckoutModal();
        showSuccess(t('checkout_prepare_success'));
    }, 1000);
}






function generateOrderId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DB-${dateStr}-${randomSuffix}`;
}
