// js/ui.js
import { escapeHtml, showNotification, t } from './utils.js';

export function setupThemeToggle() {
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

export function setupChat() {
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

export function setupLightbox() {
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

export function setupFAQ() {
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
export function setupNavigation() {
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

export function showSection(id) {
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
