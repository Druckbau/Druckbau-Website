import { loadReviews, saveReview } from './store.js';
import { renderProducts, renderStars } from './products.js';
import { escapeHtml, showNotification, t } from './utils.js';

export function openReviewModal(productId, productName) {
    console.log("Opening review modal for:", productId);
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
    
    modal.classList.add('show');
}

export function openReviewListModal(productId, productName) {
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

export function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.classList.remove('show');
}

// Ensure background click closes modal but content click doesn't
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('review-modal');
    if (modal) {

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeReviewModal();
            }
        });
    }
});

export function submitReview(e) {
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
