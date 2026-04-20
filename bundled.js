
// --- js/utils.js ---
// js/utils.js

function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showNotification(message, type = 'info') {
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

function showSuccess(msg) { showNotification(msg, 'success'); }
function showError(msg) { showNotification(msg, 'error'); }
function showWarning(msg) { showNotification(msg, 'warning'); }
function showInfo(msg) { showNotification(msg, 'info'); }

function setError(input, message) {
    if (!input) return;
    input.classList.add('error');
    input.classList.remove('success');
    const errorSpan = input.parentElement.querySelector('.form-error');
    if (errorSpan) errorSpan.textContent = message;
}

function setSuccess(input) {
    if (!input) return;
    input.classList.remove('error');
    input.classList.add('success');
    const errorSpan = input.parentElement.querySelector('.form-error');
    if (errorSpan) errorSpan.textContent = '';
}

// Translations placeholder: until translations.js is modularized
function t(key) {
    const lang = localStorage.getItem('druckbau_language') || 'de';
    if (window.translations && window.translations[lang] && window.translations[lang][key]) {
        return window.translations[lang][key];
    }
    // Fallback to global translations object if it exists (for de/en flat structure if applicable)
    if (window.translations && window.translations[key]) {
        return window.translations[key];
    }
    return key;
}

// --- js/db.js ---
// js/db.js

// --- Supabase Setup ---
// NOTE: Replace these with your actual Supabase URL and anonymous key
const SUPABASE_URL = 'https://ezwmsguucjzqovypmggk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6d21zZ3V1Y2p6cW92eXBtZ2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzg5MDEsImV4cCI6MjA5MDk1NDkwMX0.H4quCJTA75tZhWwJDkCrvM2Y7_aPhf2YLmvSDCZdgeU';

let supabaseClient = null;

// Only initialize if Supabase library is loaded
function initDB() {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase Client initialized");
    } else {
        console.warn("Supabase library not found. Running in local-only mode.");
    }
}

// --- Orders ---
async function saveOrderToDB(orderData) {
    if (!supabaseClient) return false;

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([orderData]);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error saving order to DB:", e);
        return false;
    }
}

async function loadOrdersFromDB() {
    if (!supabaseClient) return null;

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (e) {
        console.error("Error loading orders from DB:", e);
        return null;
    }
}

async function updateOrderStatus(orderId, newStatus, trackingId = null) {
    if (!supabaseClient) return false;

    try {
        const updateData = {};
        if (newStatus) updateData.status = newStatus;
        if (trackingId !== null) updateData.tracking_id = trackingId;

        const { data, error } = await supabaseClient
            .from('orders')
            .update(updateData)
            .eq('order_id', orderId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error updating order status:", e);
        return false;
    }
}

async function deleteAllOrdersFromDB() {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('orders').delete().neq('order_id', 'none');
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error deleting orders:", e);
        return false;
    }
}

async function deleteCompletedOrdersFromDB() {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('orders').delete().eq('status', 'Versendet');
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error deleting completed orders:", e);
        return false;
    }
}

// --- Subscribers ---
async function addSubscriberToDB(email) {
    if (!supabaseClient) return false;

    try {
        const { data, error } = await supabaseClient
            .from('subscribers')
            .insert([{ email }]);

        if (error) {
            // Check for unique constraint violation (already subscribed)
            if (error.code === '23505') {
                return 'exists';
            }
            throw error;
        }
        return true;
    } catch (e) {
        console.error("Error saving subscriber to DB:", e);
        return false;
    }
}

// --- News ---
async function loadNewsFromDB() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient.from('news').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch(e) {
        console.error("Error loading news:", e);
        return null;
    }
}

async function saveNewsToDB(content) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('news').insert([{ content }]);
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error saving news:", e);
        return false;
    }
}

async function deleteNewsFromDB(id) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('news').delete().eq('id', id);
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error deleting news:", e);
        return false;
    }
}

async function clearAllNewsFromDB() {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('news').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
        return true;
    } catch(e) {
        return false;
    }
}

// --- Coupons ---
async function loadCouponsFromDB() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient.from('coupons').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch(e) {
        console.error("Error loading coupons:", e);
        return null;
    }
}

async function saveCouponToDB(code, discount, type = 'fixed') {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('coupons').insert([{ code, discount, type }]);
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error saving coupon:", e);
        return false;
    }
}

async function deleteCouponFromDB(id) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('coupons').delete().eq('id', id);
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error deleting coupon:", e);
        return false;
    }
}

// --- Analytics ---
async function loadAnalyticsFromDB() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient.from('analytics').select('*');
        if (error) throw error;
        return data;
    } catch(e) {
        console.error("Error loading analytics:", e);
        return null;
    }
}

async function trackAnalyticInDB(itemId, type, value = 1) {
    if (!supabaseClient) return false;
    try {
        // Since we allow inserts/updates, we need to try selecting first or using an RPC/upsert
        // Supabase upsert works well if item_id is unique
        let currentViews = 0, currentPurchases = 0, currentRevenue = 0;
        
        const { data: existing } = await supabaseClient.from('analytics').select('*').eq('item_id', itemId).maybeSingle();
        if (existing) {
            currentViews = existing.views;
            currentPurchases = existing.purchases;
            currentRevenue = existing.revenue;
        }

        const payload = { 
            item_id: itemId, 
            views: type === 'view' ? currentViews + value : currentViews,
            purchases: type === 'purchase' ? currentPurchases + value : currentPurchases,
            revenue: type === 'revenue' ? currentRevenue + value : currentRevenue
        };

        const { error } = await supabaseClient.from('analytics').upsert([payload], { onConflict: 'item_id' });
        if (error) throw error;
        return true;
// --- Synchronization ---
async function syncLocalStorageToDB() {
    if (!supabaseClient) return { success: false, message: "Supabase not initialized." };

    let syncCount = { orders: 0, subs: 0, reviews: 0 };
    let errors = [];

    // 1. Sync Orders
    try {
        const localOrders = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
        const toSync = localOrders.filter(o => !o.synced);
        for (const order of toSync) {
            // Remove the temporary 'synced' flag before sending to DB if it exists
            const cleanOrder = { ...order };
            delete cleanOrder.synced;
            
            const success = await saveOrderToDB(cleanOrder);
            if (success) {
                order.synced = true;
                syncCount.orders++;
            }
        }
        localStorage.setItem('druckbau_orders', JSON.stringify(localOrders));
    } catch (e) { errors.push("Order sync failed: " + e.message); }

    // 2. Sync Subscribers
    try {
        const localSubs = JSON.parse(localStorage.getItem('druckbau_subscribers') || '[]');
        const toSync = localSubs.filter(s => !s.synced);
        for (const sub of toSync) {
            const result = await addSubscriberToDB(sub.email);
            if (result === true || result === 'exists') {
                sub.synced = true;
                syncCount.subs++;
            }
        }
        localStorage.setItem('druckbau_subscribers', JSON.stringify(localSubs));
    } catch (e) { errors.push("Subscriber sync failed: " + e.message); }

    // 3. Sync Reviews
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('druckbau_reviews_')) {
                const productId = key.replace('druckbau_reviews_', '');
                const reviews = JSON.parse(localStorage.getItem(key) || '[]');
                const toSync = reviews.filter(r => !r.synced);
                
                for (const review of toSync) {
                    const success = await saveReviewToDB(productId, review.name, review.text, review.rating);
                    if (success) {
                        review.synced = true;
                        syncCount.reviews++;
                    }
                }
                localStorage.setItem(key, JSON.stringify(reviews));
            }
        }
    } catch (e) { errors.push("Review sync failed: " + e.message); }

    return { 
        success: errors.length === 0, 
        message: `Synced ${syncCount.orders} orders, ${syncCount.subs} subs, ${syncCount.reviews} reviews.`,
        details: syncCount,
        errors: errors
    };
}

// Helper for reviews (if not already defined)
async function saveReviewToDB(productId, name, text, rating) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient
            .from('reviews')
            .insert([{ 
                product_id: productId, 
                name: name, 
                text: text, 
                rating: parseInt(rating),
                created_at: new Date().toISOString()
            }]);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error saving review to DB:", e);
        return false;
    }
}

// --- js/store.js ---
// js/store.js

const products = [
    { id: 'a', nameKey: 'catalog_fidget_name', price: 3.99, images: ['logo.jpg'] },
    { id: 'b', nameKey: 'catalog_poop_name', price: 14.99, descKey: 'catalog_poop_desc', images: ['hund_1.jpg', 'hund_2.jpg', 'hund_3.jpg', 'hund_4.jpg', 'hund_5.jpg'] },
    { id: 'c', nameKey: 'catalog_vase_name', price: 11.99, descKey: 'catalog_vase_desc', images: ['vase_1.jpg', 'vase_2.jpg'] },
    { id: 'e', nameKey: 'catalog_pen_name', price: 6.99, descKey: 'catalog_pen_desc', images: ['logo.jpg'] },
    { id: 'd', nameKey: 'catalog_custom_name', price: 0, isCustom: true }
];

