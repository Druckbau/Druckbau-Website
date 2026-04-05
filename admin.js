// js/admin.js
import { products, safeJSONParse, initCoupons } from './store.js';
import { formatCurrency, escapeHtml, t } from './utils.js';
import { renderCart } from './cart.js'; // Needed if admin stuff updates state
import { loadOrdersFromDB, updateOrderStatus, deleteAllOrdersFromDB, deleteCompletedOrdersFromDB, loadNewsFromDB, saveNewsToDB, deleteNewsFromDB, clearAllNewsFromDB, loadAnalyticsFromDB, trackAnalyticInDB, loadCouponsFromDB, saveCouponToDB, deleteCouponFromDB } from './db.js';

export const ADMIN_SECURITY = {
    attempts: 0,
    maxAttempts: 3,
    lockoutUntil: 0
};

export function logOrder(name, email, orderId, message, couponInfo = null, totalPrice = 0, items = []) {
    const newOrder = {
        name,
        email,
        orderId: orderId.toUpperCase(),
        message,
        coupon: couponInfo,
        totalPrice,
        items,
        date: new Date().toLocaleString(),
        status: 'Eingegangen'
    };

    const orders = safeJSONParse('druckbau_orders', []);
    orders.unshift(newOrder);
    localStorage.setItem('druckbau_orders', JSON.stringify(orders));

    triggerAdminRefresh();
    trackProductPurchase(items);
}

