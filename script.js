// script.js - Main Application Entry Point
import { loadCartFromStorage, loadWishlistFromStorage, initCoupons } from './js/store.js';
import { renderProducts, addPrintTimeBadges, updateColorPreview, switchGalleryImage } from './js/products.js';
import { renderCart, updateCartIcon, updateWishlistIcon, addToCart, addCustomToCart, toggleWishlist, removeFromCart, applyCoupon, removeCoupon, renderWishlist, addToCartFromWishlist } from './js/cart.js';
import { checkout, closeCheckoutModal, submitCheckout, nextCheckoutStep, prevCheckoutStep } from './js/checkout.js';
import { setupThemeToggle, setupChat, setupLightbox, setupFAQ, setupNavigation, sendEmail, initNewsletterSystem } from './js/ui.js';
import { initAdminSystem, triggerAdminRefresh, loadAdminData, exportOrdersToCSV, trackProductView, trackProductPurchase, trackYouTubeClick } from './js/admin.js';
import { openReviewModal, openReviewListModal, closeReviewModal, submitReview, initReviews } from './js/reviews.js';
import { initTranslations } from './translations.js';

async function init() {
    initTranslations();

    setupNavigation();
    setupThemeToggle();
    setupChat();
    setupLightbox();
    setupGlobalEventListeners();
    initNewsletterSystem();
    initReviews();
    
    await initCoupons();
    await loadPublicNews();

    if (document.getElementById('products-grid')) {
        loadCartFromStorage();
        loadWishlistFromStorage();
        addPrintTimeBadges();
        renderProducts();
        updateCartIcon();
        setupFAQ();
    }

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
    window.sendEmail = sendEmail;

    initAdminSystem();
    setupGlobalEventListeners();
    
    document.addEventListener('wishlist-updated', () => {
        renderProducts();
        renderWishlist();
        updateCartIcon();
        updateWishlistIcon();
        setupFAQ();
    });
    
}

async function loadPublicNews() {
    const newsSection = document.getElementById('news');
    const newsText = document.getElementById('news-text');
    const newsDate = document.getElementById('news-date');
    if (!newsSection || !newsText) return;

    const newsList = JSON.parse(localStorage.getItem('druckbau_news_list') || '[]');

    if (newsList && newsList.length > 0) {
        const latestInfo = newsList[0];
        const content = latestInfo.content || latestInfo.text;
        if (content) {
            newsText.innerHTML = content.replace(/\n/g, '<br>');
            if (newsDate) {
                const date = latestInfo.created_at || latestInfo.date;
                newsDate.textContent = date ? new Date(date).toLocaleDateString('de-DE') : '';
            }
        }
    } else {
        newsText.innerHTML = 'Aktuell gibt es keine Neuigkeiten.';
        if (newsDate) {
            newsDate.textContent = '';
        }
    }
}