const colors = [
    { name: 'Cyan-Blau (PLA)', value: 'blue' },
    { name: 'Weiss (PLA)', value: 'white' },
    { name: 'Schwarz (PLA)', value: 'black' },
    { name: 'Grün (PLA)', value: 'green' },
    { name: 'Grün (PETG)', value: 'petg-green' },
    { name: 'Orange (PLA)', value: 'orange' },
    { name: 'Grau (PLA)', value: 'grey' },
    { name: 'Braun (PLA)', value: 'brown' },
    { name: 'Transparent Blau (PLA)', value: 'trans-blue' },
    { name: 'Transparent Grün (PLA)', value: 'trans-green' },
    { name: 'Transparent Gelb (PLA)', value: 'trans-yellow' },
    { name: 'Transparent Rot (PLA)', value: 'trans-red' },
    { name: 'Eigene (Wunschfarbe)', value: 'custom' }
];

const SHIPPING_COST = 4.90;

const state = {
    cart: [],
    wishlist: [],
    coupons: {},
    appliedCoupon: null
};

function saveCartToStorage() {
    localStorage.setItem('druckbau_cart', JSON.stringify(state.cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('druckbau_cart');
    if (saved) {
        try {
            state.cart = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load cart', e);
            state.cart = [];
        }
    }
}

function loadWishlistFromStorage() {
    const saved = localStorage.getItem('druckbau_wishlist');
    if (saved) {
        try {
            state.wishlist = JSON.parse(saved);
        } catch (e) {
            state.wishlist = [];
        }
    }
}

function saveWishlistToStorage() {
    localStorage.setItem('druckbau_wishlist', JSON.stringify(state.wishlist));
}

async function initCoupons() {
    const dbCoupons = await loadCouponsFromDB();
    if (dbCoupons && dbCoupons.length > 0) {
        state.coupons = {};
        dbCoupons.forEach(c => {
            state.coupons[c.code] = { type: c.type, value: parseFloat(c.discount), expiry: c.expires_at || '2099-12-31' };
        });
    } else {
        const savedCoupons = localStorage.getItem('druckbau_coupons');
        if (savedCoupons) {
            state.coupons = JSON.parse(savedCoupons);
        } else {
            state.coupons = {
                'NEUKUNDE10': { type: 'percentage', value: 10, expiry: '2026-12-31' },
                'SOMMER2026': { type: 'fixed', value: 5, expiry: '2026-08-31' },
                'TREUE15': { type: 'percentage', value: 15, expiry: '2026-12-31' },
                'WELCOME5': { type: 'fixed', value: 5, expiry: '2026-12-31' }
            };
        }
    }
    saveCoupons();
}

function saveCoupons() {
    localStorage.setItem('druckbau_coupons', JSON.stringify(state.coupons));
}

// Helper for safe JSON parsing
function safeJSONParse(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        return fallback;
    }
}

function loadReviews() {
    try {
        return safeJSONParse('productReviews', {});
    } catch (e) {
        return {};
    }
}

function saveReview(productId, review) {
    const reviews = loadReviews();
    if (!reviews[productId]) {
        reviews[productId] = [];
    }
    reviews[productId].push(review);
    localStorage.setItem('productReviews', JSON.stringify(reviews));
}

// --- js/products.js ---
// js/products.js

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = products.map(product => {
        const isWishlisted = state.wishlist.includes(product.id);

        let avgRating = 0;
        let reviewCount = 0;
        let starsDisplay = '☆☆☆☆☆';

        avgRating = getAverageRating(product.id);
        const reviews = loadReviews()[product.id] || [];
        reviewCount = reviews.length;
        starsDisplay = renderStars(avgRating);

        const ratingHtml = `
            <div class="product-rating-summary" style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:0.8rem;">
                <div style="display:flex; gap:0.5rem; width:100%;">
                    <button type="button" class="rate-btn" data-id="${product.id}" data-name="${escapeHtml(product.name || t(product.nameKey))}" 
                        style="flex:1; background:var(--primary-blue); border:1px solid var(--primary-blue); color:white; padding:5px; border-radius:4px; font-size:0.85rem; cursor:pointer; transition: opacity 0.2s;">
                        ${t('product_rate')}
                    </button>
                    <button type="button" class="view-reviews-btn" data-id="${product.id}" data-name="${escapeHtml(product.name || t(product.nameKey))}" 
                        style="flex:1; background:white; border:1px solid var(--primary-blue); color:var(--primary-blue); padding:5px; border-radius:4px; font-size:0.85rem; cursor:pointer; transition: background 0.2s;">
                        ${t('product_view_reviews')} (${reviewCount})
                    </button>
                </div>
            </div>
        `;

        if (product.isCustom) {
            return `
            <div class="product-card" data-product-id="${product.id}" style="position: relative;">
                <button type="button" class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" title="${t('product_wishlist_btn')}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </button>
                <h3>${t(product.nameKey)}</h3>
                ${ratingHtml}
                <span class="price">${t('product_indiv')}</span>
                
                <div class="product-options">
                    <div class="option-group">
                        <label>${t('product_order_custom_from')}</label>
                        <input type="text" id="custom-from-${product.id}" placeholder="${t('product_custom_from_placeholder')}" class="qty-input">
                    </div>
                    <div class="option-group">
                        <label>${t('product_order_custom_to')}</label>
                        <input type="text" id="custom-to-${product.id}" placeholder="${t('product_custom_to_placeholder')}" class="qty-input">
                    </div>
                    <div class="option-group">
                        <label>${t('product_order_custom_desc')}</label>
                        <textarea id="custom-desc-${product.id}" placeholder="${t('product_custom_desc_placeholder')}" class="qty-input" style="min-height: 60px;"></textarea>
                    </div>
                    <div class="product-controls" style="display:flex; gap:8px; align-items:center; margin-top:12px;">
                        <input type="number" id="custom-qty-${product.id}" value="1" min="1" class="qty-input" style="width:60px; padding:0.5rem; flex-shrink:0;" title="${t('product_quantity')}">
                         <button type="button" class="add-btn add-custom-btn" data-id="${product.id}" style="flex:1; padding:0.6rem 1rem; font-size:0.9rem; margin:0;">
                            ${t('product_add_cart')}
                        </button>
                    </div>

                    <div class="option-group" style="margin-top:10px;">
                        <input type="file" id="custom-files-${product.id}" multiple class="qty-input file-input-trigger" data-id="${product.id}" style="padding: 5px; font-size: 0.75rem;">
                        <ul id="file-list-${product.id}" class="selected-files-list"></ul>
                        <div class="file-warning-box" style="margin-top:5px; padding:5px; font-size:0.7rem;">
                            <span>${t('product_order_custom_files_warning')}</span>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-gallery">
                <div class="main-image-container">
                    <div id="tint-layer-${product.id}" class="tint-layer"></div>
                    <img src="${product.images && product.images.length > 0 ? product.images[0] : 'placeholder.jpg'}" alt="${t(product.nameKey)}" class="product-img main-img" id="main-img-${product.id}">
                </div>
                <div class="thumbnail-row">
                    ${(product.images || []).map((img, index) => `
                        <img src="${img}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                             data-src="${img}" data-id="${product.id}" onclick="window.switchGalleryImage('${img}', this)">
                    `).join('')}
                </div>
            </div>

                <div class="product-info">
                <h3>${t(product.nameKey)}</h3>
                ${ratingHtml}
                ${product.descKey ? `<p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.5rem;">${t(product.descKey)}</p>` : ''}
                <div class="price">${product.price.toFixed(2)} € <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-light); display: block;">${t('price_hint')} ${t('shipping_hint')}</span></div>
                
                <div class="product-controls" style="display:flex; gap:8px; align-items:center; margin-top:12px;">
                    <input type="number" id="qty-${product.id}" value="1" min="1" class="qty-input" style="width:55px; padding:0.5rem; flex-shrink:0; font-size:0.9rem;">
                    <select id="color-${product.id}" class="qty-input" style="flex:1; padding:0.5rem; font-size:0.85rem;" onchange="window.updateColorPreview('${product.id}', this.value)">
                        ${colors.map(c => `<option value="${c.value}">${c.name}</option>`).join('')}
                    </select>
                    <button type="button" class="add-btn add-to-cart-btn" data-id="${product.id}" style="flex:1.2; padding:0.6rem 0.8rem; font-size:0.85rem; width:auto; border-radius:4px; margin:0;">
                        ${t('product_add_cart')}
                    </button>
                </div>

                <div id="custom-color-wrapper-${product.id}" class="option-group" style="display: none; margin-top:10px;">
                    <label style="color: var(--primary-blue); font-size:0.8rem;">${t('product_custom_color_label')}</label>
                    <input type="text" id="custom-color-input-${product.id}" placeholder="${t('product_custom_color_placeholder')}" class="qty-input" style="padding:0.4rem;">
                    <div class="warning-msg" style="font-size:0.7rem; margin-top:5px;">
                        <strong>${t('product_custom_color_warning_ref')}</strong> ${t('product_custom_color_warning_text')}
                    </div>
                </div>
                <div id="cart-animation-${product.id}" style="position: absolute; right: 20px; bottom: 80px; pointer-events: none;"></div>
            </div>
        </div>
    `}).join('');
}


function updateColorPreview(productId, colorValue) {
    const tintLayer = document.getElementById(`tint-layer-${productId}`);
    const customWrapper = document.getElementById(`custom-color-wrapper-${productId}`);

    if (tintLayer) {
        // Reset class and add new color class
        tintLayer.className = `tint-layer preview-${colorValue}`;
    }

    if (colorValue === 'custom') {
        if (customWrapper) customWrapper.style.display = 'block';
    } else {
        if (customWrapper) customWrapper.style.display = 'none';
    }
}

function switchGalleryImage(src, thumbElement) {
    if (!thumbElement) return;
    const card = thumbElement.closest('.product-card');
    if (!card) return;

    const mainImg = card.querySelector('.main-img');
    if (mainImg) mainImg.src = src;

    card.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbElement.classList.add('active');
}

function getAverageRating(productId) {
    const reviews = loadReviews();
    const productReviews = reviews[productId] || [];
    if (productReviews.length === 0) return 0;

    const sum = productReviews.reduce((acc, r) => acc + parseInt(r.rating), 0);
    return (sum / productReviews.length).toFixed(1);
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let starsHtml = '';

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '★';
        } else if (i === fullStars && halfStar) {
            starsHtml += '½';
        } else {
            starsHtml += '☆';
        }
    }
    return starsHtml;
}

function addPrintTimeBadges() {
    products.forEach(product => {
        if (product.isCustom) return;
        const estimatedVolume = {
            'a': 5,
            'b': 50,
            'c': 150,
            'e': 30
        };
        const volume = estimatedVolume[product.id] || 20;
        product.printTime = Math.ceil(volume * 0.1); // Fake estimation
    });
}

// --- js/cart.js ---
// js/cart.js

let lastAddedIndex = -1;


function addToCart(productId) {
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

    const finalName = product.name || t(product.nameKey) || product.id;
    const existingItem = state.cart.find(item => 
        item.id === productId && 
        item.color === colorValue && 
        (item.customColor === customColor || (!item.customColor && !customColor))
    );

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        state.cart.push({
            id: product.id,
            name: finalName,
            price: product.price,
            qty: qty,
            color: colorValue,
            colorName: customColor ? `${t('product_custom_color_label')}: ${customColor}` : colorName,
            customColor: customColor,
            isCustom: false
        });
    }

    saveCartToStorage();
    updateCartIcon();
    
    lastAddedIndex = state.cart.indexOf(existingItem || state.cart[state.cart.length - 1]);
    
    if (window.showSection) {
        window.showSection('cart');
        setTimeout(() => {
            const cartItems = document.getElementById('cart-items-container');
            if (cartItems) cartItems.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    } else {
        renderCart();
    }

    const translatedName = typeof t === 'function' ? t(product.nameKey) : product.name;
    const addedTxt = typeof t === 'function' ? t('alert_success_added') : 'wurde zum Warenkorb hinzugefügt.';
    showNotification(`"${translatedName}" ${addedTxt}`, 'success');
}

function addCustomToCart(productId) {
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

    lastAddedIndex = state.cart.length - 1;

    if (window.showSection) {
        window.showSection('cart');
        setTimeout(() => {
            const cartItems = document.getElementById('cart-items-container');
            if (cartItems) cartItems.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    } else {
        renderCart();
    }

    const translatedName = typeof t === 'function' ? t(product.nameKey) : product.name;
    const addedTxt = typeof t === 'function' ? t('alert_success_added') : 'wurde zum Warenkorb hinzugefügt.';
    showNotification(`"${translatedName}" ${addedTxt}`, 'success');
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    saveCartToStorage();
    updateCartIcon();
    renderCart();
}

function calculateDiscount(subtotal) {
    if (!state.appliedCoupon) return 0;

    if (state.appliedCoupon.type === 'percentage') {
        return subtotal * (state.appliedCoupon.value / 100);
    } else {
        return state.appliedCoupon.value;
    }
}

function applyCoupon() {
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

    const used = JSON.parse(localStorage.getItem('druckbau_used_coupons') || '[]');
    if (used.includes(code)) {
        alert("Dieser Gutschein wurde auf diesem Gerät bereits eingelöst.");
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

function removeCoupon() {
    state.appliedCoupon = null;
    renderCart();
}

function renderCart() {
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
        const isNew = index === lastAddedIndex;
        if (isNew) {
            setTimeout(() => { 
                lastAddedIndex = -1; 
                renderCart();
            }, 2000);
        }

        const qty = parseInt(item.qty) || 1;
        const name = item.name || t('cart_item_unknown');

        if (item.isCustom) {
            hasCustomItems = true;
            return `
            <div class="cart-item ${isNew ? 'cart-item-new' : ''}">
                <div class="cart-item-details">
                    <h4>[${t('nav_more')}] ${name}</h4>
                    <div class="cart-item-info">
                        ${t('product_order_custom_from')}: ${escapeHtml(item.customFrom)}<br>
                        ${t('product_order_custom_to')}: ${escapeHtml(item.customTo)}<br>
                        ${t('product_order_custom_desc')}: ${escapeHtml(item.customDesc)}<br>
                        ${item.files && item.files.length > 0 ? `${t('product_order_custom_files_warning')}: ${item.files.join(', ')}` : ''}
                    </div>
                </div>
                <div>
                     <span style="font-weight:bold; color:var(--text-light); margin-right:15px;">${t('cart_price_indiv')}</span>
                     <button type="button" class="remove-btn" data-index="${index}" title="${t('cart_remove')}">
                        ✕
                     </button>
                </div>
            </div>`;
        } else {
            const price = parseFloat(item.price) || 0;
            const itemTotal = price * qty;
            subtotal += itemTotal;
            return `
            <div class="cart-item ${isNew ? 'cart-item-new' : ''}">
                <div class="cart-item-details">
                    <h4>${name}</h4>
                    <p class="cart-item-info">${item.colorName || t('product_standard')} | ${qty}x</p>
                </div>
                <div>
                     <span style="font-weight:bold; margin-right:15px;">${formatCurrency(itemTotal)}</span>
                     <button type="button" class="remove-btn" data-index="${index}" title="${t('cart_remove')}">
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

function updateCartIcon() {
    const count = document.getElementById('cart-count');
    if (count) {
        const totalItems = state.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        count.textContent = totalItems;
    }
}

function toggleWishlist(productId) {
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

function renderWishlist() {
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

function addToCartFromWishlist(productId) {
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

// --- js/checkout.js ---
// js/checkout.js

let currentCheckoutStep = 1;

function checkout() {
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

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('show');
}

function showCheckoutStep(step) {
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

function nextCheckoutStep() {
    if (validateCheckoutStep(currentCheckoutStep)) {
        showCheckoutStep(currentCheckoutStep + 1);
    }
}

function prevCheckoutStep() {
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
                <strong>${totalLabel} ${total.toFixed(2)}€ (${t('price_hint')})</strong>
            </div>
        </div>`;
}

async function submitCheckout() {
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
    const finalBtn = document.getElementById('final-checkout-btn');
    const activeBtn = finalBtn || btn;

    if (activeBtn) {
        activeBtn.disabled = true;
        activeBtn.innerHTML = '<span class="loading-spinner"></span> Bitte warten...';
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

    const paymentMethod = 'email';
    
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
            message: body, 
            discount, 
            coupon: state.appliedCoupon ? state.appliedCoupon.code : null, 
            subtotal, 
            shipping_cost: SHIPPING_COST,
            payment_method: paymentMethod
        }
    };
    
    // Save to DB
    await saveOrderToDB(orderData);

    // Legacy logging
    logOrder(name, email, orderId, body, state.appliedCoupon ? { code: state.appliedCoupon.code, discount: discount } : null, total, state.cart);

    // EmailJS Notification
    try {
        if (typeof emailjs !== 'undefined') {
            await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
                order_id: orderId,
                customer_name: name,
                customer_email: email,
                order_details: body,
                total_price: total.toFixed(2)
            }, "YOUR_PUBLIC_KEY");
            console.log("Email sent via EmailJS");
        }
    } catch (err) {
        console.warn("EmailJS failed:", err);
    }

    // Always use mailto fallback for manual flow
    const mailtoLink = `mailto:druckbau.info@gmail.com?subject=Bestellung ${orderId}&body=${encodeURIComponent(body)}`;
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    if (state.appliedCoupon) {
        let used = JSON.parse(localStorage.getItem('druckbau_used_coupons') || '[]');
        if (!used.includes(state.appliedCoupon.code)) {
            used.push(state.appliedCoupon.code);
            localStorage.setItem('druckbau_used_coupons', JSON.stringify(used));
        }
    }

    state.cart = [];
    state.appliedCoupon = null;
    saveCartToStorage();
    updateCartIcon();
    renderCart();
    closeCheckoutModal();

    showSuccess(t('checkout_prepare_success'));

    if (activeBtn) {
        activeBtn.disabled = false;
        activeBtn.innerHTML = t('checkout_submit');
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

// --- js/reviews.js ---

function openReviewModal(productId, productName) {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    
    document.getElementById('review-product-id').value = productId;
    const title = document.getElementById('review-product-name');
    if (title) title.textContent = (t('review_modal_title') || 'Produkt bewerten') + ' - ' + productName;
    
    const form = document.getElementById('review-form');
    if (form) {
        form.reset();
        form.style.display = 'block';
    }
    
    const existingSection = document.querySelector('#review-modal .existing-reviews-section');
    if (existingSection) existingSection.style.display = 'none';
    
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.classList.add('show');
}

function openReviewListModal(productId, productName) {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    
    document.getElementById('review-product-id').value = productId;
    const title = document.getElementById('review-product-name');
    if (title) title.textContent = productName + ' - ' + (t('review_previous') || 'Bisherige Bewertungen');
    
    const form = document.getElementById('review-form');
    if (form) form.style.display = 'none';
    
    const container = document.getElementById('reviews-list-container');
    const reviews = loadReviews()[productId] || [];
    
    if (container) {
        if (reviews.length === 0) {
            container.innerHTML = '<p>Bisher keine Bewertungen für dieses Produkt.</p>';
        } else {
            container.innerHTML = reviews.map(r => `
                <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong>${escapeHtml(r.author || 'Anonym')}</strong>
                        <span style="color:var(--primary-blue);">${renderStars(r.rating)}</span>
                    </div>
                    <p style="font-size:0.9rem; margin:0;">${escapeHtml(r.text)}</p>
                    <small style="color:#999;">${r.date}</small>
                </div>
            `).join('');
        }
    }
    
    const existingSection = document.querySelector('#review-modal .existing-reviews-section');
    if (existingSection) existingSection.style.display = 'block';
    
    modal.classList.add('show');
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.classList.remove('show');
}

function submitReview(e) {
    e.preventDefault();
    const productId = document.getElementById('review-product-id').value;
    const authorEl = document.getElementById('review-author');
    const textEl = document.getElementById('review-text');
    
    const author = authorEl ? authorEl.value.trim() : '';
    const text = textEl ? textEl.value.trim() : '';
    
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    if (!ratingInput) {
        alert("Bitte wählen Sie eine Sternebewertung aus.");
        return;
    }
    const rating = parseInt(ratingInput.value);
    
    saveReview(productId, {
        author,
        text,
        rating,
        date: new Date().toLocaleDateString('de-DE')
    });
    
    showNotification("Vielen Dank für Ihre Bewertung!", 'success');
    closeReviewModal();
    renderProducts();
}

// --- js/ui.js ---
// js/ui.js

function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('druckbau_theme', newTheme);

        updateThemeIcon(newTheme);
    });

    // Init theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('druckbau_theme');
    
    let initialTheme = 'light';
    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (systemPrefersDark.matches) {
        initialTheme = 'dark';
    }

    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);

    // Listen for system changes
    systemPrefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('druckbau_theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
}

function updateThemeIcon(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (!sunIcon || !moonIcon) return;

    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

function setupChat() {
    window.toggleChat = () => {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            if (chatWindow.style.display === 'flex') {
                chatWindow.style.display = 'none';
            } else {
                chatWindow.style.display = 'flex';
                const messages = document.getElementById('chat-messages');
                if (messages && messages.children.length === 0) {
                    messages.innerHTML = `<div class="message bot"><p>${t('chat_welcome')}</p></div>`;
                }
            }
        }
    };

    window.sendChatMessage = () => {
        const input = document.getElementById('chat-input');
        const text = input ? input.value.trim() : '';
        if (text) {
            appendMessage(text, 'user');
            input.value = '';

            setTimeout(() => {
                const response = getBotResponse(text);
                appendMessage(response, 'bot');
            }, 1000);
        }
    };

    window.sendQuickReply = (text) => {
        appendMessage(text, 'user');
        setTimeout(() => {
            const response = getBotResponse(text);
            appendMessage(response, 'bot');
        }, 1000);
    };

    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
}

function appendMessage(text, sender) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = `<p>${escapeHtml(text)}</p>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function getBotResponse(text) {
    const t = text.toLowerCase();

    // Simplistic response generation until translated
    if (t.includes('lieferung') || t.includes('versand') || t.includes('dauer')) {
        return "Unsere Lieferzeit beträgt in der Regel 3-5 Werktage nach Zahlungseingang.";
    } else if (t.includes('kosten') || t.includes('preis') || t.includes('euro')) {
        return "Die Standardversandkosten betragen 4,90€. Spezifische Produktpreise findest du im Katalog.";
    } else if (t.includes('auftrag') || t.includes('speziell') || t.includes('design')) {
        return "Für Auftragsarbeiten kontaktiere uns bitte über das Formular oder füge das Produkt 'Auftragsarbeit' zum Warenkorb hinzu!";
    } else {
        return "Vielen Dank für deine Nachricht. Unser Support-Team (ich, Philipp) meldet sich bald bei dir. Du kannst mich auch über das Kontaktformular erreichen.";
    }
}

function setupLightbox() {
    window.openLightbox = (imgSrc) => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightbox && lightboxImg) {
            lightboxImg.src = imgSrc;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeLightbox = () => {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('show');
            document.body.style.overflow = '';
        }
    };

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
}

function setupFAQ() {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            const faqAnswer = button.nextElementSibling;

            // Close others
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // Toggle current
            faqItem.classList.toggle('active');
            if (faqItem.classList.contains('active')) {
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
            } else {
                faqAnswer.style.maxHeight = null;
            }
        });
    });
}

// Navigation Logic (SPA)
function setupNavigation() {
    // We use event delegation on document body to catch ALL navigation triggers
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link, .cart-icon-container, .wishlist-icon-container, .footer-link.nav-trigger, .contact-trigger, .nav-trigger');

        if (!link) return;

        const targetId = link.getAttribute('data-target');

        if (targetId) {
            e.preventDefault();
            console.log('Navigating to:', targetId);
            showSection(targetId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Fallback classes if data-target is missing for some reason
            if (link.classList.contains('cart-icon-container')) {
                e.preventDefault();
                showSection('cart');
            } else if (link.classList.contains('wishlist-icon-container')) {
                e.preventDefault();
                showSection('wishlist');
            }
        }
    });

    // Dropdown toggle logic
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const dropdown = toggle.parentElement;
            if (dropdown.classList.contains('dropdown')) {
                e.preventDefault();

                // Close other dropdowns
                document.querySelectorAll('.dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.remove('show');
                });

                dropdown.classList.toggle('show');

                // Trigger navigation
                const targetId = toggle.getAttribute('data-target');
                if (targetId) {
                    showSection(targetId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
        }
    });

    // Make showSection globally available
    window.showSection = showSection;
}

// Bot Protection State
const SECTION_STATS = {
    contactShownAt: 0
};

function showSection(id) {
    if (id === 'contact') SECTION_STATS.contactShownAt = Date.now();

    // Hide all sections
    document.querySelectorAll('section').forEach(sec => {
        sec.classList.remove('active');
        if (sec.style.display !== 'none') sec.style.display = 'none'; // Ensure hidden
    });

    // Show target section(s)
    // Note: Home is special, it's a section.
    const target = document.getElementById(id);
    if (target) {
        target.style.setProperty('display', (id === 'home' ? 'flex' : 'block'), 'important');
        setTimeout(() => target.classList.add('active'), 10); // Small delay for fade in
    }

    // Update active nav link
    const triggers = '.nav-link, .cart-icon-container, .wishlist-icon-container, .footer-link.nav-trigger, .contact-trigger, .nav-trigger';
    document.querySelectorAll(triggers).forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === id) {
            link.classList.add('active');
        }
    });

    if (id === 'cart' && window.renderCart) window.renderCart();
    if (id === 'wishlist' && window.renderWishlist) window.renderWishlist();

    const currentTheme = document.documentElement.getAttribute('data-theme');

    // Trigger any additional section-specific logic
    document.dispatchEvent(new CustomEvent('section-shown', { detail: { id, theme: currentTheme } }));
}

