// Translation System for Druckbau Website
const translations = {
    de: {
        // Navigation
        nav_home: "Home",
        nav_products: "Produkte",
        nav_material: "Material",
        nav_faq: "FAQ",
        nav_news: "Neuigkeiten",
        nav_contact: "Kontakt",
        nav_calculator: "Preiskalkulator",
        nav_comparison: "Material-Vergleich",
        nav_more: "Mehr",

        // Home Section
        home_title: "Willkommen bei Druckbau",
        home_subtitle: "Ihr Partner für professionellen 3D Druck.",
        home_youtube: "Folgen Sie uns auf YouTube",
        home_order_status: "Bestellstatus prüfen",
        home_order_placeholder: "Bestellnummer (z.B. #123456)",
        home_check_btn: "Prüfen",
        home_hero_desc: "Von individuellen Prototypen bis hin zu Serienproduktionen – wir bringen Ihre Ideen in die dritte Dimension.",
        preview_title: "Interaktive 3D-Vorschau",
        workshop_title: "Die Werkstatt",
        product_wishlist_btn: "Auf die Wunschliste",

        // Products
        products_title: "Unsere Produkte",
        product_add_cart: "In den Warenkorb",
        product_quantity: "Menge",
        product_color: "Farbe",
        product_custom_color: "Ihre Wunschfarbe:",
        product_rate: "Bewerten",
        product_reviews: "Ansehen",
        product_print_time: "Geschätzte Druckzeit:",
        catalog_fidget_name: "Fidget Klicker",
        catalog_poop_name: "Hundekotbeutelspender",
        catalog_poop_desc: "fasst 5 Beutel",
        catalog_vase_name: "Vase",
        catalog_vase_desc: "20cm groß, Lochdurchmesser 2,5cm",
        catalog_pen_name: "Stifthalter",
        catalog_pen_desc: "10cm groß",
        catalog_custom_name: "Auftragsarbeit",
        product_quantity: "Menge",
        product_color: "Farbe",
        product_add_cart: "In den Warenkorb",
        product_rate: "Bewerten",
        product_view_reviews: "Ansehen",
        product_order_custom_from: "Von Wem (Schenkender/Auftraggeber):",
        product_order_custom_to: "Für Wen (Empfänger/Widmung):",
        chat_header: "Druckbau Support",
        chat_welcome: "Hallo! 👋 Ich bin Ihr Druckbau-Assistent. Wie kann ich Ihnen helfen?",
        chat_placeholder: "Nachricht eingeben...",
        chat_reply_shipping: "⏱️ Lieferzeit",
        chat_reply_pricing: "💰 Preise",
        chat_reply_materials: "🎨 Materialien",
        chat_reply_contact: "📞 Kontakt",
        product_order_custom_desc: "Welcher Auftrag (Beschreibung/Idee):",
        product_order_custom_files: "Dateien hinzufügen (Bilder/Modelle):",
        product_order_custom_files_tip: "(Tipp: Halten Sie Strg oder Command (⌘) gedrückt, um mehrere Dateien auszuwählen)",
        product_order_custom_files_warning: "Bitte hängen Sie Ihre Dateien später manuell an die Bestell-E-Mail an, da ein automatischer Upload nicht möglich ist.",
        product_indiv: "Individuell",
        product_custom_from_placeholder: "z.B. Ihr Name",
        product_custom_to_placeholder: "z.B. Name des Beschenkten",
        product_custom_desc_placeholder: "Beschreiben Sie Ihre Idee oder was aufgedruckt werden soll...",
        product_custom_color_label: "Ihre Wunschfarbe:",
        product_custom_color_placeholder: "Welche Farbe möchten Sie?",
        product_custom_color_warning_ref: "Hinweis:",
        product_custom_color_warning_text: "Diese Farbe muss ggf. extra bestellt werden. Dadurch können zusätzliche Kosten und Wartezeiten entstehen.",

        // Cart
        cart_title: '<i class="fas fa-shopping-cart" style="color: var(--primary-blue);"></i> Warenkorb',
        nav_more: 'Mehr <span class="arrow">▼</span>',
        cart_empty: "Ihr Warenkorb ist leer.",
        cart_subtotal: "Zwischensumme:",
        cart_shipping: "Versandkosten:",
        cart_discount: "Rabatt:",
        cart_total: "Gesamt:",
        cart_checkout: "Jetzt kaufen",
        cart_coupon: "Gutscheincode:",
        cart_apply: "Anwenden",
        cart_remove_coupon: "Entfernen",
        cart_price_indiv: "Individuell",
        cart_shipping_cost_indiv: "Nach Aufwand",
        cart_extra_charge_info: "zzgl. Auftrag",
        cart_shipping_extra_info: "ggf. mehr",
        cart_coupon_applied_msg: "Gutschein angewendet",
        cart_table_product: "Produkt",
        cart_table_price: "Einzelpreis",
        cart_table_actions: "Aktionen",
        cart_coupon_label: "Gutscheincode",
        cart_coupon_btn: "Anwenden",

        // Contact
        contact_title: "Kontaktieren Sie uns",
        contact_subtitle: "Haben Sie Fragen? Schreiben Sie uns eine Nachricht!",
        contact_name: "Ihr Name",
        contact_email: "Ihre E-Mail-Adresse",
        contact_order_id: "Bestellnummer",
        contact_message: "Ihre Nachricht an uns...",
        contact_send: "Absenden",
        contact_gdpr: "Ich stimme der Verarbeitung meiner Daten gemäß der Datenschutzerklärung zu.",

        // Legal / Price Hints
        price_hint: "inkl. MwSt.",
        shipping_hint: "zzgl. Versandkosten",
        shipping_info: "Versandkosten: 4.90€ (versichert)",

        // Footer
        footer_navigation: "Navigation",
        footer_legal: "Rechtliches",
        footer_newsletter: "Newsletter",
        footer_newsletter_text: "Bleiben Sie up-to-date bei neuen Produkten!",
        footer_newsletter_placeholder: "Deine E-Mail",
        footer_newsletter_gdpr: "Ich stimme zu, Neuigkeiten zu erhalten.",
        footer_newsletter_submit: "Anmelden",
        footer_newsletter_unsubscribe: "Abmelden",
        footer_contact: "Kontakt",
        footer_copyright: "Alle Rechte vorbehalten.",
        footer_desc: "Ihr Partner für professionellen 3D Druck. Qualität, Schnelligkeit und individuelle Lösungen.",

        // Material Section
        material_title: "Material & Technik",
        material_pla_title: "PLA (Polylactid)",
        material_pla_desc: "Unser Standardmaterial. Biologisch abbaubar, geruchsneutral und in einer riesigen Farbpalette verfügbar. Ideal für Deko, Fidget Toys und Prototypen.",
        material_petg_title: "PETG",
        material_petg_desc: "Die robuste Alternative. Hitzebeständiger (bis ca. 80°C) und stabiler als PLA. Perfekt für Funktionsteile im Außenbereich oder im Auto.",
        material_quality_title: "Druckqualität",
        material_quality_desc: "Wir drucken standardmäßig mit einer Schichthöhe von 0.2mm für die optimale Balance aus Detailreichtum und Stabilität.",

        // FAQ
        faq_title: "FAQ - Häufig gestellte Fragen",

        // Price Calculator
        calc_title: "Preiskalkulator",
        calc_subtitle: "Schätzen Sie die Kosten für Ihren 3D-Druck",
        calc_length: "Länge (cm):",
        calc_width: "Breite (cm):",
        calc_height: "Höhe (cm):",
        calc_material: "Material:",
        calc_infill: "Füllung (%):",
        calc_calculate: "Preis berechnen",
        calc_result: "Geschätzter Preis:",
        calc_disclaimer: "Dies ist eine Schätzung. Der finale Preis kann abweichen.",

        // Material Comparison
        comparison_title: "Material-Vergleich",
        comparison_subtitle: "Welches Material ist das richtige für Ihr Projekt?",
        comparison_property: "Eigenschaft",
        comparison_temp: "Temperaturbeständigkeit",
        comparison_strength: "Festigkeit",
        comparison_flexibility: "Flexibilität",
        comparison_cost: "Kosten",
        comparison_use_cases: "Anwendungsfälle",


        // Guarantee
        guarantee_title: "100% Zufriedenheitsgarantie",
        guarantee_text: "Kostenloser Nachdruck bei Druckfehlern",

        // Seasonal Offer
        offer_title: "Sonderangebot",
        offer_countdown: "Noch",
        offer_days: "Tage",
        offer_hours: "Std",
        offer_minutes: "Min",
        offer_seconds: "Sek",

        // Referral
        referral_title: "Freunde werben",
        referral_text: "Empfehlen Sie uns weiter und beide erhalten 5€ Rabatt!",
        referral_your_link: "Ihr persönlicher Link:",
        referral_copy: "Link kopieren",

        // Alerts
        alert_added_cart: "wurde zum Warenkorb hinzugefügt.",
        alert_coupon_applied: "Gutschein erfolgreich angewendet!",
        alert_coupon_invalid: "Ungültiger Gutscheincode.",
        alert_coupon_expired: "Dieser Gutschein ist abgelaufen.",
        alert_link_copied: "Link in Zwischenablage kopiert!",

        // Checkout Modal
        checkout_title: "Kasse",
        checkout_back: "Zurück",
        checkout_next_shipping: "Weiter zu Versand",
        checkout_next_preview: "Weiter zur Übersicht",
        checkout_submit: "Bestellung abschließen",
        checkout_name_label: "Vollständiger Name",
        checkout_email_label: "E-Mail-Adresse",
        checkout_address_label: "Straße und Hausnummer",
        checkout_zip_label: "PLZ",
        checkout_city_label: "Ort",
        checkout_step_1: "Daten",
        checkout_step_2: "Versand",
        checkout_step_3: "Vorschau",
        summary_shipping_address: "Lieferadresse:",
        summary_order_preview: "Bestellübersicht:",

        // Process Section
        process_title: "Wie es funktioniert",
        process_step1_title: "1. Anfrage senden",
        process_step1_text: "Laden Sie Ihre Datei hoch oder beschreiben Sie Ihre Idee im Kontaktformular.",
        process_step2_title: "2. Prüfung & Angebot",
        process_step2_text: "Wir prüfen die Machbarkeit und senden Ihnen ein unverbindliches Angebot.",
        process_step3_title: "3. Druck & Versand",
        process_step3_text: "Nach Bestätigung starten wir den Druck und versenden Ihr Teil versichert.",

        // Material & Technik Section
        material_title: "Material & Technik",
        material_pla_title: "PLA (Polylactid)",
        material_pla_text: "Unser Standardmaterial. Biologisch abbaubar, geruchsneutral und in einer riesigen Farbpalette verfügbar. Ideal für Deko, Fidget Toys und Prototypen.",
        material_petg_title: "PETG",
        material_petg_text: "Die robuste Alternative. Hitzebeständiger (bis ca. 80°C) und stabiler als PLA. Perfekt für Funktionsteile im Außenbereich oder im Auto.",
        material_quality_title: "Druckqualität",
        material_quality_text: "Wir drucken standardmäßig mit einer Schichthöhe von 0.2mm für die optimale Balance aus Detailreichtum und Stabilität.",

        // Testimonials Section
        testimonials_title: "Was unsere Kunden sagen",
        testimonial_sarah_quote: "\"Unglaubliche Qualität! Die Vase sieht in echt noch besser aus als auf den Bildern. Schneller Versand, gerne wieder.\"",
        testimonial_sarah_author: "- Sarah M.",
        testimonial_thomas_quote: "\"Habe ein Ersatzteil für meinen Oldtimer drucken lassen. Passt perfekt! Danke für die tolle Beratung.\"",
        testimonial_thomas_author: "- Thomas K.",
        testimonial_julia_quote: "\"Super netter Kontakt und das personalisierte Geschenk kam mega gut an. Die Farben leuchten richtig.\"",
        testimonial_julia_author: "- Julia & Ben",

        // FAQ Section
        faq_title: "Häufig gestellte Fragen",
        faq_q1: "Wie lange dauert der Versand?",
        faq_a1: "In der Regel versenden wir innerhalb von 2-3 Werktagen. Bei individuellen Aufträgen kann es je nach Aufwand etwas länger dauern.",
        faq_q2: "Welche Materialien nutzen Sie?",
        faq_a2: "Wir nutzen hauptsächlich PLA (biologisch abbaubar), PETG (robust) und TPU (flexibel). Mehr Details finden Sie im Material-Vergleich.",
        faq_q3: "Kann ich eigene Modelle drucken lassen?",
        faq_a3: "Ja! Nutzen Sie unser Kontaktformular für eine Anfrage.",

        faq_acc_q3: "Welche Farben sind möglich?",
        faq_acc_a3: "Wir haben ständig viele Farben auf Lager (siehe Produktoptionen). Sollte Ihre Wunschfarbe nicht dabei sein, bestellen wir diese gerne für Ihren Auftrag.",
        faq_acc_q4: "Welche Zahlungsmethoden werden akzeptiert?",
        faq_acc_a4: "Aktuell bieten wir Zahlung per Vorkasse und PayPal an. Die Details erhalten Sie direkt mit Ihrem Angebot oder der Bestellbestätigung.",
        faq_acc_q5: "Wie hoch sind die Versandkosten?",
        faq_acc_a5: "Der Standardversand innerhalb Deutschlands beträgt 4,90 €. Ab einem Bestellwert von 50 € versenden wir versandkostenfrei.",
        faq_acc_q6: "Kann ich personalisierte Artikel zurückgeben?",
        faq_acc_a6: "Individuell angefertigte Produkte (Custom Orders) sind vom Umtausch ausgeschlossen, es sei denn, sie weisen Mängel auf.",
        faq_acc_q7: "Bieten Sie auch Mengenrabatte an?",
        faq_acc_a7: "Ja, für größere Stückzahlen oder Serienfertigungen erstellen wir Ihnen gerne ein individuelles Angebot.",

        // News Section
        news_title: "Neuigkeiten & Status",
        news_loading: "Lade Neuigkeiten...",

        // Wishlist Section
        wishlist_title: "Meine Wunschliste",

        // Review Modal
        review_modal_title: "Produkt bewerten",
        review_name_label: "Dein Name (öffentlich sichtbar):",
        review_rating_label: "Bewertung:",
        review_text_label: "Deine Meinung:",
        review_text_placeholder: "Was hat dir gut gefallen?",
        review_image_label: "Foto hinzufügen (optional, max. 500KB):",
        review_policy: "Hinweis: Wir behalten uns das Recht vor, Bewertungen mit falschem oder anstößigem Inhalt zu löschen.",
        review_submit: "Bewertung absenden",
        review_previous: "Bisherige Bewertungen",

        // Chat Widget
        chat_header: "Druckbau Support",
        chat_subtitle: "Wir helfen Ihnen gerne!",
        chat_placeholder: "Nachricht eingeben...",
        chat_bot_greeting: "Hallo! 👋 Ich bin Ihr Druckbau-Assistent. Wie kann ich Ihnen helfen?",
        chat_reply_shipping: "⏱️ Lieferzeit",
        chat_reply_pricing: "💰 Preise",
        chat_reply_materials: "🎨 Materialien",
        chat_reply_contact: "📞 Kontakt",
        chat_reply_lieferzeit_response: "Unsere Standard-Lieferzeit beträgt 3-5 Werktage. Express-Versand ist auf Anfrage möglich! 🚚",
        chat_reply_preise_response: "Unsere Preise variieren je nach Produkt und Menge. Schauen Sie sich unsere Produktseite an oder kontaktieren Sie uns für ein individuelles Angebot! 💰",
        chat_reply_materialien_response: "Wir verwenden hochwertige Materialien wie PLA, PETG, ABS und TPU. Jedes Material hat seine eigenen Eigenschaften - fragen Sie uns gerne! 🎨",
        chat_reply_kontakt_response: "Sie erreichen uns per E-Mail unter druckbau@gmail.com oder nutzen Sie unser Kontaktformular. Wir antworten innerhalb von 24 Stunden! 📞",
        chat_default_response: "Vielen Dank für Ihre Anfrage! Wir melden uns in Kürze. 👋",

        // Legal Footer Extra
        footer_impressum: "Impressum",
        footer_privacy: "Datenschutz",
        footer_returns: "Widerrufsbelehrung",
        nav_reviews: "Bewertungen",
        notif_title: "🔔 Benachrichtigungen aktivieren?",
        notif_allow: "Erlauben",
        notif_later: "Später",
        notif_success_body: "Benachrichtigungen aktiviert! Sie werden über Bestellupdates informiert.",
        notif_desc: "Erhalten Sie Updates zu Ihren Bestellungen und Sonderangeboten.",
        alert_error_qty: "Bitte geben Sie eine gültige Menge ein (mindestens 1).",
        alert_success_added: "wurde zum Warenkorb hinzugefügt.",
        cart_empty: "Ihr Warenkorb ist leer.",
        checkout_back: "Zurück",
        checkout_submit: "Zahlungspflichtig bestellen",
        checkout_prepare_success: "Ihre Bestellung wurde vorbereitet! Bitte senden Sie die E-Mail im nächsten Schritt ab.",
        confirm_delete_all: "Wirklich alle Bestellungen aus der Liste löschen?",
        alert_no_orders: "Keine Bestellungen zum Exportieren vorhanden.",
    },

    en: {
        // Navigation
        nav_home: "Home",
        nav_products: "Products",
        nav_material: "Material",
        nav_faq: "FAQ",
        nav_news: "News",
        nav_contact: "Contact",
        nav_calculator: "Price Calculator",
        nav_comparison: "Material Comparison",
        nav_more: "More",
        nav_reviews: "Reviews",

        // Home Section
        home_title: "Welcome to Druckbau",
        home_subtitle: "Your partner for professional 3D printing.",
        home_youtube: "Follow us on YouTube",
        home_order_status: "Check Order Status",
        home_order_placeholder: "Order Number (e.g. #123456)",
        home_check_btn: "Check",
        home_hero_desc: "From individual prototypes to serial production – we bring your ideas into the third dimension.",
        preview_title: "Interactive 3D Preview",
        workshop_title: "The Workshop",
        product_wishlist_btn: "Add to Wishlist",

        // Products
        products_title: "Our Products",
        product_add_cart: "Add to Cart",
        product_quantity: "Quantity",
        product_color: "Color",
        product_custom_color: "Your Custom Color:",
        product_rate: "Rate",
        product_reviews: "View",
        product_print_time: "Estimated Print Time:",
        catalog_fidget_name: "Fidget Clicker",
        catalog_poop_name: "Poop Bag Dispenser",
        catalog_poop_desc: "fits 5 bags",
        catalog_vase_name: "Vase",
        catalog_vase_desc: "20cm tall, 2.5cm hole diameter",
        catalog_pen_name: "Pen Holder",
        catalog_pen_desc: "10cm tall",
        catalog_custom_name: "Custom Order",
        product_quantity: "Quantity",
        product_color: "Color",
        product_add_cart: "Add to Cart",
        product_rate: "Rate",
        product_view_reviews: "View",
        product_order_custom_from: "From Whom (Sender/Client):",
        product_order_custom_to: "For Whom (Recipient/Dedication):",
        chat_header: "Druckbau Support",
        chat_welcome: "Hello! 👋 I am your Druckbau assistant. How can I help you?",
        chat_placeholder: "Type a message...",
        chat_reply_shipping: "⏱️ Delivery time",
        chat_reply_pricing: "💰 Pricing",
        chat_reply_materials: "🎨 Materials",
        chat_reply_contact: "📞 Contact",
        product_order_custom_desc: "Which Order (Description/Idea):",
        product_order_custom_files: "Add files (Images/Models):",
        product_order_custom_files_tip: "(Tip: Hold Ctrl or Command (⌘) to select multiple files)",
        product_order_custom_files_warning: "Please attach your files manually to the order email later, as an automatic upload is not possible.",
        product_indiv: "Individual",
        product_custom_from_placeholder: "e.g. Your Name",
        product_custom_to_placeholder: "e.g. Recipient's Name",
        product_custom_desc_placeholder: "Describe your idea or what should be printed...",
        product_custom_color_label: "Your Custom Color:",
        product_custom_color_placeholder: "What color would you like?",
        product_custom_color_warning_ref: "Note:",
        product_custom_color_warning_text: "This color may need to be ordered separately. This can result in additional costs and waiting times.",

        // Cart
        cart_title: '<i class="fas fa-shopping-cart" style="color: var(--primary-blue);"></i> Shopping Cart',
        nav_more: 'More <span class="arrow">▼</span>',
        cart_empty: "Your cart is empty.",
        cart_subtotal: "Subtotal:",
        cart_shipping: "Shipping:",
        cart_discount: "Discount:",
        cart_total: "Total:",
        cart_checkout: "Checkout",
        cart_coupon: "Coupon Code:",
        cart_apply: "Apply",
        cart_remove_coupon: "Remove",
        cart_price_indiv: "Individual",
        cart_shipping_cost_indiv: "On Request",
        cart_extra_charge_info: "plus custom order",
        cart_shipping_extra_info: "may vary",
        cart_coupon_applied_msg: "Coupon applied",
        cart_table_product: "Product",
        cart_table_price: "Unit Price",
        cart_table_actions: "Actions",
        cart_coupon_label: "Coupon Code",
        cart_coupon_btn: "Apply",

        // Contact
        contact_title: "Contact Us",
        contact_subtitle: "Have questions? Send us a message!",
        contact_name: "Your Name",
        contact_email: "Your Email Address",
        contact_order_id: "Order Number",
        contact_message: "Your message to us...",
        contact_send: "Send",
        contact_gdpr: "I agree to the processing of my data according to the privacy policy.",

        // Legal / Price Hints
        price_hint: "incl. VAT",
        shipping_hint: "plus shipping",
        shipping_info: "Shipping costs: 4.90€ (insured)",

        // Footer
        footer_navigation: "Navigation",
        footer_legal: "Legal",
        footer_newsletter: "Newsletter",
        footer_newsletter_text: "Stay up-to-date with new products!",
        footer_newsletter_placeholder: "Your Email",
        footer_newsletter_gdpr: "I agree to receive news.",
        footer_newsletter_submit: "Subscribe",
        footer_newsletter_unsubscribe: "Unsubscribe",
        footer_contact: "Contact",
        footer_copyright: "All rights reserved.",
        footer_desc: "Your partner for professional 3D printing. Quality, speed and individual solutions.",
        footer_impressum: "Legal Notice",
        footer_privacy: "Privacy Policy",
        footer_returns: "Returns Policy",

        // Guarantee
        guarantee_title: "100% Satisfaction Guarantee",
        guarantee_text: "Free reprint in case of print defects",

        // Alerts
        alert_added_cart: "added to cart.",
        alert_coupon_applied: "Coupon successfully applied!",
        alert_coupon_invalid: "Invalid coupon code.",
        alert_coupon_expired: "This coupon has expired.",
        alert_link_copied: "Link copied to clipboard!",

        // Checkout & Summary
        checkout_title: "Checkout",
        checkout_back: "Back",
        checkout_next_shipping: "Next to Shipping",
        checkout_next_preview: "Next to Preview",
        checkout_submit: "Complete Order",
        checkout_name_label: "Full Name",
        checkout_email_label: "Email Address",
        checkout_address_label: "Street and House Number",
        checkout_zip_label: "Zip Code",
        checkout_city_label: "City",
        checkout_step_1: "Details",
        checkout_step_2: "Shipping",
        checkout_step_3: "Preview",
        summary_shipping_address: "Shipping Address:",
        summary_order_preview: "Order Summary:",

        // Process Section
        process_title: "How it works",
        process_step1_title: "1. Send Request",
        process_step1_text: "Upload your file or describe your idea in the contact form.",
        process_step2_title: "2. Review & Offer",
        process_step2_text: "We check the feasibility and send you a non-binding offer.",
        process_step3_title: "3. Print & Shipping",
        process_step3_text: "After confirmation, we start the printing and ship your part insured.",

        // Material & Technik Section
        material_title: "Material & Tech",
        material_pla_title: "PLA (Polylactide)",
        material_pla_text: "Our standard material. Biodegradable, odorless, and available in a huge color palette. Ideal for decor, fidget toys, and prototypes.",
        material_petg_title: "PETG",
        material_petg_text: "The robust alternative. More heat-resistant (up to approx. 80°C) and stable than PLA. Perfect for functional parts outdoors or in cars.",
        material_quality_title: "Print Quality",
        material_quality_text: "We print by default with a layer height of 0.2mm for the optimal balance of detail and stability.",

        // Testimonials Section
        testimonials_title: "What our customers say",
        testimonial_sarah_quote: "\"Incredible quality! The vase looks even better in person than in the pictures. Fast shipping, happy to return.\"",
        testimonial_sarah_author: "- Sarah M.",
        testimonial_thomas_quote: "\"Had a replacement part for my vintage car printed. Fits perfectly! Thanks for the great advice.\"",
        testimonial_thomas_author: "- Thomas K.",
        testimonial_julia_quote: "\"Super friendly contact and the personalized gift was a huge hit. The colors really shine.\"",
        testimonial_julia_author: "- Julia & Ben",

        // FAQ Accordion (Details Section)
        faq_acc_q1: "How long does a print take?",
        faq_acc_a1: "It depends strongly on size and complexity. Small parts take a few hours, large projects can take 1-3 days. We always give you an estimate.",
        faq_acc_q2: "Can I send own files (STL)?",
        faq_acc_a2: "Yes, absolutely! Just upload your .stl or .obj files in the 'Custom Order' section. we check printability for free.",
        faq_acc_q3: "Which colors are possible?",
        faq_acc_a3: "We have many colors in stock. If your desired color is missing, we are happy to order it for you.",
        faq_acc_q4: "Which payment methods are accepted?",
        faq_acc_a4: "Currently we offer payment in advance and PayPal. You will receive details with your offer.",
        faq_acc_q5: "How much is shipping?",
        faq_acc_a5: "Standard shipping within Germany is 4.90 €. Orders over 50 € are shipped for free.",
        faq_acc_q6: "Can I return personalized items?",
        faq_acc_a6: "Custom-made products are excluded from returns unless they are defective.",
        faq_acc_q7: "Do you offer bulk discounts?",
        faq_acc_a7: "Yes, for larger quantities we are happy to create a custom offer for you.",

        // News Section
        news_title: "News & Status",
        news_loading: "Loading news...",

        // Wishlist Section
        wishlist_title: "My Wishlist",

        // Review Modal
        review_modal_title: "Rate Product",
        review_name_label: "Your Name (publicly visible):",
        review_rating_label: "Rating:",
        review_text_label: "Your Opinion:",
        review_text_placeholder: "What did you like?",
        review_image_label: "Add photo (optional, max. 500KB):",
        review_policy: "Note: We reserve the right to delete reviews with false or offensive content.",
        review_submit: "Submit Review",
        review_previous: "Previous Reviews",

        // Chat Widget
        chat_header: "Druckbau Support",
        chat_subtitle: "We're happy to help!",
        chat_placeholder: "Enter message...",
        chat_bot_greeting: "Hello! 👋 I'm your Druckbau assistant. How can I help you?",
        chat_reply_shipping: "⏱️ Shipping Time",
        chat_reply_pricing: "💰 Pricing",
        chat_reply_materials: "🎨 Materials",
        chat_reply_contact: "📞 Contact",
        chat_reply_lieferzeit_response: "Our standard shipping time is 3-5 business days. Express shipping is available on request! 🚚",
        chat_reply_preise_response: "Our prices vary depending on the product and quantity. Take a look at our product page or contact us for an individual offer! 💰",
        chat_reply_materialien_response: "We use high-quality materials such as PLA, PETG, ABS and TPU. Each material has its own properties - feel free to ask us! 🎨",
        chat_reply_kontakt_response: "You can reach us by email at druckbau@gmail.com or use our contact form. We answer within 24 hours! 📞",
        chat_default_response: "Thank you for your inquiry! We will get back to you shortly. 👋",
        notif_title: "🔔 Enable Notifications?",
        notif_allow: "Allow",
        notif_later: "Later",
        notif_success_body: "Notifications enabled! You will be informed about order updates.",
        notif_desc: "Receive updates on your orders and special offers.",
        alert_error_qty: "Please enter a valid quantity (at least 1).",
        alert_success_added: "has been added to the cart.",
        cart_empty: "Your cart is empty.",
        checkout_back: "Back",
        checkout_submit: "Buy Now / Order with obligation to pay",
        checkout_prepare_success: "Your order has been prepared! Please send the email in the next step.",
        confirm_delete_all: "Really delete all orders from the list?",
        alert_no_orders: "No orders available for export.",
    }
};

