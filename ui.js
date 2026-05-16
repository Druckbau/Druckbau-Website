// js/ui.js
import { escapeHtml, showNotification, t } from './utils.js';

let currentGallery = [];
let currentImgIndex = 0;

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
    const toggleBtn = document.getElementById('chat-toggle');
    const closeBtn = document.querySelector('.chat-close-btn');
    const chatWindow = document.getElementById('chat-window');
    const sendBtn = document.querySelector('.chat-send-btn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (chatWindow) {
                const isVisible = chatWindow.style.display === 'flex';
                chatWindow.style.display = isVisible ? 'none' : 'flex';
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (chatWindow) chatWindow.style.display = 'none';
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            sendChatMessage();
        });
    }

    window.toggleChat = () => {
        if (chatWindow) {
            chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
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

    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }

    document.querySelectorAll('.quick-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.sendQuickReply(btn.innerText);
        });
    });
}

function appendMessage(text, sender) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.innerHTML = `
        ${sender === 'bot' ? '<div class="chat-avatar">🤖</div>' : ''}
        <div class="chat-bubble">${escapeHtml(text)}</div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function getBotResponse(text) {
    const t = text.toLowerCase();
    if (t.includes('lieferung') || t.includes('versand') || t.includes('dauer')) {
        return "Unsere Lieferzeit beträgt in der Regel 3-5 Werktage nach Zahlungseingang.";
    } else if (t.includes('kosten') || t.includes('preis') || t.includes('euro')) {
        return "Die Standardversandkosten betragen 4,90€. Spezifische Produktpreise findest du im Katalog.";
    } else {
        return "Vielen Dank für deine Nachricht. Unser Support-Team meldet sich bald bei dir.";
    }
}

export function setupLightbox() {
    window.openLightbox = (imgList, startIndex = 0) => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        if (!lightbox || !lightboxImg) return;

        currentGallery = Array.isArray(imgList) ? imgList : [imgList];
        currentImgIndex = startIndex;

        updateLightboxImage();
        lightbox.classList.add('show');
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = () => {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('show');
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    const nextBtn = document.getElementById('next-img');
    const prevBtn = document.getElementById('prev-img');

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImgIndex = (currentImgIndex + 1) % currentGallery.length;
            updateLightboxImage();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImgIndex = (currentImgIndex - 1 + currentGallery.length) % currentGallery.length;
            updateLightboxImage();
        });
    }

    function updateLightboxImage() {
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg) {
            lightboxImg.src = currentGallery[currentImgIndex];
        }
        
        const nextBtn = document.getElementById('next-img');
        const prevBtn = document.getElementById('prev-img');
        if (nextBtn && prevBtn) {
            const isSingle = currentGallery.length <= 1;
            nextBtn.style.display = isSingle ? 'none' : 'block';
            prevBtn.style.display = isSingle ? 'none' : 'block';
        }
    }
}

export function setupFAQ() {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            const faqAnswer = button.nextElementSibling;
            faqItem.classList.toggle('active');
            if (faqItem.classList.contains('active')) {
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
            } else {
                faqAnswer.style.maxHeight = null;
            }
        });
    });
}

export function setupNavigation() {
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link, .cart-icon-container, .wishlist-icon-container, .footer-link.nav-trigger, .contact-trigger, .nav-trigger');
        if (!link) return;
        const targetId = link.getAttribute('data-target');
        if (targetId) {
            e.preventDefault();
            showSection(targetId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    window.showSection = showSection;
}

export function showSection(id) {
    document.querySelectorAll('section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const target = document.getElementById(id);
    if (target) {
        target.style.setProperty('display', (id === 'home' ? 'flex' : 'block'), 'important');
        setTimeout(() => target.classList.add('active'), 10);
    }
}
