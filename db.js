// js/db.js
import { showNotification } from './utils.js';

// --- Supabase Setup ---
// NOTE: These are your current credentials. 
const SUPABASE_URL = 'https://ezwmsguucjzqovypmggk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6d21zZ3V1Y2p6cW92eXBtZ2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzg5MDEsImV4cCI6MjA5MDk1NDkwMX0.H4quCJTA75tZhWwJDkCrvM2Y7_aPhf2YLmvSDCZdgeU';

let supabaseClient = null;

export function initDB() {
    if (window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("✅ Supabase Client erfolgreich initialisiert.");
            
            // Sofortige Synchronisation beim Start versuchen
            setTimeout(() => syncLocalStorageToDB(), 2000);
        } catch (err) {
            console.error("❌ Fehler bei der Supabase-Initialisierung:", err);
        }
    } else {
        console.warn("⚠️ Supabase Bibliothek nicht gefunden. Die Seite läuft im lokalen Modus (Daten werden nur auf diesem Gerät gespeichert).");
    }
}

// --- Orders ---
export async function saveOrderToDB(orderData) {
    if (!supabaseClient) {
        console.warn("Bestellung wurde lokal gespeichert (Keine Supabase Verbindung).");
        return false;
    }

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([orderData]);

        if (error) {
            console.error("❌ Supabase Fehler (Orders):", error.message, error.details);
            return false;
        }
        console.log("✅ Bestellung erfolgreich nach Supabase übertragen.");
        return true;
    } catch (e) {
        console.error("❌ Schwerer Fehler beim Speichern der Bestellung:", e);
        return false;
    }
}

export async function loadOrdersFromDB() {
    if (!supabaseClient) return null;

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (e) {
        console.error("Error loading orders from DB:", e);
        return null;
    }
}

export async function updateOrderStatus(orderId, newStatus, trackingId = null) {
    if (!supabaseClient) return false;

    try {
        const updateData = {};
        if (newStatus) updateData.status = newStatus;
        if (trackingId !== null) updateData.tracking_id = trackingId;

        const { data, error } = await supabaseClient
            .from('orders')
            .update(updateData)
            .eq('order_id', orderId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error updating order status:", e);
        return false;
    }
}

export async function deleteAllOrdersFromDB() {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('orders').delete().neq('order_id', 'none');
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error deleting orders:", e);
        return false;
    }
}

export async function deleteCompletedOrdersFromDB() {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('orders').delete().eq('status', 'Versendet');
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error deleting completed orders:", e);
        return false;
    }
}

// --- Subscribers ---
export async function addSubscriberToDB(email) {
    if (!supabaseClient) return false;

    try {
        const { data, error } = await supabaseClient
            .from('subscribers')
            .insert([{ email }]);

        if (error) {
            if (error.code === '23505') return 'exists';
            console.error("❌ Supabase Fehler (Subscribers):", error.message);
            throw error;
        }
        return true;
    } catch (e) {
        console.error("Error saving subscriber to DB:", e);
        return false;
    }
}

// --- News ---
export async function loadNewsFromDB() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient.from('news').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch(e) {
        console.error("Error loading news:", e);
        return null;
    }
}

export async function saveNewsToDB(content) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('news').insert([{ content }]);
        if (error) {
            console.error("❌ Supabase Fehler (News):", error.message);
            throw error;
        }
        return true;
    } catch(e) {
        console.error("Error saving news:", e);
        return false;
    }
}

export async function deleteNewsFromDB(id) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('news').delete().eq('id', id);
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error deleting news:", e);
        return false;
    }
}

export async function clearAllNewsFromDB() {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('news').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
        return true;
    } catch(e) {
        return false;
    }
}

// --- Coupons ---
export async function loadCouponsFromDB() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient.from('coupons').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch(e) {
        console.error("Error loading coupons:", e);
        return null;
    }
}

export async function saveCouponToDB(code, discount, type = 'fixed') {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('coupons').insert([{ code, discount, type }]);
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error saving coupon:", e);
        return false;
    }
}

export async function deleteCouponFromDB(id) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('coupons').delete().eq('id', id);
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error deleting coupon:", e);
        return false;
    }
}

// --- Analytics ---
export async function loadAnalyticsFromDB() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient.from('analytics').select('*');
        if (error) throw error;
        return data;
    } catch(e) {
        console.error("Error loading analytics:", e);
        return null;
    }
}

