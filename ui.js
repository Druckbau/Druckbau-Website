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

    if (t.includes('discord') || t.includes('hilfe') || t.includes('community') || t.includes('server')) {
        return '💬 Für noch mehr direkte Hilfe und schnellen Austausch treten Sie gerne unserem <a href="https://discord.gg/6PPEYN9YKp" target="_blank" style="color:var(--primary-blue); font-weight:bold; text-decoration:underline;">Discord-Server</a> bei! Unser Team und die Community stehen dort rund um die Uhr bereit.';
    }
    if (t.includes('lieferzeit') || t.includes('dauer') || t.includes('wann') || t.includes('versandzeit') || t.includes('lieferung') || t.includes('tage') || t.includes('werktage')) {
        return '⏱️ Unsere Standard-Lieferzeit beträgt in der Regel <strong>8–12 Werktage</strong> nach Zahlungseingang. Da jedes Stück individuell gedruckt wird, sichern wir so beste Qualität.';
    }
    if (t.includes('versand') || t.includes('porto') || t.includes('kostenlos') || t.includes('frei')) {
        return '🚚 Der Versand innerhalb Deutschlands kostet pauschal <strong>4,90 €</strong>. Ab einem Bestellwert von <strong>50,00 €</strong> liefern wir <strong>versandkostenfrei</strong>!';
    }
    if (t.includes('preis') || t.includes('kosten') || t.includes('rabatt') || t.includes('gutschein') || t.includes('code') || t.includes('angebot')) {
        return '💰 Unsere Produktpreise finden Sie im Katalog. Mit dem Code <code>NEUKUNDE10</code> erhalten Sie 10% Rabatt im Warenkorb! Alle Preise sind Gesamtpreise gem. § 19 UStG.';
    }
    if (t.includes('material') || t.includes('pla') || t.includes('petg') || t.includes('tpu') || t.includes('farbe') || t.includes('farben')) {
        return '🎨 Wir drucken standardmäßig in <strong>Schwarz, Grau und Weiß</strong>.<br>• <strong>PLA:</strong> Biologisch abbaubar & geruchsneutral.<br>• <strong>PETG:</strong> Hitzebeständig bis 80°C & stabil für den Außenbereich.';
    }
    if (t.includes('sonderanfertigung') || t.includes('custom') || t.includes('eigenes') || t.includes('datei') || t.includes('upload') || t.includes('stl') || t.includes('auftrag')) {
        return '⚙️ Sie möchten ein eigenes 3D-Modell drucken lassen? Wählen Sie im Katalog das Produkt <strong>"Auftragsarbeit"</strong> aus und laden Sie Ihre Wünsche/Dateien hoch, oder schreiben Sie uns an <code>druckbau@gmail.com</code>!';
    }
    if (t.includes('klicker') || t.includes('fidget') || t.includes('keycap') || t.includes('tastenkappe') || t.includes('unterteil')) {
        return '⌨️ Beim <strong>Fidget Klicker</strong> können Sie die Farbe des Unterteils und der <strong>Keycaps</strong> (Tastenkappen) frei aus Schwarz, Grau und Weiß wählen!';
    }
    if (t.includes('widerruf') || t.includes('rückgabe') || t.includes('stornieren') || t.includes('umtausch')) {
        return '🛡️ Für Standardartikel gilt das gesetzliche 14-tägige Widerrufsrecht. Bei Kundenanfertigungen (Custom Orders) ist der Widerruf gem. § 312g Abs. 2 Nr. 1 BGB ausgeschlossen.';
    }
    if (t.includes('zahlung') || t.includes('bezahlen') || t.includes('paypal') || t.includes('überweisung')) {
        return '💳 Sie können per <strong>PayPal</strong> oder <strong>Vorkasse per Banküberweisung</strong> bezahlen.';
    }
    if (t.includes('kontakt') || t.includes('email') || t.includes('e-mail')) {
        return '✉️ Sie erreichen uns per E-Mail unter <a href="mailto:druckbau@gmail.com">druckbau@gmail.com</a> oder direkt über unseren <a href="https://discord.gg/6PPEYN9YKp" target="_blank" style="color:var(--primary-blue); font-weight:bold;">Discord-Server</a>!';
    }

    return '💡 Vielen Dank für Ihre Nachricht! Schauen Sie gerne auch in unsere FAQ oder treten Sie für noch mehr direkte Hilfe unserem <a href="https://discord.gg/6PPEYN9YKp" target="_blank" style="color:var(--primary-blue); font-weight:bold; text-decoration:underline;">Discord-Server</a> bei!';
}

export function setupLightbox() {
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) {
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImg.classList.toggle('zoomed');
        });
    }

    window.openLightbox = (imgList, startIndex = 0) => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        if (!lightbox || !lightboxImg) return;

        currentGallery = Array.isArray(imgList) ? imgList : [imgList];
        currentImgIndex = startIndex;

        if (lightboxImg) lightboxImg.classList.remove('zoomed');
        updateLightboxImage();
        lightbox.classList.add('show');
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg) lightboxImg.classList.remove('zoomed');
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
            lightboxImg.classList.remove('zoomed');
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
    const mailtoLink = `mailto:kontakt.druckbau@gmail.com?subject=${encodeURIComponent(prioritySubject)}&body=${encodeURIComponent(body)}`;
    
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // 2. Log inquiry in database/local storage
    logOrder(name, email, inquiryId, message, null, 0, []);

    // 3. Mailto-Flow bleibt aktiv; EmailJS wird nicht mehr verwendet.
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
