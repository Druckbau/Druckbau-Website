import fs from 'fs';
import path from 'path';

const root = process.cwd();
const files = {
  impressum: path.join(root, 'impressum.html'),
  datenschutz: path.join(root, 'datenschutz.html'),
  agb: path.join(root, 'agb.html'),
  widerruf: path.join(root, 'widerruf.html'),
  index: path.join(root, 'index.html'),
  checkout: path.join(root, 'js/checkout.js')
};

const fails = [];
for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) {
    fails.push(`${name}: missing file`);
  }
}

const imprint = fs.readFileSync(files.impressum, 'utf8');
if (imprint.includes('[Vorname]') || imprint.includes('[Musterstraße 12]') || imprint.includes('[DE000000000]')) {
  fails.push('impressum still contains placeholder values');
}

const privacy = fs.readFileSync(files.datenschutz, 'utf8');
if (!privacy.includes('Google Analytics') && !privacy.includes('Google Tag Manager')) {
  fails.push('datenschutz missing Google Analytics section');
}

const indexHtml = fs.readFileSync(files.index, 'utf8');
if (!indexHtml.includes('Zahlungspflichtig bestellen') && !indexHtml.includes('Kostenpflichtig bestellen')) {
  fails.push('index missing compliant final checkout wording');
}

const checkoutJs = fs.readFileSync(files.checkout, 'utf8');
if (!checkoutJs.includes('bestellungen.druckbau@gmail.com')) {
  fails.push('checkout does not send order emails to bestellungen.druckbau@gmail.com');
}

if (fails.length > 0) {
  console.error('Legal checks failed:');
  for (const fail of fails) console.error('-', fail);
  process.exit(1);
}

console.log('Legal checks passed.');
