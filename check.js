const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    const errors = [];
    page.on('pageerror', err => {
        errors.push(err.toString());
    });
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push('Console Error: ' + msg.text());
        }
    });

    try {
        await page.goto('file:///Users/philipproggenland/Desktop/Druckbau/index.html', { waitUntil: 'load', timeout: 5000 });
        
        console.log("Found DOM elements:");
        console.log("- products-grid:", !!await page.$('#products-grid'));
        
        console.log("\nErrors:");
        console.log(errors.length === 0 ? "None" : errors.join('\n'));
    } catch(err) {
        console.log("Nav Error:", err);
    }
    
    await browser.close();
})();
