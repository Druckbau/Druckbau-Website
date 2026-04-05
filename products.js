// js/products.js
import { products, colors, state, loadReviews } from './store.js';
import { trackProductView } from './admin.js';
import { escapeHtml, t } from './utils.js';

export function renderProducts() {
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
                    <div class="option-group">
                        <label>${t('product_order_custom_files')}</label>
                        <input type="file" id="custom-files-${product.id}" multiple class="qty-input file-input-trigger" data-id="${product.id}" style="padding: 5px;">
                        <span style="font-size: 0.75rem; color: var(--text-light);">${t('product_order_custom_files_tip')}</span>
                        <ul id="file-list-${product.id}" class="selected-files-list"></ul>
                        <div class="file-warning-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                            </svg>
                            <span>${t('product_order_custom_files_warning')}</span>
                        </div>
                    </div>
                </div>

                <button type="button" class="add-btn add-custom-btn" data-id="${product.id}">
                    ${t('product_add_cart')}
                </button>
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
                 ${product.images && product.images.length > 1 ? `
                <div class="thumbnail-row">
                    ${product.images.map((img, index) => `
                        <img src="${img}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                             data-src="${img}">
                    `).join('')}
                </div>` : ''}
            </div>

            <div class="product-info">
                <h3>${t(product.nameKey)}</h3>
                ${ratingHtml}
                ${product.descKey ? `<p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.5rem;">${t(product.descKey)}</p>` : ''}
                <div class="price">${product.price.toFixed(2)} € <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-light); display: block;">${t('price_hint')} ${t('shipping_hint')}</span></div>
                
                <div class="product-options">
                    <div class="option-group">
                        <label>${t('product_quantity')}</label>
                        <input type="number" id="qty-${product.id}" value="1" min="1" class="qty-input">
                    </div>
                    
                    <div class="option-group">
                        <label>${t('product_color')}</label>
                        <div class="color-preview-container">
                            <select id="color-${product.id}" class="color-select" data-id="${product.id}">
                                ${colors.map(c => `<option value="${c.value}">${c.name}</option>`).join('')}
                            </select>
                            <div id="preview-${product.id}" class="color-preview preview-blue"></div>
                        </div>
                    </div>

                    <div id="custom-color-wrapper-${product.id}" class="option-group" style="display: none;">
                        <label style="color: var(--primary-blue);">${t('product_custom_color_label')}</label>
                        <input type="text" id="custom-color-input-${product.id}" placeholder="${t('product_custom_color_placeholder')}" class="qty-input">
                        <div class="warning-msg">
                            <strong>${t('product_custom_color_warning_ref')}</strong> ${t('product_custom_color_warning_text')}
                        </div>
                    </div>
                </div>

                <button type="button" class="add-btn add-to-cart-btn" data-id="${product.id}">
                    ${t('product_add_cart')}
                </button>
                <div id="cart-animation-${product.id}" style="position: absolute; right: 20px; bottom: 80px; pointer-events: none;"></div>
            </div>
        </div>
    `}).join('');
}


export function updateColorPreview(select, id) {
    const preview = document.getElementById(`preview-${id}`);
    const customWrapper = document.getElementById(`custom-color-wrapper-${id}`);

    if (preview) preview.className = `color-preview preview-${select.value}`;

    if (select.value === 'custom') {
        if (customWrapper) customWrapper.style.display = 'block';
    } else {
        if (customWrapper) customWrapper.style.display = 'none';
    }
}

export function switchGalleryImage(src, thumbElement) {
    if (!thumbElement) return;
    const card = thumbElement.closest('.product-card');
    if (!card) return;

    const mainImg = card.querySelector('.main-img');
    if (mainImg) mainImg.src = src;

    card.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbElement.classList.add('active');
}

export function getAverageRating(productId) {
    const reviews = loadReviews();
    const productReviews = reviews[productId] || [];
    if (productReviews.length === 0) return 0;

    const sum = productReviews.reduce((acc, r) => acc + parseInt(r.rating), 0);
    return (sum / productReviews.length).toFixed(1);
}

export function renderStars(rating) {
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

export function addPrintTimeBadges() {
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