// Current language (default: German)
let currentLanguage = localStorage.getItem('druckbau_language') || 'de';

// Translation function
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Switch language
function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('druckbau_language', lang);
    updatePageLanguage();

    // Re-render dynamic components if they exist
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.renderCart === 'function') window.renderCart();
    if (typeof window.renderWishlist === 'function') window.renderWishlist();
    if (typeof window.renderNews === 'function') window.renderNews();
}

// Update all translatable elements
function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            // Use innerHTML for elements with icons or complex structure
            if (element.querySelector('i, svg, span.arrow') || translation.includes('<')) {
                // If it's the "Warenkorb" header or similar, we might need more care.
                // For now, let's allow innerHTML if the key suggests it or if children exist.
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
}

// Simple showSection fallback for local browsing
function showSection(id) {
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });

    const target = document.getElementById(id);
    if (target) {
        target.style.display = (id === 'home' ? 'flex' : 'block');
        setTimeout(() => target.classList.add('active'), 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.nav-link, .nav-trigger, .lang-btn').forEach(link => {
        if (link.getAttribute('data-target') === id) {
            link.classList.add('active');
        } else if (link.getAttribute('data-target')) {
            link.classList.remove('active');
        }
    });

    // Close all dropdowns
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        updatePageLanguage();

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                switchLanguage(lang);
            });
        });

        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-target]');
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
            }
            if (!link) return;
            const targetId = link.getAttribute('data-target');
            if (link.classList.contains('dropdown-toggle')) {
                const dropdown = link.parentElement;
                if (dropdown && dropdown.classList.contains('dropdown')) {
                    const isOpening = !dropdown.classList.contains('show');
                    document.querySelectorAll('.dropdown').forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
                    dropdown.classList.toggle('show');
                    if (isOpening && targetId) showSection(targetId);
                    e.preventDefault();
                    return;
                }
            }
            if (targetId) {
                showSection(targetId);
                e.preventDefault();
            }
        });

        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.addEventListener('mouseenter', () => dropdown.classList.add('show'));
            dropdown.addEventListener('mouseleave', () => dropdown.classList.remove('show'));
        });

        // Chatbot Toggle
        const chatToggle = document.getElementById('chat-toggle');
        if (chatToggle) {
            chatToggle.addEventListener('click', () => {
                const chatWindow = document.getElementById('chat-window');
                if (chatWindow) {
                    if (chatWindow.style.display === 'flex') {
                        chatWindow.style.display = 'none';
                    } else {
                        chatWindow.style.display = 'flex';
                        const messages = document.getElementById('chat-messages');
                        if (messages && messages.children.length === 0) {
                            // Initial message from bot - find welcome text in translations
                            const lang = localStorage.getItem('druckbau_lang') || 'de';
                            const welcomeText = (translations[lang] && translations[lang]['chat_welcome']) || "Hallo! Wie kann ich helfen?";
                            messages.innerHTML = `<div class="message bot"><p>${welcomeText}</p></div>`;
                        }
                    }
                }
            });
        }

        // Quick Replies
        document.querySelectorAll('.quick-reply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const topic = btn.getAttribute('data-topic');
                const messages = document.getElementById('chat-messages');
                if (messages) {
                    const userDiv = document.createElement('div');
                    userDiv.className = 'message user';
                    userDiv.innerHTML = `<p>${t('chat_reply_' + topic.toLowerCase())}</p>`;
                    messages.appendChild(userDiv);

                    setTimeout(() => {
                        const botDiv = document.createElement('div');
                        botDiv.className = 'message bot';
                        const response = t('chat_reply_' + topic.toLowerCase() + '_response');
                        botDiv.innerHTML = `
                            <div class="chat-avatar">🤖</div>
                            <div class="chat-bubble">${response}</div>
                        `;
                        messages.appendChild(botDiv);
                        messages.scrollTop = messages.scrollHeight;
                    }, 600);
                }
            });
        });

        // Chat Send Logic
        const chatSendBtn = document.querySelector('.chat-send-btn');
        const chatInput = document.getElementById('chat-input');

        const handleSendMessage = () => {
            const text = chatInput.value.trim();
            if (!text) return;

            const messages = document.getElementById('chat-messages');
            const userDiv = document.createElement('div');
            userDiv.className = 'message user';
            userDiv.innerHTML = `<p>${text}</p>`;
            messages.appendChild(userDiv);
            chatInput.value = '';

            setTimeout(() => {
                const botDiv = document.createElement('div');
                botDiv.className = 'message bot';
                let response = t('chat_default_response');
                const lowerText = text.toLowerCase();

                // Advanced Chatbot Logic
                if (lowerText.match(/hallo|hi|hey|servus|moin/)) {
                    response = t('chat_bot_greeting');
                } else if (lowerText.match(/preis|kosten|teuer|bezahlen|euro|price|cost|pay/)) {
                    response = t('chat_reply_preise_response');
                } else if (lowerText.match(/versand|dauer|lieferung|wann|lieferzeit|shipping|delivery|when/)) {
                    response = t('chat_reply_lieferzeit_response');
                } else if (lowerText.match(/material|farbe|pla|petg|tpu|filament|color/)) {
                    response = t('chat_reply_materialien_response');
                } else if (lowerText.match(/kontakt|hilfe|email|telefon|contact|help|problem/)) {
                    response = t('chat_reply_kontakt_response');
                } else if (lowerText.match(/wie geht|alles klar|how are you/)) {
                    response = currentLanguage === 'de' ? "Mir geht es fantastisch! 🤖 Ich bin bereit, Ihre 3D-Druck-Träume wahr werden zu lassen. Wie kann ich Ihnen heute helfen?" : "I'm doing fantastic! 🤖 I'm ready to make your 3D printing dreams come true. How can I help you today?";
                } else if (lowerText.match(/danke|thanks/)) {
                    response = currentLanguage === 'de' ? "Sehr gerne! Falls Sie noch Fragen haben, bin ich jederzeit für Sie da. 😊" : "You're very welcome! If you have any more questions, I'm here for you at any time. 😊";
                }

                botDiv.innerHTML = `
                    <div class="chat-avatar">🤖</div>
                    <div class="chat-bubble">${response}</div>
                `;
                messages.appendChild(botDiv);
                messages.scrollTop = messages.scrollHeight;
            }, 600);
        };

        if (chatSendBtn) chatSendBtn.addEventListener('click', handleSendMessage);
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSendMessage();
            });
        }

        // --- PRODUCT RENDERING FALLBACK (for file:// browsing) ---
        const fallbackProducts = [
            { id: 'a', nameKey: 'catalog_fidget_name', price: 3.99, images: ['logo.jpg'] },
            { id: 'b', nameKey: 'catalog_poop_name', price: 14.99, descKey: 'catalog_poop_desc', images: ['hund_1.jpg', 'hund_2.jpg', 'hund_3.jpg', 'hund_4.jpg', 'hund_5.jpg'] },
            { id: 'c', nameKey: 'catalog_vase_name', price: 11.99, descKey: 'catalog_vase_desc', images: ['vase_1.jpg', 'vase_2.jpg'] },
            { id: 'e', nameKey: 'catalog_pen_name', price: 6.99, descKey: 'catalog_pen_desc', images: ['logo.jpg'] },
            { id: 'd', nameKey: 'catalog_custom_name', price: 0, isCustom: true }
        ];

        const fallbackColors = [
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

        window.renderProducts = function () {
            const grid = document.getElementById('products-grid');
            if (!grid) return;
            grid.innerHTML = fallbackProducts.map(p => {
                const name = t(p.nameKey);
                if (p.isCustom) {
                    return `
                        <div class="product-card" data-product-id="${p.id}" style="position: relative;">
                            <h3>${name}</h3>
                            <span class="price">${t('product_indiv')}</span>
                            
                            <div class="product-options">
                                <div class="option-group">
                                    <label>${t('product_order_custom_from')}</label>
                                    <input type="text" id="custom-from-${p.id}" placeholder="${t('product_custom_from_placeholder')}" class="qty-input">
                                </div>
                                <div class="option-group">
                                    <label>${t('product_order_custom_to')}</label>
                                    <input type="text" id="custom-to-${p.id}" placeholder="${t('product_custom_to_placeholder')}" class="qty-input">
                                </div>
                                <div class="option-group">
                                    <label>${t('product_order_custom_desc')}</label>
                                    <textarea id="custom-desc-${p.id}" placeholder="${t('product_custom_desc_placeholder')}" class="qty-input" style="min-height: 60px;"></textarea>
                                </div>
                                <div class="option-group">
                                    <label>${t('product_order_custom_files')}</label>
                                    <input type="file" id="custom-files-${p.id}" multiple class="qty-input file-input-trigger" data-id="${p.id}" style="padding: 5px;">
                                    <span style="font-size: 0.75rem; color: var(--text-light);">${t('product_order_custom_files_tip')}</span>
                                    <div class="file-warning-box">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                        </svg>
                                        <span>${t('product_order_custom_files_warning')}</span>
                                    </div>
                                </div>
                            </div>

                            <p style="font-size:0.9rem; color:var(--text-light); margin-top:10px;">Da Sie die Seite lokal öffnen, funktioniert die Warenkorb-Weiterleitung für Anlagen nicht. Bitte senden Sie uns eine Anfrage.</p>
                            <button class="add-btn contact-trigger" data-target="contact" style="margin-top:10px;">Anfrage senden (Kontaktformular)</button>
                        </div>
                    `;
                }
                return `
                    <div class="product-card">
                        <img src="${p.images[0]}" alt="${name}" style="width:100%; height:200px; object-fit:cover; border-radius:8px;">
                        <h3>${name}</h3>
                        <div class="price">${p.price.toFixed(2)} € <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-light); display: block;">${t('price_hint')} ${t('shipping_hint')}</span></div>
                        <div class="product-options">
                            <select class="qty-input"><option value="1">1x</option></select>
                            <select class="qty-input">${fallbackColors.map(c => `<option value="${c.value}">${c.name}</option>`).join('')}</select>
                        </div>
                        <button class="add-btn" onclick="alert('Bitte nutzen Sie einen lokalen Server für volle Funktionalität.')">${t('product_add_cart')}</button>
                    </div>
                `;
            }).join('');
        };

        // Initial render if grid is empty (usually means script.js failed)
        setTimeout(() => {
            const grid = document.getElementById('products-grid');
            if (grid && grid.children.length === 0) {
                window.renderProducts();
            }
        }, 500);

        // FAQ Accordion
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const faqItem = button.parentElement;
                const faqAnswer = button.nextElementSibling;

                // Close others
                document.querySelectorAll('.faq-item').forEach(item => {
                    if (item !== faqItem && item.classList.contains('active')) {
                        item.classList.remove('active');
                        const answer = item.querySelector('.faq-answer');
                        if (answer) answer.style.maxHeight = null;
                    }
                });

                faqItem.classList.toggle('active');
                if (faqItem.classList.contains('active')) {
                    faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
                } else {
                    faqAnswer.style.maxHeight = null;
                }
            });
        });

        setTimeout(updatePageLanguage, 100);

        // Fallback for Admin Panel when ES modules (script.js) are blocked by CORS on file://
        setTimeout(() => {
            const adminTrigger = document.getElementById('admin-trigger');
            if (adminTrigger && !window.adminModuleLoaded) {
                adminTrigger.addEventListener('click', (e) => {
                    e.preventDefault();

                    const pwd = prompt("Admin Passwort:");
                    if (pwd === 'admin123') {
                        const adminNav = document.getElementById('admin-nav-item');
                        if (adminNav) adminNav.style.display = 'list-item';

                        // Hide all other sections manually
                        document.querySelectorAll('section').forEach(s => s.style.display = 'none');
                        const adminSection = document.getElementById('admin');
                        if (adminSection) adminSection.style.display = 'block';
                        window.scrollTo(0, 0);

                        // Fallback Render Table
                        const renderFallbackAdmin = () => {
                            const orders = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
                            const tbody = document.querySelector('#orders-table tbody');
                            if (tbody) {
                                if (orders.length === 0) {
                                    tbody.innerHTML = '<tr><td colspan="9" style="padding:1rem; text-align:center;">Keine Bestellungen vorhanden.</td></tr>';
                                } else {
                                    tbody.innerHTML = orders.map((order, index) => {
                                        const status = order.status || 'Eingegangen';
                                        const options = ['Eingegangen', 'In Bearbeitung', 'Gedruckt', 'Versendet'].map(opt =>
                                            `<option value="${opt}" ${status === opt ? 'selected' : ''}>${opt}</option>`
                                        ).join('');
                                        const itemsHtml = order.items ? order.items.map(i => `${i.qty}x ${i.name || t(i.nameKey)}`).join('<br>') : '-';
                                        return `
                                        <tr style="border-bottom: 1px solid #eee;">
                                            <td style="padding: 0.5rem; font-size: 0.9rem;">${order.date}</td>
                                            <td style="padding: 0.5rem;">${order.name}</td>
                                            <td style="padding: 0.5rem; font-family:monospace;">${order.orderId}</td>
                                            <td style="padding: 0.5rem;">${order.email}</td>
                                            <td style="padding: 0.5rem; font-size: 0.9rem;">${order.message}</td>
                                            <td style="padding: 0.5rem; font-size: 0.85rem;">${itemsHtml}</td>
                                            <td style="padding: 0.5rem; font-weight:bold;">${order.totalPrice ? order.totalPrice.toFixed(2) + ' €' : '-'}</td>
                                            <td style="padding: 0.5rem; font-size: 0.85rem; color: var(--primary-blue);">
                                                ${order.coupon ? `${order.coupon.code}<br><small>(-${order.coupon.discount.toFixed(2)}€)</small>` : '-'}
                                            </td>
                                            <td style="padding: 0.5rem;">
                                                <select class="fallback-status-select" data-index="${index}" style="padding:2px; font-size:0.8rem; border-radius:4px; border:1px solid #ccc;">
                                                    ${options}
                                                </select>
                                            </td>
                                        </tr>`;
                                    }).join('');

                                    // Event listeners for fallback dropdowns
                                    document.querySelectorAll('.fallback-status-select').forEach(select => {
                                        select.addEventListener('change', (e) => {
                                            const i = parseInt(e.target.getAttribute('data-index'));
                                            orders[i].status = e.target.value;
                                            localStorage.setItem('druckbau_orders', JSON.stringify(orders));
                                        });
                                    });
                                }
                            }

                            // Fallback Render Stats (Revenue)
                            const stats = JSON.parse(localStorage.getItem('druckbau_stats')) || { views: {}, purchases: {}, revenue: {}, youtube_clicks: 0 };
                            const statsBody = document.querySelector('#stats-table tbody');
                            if (statsBody) {
                                let sortedProducts = [...fallbackProducts].sort((a, b) => {
                                    const revA = stats.revenue ? (stats.revenue[a.id] || 0) : 0;
                                    const revB = stats.revenue ? (stats.revenue[b.id] || 0) : 0;
                                    return revB - revA;
                                });

                                let statsHtml = sortedProducts.map(p => {
                                    const buys = stats.purchases && stats.purchases[p.id] ? stats.purchases[p.id] : 0;
                                    const rev = stats.revenue && stats.revenue[p.id] ? stats.revenue[p.id] : 0;
                                    return `
                                        <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 0.5rem;">${t(p.nameKey)}</td>
                                        <td style="padding: 0.5rem;">${buys}</td>
                                        <td style="padding: 0.5rem; color: var(--primary-blue); font-weight: bold;">${rev.toFixed(2)} €</td>
                                        </tr>
                                    `;
                                }).join('');
                                statsHtml += `
                                    <tr style="background: rgba(46, 204, 113, 0.1);">
                                    <td style="padding: 0.5rem; font-weight:bold; color:var(--primary-blue);">YouTube Kanal</td>
                                    <td style="padding: 0.5rem; font-weight:bold;">${stats.youtube_clicks || 0} Klicks</td>
                                    <td style="padding: 0.5rem;">-</td>
                                    </tr>
                                `;
                                statsBody.innerHTML = statsHtml;
                            }
                        };
                        renderFallbackAdmin();
                    } else if (pwd !== null) {
                        alert("Falsches Passwort.");
                    }
                });
            }
        }, 1000); // Wait 1s to see if module loads.
    });
}
