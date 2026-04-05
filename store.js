// js/store.js
import { loadCouponsFromDB } from './db.js';

export const products = [
    { id: 'a', nameKey: 'catalog_fidget_name', price: 3.99, images: ['logo.jpg'] },
    { id: 'b', nameKey: 'catalog_poop_name', price: 14.99, descKey: 'catalog_poop_desc', images: ['hund_1.jpg', 'hund_2.jpg', 'hund_3.jpg', 'hund_4.jpg', 'hund_5.jpg'] },
    { id: 'c', nameKey: 'catalog_vase_name', price: 11.99, descKey: 'catalog_vase_desc', images: ['vase_1.jpg', 'vase_2.jpg'] },
    { id: 'e', nameKey: 'catalog_pen_name', price: 6.99, descKey: 'catalog_pen_desc', images: ['logo.jpg'] },
    { id: 'd', nameKey: 'catalog_custom_name', price: 0, isCustom: true }
];

export const colors = [
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

export const SHIPPING_COST = 4.90;

export const state = {
    cart: [],
    wishlist: [],
    coupons: {},
    appliedCoupon: null
};

export function saveCartToStorage() {
    localStorage.setItem('druckbau_cart', JSON.stringify(state.cart));
}

export function loadCartFromStorage() {
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

export function loadWishlistFromStorage() {
    const saved = localStorage.getItem('druckbau_wishlist');
    if (saved) {
        try {
            state.wishlist = JSON.parse(saved);
        } catch (e) {
            state.wishlist = [];
        }
    }
}

export function saveWishlistToStorage() {
    localStorage.setItem('druckbau_wishlist', JSON.stringify(state.wishlist));
}

export async function initCoupons() {
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

export function saveCoupons() {
    localStorage.setItem('druckbau_coupons', JSON.stringify(state.coupons));
}

// Helper for safe JSON parsing
export function safeJSONParse(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        return fallback;
    }
}

export function loadReviews() {
    try {
        return safeJSONParse('productReviews', {});
    } catch (e) {
        return {};
    }
}

export function saveReview(productId, review) {
    const reviews = loadReviews();
    if (!reviews[productId]) {
        reviews[productId] = [];
    }
    reviews[productId].push(review);
    localStorage.setItem('productReviews', JSON.stringify(reviews));
}
