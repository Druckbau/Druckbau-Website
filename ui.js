import { escapeHtml, showNotification, t, showSuccess, showWarning, showError } from './utils.js';
import { logOrder } from './admin.js';

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
    const closeBtn = document.querySelector('.chat-close-btn');
    const chatWindow = document.getElementById('chat-window');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (chatWindow) chatWindow.style.display = 'none';
        });
    }

    window.toggleChat = () => {
        if (chatWindow) {
            chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        }
    };
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
    document.querySelectorAll('.faq-item').forEach(item => {
        const button = item.querySelector('.faq-question');
        const faqAnswer = item.querySelector('.faq-answer');
        
        if (button && faqAnswer) {
            item.addEventListener('mouseenter', () => {
                item.classList.add('active');
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
            });
            item.addEventListener('mouseleave', () => {
                item.classList.remove('active');
                faqAnswer.style.maxHeight = null;
            });
            // Fallback for mobile/click
            button.addEventListener('click', () => {
                item.classList.toggle('active');
                if (item.classList.contains('active')) {
                    faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
                } else {
                    faqAnswer.style.maxHeight = null;
                }
            });
        }
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

        // Update nav links active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === id) {
                link.classList.add('active');
            }
        });

        // Render dynamic views on navigation
        if (id === 'cart' && typeof window.renderCart === 'function') window.renderCart();
        if (id === 'wishlist' && typeof window.renderWishlist === 'function') window.renderWishlist();
    }
}