export function initAdminSystem() {
    window.adminModuleLoaded = true;

    const trigger = document.getElementById('admin-trigger');
    const panel = document.getElementById('admin-panel');
    const saveNewsBtn = document.getElementById('save-news-btn');
    const deleteNewsBtn = document.getElementById('delete-news-btn');
    const clearOrdersBtn = document.getElementById('clear-orders-btn');

    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent jump to top if it's an anchor link

            const now = Date.now();
            if (now < ADMIN_SECURITY.lockoutUntil) {
                const remaining = Math.ceil((ADMIN_SECURITY.lockoutUntil - now) / 1000);
                alert(`Zu viele Fehlversuche. Bitte warten Sie ${remaining} Sekunden.`);
                return;
            }

            const pwd = prompt("Admin Passwort:");
            if (pwd === 'admin123') {
                ADMIN_SECURITY.attempts = 0;
                const adminNavItem = document.getElementById('admin-nav-item');
                if (adminNavItem) adminNavItem.style.display = 'list-item';

                document.dispatchEvent(new CustomEvent('navigate', { detail: 'admin' }));
                loadAdminData();
            } else if (pwd !== null) {
                ADMIN_SECURITY.attempts++;
                if (ADMIN_SECURITY.attempts >= ADMIN_SECURITY.maxAttempts) {
                    ADMIN_SECURITY.lockoutUntil = Date.now() + 60000;
                    alert("Maximale Versuche erreicht. Zugriff für 1 Minute gesperrt.");
                } else {
                    alert(`Zugriff verweigert. (${ADMIN_SECURITY.attempts}/${ADMIN_SECURITY.maxAttempts})`);
                }
            }
        });
    }

    if (saveNewsBtn) {
        saveNewsBtn.addEventListener('click', async () => {
            const text = document.getElementById('admin-news-input').value;
            if (text) {
                await saveNewsToDB(text);
                
                // Fallback to local sync
                const date = new Date().toLocaleString();
                const newsList = safeJSONParse('druckbau_news_list', []);
                newsList.unshift({ text, date });
                localStorage.setItem('druckbau_news_list', JSON.stringify(newsList));

                alert("Status erfolgreich hinzugefügt!");
                document.getElementById('admin-news-input').value = '';
                document.dispatchEvent(new Event('news-updated'));
                loadAdminData();
            }
        });
    }

    if (deleteNewsBtn) {
        deleteNewsBtn.addEventListener('click', async () => {
            if (confirm("Möchtest du den gesamten Neuigkeiten-Verlauf löschen?")) {
                await clearAllNewsFromDB();
                localStorage.removeItem('druckbau_news_list');
                document.dispatchEvent(new Event('news-updated'));
                loadAdminData();
                alert("Verlauf gelöscht.");
            }
        });
    }

    if (clearOrdersBtn) {
        clearOrdersBtn.addEventListener('click', async () => {
            if (confirm("Wirklich alle Bestellungen aus der Datenbank löschen? (Unwiderruflich)")) {
                await deleteAllOrdersFromDB();
                localStorage.removeItem('druckbau_orders');
                loadAdminData();
            }
        });
    }

    const addCouponBtn = document.getElementById('add-coupon-btn');
    if (addCouponBtn) {
        addCouponBtn.addEventListener('click', async () => {
            const code = document.getElementById('admin-coupon-code').value.trim().toUpperCase();
            const type = document.getElementById('admin-coupon-type').value;
            const value = parseFloat(document.getElementById('admin-coupon-value').value);
            
            if (code && !isNaN(value)) {
                await saveCouponToDB(code, value, type);
                alert("Gutschein erfolgreich hinzugefügt!");
                
                // Clear inputs
                document.getElementById('admin-coupon-code').value = '';
                document.getElementById('admin-coupon-value').value = '';
                
                if (typeof initCoupons === 'function') await initCoupons();
                document.dispatchEvent(new Event('render-admin-coupons'));
            } else {
                alert("Bitte Code und gültigen Wert eingeben.");
            }
        });
    }

    const couponsTable = document.getElementById('admin-coupons-table');
    if (couponsTable) {
        couponsTable.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-coupon-btn')) {
                const id = e.target.getAttribute('data-id');
                const code = e.target.getAttribute('data-code');
                
                if (confirm(`Gutschein definitiv löschen?`)) {
                    if (id) {
                        await deleteCouponFromDB(id);
                    } else if (code) {
                        // Local deletion fallback
                        const local = safeJSONParse('druckbau_coupons', {});
                        delete local[code];
                        localStorage.setItem('druckbau_coupons', JSON.stringify(local));
                    }
                    alert("Gutschein gelöscht.");
                    if (typeof initCoupons === 'function') await initCoupons();
                    document.dispatchEvent(new Event('render-admin-coupons'));
                }
            }
        });
    }

    document.addEventListener('render-admin-coupons', async () => {
        const tbody = document.querySelector('#admin-coupons-table tbody');
        if (!tbody) return;
        
        const dbCoupons = await loadCouponsFromDB();
        let html = '';
        if (dbCoupons && dbCoupons.length > 0) {
            html = dbCoupons.map(c => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 0.5rem;">${c.code}</td>
                    <td style="padding: 0.5rem;">${c.type}</td>
                    <td style="padding: 0.5rem;">${c.type === 'percentage' ? c.discount + '%' : formatCurrency(c.discount) + ' €'}</td>
                    <td style="padding: 0.5rem;">${c.expires_at || '-'}</td>
                    <td style="padding: 0.5rem;">
                        <button class="delete-coupon-btn" data-id="${c.id}" style="background:none; border:none; color:#d9534f; cursor:pointer;" title="Löschen">&times;</button>
                    </td>
                </tr>
            `).join('');
        } else {
            // Local fallback
            const local = safeJSONParse('druckbau_coupons', {});
            const keys = Object.keys(local);
            if (keys.length > 0) {
                html = keys.map(key => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 0.5rem;">${key}</td>
                        <td style="padding: 0.5rem;">${local[key].type}</td>
                        <td style="padding: 0.5rem;">${local[key].type === 'percentage' ? local[key].value + '%' : formatCurrency(local[key].value) + ' €'}</td>
                        <td style="padding: 0.5rem;">${local[key].expiry} (Lokal)</td>
                        <td style="padding: 0.5rem;">
                            <button class="delete-coupon-btn" data-code="${key}" style="background:none; border:none; color:#d9534f; cursor:pointer;" title="Lokal Löschen">&times;</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        tbody.innerHTML = html || '<tr><td colspan="5" style="padding:1rem; text-align:center;">Keine Gutscheine vorhanden.</td></tr>';
    });

    const historyContainer = document.getElementById('admin-news-history');
    if (historyContainer) {
        historyContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-news-item')) {
                const id = e.target.getAttribute('data-id');
                const index = parseInt(e.target.getAttribute('data-index'));
                
                if (id) {
                    await deleteNewsFromDB(id);
                }

                // Local sync
                const newsList = JSON.parse(localStorage.getItem('druckbau_news_list')) || [];
                // if we don't have id but index we just splice locally
                if (index !== null && !isNaN(index) && !id) {
                    newsList.splice(index, 1);
                } else if (id) {
                    // Try to filter it out if we know it was matching 
                    // Not strict matching possible easily locally if ids are missed. Just reload.
                }
                
                localStorage.setItem('druckbau_news_list', JSON.stringify(newsList));
                document.dispatchEvent(new Event('news-updated'));
                loadAdminData();
            }
        });
    }

    const ordersTable = document.getElementById('orders-table');
    if (ordersTable) {
        ordersTable.addEventListener('change', async (e) => {
            if (e.target.classList.contains('order-status-select')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                const newStatus = e.target.value;
                const orderId = e.target.getAttribute('data-order-id');
                
                await updateOrderStatus(orderId, newStatus);

                const orders = safeJSONParse('druckbau_orders', []);
                if (orders[index]) {
                    orders[index].status = newStatus;
                    localStorage.setItem('druckbau_orders', JSON.stringify(orders));
                }
                
                alert('Status in der Datenbank aktualisiert!');
            }
        });
    }

    const deleteCompletedBtn = document.getElementById('delete-completed-orders-btn');
    if (deleteCompletedBtn) {
        deleteCompletedBtn.addEventListener('click', async () => {
            if (confirm("Wirklich alle erledigten (versendeten) Bestellungen in der Datenbank löschen?")) {
                await deleteCompletedOrdersFromDB();
                let orders = JSON.parse(localStorage.getItem('druckbau_orders')) || [];
                const initialLength = orders.length;
                orders = orders.filter(o => o.status !== 'Versendet');
                localStorage.setItem('druckbau_orders', JSON.stringify(orders));
                loadAdminData();
                alert(`${initialLength - orders.length} erledigte Bestellungen gelöscht.`);
            }
        });
    }

    const seasonalBtn = document.querySelector('.seasonal-offer-btn');
    if (seasonalBtn) {
        seasonalBtn.addEventListener('click', async () => {
            const title = prompt("Titel (z.B. Black Friday!):", "Sonderangebot!");
            if (!title) return;
            const desc = prompt("Beschreibung (z.B. 20% auf alles):", "20% Rabatt auf Drucke");
            if (!desc) return;
            
            // We use DB news to store it as a special offer
            const payload = `[OFFER] ${title} | ${desc}`;
            const success = await saveNewsToDB(payload);
            
            // local fallback
            const newsList = JSON.parse(localStorage.getItem('druckbau_news_list')) || [];
            newsList.unshift({ text: payload, date: new Date().toLocaleString() });
            localStorage.setItem('druckbau_news_list', JSON.stringify(newsList));

            if (success) {
                alert("Angebot erfolgreich in der Datenbank gespeichert! Es wird auf der Startseite angezeigt.");
            } else {
                alert("Angebot wurde vorerst lokal gespeichert (Fehler bei der Datenbank-Verbindung).");
            }
            loadAdminData();
        });
    }

    const chartRange = document.getElementById('admin-chart-range');
    if (chartRange) {
        chartRange.addEventListener('change', renderOrdersChart);
    }

    // Public Order Tracking Logic
    const submitStatusBtn = document.getElementById('check-status-btn');
    const orderInput = document.getElementById('status-order-id');
    const statusResult = document.getElementById('status-result');
    const statusBadge = document.getElementById('status-badge');

    if (submitStatusBtn && orderInput && statusResult && statusBadge) {
        submitStatusBtn.addEventListener('click', async () => {
            const val = orderInput.value.trim().toUpperCase();
            if (!val) return;

            statusResult.style.display = 'block';
            statusBadge.innerText = 'Lade...';
            statusBadge.style.background = '#ccc';
            statusBadge.style.color = '#333';

            const { fetchOrderById } = await import('./db.js');
            const data = await fetchOrderById(val) || await fetchOrderById(val.replace('#', ''));
            let statusStr = '';

            if (data) {
                statusStr = data.status || 'Eingegangen';
            } else {
                const orders = safeJSONParse('druckbau_orders', []);
                const foundOrder = orders.find(o => o.orderId === val || o.orderId === val.replace('#', ''));
                if (foundOrder) statusStr = foundOrder.status || 'Eingegangen';
            }

            if (statusStr) {
                statusBadge.innerText = statusStr;
                statusBadge.style.color = 'white';

                if (statusStr === 'Versendet') statusBadge.style.background = '#10b981'; // Green
                else if (statusStr === 'Eingegangen') statusBadge.style.background = '#f59e0b'; // Orange
                else statusBadge.style.background = '#3b82f6'; // Blue
            } else {
                statusBadge.innerText = 'Bestellung nicht gefunden';
                statusBadge.style.background = '#ef4444'; // Red
                statusBadge.style.color = 'white';
            }
        });

        // Allow entering via Enter key
        orderInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitStatusBtn.click();
        });
    }
}

export async function loadAdminData() {
    const dbNews = await loadNewsFromDB();
    let newsList = [];
    
    if (dbNews && dbNews.length > 0) {
        newsList = dbNews.map(n => ({ id: n.id, text: n.content, date: new Date(n.created_at).toLocaleString() }));
        localStorage.setItem('druckbau_news_list', JSON.stringify(newsList)); // Local sync
    } else {
        newsList = JSON.parse(localStorage.getItem('druckbau_news_list')) || [];
    }

    const historyContainer = document.getElementById('admin-news-history');
    if (historyContainer) {
        if (newsList.length === 0) {
            historyContainer.innerHTML = '<p style="font-size:0.9rem; color:#999; text-align:center;">Kein Verlauf vorhanden.</p>';
        } else {
            historyContainer.innerHTML = newsList.map((item, index) => `
                <div style="border-bottom:1px solid #eee; padding:0.5rem 0; display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="font-size:0.85rem;">
                        <div style="font-weight:bold; color:var(--primary-blue);">${item.date}</div>
                        <div>${escapeHtml(item.text).replace(/\\n/g, '<br>')}</div>
                    </div>
                    <button class="delete-news-item" data-id="${item.id || ''}" data-index="${index}" style="background:none; border:none; color:#d9534f; cursor:pointer; font-size:1.2rem;" title="Löschen">&times;</button>
                </div>
            `).join('');
        }
    }

    const dbOrdersRaw = await loadOrdersFromDB();
    let orders = [];

    if (dbOrdersRaw && dbOrdersRaw.length > 0) {
        // Use DB orders if available mapping them to local format
        orders = dbOrdersRaw.map(dbO => ({
            name: dbO.customer_name,
            email: dbO.customer_email,
            orderId: dbO.order_id,
            message: dbO.order_data.message || '',
            coupon: dbO.order_data.coupon ? { code: dbO.order_data.coupon, discount: dbO.order_data.discount } : null,
            totalPrice: dbO.total_price,
            items: dbO.order_data.cart || [],
            date: new Date(dbO.created_at).toLocaleString(),
            status: dbO.status
        }));
        localStorage.setItem('druckbau_orders', JSON.stringify(orders)); // Keep local sync
    } else {
        orders = safeJSONParse('druckbau_orders', []);
    }

    const ordersBody = document.querySelector('#orders-table tbody');
    if (ordersBody) {
        if (orders.length === 0) {
            ordersBody.innerHTML = '<tr><td colspan="7" style="padding:1rem; text-align:center;">Keine Bestellungen vorhanden.</td></tr>';
        } else {
            ordersBody.innerHTML = orders.map((order, index) => {
                const status = order.status || 'Eingegangen';
                const options = ['Eingegangen', 'In Bearbeitung', 'Gedruckt', 'Versendet'].map(opt =>
                    `<option value="${opt}" ${status === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');

                return `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 0.5rem; font-size: 0.9rem;">${order.date}</td>
                        <td style="padding: 0.5rem;">${escapeHtml(order.name)}</td>
                        <td style="padding: 0.5rem; font-family:monospace;">${escapeHtml(order.orderId)}</td>
                        <td style="padding: 0.5rem;">${escapeHtml(order.email)}</td>
                        <td style="padding: 0.5rem; font-size: 0.9rem;">${escapeHtml(order.message)}</td>
                        <td style="padding: 0.5rem; font-size: 0.85rem;">${order.items ? order.items.map(i => `${i.qty}x ${escapeHtml(i.name || i.nameKey)}`).join('<br>') : '-'}</td>
                        <td style="padding: 0.5rem; font-weight:bold;">${order.totalPrice ? formatCurrency(order.totalPrice) + ' €' : '-'}</td>
                        <td style="padding: 0.5rem; font-size: 0.85rem; color: var(--primary-blue);">
                            ${order.coupon ? `${order.coupon.code}<br><small>(-${formatCurrency(order.coupon.discount)})</small>` : '-'}
                        </td>
                        <td style="padding: 0.5rem;">
                            <select class="order-status-select" data-index="${index}" data-order-id="${order.orderId}" style="padding:2px; font-size:0.8rem; border-radius:4px; border:1px solid #ccc;">
                                ${options}
                            </select>
                        </td>
                    </tr >
                    `;
            }).join('');
        }
    }

    const subscribers = JSON.parse(localStorage.getItem('druckbau_subscribers')) || [];
    const newsletterBody = document.querySelector('#newsletter-table tbody');
    if (newsletterBody) {
        if (subscribers.length === 0) {
            newsletterBody.innerHTML = '<tr><td colspan="3" style="padding:1rem; text-align:center;">Keine Abonnenten.</td></tr>';
        } else {
            newsletterBody.innerHTML = subscribers.map((sub, index) => `
                    < tr style = "border-bottom: 1px solid #eee;" >
                    <td style="padding: 0.5rem; font-size: 0.85rem;">${sub.date}</td>
                    <td style="padding: 0.5rem; font-size: 0.85rem;">${escapeHtml(sub.email)}</td>
                    <td style="padding: 0.5rem;">
                        <button class="delete-subscriber" data-index="${index}" style="background:none; border:none; color:#d9534f; cursor:pointer;" title="Entfernen">&times;</button>
                    </td>
                </tr >
                    `).join('');
        }
    }

    // Trigger coupon rendering out of here
    document.dispatchEvent(new Event('render-admin-coupons'));

    renderOrdersChart();

    const dbStats = await loadAnalyticsFromDB();
    const stats = safeJSONParse('druckbau_stats', { views: {}, purchases: {}, revenue: {}, youtube_clicks: 0 });
    
    // Sync DB stats to local
    if (dbStats && dbStats.length > 0) {
        dbStats.forEach(s => {
            if (s.item_id === 'youtube') stats.youtube_clicks = s.views;
            else {
                stats.purchases[s.item_id] = s.purchases;
                stats.revenue[s.item_id] = parseFloat(s.revenue) || 0;
                stats.views[s.item_id] = s.views;
            }
        });
        localStorage.setItem('druckbau_stats', JSON.stringify(stats));
    }

    const statsBody = document.querySelector('#stats-table tbody');
    if (statsBody) {
        let sortedProducts = [...products].sort((a, b) => {
            const revA = stats.revenue ? (stats.revenue[a.id] || 0) : 0;
            const revB = stats.revenue ? (stats.revenue[b.id] || 0) : 0;
            return revB - revA; // Sort by revenue descending
        });

        let statsHtml = sortedProducts.map(p => {
            const buys = stats.purchases[p.id] || 0;
            const rev = stats.revenue ? (stats.revenue[p.id] || 0) : 0;
            return `
                    < tr style = "border-bottom: 1px solid #eee;" >
                    <td style="padding: 0.5rem;">${t(p.nameKey)}</td>
                    <td style="padding: 0.5rem;">${buys}</td>
                    <td style="padding: 0.5rem; color: var(--primary-blue); font-weight: bold;">${formatCurrency(rev)} €</td>
                </tr >
                    `;
        }).join('');

        statsHtml += `
                    < tr style = "background: rgba(46, 204, 113, 0.1);" >
                <td style="padding: 0.5rem; font-weight:bold; color:var(--primary-blue);">YouTube Kanal</td>
                <td style="padding: 0.5rem; font-weight:bold;">${stats.youtube_clicks || 0} Klicks</td>
                <td style="padding: 0.5rem;">-</td>
            </tr >
                    `;

        statsBody.innerHTML = statsHtml;
    }
}