export async function trackAnalyticInDB(itemId, type, value = 1) {
    if (!supabaseClient) return false;
    try {
        let currentViews = 0, currentPurchases = 0, currentRevenue = 0;
        
        const { data: existing } = await supabaseClient.from('analytics').select('*').eq('item_id', itemId).maybeSingle();
        if (existing) {
            currentViews = existing.views;
            currentPurchases = existing.purchases;
            currentRevenue = existing.revenue;
        }

        const payload = { 
            item_id: itemId, 
            views: type === 'view' ? currentViews + value : currentViews,
            purchases: type === 'purchase' ? currentPurchases + value : currentPurchases,
            revenue: type === 'revenue' ? currentRevenue + value : currentRevenue
        };

        const { error } = await supabaseClient.from('analytics').upsert([payload], { onConflict: 'item_id' });
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error tracking analytic:", e);
        return false;
    }
}

// --- Synchronization ---
export async function syncLocalStorageToDB() {
    if (!supabaseClient) return { success: false, message: "Supabase nicht initialisiert." };

    console.log("🔄 Synchronisation mit Supabase gestartet...");
    let syncCount = { orders: 0, subs: 0, reviews: 0 };
    let errors = [];

    // 1. Sync Orders
    try {
        const localOrders = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
        const toSync = localOrders.filter(o => !o.synced);
        for (const order of toSync) {
            const cleanOrder = { ...order };
            delete cleanOrder.synced;
            delete cleanOrder.date; // Supabase uses created_at
            
            // Map Local Format to DB Format
            const dbPayload = {
                order_id: cleanOrder.orderId,
                customer_name: cleanOrder.name,
                customer_email: cleanOrder.email,
                total_price: cleanOrder.totalPrice,
                status: cleanOrder.status,
                order_data: {
                    message: cleanOrder.message,
                    coupon: cleanOrder.coupon,
                    cart: cleanOrder.items
                }
            };

            const success = await saveOrderToDB(dbPayload);
            if (success) {
                order.synced = true;
                syncCount.orders++;
            }
        }
        localStorage.setItem('druckbau_orders', JSON.stringify(localOrders));
    } catch (e) { errors.push("Order sync failed: " + e.message); }

    // 2. Sync Subscribers
    try {
        const localSubs = JSON.parse(localStorage.getItem('druckbau_subscribers') || '[]');
        const toSync = localSubs.filter(s => !s.synced);
        for (const sub of toSync) {
            const result = await addSubscriberToDB(sub.email);
            if (result === true || result === 'exists') {
                sub.synced = true;
                syncCount.subs++;
            }
        }
        localStorage.setItem('druckbau_subscribers', JSON.stringify(localSubs));
    } catch (e) { errors.push("Subscriber sync failed: " + e.message); }

    // 3. Sync Reviews
    try {
        const allReviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
        for (const productId in allReviews) {
            const reviews = allReviews[productId];
            const toSync = reviews.filter(r => !r.synced);
            for (const review of toSync) {
                const success = await saveReviewToDB(productId, review.author, review.text, review.rating);
                if (success) {
                    review.synced = true;
                    syncCount.reviews++;
                }
            }
        }
        localStorage.setItem('productReviews', JSON.stringify(allReviews));
    } catch (e) { errors.push("Review sync failed: " + e.message); }

    if (syncCount.orders > 0 || syncCount.subs > 0 || syncCount.reviews > 0) {
        console.log(`✅ Synchronisation abgeschlossen: ${syncCount.orders} Bestellungen, ${syncCount.subs} Abonnenten, ${syncCount.reviews} Bewertungen.`);
    } else {
        console.log("ℹ️ Keine neuen Daten zum Synchronisieren.");
    }

    return { 
        success: errors.length === 0, 
        message: `Synced ${syncCount.orders} orders, ${syncCount.subs} subs, ${syncCount.reviews} reviews.`,
        details: syncCount,
        errors: errors
    };
}

// Helper for reviews
export async function saveReviewToDB(productId, name, text, rating) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient
            .from('reviews')
            .insert([{ 
                product_id: productId, 
                name: name, 
                text: text, 
                rating: parseInt(rating)
            }]);
        if (error) {
             console.error("❌ Supabase Fehler (Reviews):", error.message);
             return false;
        }
        return true;
    } catch (e) {
        console.error("Error saving review to DB:", e);
        return false;
    }
}
