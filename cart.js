// js/cart.js
import { products, colors, state, saveCartToStorage, saveWishlistToStorage, SHIPPING_COST } from './store.js';
import { trackProductPurchase } from './admin.js';
import { formatCurrency, showNotification, escapeHtml, t } from './utils.js';

export function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const qtyInput = document.getElementById(`qty-${productId}`);
    let qty = qtyInput ? parseInt(qtyInput.value) : 1;

    if (isNaN(qty) || qty < 1) {
        alert(t('alert_error_qty'));
        return;
    }

    const colorSelect = document.getElementById(`color-${productId}`);
    const colorValue = colorSelect ? colorSelect.value : 'pla';
    const colorName = colorSelect ? colorSelect.options[colorSelect.selectedIndex].text : 'Standard';

    let customColor = null;
    if (colorValue === 'custom') {
        const customInput = document.getElementById(`custom-color-input-${productId}`);
        if (customInput && customInput.value.trim() !== '') {
            customColor = customInput.value.trim();
        } else {
            alert("Bitte geben Sie Ihre Wunschfarbe ein.");
            return;
        }
    }

    const existingItem = state.cart.find(item => item.id === productId && item.color === colorValue && item.customColor === customColor);

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        state.cart.push({
            id: product.id,
            name: product.name || t(product.nameKey),
            price: product.price,
            qty: qty,
            color: colorValue,
            colorName: customColor ? `Wunschfarbe: ${customColor}` : colorName,
            customColor: customColor,
            isCustom: false
        });
    }

    saveCartToStorage();
    updateCartIcon();
    renderCart();

    const translatedName = typeof t === 'function' ? t(product.nameKey) : product.name;
    const addedTxt = typeof t === 'function' ? t('alert_success_added') : 'wurde zum Warenkorb hinzugefügt.';
    showNotification(`"${translatedName}" ${addedTxt}`, 'success');
}

export function addCustomToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.isCustom) return;

    const fromInput = document.getElementById(`custom-from-${productId}`);
    const toInput = document.getElementById(`custom-to-${productId}`);
    const descInput = document.getElementById(`custom-desc-${productId}`);
    const fileInput = document.getElementById(`custom-files-${productId}`);

    const from = fromInput ? fromInput.value.trim() : '';
    const to = toInput ? toInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const qtyInput = document.getElementById(`custom-qty-${productId}`);
    let qty = qtyInput ? parseInt(qtyInput.value) : 1;

    if (isNaN(qty) || qty < 1) qty = 1;

    if (!from || !to || !desc) {
        alert("Bitte füllen Sie alle Felder (Von, Für, Info) aus.");
        return;
    }

    const fileNames = [];
    if (fileInput && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            fileNames.push(fileInput.files[i].name);
        }
    }

    state.cart.push({
        id: product.id,
        name: product.name || t(product.nameKey),
        price: 0,
        qty: qty,
        isCustom: true,
        customFrom: from,
        customTo: to,
        customDesc: desc,
        files: fileNames
    });

    if (fromInput) fromInput.value = '';
    if (toInput) toInput.value = '';
    if (descInput) descInput.value = '';
    if (fileInput) fileInput.value = '';

    const list = document.getElementById(`file-list-${productId}`);
    if (list) list.innerHTML = '';

    saveCartToStorage();
    updateCartIcon();
    renderCart();

    const translatedName = typeof t === 'function' ? t(product.nameKey) : product.name;
    const addedTxt = typeof t === 'function' ? t('alert_success_added') : 'wurde zum Warenkorb hinzugefügt.';
    showNotification(`"${translatedName}" ${addedTxt}`, 'success');
}

export function removeFromCart(index) {
    state.cart.splice(index, 1);
    saveCartToStorage();
    updateCartIcon();
    renderCart();
}

export function calculateDiscount(subtotal) {
    if (!state.appliedCoupon) return 0;

    if (state.appliedCoupon.type === 'percentage') {
        return subtotal * (state.appliedCoupon.value / 100);
    } else {
        return state.appliedCoupon.value;
    }
}

export function applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (!code) {
        alert(t('alert_coupon_invalid'));
        return;
    }

    const coupon = state.coupons[code];

    if (!coupon) {
        alert(t('alert_coupon_invalid'));
        return;
    }

    const today = new Date();
    const expiryDate = new Date(coupon.expiry);

    if (today > expiryDate) {
        alert(t('alert_coupon_expired'));
        return;
    }

    state.appliedCoupon = { code, ...coupon };
    alert(t('alert_coupon_applied'));
    renderCart();
}

export function removeCoupon() {
    state.appliedCoupon = null;
    renderCart();
}