export function renderOrdersChart() {
    const canvas = document.getElementById('admin-orders-chart');
    const rangeSelect = document.getElementById('admin-chart-range');
    if (!canvas || !window.Chart) return;

    const orders = safeJSONParse('druckbau_orders', []);
    const range = rangeSelect ? rangeSelect.value : '1w';

    let daysToDisplay = 7;
    if (range === 'day') daysToDisplay = 1;
    else if (range === '1w') daysToDisplay = 7;
    else if (range === '1m') daysToDisplay = 30;
    else if (range === '5m') daysToDisplay = 150;
    else if (range === 'all') {
        if (orders.length > 0) {
            const firstDate = new Date(orders[orders.length - 1].date.split(',')[0].split('.').reverse().join('-'));
            const diffTime = Math.abs(new Date() - firstDate);
            daysToDisplay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        } else {
            daysToDisplay = 7;
        }
    }

    const labels = [];
    const dataPoints = [];
    const revPoints = [];

    for (let i = daysToDisplay - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('de-DE');
        labels.push(dateStr);

        const dayOrders = orders.filter(o => o.date.startsWith(dateStr));
        dataPoints.push(dayOrders.length);

        const dayRev = dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        revPoints.push(dayRev);
    }

    let finalLabels = labels;
    let finalData = dataPoints;
    let finalRev = revPoints;
    if (daysToDisplay > 31) {
        finalLabels = labels.map((l, i) => (i % 7 === 0 || i === labels.length - 1) ? l : '');
    }

    if (window.myAdminChart) {
        window.myAdminChart.destroy();
    }

    window.myAdminChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: finalLabels,
            datasets: [{
                label: 'Bestellungen',
                data: finalData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: daysToDisplay > 30 ? 0 : 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
                x: { grid: { display: false } }
            }
        }
    });

    const revCanvas = document.getElementById('admin-revenue-chart');
    if (revCanvas) {
        if (window.myRevChart) window.myRevChart.destroy();
        window.myRevChart = new Chart(revCanvas, {
            type: 'line',
            data: {
                labels: finalLabels,
                datasets: [{
                    label: 'Umsatz (€)',
                    data: finalRev,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: daysToDisplay > 30 ? 0 : 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

export async function triggerAdminRefresh() {
    const adminSection = document.getElementById('admin');
    if (adminSection && (adminSection.style.display === 'block' || adminSection.classList.contains('active'))) {
        await loadAdminData();
    }
}

// Analytics Helpers
export async function trackProductView(productId) {
    await trackAnalyticInDB(productId, 'view', 1);

    const stats = safeJSONParse('druckbau_stats', { views: {}, purchases: {}, youtube_clicks: 0 });
    stats.views[productId] = (stats.views[productId] || 0) + 1;
    localStorage.setItem('druckbau_stats', JSON.stringify(stats));
}

export async function trackProductPurchase(items) {
    const stats = safeJSONParse('druckbau_stats', { views: {}, purchases: {}, revenue: {}, youtube_clicks: 0 });
    if (!stats.revenue) stats.revenue = {};

    if (Array.isArray(items)) {
        for (const item of items) {
            if (!item.isCustom) {
                await trackAnalyticInDB(item.id, 'purchase', item.qty);
                await trackAnalyticInDB(item.id, 'revenue', item.price * item.qty);
                stats.purchases[item.id] = (stats.purchases[item.id] || 0) + item.qty;
                stats.revenue[item.id] = (stats.revenue[item.id] || 0) + (item.price * item.qty);
            }
        }
    } else if (typeof items === 'string') {
        await trackAnalyticInDB(items, 'purchase', 1);
        stats.purchases[items] = (stats.purchases[items] || 0) + 1;
    }

    localStorage.setItem('druckbau_stats', JSON.stringify(stats));
    triggerAdminRefresh();
}

export async function trackYouTubeClick() {
    await trackAnalyticInDB('youtube', 'view', 1);

    const stats = safeJSONParse('druckbau_stats', { views: {}, purchases: {}, youtube_clicks: 0 });
    stats.youtube_clicks = (stats.youtube_clicks || 0) + 1;
    localStorage.setItem('druckbau_stats', JSON.stringify(stats));
    triggerAdminRefresh();
}

export function exportOrdersToCSV() {
    const orders = safeJSONParse('druckbau_orders', []);
    if (orders.length === 0) {
        alert("Keine Bestellungen zum Exportieren vorhanden.");
        return;
    }

    const headers = ['Datum', 'Name', 'Bestell-ID', 'Email', 'Nachricht', 'Gutschein', 'Rabatt', 'Status'];
    const rows = orders.map(o => [
        o.date,
        `"${o.name}"`,
        o.orderId,
        o.email,
        `"${o.message.replace(/"/g, '""')}"`,
        o.coupon ? o.coupon.code : '-',
        o.coupon ? o.coupon.discount : 0,
        o.status || 'Eingegangen'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `druckbau_bestellungen_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
