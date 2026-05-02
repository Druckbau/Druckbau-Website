// js/admin.js
import { showNotification, escapeHtml, t } from './utils.js';
import { loadOrdersFromDB, updateOrderStatus, loadAnalyticsFromDB, trackAnalyticInDB, loadNewsFromDB, saveNewsToDB, deleteNewsFromDB, clearAllNewsFromDB, loadCouponsFromDB, saveCouponToDB, deleteCouponFromDB, deleteAllOrdersFromDB, deleteCompletedOrdersFromDB } from './db.js';

let ordersChart = null;
let revenueChart = null;

export function initAdminSystem() {
    const adminTrigger = document.getElementById('admin-trigger');
    if (adminTrigger) {
        adminTrigger.addEventListener('click', () => {
            const pass = prompt("Admin Passwort:");
            if (pass === 'dbadmin') {
                showSection('admin');
                loadAdminData();
            } else {
                alert("Falsches Passwort!");
            }
        });
    }

    const saveNewsBtn = document.getElementById('save-news-btn');
    if (saveNewsBtn) {
        saveNewsBtn.addEventListener('click', async () => {
            const input = document.getElementById('admin-news-input');
            const content = input ? input.value.trim() : '';
            if (content) {
                const success = await saveNewsToDB(content);
                if (success) {
                    showNotification("Status gespeichert!", "success");
                    input.value = '';
                    loadAdminData();
                } else {
                    showNotification("Fehler beim Speichern.", "error");
                }
            }
        });
    }

    const deleteNewsBtn = document.getElementById('delete-news-btn');
    if (deleteNewsBtn) {
        deleteNewsBtn.addEventListener('click', async () => {
            if (confirm("Wirklich den gesamten Verlauf löschen?")) {
                await clearAllNewsFromDB();
                loadAdminData();
            }
        });
    }

    const chartRange = document.getElementById('admin-chart-range');
    if (chartRange) {
        chartRange.addEventListener('change', () => {
            renderOrdersChart();
        });
    }

    // Global listeners for tables (using delegation)
    document.body.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-subscriber')) {
            const index = parseInt(e.target.dataset.index);
            if (confirm("Abonnent wirklich entfernen?")) {
                const subs = JSON.parse(localStorage.getItem('druckbau_subscribers') || '[]');
                subs.splice(index, 1);
                localStorage.setItem('druckbau_subscribers', JSON.stringify(subs));
                loadAdminData();
            }
        }

        if (e.target.classList.contains('delete-news-item')) {
            const id = e.target.dataset.id;
            if (confirm("Eintrag löschen?")) {
                await deleteNewsFromDB(id);
                loadAdminData();
            }
        }
        
        if (e.target.id === 'clear-orders-btn') {
            if (confirm("WIRKLICH ALLE BESTELLUNGEN LÖSCHEN?")) {
                await deleteAllOrdersFromDB();
                localStorage.removeItem('druckbau_orders');
                loadAdminData();
            }
        }

        if (e.target.id === 'delete-completed-orders-btn') {
            if (confirm("Alle 'Versendet' Bestellungen löschen?")) {
                await deleteCompletedOrdersFromDB();
                loadAdminData();
            }
        }
    });

    document.body.addEventListener('change', async (e) => {
        if (e.target.classList.contains('order-status-select')) {
            const orderId = e.target.dataset.orderId;
            const newStatus = e.target.value;
            const success = await updateOrderStatus(orderId, newStatus);
            if (success) {
                showNotification(`Status für ${orderId} auf ${newStatus} aktualisiert.`, "success");
                // Sync back to local storage
                const localOrders = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
                const localIdx = localOrders.findIndex(o => o.orderId === orderId);
                if (localIdx !== -1) {
                    localOrders[localIdx].status = newStatus;
                    localStorage.setItem('druckbau_orders', JSON.stringify(localOrders));
                }
            }
        }

        if (e.target.classList.contains('tracking-id-input')) {
            const orderId = e.target.dataset.orderId;
            const trackingId = e.target.value;
            await updateOrderStatus(orderId, null, trackingId);
            showNotification(`Tracking ID für ${orderId} gespeichert.`, "success");
        }
    });

    document.addEventListener('render-admin-coupons', renderAdminCoupons);
}