// --- js/admin.js ---
// js/admin.js

const ADMIN_SECURITY = {
    attempts: 0,
    maxAttempts: 3,
    lockoutUntil: 0
};

function logOrder(name, email, orderId, message, couponInfo = null, totalPrice = 0, items = []) {
    const newOrder = {
        name,
        email,
        orderId: orderId.toUpperCase(),
        message,
        coupon: couponInfo,
        totalPrice,
        items,
        date: new Date().toLocaleString(),
        status: 'Eingegangen'
    };

    const orders = safeJSONParse('druckbau_orders', []);
    orders.unshift(newOrder);
    localStorage.setItem('druckbau_orders', JSON.stringify(orders));

    triggerAdminRefresh();
    trackProductPurchase(items);
}

function initAdminSystem() {
    initDB();
    window.adminModuleLoaded = true;

    const trigger = document.getElementById('admin-trigger');
    const panel = document.getElementById('admin-panel');
    const saveNewsBtn = document.getElementById('save-news-btn');
    const deleteNewsBtn = document.getElementById('delete-news-btn');
    const clearOrdersBtn = document.getElementById('clear-orders-btn');
    const sendNewsletterBtn = document.getElementById('admin-send-newsletter');

    if (sendNewsletterBtn) {
        sendNewsletterBtn.addEventListener('click', async () => {
            const subscribers = JSON.parse(localStorage.getItem('druckbau_subscribers')) || [];
            if (subscribers.length === 0) {
                showNotification("Keine Abonnenten vorhanden.", "warning");
                return;
            }
            const subject = prompt("Betreff des Newsletters:", "Neuigkeiten von Druckbau");
            if (!subject) return;
            const message = prompt("Nachrichtentext:");
            if (!message) return;

            sendNewsletterBtn.classList.add('btn-loading');
            setTimeout(() => {
                sendNewsletterBtn.classList.remove('btn-loading');
                showNotification(`${subscribers.length} Abonnenten haben den Newsletter erhalten! (Simulation)`);
            }, 1500);
        });
    }

    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent jump to top if it's an anchor link

            const now = Date.now();
            if (now < ADMIN_SECURITY.lockoutUntil) {
                const remaining = Math.ceil((ADMIN_SECURITY.lockoutUntil - now) / 1000);
                alert(`Zu viele Fehlversuche. Bitte warten Sie ${remaining} Sekunden.`);
                return;
            }

            const pwd = prompt("Admin Passwort:");
            if (pwd === 'admin123') {
                ADMIN_SECURITY.attempts = 0;
                const adminNavItem = document.getElementById('admin-nav-item');
                if (adminNavItem) adminNavItem.style.display = 'list-item';

                document.dispatchEvent(new CustomEvent('navigate', { detail: 'admin' }));
                loadAdminData();
            } else if (pwd !== null) {
                ADMIN_SECURITY.attempts++;
                if (ADMIN_SECURITY.attempts >= ADMIN_SECURITY.maxAttempts) {
                    ADMIN_SECURITY.lockoutUntil = Date.now() + 60000;
                    alert("Maximale Versuche erreicht. Zugriff für 1 Minute gesperrt.");
                } else {
                    alert(`Zugriff verweigert. (${ADMIN_SECURITY.attempts}/${ADMIN_SECURITY.maxAttempts})`);
                }
            }
        });
    }

    if (saveNewsBtn) {
        saveNewsBtn.addEventListener('click', async () => {
            const text = document.getElementById('admin-news-input').value;
            if (text) {
                saveNewsBtn.classList.add('btn-loading');
                try {
                    await saveNewsToDB(text);
                    
                    // Fallback to local sync
                    const date = new Date().toLocaleString();
                    const newsList = safeJSONParse('druckbau_news_list', []);
                    newsList.unshift({ text, date });
                    localStorage.setItem('druckbau_news_list', JSON.stringify(newsList));

                    showNotification("Status erfolgreich hinzugefügt!");
                    document.getElementById('admin-news-input').value = '';
                    document.dispatchEvent(new Event('news-updated'));
                    loadAdminData();
                } catch (e) {
                    showNotification("Fehler beim Speichern.", "error");
                } finally {
                    saveNewsBtn.classList.remove('btn-loading');
                }
            }
        });
    }

    if (deleteNewsBtn) {
        deleteNewsBtn.addEventListener('click', async () => {
            if (confirm("Möchtest du den gesamten Neuigkeiten-Verlauf löschen?")) {
                deleteNewsBtn.classList.add('btn-loading');
                try {
                    await clearAllNewsFromDB();
                    localStorage.removeItem('druckbau_news_list');
                    document.dispatchEvent(new Event('news-updated'));
                    loadAdminData();
                    showNotification("Verlauf gelöscht.");
                } finally {
                    deleteNewsBtn.classList.remove('btn-loading');
                }
            }
        });
    }

    if (clearOrdersBtn) {
        clearOrdersBtn.addEventListener('click', async () => {
            if (confirm("Wirklich alle Bestellungen aus der Datenbank löschen? (Unwiderruflich)")) {
                clearOrdersBtn.classList.add('btn-loading');
                try {
                    await deleteAllOrdersFromDB();
                    localStorage.removeItem('druckbau_orders');
                    loadAdminData();
                    showNotification("Alle Bestellungen gelöscht.");
                } finally {
                    clearOrdersBtn.classList.remove('btn-loading');
                }
            }
        });
    }

    const addCouponBtn = document.getElementById('add-coupon-btn');
    if (addCouponBtn) {
        addCouponBtn.addEventListener('click', async () => {
            const code = document.getElementById('admin-coupon-code').value.trim().toUpperCase();
            const type = document.getElementById('admin-coupon-type').value;
            const value = parseFloat(document.getElementById('admin-coupon-value').value);
            
            if (code && !isNaN(value)) {
                addCouponBtn.classList.add('btn-loading');
                try {
                    const dbSuccess = await saveCouponToDB(code, value, type);
                    
                    const local = safeJSONParse('druckbau_coupons', {});
                    local[code] = { type, value, expiry: 'Unbegrenzt' };
                    localStorage.setItem('druckbau_coupons', JSON.stringify(local));

                    if (dbSuccess) {
                        showNotification("Gutschein erfolgreich gespeichert! ✅");
                    } else {
                        showNotification("Gutschein wurde nur LOKAL gespeichert. ⚠️", "warning");
                    }
                    
                    // Clear inputs
                    document.getElementById('admin-coupon-code').value = '';
                    document.getElementById('admin-coupon-value').value = '';
                    
                    if (typeof initCoupons === 'function') await initCoupons();
                    document.dispatchEvent(new Event('render-admin-coupons'));
                } finally {
                    addCouponBtn.classList.remove('btn-loading');
                }
            } else {
                showNotification("Bitte Code und Wert eingeben.", "warning");
            }
        });
    }

    const couponsTable = document.getElementById('admin-coupons-table');
    if (couponsTable) {
        couponsTable.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-coupon-btn')) {
                const id = e.target.getAttribute('data-id');
                const code = e.target.getAttribute('data-code');
                const btn = e.target;
                
                if (confirm(`Gutschein definitiv löschen?`)) {
                    btn.classList.add('btn-loading');
                    try {
                        if (id) {
                            await deleteCouponFromDB(id);
                        } else if (code) {
                            // Local deletion fallback
                            const local = safeJSONParse('druckbau_coupons', {});
                            delete local[code];
                            localStorage.setItem('druckbau_coupons', JSON.stringify(local));
                        }
                        showNotification("Gutschein gelöscht.");
                        if (typeof initCoupons === 'function') await initCoupons();
                        document.dispatchEvent(new Event('render-admin-coupons'));
                    } finally {
                        btn.classList.remove('btn-loading');
                    }
                }
            }
        });
    }

    document.addEventListener('render-admin-coupons', async () => {
        const tbody = document.querySelector('#admin-coupons-table tbody');
        if (!tbody) return;
        
        const dbCoupons = await loadCouponsFromDB();
        let html = '';
        if (dbCoupons && dbCoupons.length > 0) {
            html = dbCoupons.map(c => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 0.5rem;">${c.code}</td>
                    <td style="padding: 0.5rem;">${c.type}</td>
                    <td style="padding: 0.5rem;">${c.type === 'percentage' ? c.discount + '%' : formatCurrency(c.discount) + ' €'}</td>
                    <td style="padding: 0.5rem;">${c.expires_at || '-'}</td>
                    <td style="padding: 0.5rem;">
                        <button class="delete-coupon-btn" data-id="${c.id}" style="background:none; border:none; color:#d9534f; cursor:pointer;" title="Löschen">&times;</button>
                    </td>
                </tr>
            `).join('');
        } else {
            // Local fallback
            const local = safeJSONParse('druckbau_coupons', {});
            const keys = Object.keys(local);
            if (keys.length > 0) {
                html = keys.map(key => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 0.5rem;">${key}</td>
                        <td style="padding: 0.5rem;">${local[key].type}</td>
                        <td style="padding: 0.5rem;">${local[key].type === 'percentage' ? local[key].value + '%' : formatCurrency(local[key].value) + ' €'}</td>
                        <td style="padding: 0.5rem;">${local[key].expiry} (Lokal)</td>
                        <td style="padding: 0.5rem;">
                            <button class="delete-coupon-btn" data-code="${key}" style="background:none; border:none; color:#d9534f; cursor:pointer;" title="Lokal Löschen">&times;</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        tbody.innerHTML = html || '<tr><td colspan="5" style="padding:1rem; text-align:center;">Keine Gutscheine vorhanden.</td></tr>';
    });

    const historyContainer = document.getElementById('admin-news-history');
    if (historyContainer) {
        historyContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-news-item')) {
                const id = e.target.getAttribute('data-id');
                const index = parseInt(e.target.getAttribute('data-index'));
                
                if (id) {
                    await deleteNewsFromDB(id);
                }

                // Local sync
                const newsList = JSON.parse(localStorage.getItem('druckbau_news_list')) || [];
                // if we don't have id but index we just splice locally
                if (index !== null && !isNaN(index) && !id) {
                    newsList.splice(index, 1);
                } else if (id) {
                    // Try to filter it out if we know it was matching 
                    // Not strict matching possible easily locally if ids are missed. Just reload.
                }
                
                localStorage.setItem('druckbau_news_list', JSON.stringify(newsList));
                document.dispatchEvent(new Event('news-updated'));
                loadAdminData();
            }
        });
    }

    const ordersTable = document.getElementById('orders-table');
    if (ordersTable) {
        ordersTable.addEventListener('change', async (e) => {
            if (e.target.classList.contains('order-status-select')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                const newStatus = e.target.value;
                const orderId = e.target.getAttribute('data-order-id');
                const select = e.target;

                select.style.opacity = '0.5';
                try {
                    await updateOrderStatus(orderId, newStatus);

                    const orders = safeJSONParse('druckbau_orders', []);
                    if (orders[index]) {
                        orders[index].status = newStatus;
                        localStorage.setItem('druckbau_orders', JSON.stringify(orders));
                    }
                    
                    showNotification(`Status für ${orderId} auf "${newStatus}" aktualisiert.`);
                } finally {
                    select.style.opacity = '1';
                }
            }
        });

        ordersTable.addEventListener('blur', async (e) => {
            if (e.target.classList.contains('tracking-id-input')) {
                const orderId = e.target.getAttribute('data-order-id');
                const trackingId = e.target.value.trim();
                
                e.target.style.borderColor = 'var(--primary-blue)';
                try {
                    const success = await updateOrderStatus(orderId, null, trackingId);
                    if (success) {
                        showNotification(`Tracking-ID für ${orderId} gespeichert.`);
                        // Local update
                        const orders = safeJSONParse('druckbau_orders', []);
                        const order = orders.find(o => o.orderId === orderId);
                        if (order) {
                            order.trackingId = trackingId;
                            localStorage.setItem('druckbau_orders', JSON.stringify(orders));
                        }
                    }
                } finally {
                    e.target.style.borderColor = '#ccc';
                }
            }
        }, true);
    }

    const deleteCompletedBtn = document.getElementById('delete-completed-orders-btn');
    if (deleteCompletedBtn) {
        deleteCompletedBtn.addEventListener('click', async () => {
            if (confirm("Wirklich alle erledigten (versendeten) Bestellungen in der Datenbank löschen?")) {
                await deleteCompletedOrdersFromDB();
                let orders = JSON.parse(localStorage.getItem('druckbau_orders')) || [];
                const initialLength = orders.length;
                orders = orders.filter(o => o.status !== 'Versendet');
                localStorage.setItem('druckbau_orders', JSON.stringify(orders));
                loadAdminData();
                showNotification(`${initialLength - orders.length} erledigte Bestellungen gelöscht.`);
            }
        });
    }

    // FIX: Missing Newsletter Delete Listener
    const newsletterTable = document.getElementById('newsletter-table');
    if (newsletterTable) {
        newsletterTable.addEventListener('click', (e) => {
            const btn = e.target.closest('.delete-subscriber');
            if (btn) {
                const index = parseInt(btn.getAttribute('data-index'));
                if (confirm("Abonnent wirklich entfernen?")) {
                    const subs = JSON.parse(localStorage.getItem('druckbau_subscribers')) || [];
                    subs.splice(index, 1);
                    localStorage.setItem('druckbau_subscribers', JSON.stringify(subs));
                    loadAdminData();
                    showNotification("Abonnent entfernt.");
                }
            }
        });
    }

    const seasonalBtn = document.querySelector('.seasonal-offer-btn');
    if (seasonalBtn) {
        seasonalBtn.addEventListener('click', async () => {
            const title = prompt("Titel (z.B. Black Friday!):", "Sonderangebot!");
            if (!title) return;
            const desc = prompt("Beschreibung (z.B. 20% auf alles):", "20% Rabatt auf Drucke");
            if (!desc) return;
            
            seasonalBtn.classList.add('btn-loading');
            try {
                const payload = `[OFFER] ${title} | ${desc}`;
                
                // 1. Save to Supabase (if available)
                const dbSuccess = await saveNewsToDB(payload);
                
                // 2. Save to LocalStorage (Always as backup/sync)
                const newsList = JSON.parse(localStorage.getItem('druckbau_news_list') || '[]');
                newsList.unshift({ content: payload, created_at: new Date().toISOString(), text: payload });
                localStorage.setItem('druckbau_news_list', JSON.stringify(newsList));
                
                // Special offer flag for quick local loading
                localStorage.setItem('druckbau_seasonal_offer', JSON.stringify({ title, desc }));

                if (dbSuccess) {
                    showNotification("Sonderangebot erfolgreich veröffentlicht! ✅");
                } else {
                    showNotification("Angebot nur LOKAL gespeichert. ⚠️", "warning");
                }
                loadAdminData();
            } finally {
                seasonalBtn.classList.remove('btn-loading');
            }
        });
    }

    // Also update the general "News" save if it exists (usually triggered by a button in index.html)
    window.saveNewsSync = async (text) => {
        const dbSuccess = await saveNewsToDB(text);
        const newsList = JSON.parse(localStorage.getItem('druckbau_news_list') || '[]');
        newsList.unshift({ content: text, created_at: new Date().toISOString(), text: text });
        localStorage.setItem('druckbau_news_list', JSON.stringify(newsList));
        return dbSuccess;
    };

    const chartRange = document.getElementById('admin-chart-range');
    if (chartRange) {
        chartRange.addEventListener('change', renderOrdersChart);
    }

    // Public Order Tracking Logic
    const submitStatusBtn = document.getElementById('check-status-btn');
    const orderInput = document.getElementById('status-order-id');
    const statusResult = document.getElementById('status-result');
    const statusBadge = document.getElementById('status-badge');

    if (submitStatusBtn && orderInput && statusResult && statusBadge) {
        submitStatusBtn.addEventListener('click', async () => {
            const val = orderInput.value.trim().toUpperCase();
            if (!val) return;

            statusResult.style.display = 'block';
            statusBadge.innerText = 'Lade...';
            statusBadge.style.background = '#ccc';
            statusBadge.style.color = '#333';

            const { fetchOrderById } = await import('./db.js');
            const data = await fetchOrderById(val) || await fetchOrderById(val.replace('#', ''));
            let statusStr = '';

            if (data) {
                statusStr = data.status || 'Eingegangen';
            } else {
                const orders = safeJSONParse('druckbau_orders', []);
                const foundOrder = orders.find(o => o.orderId === val || o.orderId === val.replace('#', ''));
                if (foundOrder) statusStr = foundOrder.status || 'Eingegangen';
            }

            if (statusStr) {
                statusBadge.innerText = statusStr;
                statusBadge.style.color = 'white';

                if (statusStr === 'Versendet') statusBadge.style.background = '#10b981'; // Green
                else if (statusStr === 'Eingegangen') statusBadge.style.background = '#f59e0b'; // Orange
                else statusBadge.style.background = '#3b82f6'; // Blue
            } else {
                statusBadge.innerText = 'Bestellung nicht gefunden';
                statusBadge.style.background = '#ef4444'; // Red
                statusBadge.style.color = 'white';
            }
        });

        // Allow entering via Enter key
        orderInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitStatusBtn.click();
        });
    }
}

async function loadAdminData() {
    const dbNews = await loadNewsFromDB();
    let newsList = [];
    
    if (dbNews && dbNews.length > 0) {
        newsList = dbNews.map(n => ({ id: n.id, text: n.content, date: new Date(n.created_at).toLocaleString() }));
        localStorage.setItem('druckbau_news_list', JSON.stringify(newsList)); // Local sync
    } else {
        newsList = JSON.parse(localStorage.getItem('druckbau_news_list')) || [];
    }

    const historyContainer = document.getElementById('admin-news-history');
    if (historyContainer) {
        if (newsList.length === 0) {
            historyContainer.innerHTML = '<p style="font-size:0.9rem; color:#999; text-align:center;">Kein Verlauf vorhanden.</p>';
        } else {
            historyContainer.innerHTML = newsList.map((item, index) => `
                <div style="border-bottom:1px solid #eee; padding:0.5rem 0; display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="font-size:0.85rem;">
                        <div style="font-weight:bold; color:var(--primary-blue);">${item.date}</div>
                        <div>${escapeHtml(item.text).replace(/\\n/g, '<br>')}</div>
                    </div>
                    <button class="delete-news-item" data-id="${item.id || ''}" data-index="${index}" style="background:none; border:none; color:#d9534f; cursor:pointer; font-size:1.2rem;" title="Löschen">&times;</button>
                </div>
            `).join('');
        }
    }

    const dbOrdersRaw = await loadOrdersFromDB();
    let orders = [];

    if (dbOrdersRaw && dbOrdersRaw.length > 0) {
        // Use DB orders if available mapping them to local format
        orders = dbOrdersRaw.map(dbO => ({
            name: dbO.customer_name,
            email: dbO.customer_email,
            orderId: dbO.order_id,
            message: dbO.order_data.message || '',
            coupon: dbO.order_data.coupon ? { code: dbO.order_data.coupon, discount: dbO.order_data.discount } : null,
            totalPrice: dbO.total_price,
            items: dbO.order_data.cart || [],
            date: new Date(dbO.created_at).toLocaleString(),
            status: dbO.status
        }));
        localStorage.setItem('druckbau_orders', JSON.stringify(orders)); // Keep local sync
    } else {
        orders = safeJSONParse('druckbau_orders', []);
    }

    const ordersBody = document.querySelector('#orders-table tbody');
    if (ordersBody) {
        if (orders.length === 0) {
            ordersBody.innerHTML = '<tr><td colspan="7" style="padding:1rem; text-align:center;">Keine Bestellungen vorhanden.</td></tr>';
        } else {
            ordersBody.innerHTML = orders.map((order, index) => {
                const status = order.status || 'Eingegangen';
                const options = ['Eingegangen', 'In Bearbeitung', 'Gedruckt', 'Versendet'].map(opt =>
                    `<option value="${opt}" ${status === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');

                return `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 0.5rem; font-size: 0.9rem;">${order.date}</td>
                        <td style="padding: 0.5rem;">${escapeHtml(order.name)}</td>
                        <td style="padding: 0.5rem; font-family:monospace;">${escapeHtml(order.orderId)}</td>
                        <td style="padding: 0.5rem;">${escapeHtml(order.email)}</td>
                        <td style="padding: 0.5rem; font-size: 0.9rem;">${escapeHtml(order.message)}</td>
                        <td style="padding: 0.5rem; font-size: 0.85rem;">${order.items ? order.items.map(i => `${i.qty}x ${escapeHtml(i.name || i.nameKey)}`).join('<br>') : '-'}</td>
                        <td style="padding: 0.5rem; font-weight:bold;">${order.totalPrice ? formatCurrency(order.totalPrice) + ' €' : '-'}</td>
                        <td style="padding: 0.5rem; font-size: 0.85rem;">
                            <input type="text" class="tracking-id-input" data-order-id="${order.orderId}" value="${order.trackingId || ''}" placeholder="Tracking ID" style="width:100px; padding:2px; font-size:0.75rem; border:1px solid #ccc; border-radius:3px;">
                        </td>
                        <td style="padding: 0.5rem;">
                            <select class="order-status-select" data-index="${index}" data-order-id="${order.orderId}" style="padding:2px; font-size:0.8rem; border-radius:4px; border:1px solid #ccc;">
                                ${options}
                            </select>
                        </td>
                    </tr >
                    `;
            }).join('');
        }
    }

    const subscribers = JSON.parse(localStorage.getItem('druckbau_subscribers')) || [];
    const newsletterBody = document.querySelector('#newsletter-table tbody');
    if (newsletterBody) {
        if (subscribers.length === 0) {
            newsletterBody.innerHTML = '<tr><td colspan="3" style="padding:1rem; text-align:center;">Keine Abonnenten.</td></tr>';
        } else {
            newsletterBody.innerHTML = subscribers.map((sub, index) => `
                    < tr style = "border-bottom: 1px solid #eee;" >
                    <td style="padding: 0.5rem; font-size: 0.85rem;">${sub.date}</td>
                    <td style="padding: 0.5rem; font-size: 0.85rem;">${escapeHtml(sub.email)}</td>
                    <td style="padding: 0.5rem;">
                        <button class="delete-subscriber" data-index="${index}" style="background:none; border:none; color:#d9534f; cursor:pointer;" title="Entfernen">&times;</button>
                    </td>
                </tr >
                    `).join('');
        }
    }

    // Trigger coupon rendering out of here
    document.dispatchEvent(new Event('render-admin-coupons'));

    renderOrdersChart();

    const dbStats = await loadAnalyticsFromDB();
    const stats = safeJSONParse('druckbau_stats', { views: {}, purchases: {}, revenue: {}, youtube_clicks: 0 });
    
    // Sync DB stats to local
    if (dbStats && dbStats.length > 0) {
        dbStats.forEach(s => {
            if (s.item_id === 'youtube') stats.youtube_clicks = s.views;
            else {
                stats.purchases[s.item_id] = s.purchases;
                stats.revenue[s.item_id] = parseFloat(s.revenue) || 0;
                stats.views[s.item_id] = s.views;
            }
        });
        localStorage.setItem('druckbau_stats', JSON.stringify(stats));
    }

    const statsBody = document.querySelector('#stats-table tbody');
    if (statsBody) {
        let sortedProducts = [...products].sort((a, b) => {
            const revA = stats.revenue ? (stats.revenue[a.id] || 0) : 0;
            const revB = stats.revenue ? (stats.revenue[b.id] || 0) : 0;
            return revB - revA; // Sort by revenue descending
        });

        let statsHtml = sortedProducts.map(p => {
            const buys = stats.purchases[p.id] || 0;
            const rev = stats.revenue ? (stats.revenue[p.id] || 0) : 0;
            return `
                    < tr style = "border-bottom: 1px solid #eee;" >
                    <td style="padding: 0.5rem;">${t(p.nameKey)}</td>
                    <td style="padding: 0.5rem;">${buys}</td>
                    <td style="padding: 0.5rem; color: var(--primary-blue); font-weight: bold;">${formatCurrency(rev)} €</td>
                </tr >
                    `;
        }).join('');

        statsHtml += `
                    < tr style = "background: rgba(46, 204, 113, 0.1);" >
                <td style="padding: 0.5rem; font-weight:bold; color:var(--primary-blue);">YouTube Kanal</td>
                <td style="padding: 0.5rem; font-weight:bold;">${stats.youtube_clicks || 0} Klicks</td>
                <td style="padding: 0.5rem;">-</td>
            </tr >
                    `;

        statsBody.innerHTML = statsHtml;
    }
}

