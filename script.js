// script.js - Main Application Entry Point
import { loadCartFromStorage, loadWishlistFromStorage, initCoupons } from './js/store.js';
import { renderProducts, addPrintTimeBadges, updateColorPreview, switchGalleryImage } from './js/products.js';
import { renderCart, updateCartIcon, addToCart, addCustomToCart, toggleWishlist, removeFromCart, applyCoupon, removeCoupon, renderWishlist, addToCartFromWishlist } from './js/cart.js';
import { checkout, closeCheckoutModal, submitCheckout, nextCheckoutStep, prevCheckoutStep } from './js/checkout.js';
import { setupThemeToggle, setupChat, setupLightbox, setupFAQ, setupNavigation } from './js/ui.js';
import { initAdminSystem, triggerAdminRefresh, loadAdminData, exportOrdersToCSV, trackProductView, trackProductPurchase, trackYouTubeClick } from './js/admin.js';
import { initDB, loadNewsFromDB } from './js/db.js';

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