export async function sendEmail(event) {
    if (event) event.preventDefault();

    // Honeypot check
    const hp = document.getElementById('hp_name')?.value || '';
    if (hp) {
        console.warn("Spam detected via honeypot.");
        return;
    }

    // Consent check
    const gdprCheckbox = document.getElementById('contact-gdpr');
    if (gdprCheckbox && !gdprCheckbox.checked) {
        showWarning("Bitte akzeptieren Sie die Datenschutzerklärung.");
        return;
    }

    const name = document.getElementById('contact-name')?.value || '';
    const email = document.getElementById('contact-email')?.value || '';
    const message = document.getElementById('contact-message')?.value || '';

    if (name.trim().length < 2) {
        showWarning("Bitte geben Sie Ihren Namen ein (min. 2 Zeichen).");
        return;
    }

    if (!email.includes('@') || email.length < 5) {
        showWarning("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
        return;
    }

    if (message.trim().length < 10) {
        showWarning("Bitte geben Sie eine Nachricht ein (min. 10 Zeichen).");
        return;
    }

    // Priority keyword analysis
    const urgentKeywords = [
        'dringend', 'sofort', 'defekt', 'kaputt', 'beschwerde', 'problem', 'hilfe', 'eilig', 'wichtig', 'notfall',
        'reklamation', 'rückerstattung', 'stornierung', 'frist', 'deadline', 'fehler', 'falsch', 'nicht erhalten',
        'vermisst', 'beschädigt', 'kaput', 'geld zurück', 'schaden', 'anzeige', 'mahnung'
    ];
    const mediumKeywords = ['frage', 'bestellung', 'status', 'wann', 'angebot', 'termin', 'lieferzeit', 'versand'];

    let prioritySubject = "Anfrage über Webseite";
    const lowerMsg = message.toLowerCase();
    const isUrgent = urgentKeywords.some(keyword => lowerMsg.includes(keyword));
    const isMedium = !isUrgent && mediumKeywords.some(keyword => lowerMsg.includes(keyword));

    if (isUrgent) {
        prioritySubject = "[HOHE PRIORITÄT] " + prioritySubject;
    } else if (isMedium) {
        prioritySubject = "[MITTLERE PRIORITÄT] " + prioritySubject;
    }

    // Generate reference ID
    const inquiryId = `DB-REQ-${Date.now().toString().slice(-6)}`;

    // 1. Open native email client synchronously first
    const body = `Hallo Druckbau Team,\n\nIch habe eine Anfrage:\nReferenz: ${inquiryId}\n\nKundendaten:\nName: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}\n\nVielen Dank!`;
    const mailtoLink = `mailto:druckbau.info@gmail.com?subject=${encodeURIComponent(prioritySubject)}&body=${encodeURIComponent(body)}`;
    
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // 2. Log inquiry in database/local storage
    logOrder(name, email, inquiryId, message, null, 0, []);

    // 3. Send via EmailJS in the background
    const templateParams = {
        order_id: inquiryId,
        customer_name: name,
        customer_email: email,
        customer_address: "Online-Kontaktformular",
        order_details: message,
        total_price: "-"
    };

    try {
        if (typeof emailjs !== 'undefined') {
            await emailjs.send("service_mlst2ql", "template_sj2lgvo", templateParams);
            console.log("EmailJS: Kontaktanfrage gesendet.");
        } else {
            console.warn("EmailJS ist nicht geladen.");
        }
    } catch (emailErr) {
        console.error("Fehler beim E-Mail-Versand (EmailJS):", emailErr);
    }

    showSuccess("Ihr E-Mail-Programm wurde geöffnet. Bitte senden Sie die Nachricht ab!");
    const form = document.querySelector('.contact-form');
    if (form) form.reset();
}

export function initNewsletterSystem() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput ? emailInput.value.trim() : '';
        const gdprCheckbox = document.getElementById('newsletter-gdpr');
        const gdpr = gdprCheckbox ? gdprCheckbox.checked : false;

        if (!email || !gdpr) return;

        const subscribers = JSON.parse(localStorage.getItem('druckbau_subscribers') || '[]');

        if (subscribers.some(s => s.email === email)) {
            showWarning("Diese E-Mail ist bereits angemeldet.");
            return;
        }

        const newSub = {
            email,
            date: new Date().toLocaleDateString('de-DE'),
            synced: false
        };

        subscribers.unshift(newSub);
        localStorage.setItem('druckbau_subscribers', JSON.stringify(subscribers));

        // Background sync to database
        import('./db.js').then(async (db) => {
            if (db && typeof db.syncLocalStorageToDB === 'function') {
                await db.syncLocalStorageToDB();
            }
        }).catch(err => console.warn("Failed to dynamically load db.js for sync:", err));

        // Refresh admin panel if open
        import('./admin.js').then((admin) => {
            if (admin && typeof admin.triggerAdminRefresh === 'function') {
                admin.triggerAdminRefresh();
            }
        }).catch(err => console.warn("Failed to dynamically load admin.js for refresh:", err));

        showSuccess("Vielen Dank! Sie sind nun für den Newsletter angemeldet.");
        form.reset();
    });

    const unsubscribeBtn = document.getElementById('newsletter-unsubscribe-btn');
    if (unsubscribeBtn) {
        unsubscribeBtn.addEventListener('click', async () => {
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput ? emailInput.value.trim() : '';
            if (!email) {
                showWarning("Bitte geben Sie Ihre E-Mail-Adresse zum Abmelden ein.");
                return;
            }

            if (confirm("Möchten Sie sich wirklich vom Newsletter abmelden?")) {
                let subscribers = JSON.parse(localStorage.getItem('druckbau_subscribers') || '[]');
                const initialLength = subscribers.length;
                subscribers = subscribers.filter(s => s.email !== email);

                if (subscribers.length < initialLength) {
                    localStorage.setItem('druckbau_subscribers', JSON.stringify(subscribers));
                    
                    import('./admin.js').then((admin) => {
                        if (admin && typeof admin.triggerAdminRefresh === 'function') {
                            admin.triggerAdminRefresh();
                        }
                    }).catch(err => console.warn("Failed to refresh admin panel:", err));

                    showSuccess("Sie wurden erfolgreich vom Newsletter abgemeldet.");
                    if (emailInput) emailInput.value = '';
                } else {
                    showWarning("Diese E-Mail-Adresse wurde nicht in unserer Liste gefunden.");
                }
            }
        });
    }
}