export async function loadAdminData() {
    console.log("Loading Admin Data...");
    
    // News History
    const newsList = await loadNewsFromDB();
    const historyDiv = document.getElementById('admin-news-history');
    if (historyDiv) {
        if (!newsList || newsList.length === 0) {
            historyDiv.innerHTML = '<p style="text-align:center; padding:1rem; opacity:0.6;">Kein Verlauf vorhanden.</p>';
        } else {
            historyDiv.innerHTML = newsList.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:5px 0;">
                    <span style="font-size:0.8rem;">${new Date(item.created_at).toLocaleDateString('de-DE')}: ${escapeHtml(item.content)}</span>
                    <button class="delete-news-item" data-id="${item.id}" style="background:none; border:none; color:#d9534f; cursor:pointer;">&times;</button>
                </div>
            `).join('');
        }
    }

    const dbOrdersRaw = await loadOrdersFromDB();
    let orders = [];

    if (dbOrdersRaw && dbOrdersRaw.length > 0) {
        orders = dbOrdersRaw.map(dbO => ({
            name: dbO.customer_name,
            email: dbO.customer_email,
            orderId: dbO.order_id,
            message: dbO.order_data.message || '',
            coupon: dbO.order_data.coupon ? { code: dbO.order_data.coupon, discount: dbO.order_data.discount } : null,
            totalPrice: dbO.total_price,
            items: dbO.order_data.cart || [],
            date: new Date(dbO.created_at).toLocaleString('de-DE'),
            status: dbO.status,
            trackingId: dbO.tracking_id
        }));
        localStorage.setItem('druckbau_orders', JSON.stringify(orders));
    } else {
        orders = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
    }

    const ordersBody = document.querySelector('#orders-table tbody');
    if (ordersBody) {
        if (orders.length === 0) {
            ordersBody.innerHTML = '<tr><td colspan="9" style="padding:1rem; text-align:center;">Keine Bestellungen vorhanden.</td></tr>';
        } else {
            const statusOptions = ['Eingegangen', 'Zahlung ausstehend', 'In Bearbeitung', 'Gedruckt', 'Abholbereit', 'Versendet', 'Storniert'];
            
            ordersBody.innerHTML = orders.map((order, index) => {
                const status = order.status || 'Eingegangen';
                const options = statusOptions.map(opt =>
                    `<option value="${opt}" ${status === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');

                return `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 0.8rem; font-size: 0.85rem; white-space:nowrap;">${order.date}</td>
                        <td style="padding: 0.8rem;">${escapeHtml(order.name)}</td>
                        <td style="padding: 0.8rem; font-family:monospace; font-weight:bold;">${escapeHtml(order.orderId)}</td>
                        <td style="padding: 0.8rem; font-size:0.85rem;"><a href="mailto:${order.email}">${escapeHtml(order.email)}</a></td>
                        <td style="padding: 0.8rem; font-size: 0.85rem; max-width:200px; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(order.message)}</td>
                        <td style="padding: 0.8rem; font-size: 0.8rem; line-height:1.3;">${order.items ? order.items.map(i => `${i.qty}x ${escapeHtml(i.name)}`).join('<br>') : '-'}</td>
                        <td style="padding: 0.8rem; font-weight:bold;">${order.totalPrice ? order.totalPrice.toFixed(2) + ' €' : '-'}</td>
                        <td style="padding: 0.8rem;">
                            <input type="text" class="tracking-id-input" data-order-id="${order.orderId}" value="${order.trackingId || ''}" placeholder="ID" style="width:100%; padding:4px; font-size:0.75rem; border:1px solid var(--border-color); border-radius:4px; background:var(--bg-light); color:var(--text-dark);">
                        </td>
                        <td style="padding: 0.8rem;">
                            <select class="order-status-select" data-order-id="${order.orderId}" style="width:100%; padding:4px; font-size:0.8rem; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-light); color:var(--text-dark);">
                                ${options}
                            </select>
                        </td>
                    </tr >
                `;
            }).join('');
        }
    }

    const subscribers = JSON.parse(localStorage.getItem('druckbau_subscribers') || '[]');
    const newsletterBody = document.querySelector('#newsletter-table tbody');
    if (newsletterBody) {
        if (subscribers.length === 0) {
            newsletterBody.innerHTML = '<tr><td colspan="3" style="padding:1rem; text-align:center;">Keine Abonnenten.</td></tr>';
        } else {
            newsletterBody.innerHTML = subscribers.map((sub, index) => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.8rem; font-size: 0.85rem;">${sub.date || '-'}</td>
                    <td style="padding: 0.8rem; font-size: 0.85rem;">${escapeHtml(sub.email)}</td>
                    <td style="padding: 0.8rem; text-align:right;">
                        <button class="delete-subscriber" data-index="${index}" style="background:none; border:none; color:var(--error-color); cursor:pointer; font-size:1.2rem;" title="Entfernen">&times;</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    renderAdminCoupons();
    renderOrdersChart();
    renderStatsTable();
}

async function renderStatsTable() {
    const dbStats = await loadAnalyticsFromDB();
    const stats = JSON.parse(localStorage.getItem('druckbau_stats') || '{"views":{},"purchases":{},"revenue":{},"youtube_clicks":0}');
    
    if (dbStats && dbStats.length > 0) {
        dbStats.forEach(s => {
            if (s.item_id === 'youtube') stats.youtube_clicks = s.views;
            else {
                stats.purchases[s.item_id] = s.purchases;
                stats.revenue[s.item_id] = parseFloat(s.revenue) || 0;
                stats.views[s.item_id] = s.views;
            }
        });
    }

    const statsBody = document.querySelector('#stats-table tbody');
    if (statsBody) {
        // We'd need the products list here, for now use a simplified approach
        const itemIds = Object.keys(stats.views);
        if (itemIds.length === 0) {
            statsBody.innerHTML = '<tr><td colspan="3" style="padding:1rem; text-align:center;">Noch keine Daten vorhanden.</td></tr>';
        } else {
            statsBody.innerHTML = itemIds.map(id => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.8rem;">${id}</td>
                    <td style="padding: 0.8rem;">${stats.purchases[id] || 0}</td>
                    <td style="padding: 0.8rem; font-weight:bold;">${(stats.revenue[id] || 0).toFixed(2)} €</td>
                </tr>
            `).join('');
        }
    }
}

async function renderAdminCoupons() {
    const coupons = await loadCouponsFromDB() || [];
    const tableBody = document.querySelector('#admin-coupons-table tbody');
    if (!tableBody) return;

    if (coupons.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1rem;">Keine Gutscheine vorhanden.</td></tr>';
    } else {
        tableBody.innerHTML = coupons.map(c => `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.5rem; font-family:monospace; font-weight:bold;">${c.code}</td>
                <td style="padding: 0.5rem;">${c.type === 'fixed' ? 'Festbetrag' : 'Prozent'}</td>
                <td style="padding: 0.5rem;">${c.discount}${c.type === 'fixed' ? ' €' : ' %'}</td>
                <td style="padding: 0.5rem; font-size:0.8rem;">${c.expires_at ? new Date(c.expires_at).toLocaleDateString('de-DE') : '-'}</td>
                <td style="padding: 0.5rem;">
                    <button class="delete-coupon-btn" data-id="${c.id}" style="color:var(--error-color); background:none; border:none; cursor:pointer;">Löschen</button>
                </td>
            </tr>
        `).join('');
    }

    // Add Coupon Listener
    const addBtn = document.getElementById('add-coupon-btn');
    if (addBtn && !addBtn.dataset.listener) {
        addBtn.dataset.listener = "true";
        addBtn.addEventListener('click', async () => {
            const code = document.getElementById('admin-coupon-code').value.toUpperCase().trim();
            const type = document.getElementById('admin-coupon-type').value;
            const val = parseFloat(document.getElementById('admin-coupon-value').value);
            
            if (code && !isNaN(val)) {
                const success = await saveCouponToDB(code, val, type);
                if (success) {
                    showNotification("Gutschein erstellt!", "success");
                    renderAdminCoupons();
                }
            }
        });
    }

    // Delete Coupon Listener
    tableBody.querySelectorAll('.delete-coupon-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm("Gutschein wirklich löschen?")) {
                await deleteCouponFromDB(btn.dataset.id);
                renderAdminCoupons();
            }
        });
    });
}

function renderOrdersChart() {
    const ctx = document.getElementById('admin-orders-chart');
    if (!ctx || !window.Chart) return;

    if (ordersChart) ordersChart.destroy();

    const orders = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
    const range = document.getElementById('admin-chart-range')?.value || '1w';
    
    // Group orders by date
    const grouped = {};
    orders.forEach(o => {
        const d = o.date.split(',')[0];
        grouped[d] = (grouped[d] || 0) + 1;
    });

    const labels = Object.keys(grouped).sort();
    const data = labels.map(l => grouped[l]);

    ordersChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bestellungen',
                data: data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
}

export function triggerAdminRefresh() {
    loadAdminData();
}

export function exportOrdersToCSV() {
    const orders = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
    if (orders.length === 0) return alert("Keine Bestellungen zum Exportieren.");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Datum;Name;Bestell-Nr;Email;Status;Preis;Produkte\n";

    orders.forEach(o => {
        const row = [
            o.date,
            o.name,
            o.orderId,
            o.email,
            o.status,
            o.totalPrice,
            o.items.map(i => `${i.qty}x ${i.name}`).join(' | ')
        ].join(';');
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bestellungen_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function trackProductView(id) {
    trackAnalyticInDB(id, 'view');
}

export function trackProductPurchase(id) {
    trackAnalyticInDB(id, 'purchase');
}

export function trackYouTubeClick() {
    trackAnalyticInDB('youtube', 'view');
}
