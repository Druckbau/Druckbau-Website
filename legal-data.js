window.DRUCKBAU_LEGAL = {
  companyName: 'Druckbau Manufaktur',
  ownerName: 'Philipp Muster',
  street: 'Musterstraße 12',
  zip: '12345',
  city: 'Musterstadt',
  country: 'Deutschland',
  phone: '+49 1234 567890',
  email: 'kontakt.druckbau@gmail.com',
  orderEmail: 'bestellungen.druckbau@gmail.com',
  website: 'https://druckbau.de',
  vatId: '',
  lucidNumber: '',
  googlePrivacyLink: 'https://policies.google.com/privacy?hl=de',
  contactLabel: 'zentrale Kontaktstelle',
  registrationText: 'Kein Handelsregistereintrag – Einzelunternehmen / Kleingewerbe nach § 19 UStG.'
};

window.addEventListener('DOMContentLoaded', () => {
  const legal = window.DRUCKBAU_LEGAL || {};
  const map = {
    'company-name': legal.companyName || 'Druckbau Manufaktur',
    'owner-name': legal.ownerName || 'Philipp Muster',
    'street': legal.street || 'Musterstraße 12',
    'city-line': `${legal.zip || '12345'} ${legal.city || 'Musterstadt'}, ${legal.country || 'Deutschland'}`,
    'phone': legal.phone || '+49 1234 567890',
    'email': legal.email || 'kontakt.druckbau@gmail.com',
    'order-email': legal.orderEmail || 'bestellungen.druckbau@gmail.com',
    'website': legal.website || 'https://druckbau.de',
    'vat-id': legal.vatId ? `USt-IdNr. gemäß § 27a UStG: ${legal.vatId}` : 'Keine USt-IdNr. vorhanden (Kleinunternehmer gemäß § 19 UStG).',
    'lucid': legal.lucidNumber ? `LUCID-Registrierungsnummer: ${legal.lucidNumber}` : 'LUCID-Registrierungsnummer: [eintragen, sobald registriert]',
    'google-privacy': legal.googlePrivacyLink || 'https://policies.google.com/privacy?hl=de',
    'contact-label': legal.contactLabel || 'zentrale Kontaktstelle',
    'company-registration': legal.registrationText || 'Kein Handelsregistereintrag – Einzelunternehmen / Kleingewerbe nach § 19 UStG.'
  };

  document.querySelectorAll('[data-legal]').forEach((element) => {
    const key = element.getAttribute('data-legal');
    if (map[key]) {
      element.textContent = map[key];
    }
  });

  document.querySelectorAll('[data-legal-mailto]').forEach((element) => {
    const key = element.getAttribute('data-legal-mailto');
    if (map[key]) {
      element.href = `mailto:${map[key]}`;
    }
  });

  document.querySelectorAll('[data-legal-link]').forEach((element) => {
    const key = element.getAttribute('data-legal-link');
    if (key === 'website' && map.website) {
      element.href = map.website;
      element.textContent = map.website;
    }
  });

  const vatBlock = document.getElementById('vat-id-block');
  if (vatBlock && !legal.vatId) {
    vatBlock.style.display = 'none';
  }
});
