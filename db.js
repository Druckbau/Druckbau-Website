// js/db.js
import { showNotification } from './utils.js';

// --- Supabase Setup ---
// NOTE: Replace these with your actual Supabase URL and anonymous key
const SUPABASE_URL = 'https://ezwmsguucjzqovypmggk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6d21zZ3V1Y2p6cW92eXBtZ2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzg5MDEsImV4cCI6MjA5MDk1NDkwMX0.H4quCJTA75tZhWwJDkCrvM2Y7_aPhf2YLmvSDCZdgeU';

let supabaseClient = null;

// Only initialize if Supabase library is loaded
export function initDB() {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase Client initialized");
    } else {
        console.warn("Supabase library not found. Running in local-only mode.");
    }
}

// --- Orders ---
export async function saveOrderToDB(orderData) {
    if (!supabaseClient) return false;

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([orderData]);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error saving order to DB:", e);
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
            // Check for unique constraint violation (already subscribed)
            if (error.code === '23505') {
                return 'exists';
            }
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
        if (error) throw error;
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
        // Since we allow inserts/updates, we need to try selecting first or using an RPC/upsert
        // Supabase upsert works well if item_id is unique
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
// --- Synchronization ---
export async function syncLocalStorageToDB() {
    if (!supabaseClient) return { success: false, message: "Supabase not initialized." };

    let syncCount = { orders: 0, subs: 0, reviews: 0 };
    let errors = [];

    // 1. Sync Orders
    try {
        const localOrders = JSON.parse(localStorage.getItem('druckbau_orders') || '[]');
        const toSync = localOrders.filter(o => !o.synced);
        for (const order of toSync) {
            // Remove the temporary 'synced' flag before sending to DB if it exists
            const cleanOrder = { ...order };
            delete cleanOrder.synced;
            
            const success = await saveOrderToDB(cleanOrder);
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
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('druckbau_reviews_')) {
                const productId = key.replace('druckbau_reviews_', '');
                const reviews = JSON.parse(localStorage.getItem(key) || '[]');
                const toSync = reviews.filter(r => !r.synced);
                
                for (const review of toSync) {
                    const success = await saveReviewToDB(productId, review.name, review.text, review.rating);
                    if (success) {
                        review.synced = true;
                        syncCount.reviews++;
                    }
                }
                localStorage.setItem(key, JSON.stringify(reviews));
            }
        }
    } catch (e) { errors.push("Review sync failed: " + e.message); }

    return { 
        success: errors.length === 0, 
        message: `Synced ${syncCount.orders} orders, ${syncCount.subs} subs, ${syncCount.reviews} reviews.`,
        details: syncCount,
        errors: errors
    };
}

// Helper for reviews (if not already defined)
export async function saveReviewToDB(productId, name, text, rating) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient
            .from('reviews')
            .insert([{ 
                product_id: productId, 
                name: name, 
                text: text, 
                rating: parseInt(rating),
                created_at: new Date().toISOString()
            }]);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error saving review to DB:", e);
        return false;
    }
}