function setupGlobalEventListeners() {
    document.body.addEventListener('click', (e) => {
        const target = e.target;

        if (target.id === 'final-checkout-btn' || target.closest('#final-checkout-btn')) {
            const agbCheckbox = document.getElementById('checkout-agb');
            const revCheckbox = document.getElementById('checkout-revocation');
            
            if ((agbCheckbox && !agbCheckbox.checked) || (revCheckbox && !revCheckbox.checked)) {
                // If utils.js has showWarning, use it, else alert
                if (typeof showWarning === 'function') {
                    showWarning('Bitte akzeptieren Sie die AGB und die Widerrufsbelehrung, um fortzufahren.');
                } else {
                    alert('Bitte akzeptieren Sie die AGB und die Widerrufsbelehrung, um fortzufahren.');
                }
                return;
            }
            
            if (typeof submitCheckout === 'function') {
                submitCheckout();
            }
            return;
        }

        // PRIORITIZE BUTTONS (Wishlist, Add to Cart, etc.)
        if (target.closest('.wishlist-btn')) {
            toggleWishlist(target.closest('.wishlist-btn').dataset.id);
            return;
        }

        if (target.closest('.add-to-cart-btn')) {
            addToCart(target.closest('.add-to-cart-btn').dataset.id);
            return;
        }
        
        if (target.closest('.add-custom-btn')) {
            addCustomToCart(target.closest('.add-custom-btn').dataset.id);
            return;
        }

        if (target.closest('.rate-btn')) {
            const btn = target.closest('.rate-btn');
            openReviewModal(btn.dataset.id, btn.dataset.name);
            return;
        }

        if (target.closest('.view-reviews-btn')) {
            const btn = target.closest('.view-reviews-btn');
            openReviewListModal(btn.dataset.id, btn.dataset.name);
            return;
        }

        if (target.closest('#check-status-btn')) {
            handleStatusCheck();
            return;
        }

        if (target.closest('.wishlist-remove-btn')) {
            toggleWishlist(target.closest('.wishlist-remove-btn').dataset.productId);
            return;
        }

        if (target.closest('.wishlist-add-to-cart-btn')) {
            addToCartFromWishlist(target.closest('.wishlist-add-to-cart-btn').dataset.productId);
            return;
        }

        // Cart Actions (Remove Item, Apply/Remove Coupon, Checkout)
        if (target.closest('.remove-btn')) {
            const removeBtn = target.closest('.remove-btn');
            const indexAttr = removeBtn.getAttribute('data-index') || removeBtn.dataset.index;
            const index = parseInt(indexAttr);
            if (!isNaN(index)) {
                removeFromCart(index);
            }
            return;
        }

        if (target.id === 'apply-coupon-btn' || target.closest('#apply-coupon-btn')) {
            applyCoupon();
            return;
        }

        if (target.id === 'remove-coupon-btn' || target.closest('#remove-coupon-btn')) {
            removeCoupon();
            return;
        }

        if (target.classList.contains('checkout-btn') || target.closest('.checkout-btn')) {
            checkout();
            return;
        }

        // IMAGE GALLERY / LIGHTBOX
        if (target.closest('.main-image-container')) {
            const card = target.closest('.product-card');
            if (card) {
                const id = card.dataset.productId;
                const thumbs = Array.from(card.querySelectorAll('.thumbnail'));
                const imgList = thumbs.map(t => t.getAttribute('data-src') || t.src);
                
                const activeThumb = card.querySelector('.thumbnail.active');
                const startIndex = activeThumb ? thumbs.indexOf(activeThumb) : 0;

                if (window.openLightbox) window.openLightbox(imgList, startIndex);
                trackProductView(id);
            }
            return;
        }

        if (target.closest('.thumbnail')) {
            const card = target.closest('.product-card');
            if (card) {
                const thumb = target.closest('.thumbnail');
                const src = thumb.getAttribute('data-src') || thumb.src;
                if (window.switchGalleryImage) window.switchGalleryImage(src, thumb);
            }
            return;
        }

        if (target.closest('.wishlist-remove-btn')) {
            toggleWishlist(target.closest('.wishlist-remove-btn').dataset.productId);
            return;
        }
        
        if (target.closest('.wishlist-add-to-cart-btn')) {
            addToCartFromWishlist(target.closest('.wishlist-add-to-cart-btn').dataset.productId);
            return;
        }
    });

    document.body.addEventListener('change', (e) => {
        if (e.target.classList.contains('color-select')) {
            updateColorPreview(e.target, e.target.dataset.id);
        }
    });
}

async function handleStatusCheck() {
    const input = document.getElementById('status-order-id');
    const badge = document.getElementById('status-badge');
    const resultDiv = document.getElementById('status-result');
    if (!input || !badge || !resultDiv) return;

    const orderId = input.value.trim().replace('#', '').toUpperCase();
    if (!orderId) return;

    badge.innerText = "Suche...";
    resultDiv.style.display = 'block';

    try {
        const locals = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
        const order = locals.find(o => o.orderId === orderId);

        if (order) {
            badge.innerText = order.status || 'Eingegangen';
            badge.style.background = '#cce5ff';
            badge.style.color = '#004085';
        } else {
            badge.innerText = "Nicht gefunden";
            badge.style.background = '#f8d7da';
        }
    } catch (err) {
        badge.innerText = "Fehler.";
    }
}

init();