export function renderCart() {
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    if (!container || !summary) return;

    if (state.cart.length === 0) {
        container.innerHTML = `<p style="text-align:center;">${t('cart_empty')}</p>`;
        summary.style.display = 'none';
        return;
    }

    let subtotal = 0;
    let hasCustomItems = false;

    container.innerHTML = state.cart.map((item, index) => {
        if (item.isCustom) {
            hasCustomItems = true;
            return `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>[${t('nav_more')}] ${item.name}</h4>
                    <div class="cart-item-info">
                        Von: ${escapeHtml(item.customFrom)}<br>
                        Zu: ${escapeHtml(item.customTo)}<br>
                        Info: ${escapeHtml(item.customDesc)}<br>
                        ${item.files && item.files.length > 0 ? `Dateien: ${item.files.join(', ')}` : ''}
                    </div>
                </div>
                <div>
                     <span style="font-weight:bold; color:var(--text-light); margin-right:15px;">${t('cart_price_indiv')}</span>
                     <button type="button" class="remove-btn" data-index="${index}" title="Entfernen">
                        ✕
                     </button>
                </div>
            </div>`;
        } else {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            return `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-info">${item.colorName} | ${item.qty}x</p>
                </div>
                <div>
                     <span style="font-weight:bold; margin-right:15px;">${formatCurrency(itemTotal)}</span>
                     <button type="button" class="remove-btn" data-index="${index}" title="Entfernen">
                        ✕
                     </button>
                </div>
            </div>`;
        }
    }).join('');

    summary.style.display = 'block';

    const discount = calculateDiscount(subtotal);
    const total = subtotal - discount + SHIPPING_COST;

    const subtotalEl = document.getElementById('subtotal');
    if (subtotalEl) {
        subtotalEl.innerHTML = `${formatCurrency(subtotal)} <span style="font-size:0.75rem; font-weight:normal; color:var(--text-light);">${t('price_hint')}</span>`;
        if (hasCustomItems) {
            subtotalEl.innerHTML += ` <span style="font-size:0.8rem; color:var(--text-light);">(${t('cart_extra_charge_info')})</span>`;
        }
    }

    const shippingEl = document.getElementById('shipping');
    if (shippingEl) {
        shippingEl.innerHTML = formatCurrency(SHIPPING_COST);
        if (hasCustomItems) {
            shippingEl.innerHTML = `${t('cart_shipping_cost_indiv')} <span style="font-size:0.8rem; color:var(--text-light);">(${t('cart_shipping_extra_info')})</span>`;
        }
    }

    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('discount');
    if (discountRow && discountEl) {
        if (discount > 0) {
            discountRow.style.display = 'flex';
            discountEl.textContent = `-${formatCurrency(discount)}`;
        } else {
            discountRow.style.display = 'none';
        }
    }

    const couponSection = document.getElementById('coupon-section');
    if (couponSection) {
        if (state.appliedCoupon) {
            couponSection.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#e6f4ea; padding:0.5rem 1rem; border-radius:4px; margin-top:1rem;">
                    <span style="color:#1e7e34; font-weight:bold;">✅ ${state.appliedCoupon.code} (${t('cart_coupon_applied_msg')})</span>
                    <button type="button" id="remove-coupon-btn" style="background:none; border:none; color:#dc3545; cursor:pointer; text-decoration:underline;">${t('cart_remove_coupon')}</button>
                </div>
            `;
            // Will reattach in event listeners
        } else {
            couponSection.innerHTML = `
                <div style="margin-top:1rem;" class="coupon-input-group">
                    <input type="text" id="coupon-input" class="coupon-input" placeholder="${t('cart_coupon')}">
                    <button type="button" id="apply-coupon-btn" class="coupon-apply-btn contact-btn">${t('cart_apply')}</button>
                </div>
            `;
        }
    }

    const totalSumEl = document.getElementById('total-sum');
    if (totalSumEl) {
        if (hasCustomItems) {
            totalSumEl.innerHTML = `${formatCurrency(total)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-light);">${t('price_hint')} zzgl. Aufträge</span>`;
        } else {
            totalSumEl.innerHTML = `${formatCurrency(total)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-light);">${t('price_hint')}</span>`;
        }
    }
}

export function updateCartIcon() {
    const count = document.getElementById('cart-count');
    if (count) {
        const totalItems = state.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        count.textContent = totalItems;
    }
}

export function toggleWishlist(productId) {
    const index = state.wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);

    if (index === -1) {
        state.wishlist.push(productId);
        showNotification(`${product ? t(product.nameKey) : productId} zur Wunschliste hinzugefügt!`, 'success');
    } else {
        state.wishlist.splice(index, 1);
        showNotification(`${product ? t(product.nameKey) : productId} von der Wunschliste entfernt.`, 'info');
    }

    saveWishlistToStorage();

    // We defer renderProducts and updateWishlistIcon to main script to avoid circular dependency
    document.dispatchEvent(new CustomEvent('wishlist-updated'));
}

export function renderWishlist() {
    const container = document.getElementById('wishlist-items');
    if (!container) return;

    if (state.wishlist.length === 0) {
        container.innerHTML = `
            <div class="wishlist-empty">
                <h2>Ihre Wunschliste ist leer</h2>
                <p>Entdecken Sie unsere <a href="#" class="nav-link" data-target="products">Produkte</a> und markieren Sie Ihre Favoriten!</p>
            </div>
        `;
        return;
    }

    const wishlistProducts = state.wishlist.map(id => products.find(p => p.id === id)).filter(p => p);

    container.innerHTML = wishlistProducts.map(product => `
        <div class="cart-item">
            <div class="cart-item-details">
                <h4>${t(product.nameKey)}</h4>
                <p class="cart-item-info">${product.price > 0 ? formatCurrency(product.price) : 'Individueller Preis'}</p>
            </div>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <button type="button" class="contact-btn wishlist-add-to-cart-btn" data-product-id="${product.id}" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                    In den Warenkorb
                </button>
                <button type="button" class="remove-btn wishlist-remove-btn" data-product-id="${product.id}" title="Entfernen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

export function addToCartFromWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.isCustom) {
        showNotification('Bitte konfigurieren Sie die Auftragsarbeit auf der Produktseite', 'info');
        // Triggers section change
        document.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }));
        return;
    }

    addToCart(productId);
    trackProductPurchase(productId);
}