function renderOrdersChart() {
    const canvas = document.getElementById('admin-orders-chart');
    const rangeSelect = document.getElementById('admin-chart-range');
    if (!canvas || !window.Chart) return;

    const orders = safeJSONParse('druckbau_orders', []);
    const range = rangeSelect ? rangeSelect.value : '1w';

    let daysToDisplay = 7;
    if (range === 'day') daysToDisplay = 1;
    else if (range === '1w') daysToDisplay = 7;
    else if (range === '1m') daysToDisplay = 30;
    else if (range === '5m') daysToDisplay = 150;
    else if (range === 'all') {
        if (orders.length > 0) {
            const firstDate = new Date(orders[orders.length - 1].date.split(',')[0].split('.').reverse().join('-'));
            const diffTime = Math.abs(new Date() - firstDate);
            daysToDisplay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        } else {
            daysToDisplay = 7;
        }
    }

    const labels = [];
    const dataPoints = [];
    const revPoints = [];

    for (let i = daysToDisplay - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('de-DE');
        labels.push(dateStr);

        const dayOrders = orders.filter(o => o.date.startsWith(dateStr));
        dataPoints.push(dayOrders.length);

        const dayRev = dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        revPoints.push(dayRev);
    }

    let finalLabels = labels;
    let finalData = dataPoints;
    let finalRev = revPoints;
    if (daysToDisplay > 31) {
        finalLabels = labels.map((l, i) => (i % 7 === 0 || i === labels.length - 1) ? l : '');
    }

    if (window.myAdminChart) {
        window.myAdminChart.destroy();
    }

    window.myAdminChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: finalLabels,
            datasets: [
                {
                    label: 'Bestellungen',
                    data: finalData,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: daysToDisplay > 30 ? 0 : 3
                },
                {
                    label: 'Umsatz (€)',
                    data: finalRev,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y1',
                    pointRadius: daysToDisplay > 30 ? 0 : 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } 
            },
            scales: {
                y: { 
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true, 
                    ticks: { stepSize: 1, precision: 0 },
                    title: { display: true, text: 'Bestellungen', font: { size: 10 } }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Umsatz (€)', font: { size: 10 } }
                },
                x: { grid: { display: false } }
            }
        }
    });

    const revCanvas = document.getElementById('admin-revenue-chart');
    if (revCanvas) {
        if (window.myRevChart) window.myRevChart.destroy();
        window.myRevChart = new Chart(revCanvas, {
            type: 'line',
            data: {
                labels: finalLabels,
                datasets: [{
                    label: 'Umsatz (€)',
                    data: finalRev,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: daysToDisplay > 30 ? 0 : 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

async function triggerAdminRefresh() {
    const adminSection = document.getElementById('admin');
    if (adminSection && (adminSection.style.display === 'block' || adminSection.classList.contains('active'))) {
        await loadAdminData();
    }
}

// Analytics Helpers
async function trackProductView(productId) {
    await trackAnalyticInDB(productId, 'view', 1);

    const stats = safeJSONParse('druckbau_stats', { views: {}, purchases: {}, youtube_clicks: 0 });
    stats.views[productId] = (stats.views[productId] || 0) + 1;
    localStorage.setItem('druckbau_stats', JSON.stringify(stats));
}

async function trackProductPurchase(items) {
    const stats = safeJSONParse('druckbau_stats', { views: {}, purchases: {}, revenue: {}, youtube_clicks: 0 });
    if (!stats.revenue) stats.revenue = {};

    if (Array.isArray(items)) {
        for (const item of items) {
            if (!item.isCustom) {
                await trackAnalyticInDB(item.id, 'purchase', item.qty);
                await trackAnalyticInDB(item.id, 'revenue', item.price * item.qty);
                stats.purchases[item.id] = (stats.purchases[item.id] || 0) + item.qty;
                stats.revenue[item.id] = (stats.revenue[item.id] || 0) + (item.price * item.qty);
            }
        }
    } else if (typeof items === 'string') {
        await trackAnalyticInDB(items, 'purchase', 1);
        stats.purchases[items] = (stats.purchases[items] || 0) + 1;
    }

    localStorage.setItem('druckbau_stats', JSON.stringify(stats));
    triggerAdminRefresh();
}

async function trackYouTubeClick() {
    await trackAnalyticInDB('youtube', 'view', 1);

    const stats = safeJSONParse('druckbau_stats', { views: {}, purchases: {}, youtube_clicks: 0 });
    stats.youtube_clicks = (stats.youtube_clicks || 0) + 1;
    localStorage.setItem('druckbau_stats', JSON.stringify(stats));
    triggerAdminRefresh();
}

function exportOrdersToCSV() {
    const orders = safeJSONParse('druckbau_orders', []);
    if (orders.length === 0) {
        alert("Keine Bestellungen zum Exportieren vorhanden.");
        return;
    }

    const headers = ['Datum', 'Name', 'Bestell-ID', 'Email', 'Nachricht', 'Gutschein', 'Rabatt', 'Status'];
    const rows = orders.map(o => [
        o.date,
        `"${o.name}"`,
        o.orderId,
        o.email,
        `"${o.message.replace(/"/g, '""')}"`,
        o.coupon ? o.coupon.code : '-',
        o.coupon ? o.coupon.discount : 0,
        o.status || 'Eingegangen'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `druckbau_bestellungen_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- script.js ---
// script.js - Main Application Entry Point

async function init() {
    initDB();
    setupNavigation();
    setupThemeToggle();
    setupChat();
    setupLightbox();
    
    await initCoupons();
    await loadPublicNews();

    if (document.getElementById('products-grid')) {
        loadCartFromStorage();
        loadWishlistFromStorage();
        addPrintTimeBadges();
        renderProducts();
        updateCartIcon();

        setupFAQ();
        initOrderStatusChecker();
    }

    // Pass global utilities that inline HTML or older scripts might need
    window.updateColorPreview = updateColorPreview;
    window.switchGalleryImage = switchGalleryImage;
    window.renderProducts = renderProducts;
    window.renderCart = renderCart;
    window.renderWishlist = renderWishlist;
    window.submitCheckout = submitCheckout;
    window.nextCheckoutStep = nextCheckoutStep;
    window.prevCheckoutStep = prevCheckoutStep;
    window.closeCheckoutModal = closeCheckoutModal;
    window.triggerAdminRefresh = triggerAdminRefresh;

    window.trackYouTubeClick = trackYouTubeClick;

    initAdminSystem();
    setupGlobalEventListeners();
}

async function loadPublicNews() {
    const newsSection = document.getElementById('news');
    const newsText = document.getElementById('news-text');
    const newsDate = document.getElementById('news-date');
    if (!newsSection || !newsText) return;

    let newsList = await loadNewsFromDB();
    
    // Fallback if DB is empty/fails
    if (!newsList || newsList.length === 0) {
        newsList = JSON.parse(localStorage.getItem('druckbau_news_list') || '[]');
    }

    if (newsList && newsList.length > 0) {
        const latestInfo = newsList[0];
        const content = latestInfo.content || latestInfo.text;
        
        if (content && content.startsWith('[OFFER]')) {
            const parts = content.replace('[OFFER] ', '').split('|');
            const offerBanner = document.getElementById('seasonal-offer-banner');
            if (offerBanner) {
                offerBanner.style.display = 'block';
                const titleEl = document.getElementById('offer-title-text');
                const descEl = document.getElementById('offer-description-text');
                if (titleEl) titleEl.innerText = parts[0] ? parts[0].trim() : 'Sonderangebot!';
                if (descEl) descEl.innerText = parts[1] ? parts[1].trim() : '';
                const countdown = document.querySelector('.countdown-timer');
                if (countdown) countdown.style.display = 'none';
            }
            newsSection.style.display = 'none';
        } else if (content) {
            newsSection.style.display = 'block';
            newsText.innerHTML = content.replace(/\\n/g, '<br>');
            if (newsDate) {
                const date = latestInfo.created_at || latestInfo.date;
                newsDate.textContent = date ? new Date(date).toLocaleDateString('de-DE') : '';
            }
        }
    } else {
        newsSection.style.display = 'none';
        newsText.innerHTML = "Aktuell keine Neuigkeiten.";
        if (newsDate) newsDate.textContent = "";
    }
}

function setupGlobalEventListeners() {
    document.body.addEventListener('click', (e) => {
        const target = e.target;

        if (target.id === 'checkout-btn') checkout();
        if (target.closest('#close-checkout')) closeCheckoutModal();
        if (target.closest('.next-step-btn')) nextCheckoutStep();
        if (target.closest('.back-step-btn')) prevCheckoutStep();
        if (target.id === 'final-checkout-btn') submitCheckout();

        if (target.closest('.rate-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const btn = target.closest('.rate-btn');
            openReviewModal(btn.dataset.id, btn.dataset.name);
        }
        if (target.closest('.view-reviews-btn')) {
            const btn = target.closest('.view-reviews-btn');
            openReviewListModal(btn.dataset.id, btn.dataset.name);
        }
        if (target.closest('#review-modal .close-modal')) {
            closeReviewModal();
        }

        if (target.closest('.add-to-cart-btn')) addToCart(target.closest('.add-to-cart-btn').dataset.id);
        if (target.closest('.add-custom-btn')) addCustomToCart(target.closest('.add-custom-btn').dataset.id);
        if (target.closest('.wishlist-btn')) {
            e.preventDefault();
            toggleWishlist(target.closest('.wishlist-btn').dataset.id);
        }
        if (target.closest('.remove-btn') && target.closest('.remove-btn').dataset.index !== undefined) {
            removeFromCart(parseInt(target.closest('.remove-btn').dataset.index));
        }

        if (target.id === 'apply-coupon-btn') applyCoupon();
        if (target.id === 'remove-coupon-btn') removeCoupon();

        if (target.classList.contains('wishlist-add-to-cart-btn')) {
            addToCartFromWishlist(target.dataset.productId);
        }
        if (target.classList.contains('wishlist-remove-btn')) {
            toggleWishlist(target.dataset.productId);
        }

        if (target.classList.contains('main-img')) {
            const card = target.closest('.product-card');
            if (card) {
                const id = card.dataset.productId;
                if (window.openLightbox) window.openLightbox(target.src);
                trackProductView(id);
            }
        }
        
        if (target.classList.contains('thumbnail')) {
            const card = target.closest('.product-card');
            if (card) {
                const src = target.getAttribute('data-src') || target.src;
                if (window.switchGalleryImage) window.switchGalleryImage(src, target);
                trackProductView(card.dataset.productId);
            }
        }
        
        if (target.closest('.youtube-link')) {
            trackYouTubeClick();
        }

        if (target.innerText && target.innerText.includes('Export') && target.classList.contains('contact-btn')) exportOrdersToCSV();

        if (target.id === 'check-status-btn') {
            handleStatusCheck();
        }
    });

    document.body.addEventListener('change', (e) => {
        if (e.target.classList.contains('color-select')) {
            updateColorPreview(e.target, e.target.dataset.id);
        }
    });

    document.addEventListener('wishlist-updated', () => {
        renderProducts();
        if (document.getElementById('wishlist').classList.contains('active')) {
            renderWishlist();
        }
    });

    // Custom Event listener for navigating via code
    document.addEventListener('navigate', (e) => {
        if (window.showSection) window.showSection(e.detail);
    });

    // Language switcher logic will remain mostly global for now, handled here if needed

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', submitReview);
    }
}

async function handleStatusCheck() {
    const input = document.getElementById('status-order-id');
    const badge = document.getElementById('status-badge');
    const resultDiv = document.getElementById('status-result');
    if (!input || !badge || !resultDiv) return;

    const orderId = input.value.trim().replace('#', '').toUpperCase();
    if (!orderId) return;

    badge.innerText = t('status_searching') || "Suche...";
    badge.style.background = "#eee";
    badge.style.color = "#333";
    resultDiv.style.display = 'block';

    try {
        // 1. Try Supabase
        const { loadOrdersFromDB } = await import('./js/db.js');
        const dbOrders = await loadOrdersFromDB();
        let order = dbOrders ? dbOrders.find(o => o.orderId === orderId) : null;

        // 2. Fallback LocalStorage
        if (!order) {
            const localOrders = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
            order = localOrders.find(o => o.orderId === orderId);
        }

        if (order) {
            const status = order.status || 'Eingegangen';
            badge.innerText = status;
            
            // Nice coloring
            if (status.includes('Versendet')) {
                badge.style.background = '#d4edda';
                badge.style.color = '#155724';
            } else if (status.includes('Bearbeitung') || status.includes('Gedruckt')) {
                badge.style.background = '#fff3cd';
                badge.style.color = '#856404';
            } else {
                badge.style.background = '#e9ecef';
                badge.style.color = '#495057';
            }
        } else {
            badge.innerText = t('status_not_found') || "Nicht gefunden";
            badge.style.background = '#f8d7da';
            badge.style.color = '#721c24';
        }
    } catch (err) {
        console.error("Status check failed", err);
        badge.innerText = "Fehler bei der Abfrage.";
    }
}

function initOrderStatusChecker() {
    // Basic setup if needed, most is handled via event delegation now
    console.log("Order Status Checker initialized");
}

// Start App
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
