// Ensure renderCart() is called when navigating to the cart section
function showSection(section) {
    // Other section handling code...
    if (section === 'cart') {
        renderCart(); // Call renderCart to display cart items
    }
    // More code...
}

// Ensure cart items are rendered from localStorage
function renderCart() {
    // Fetch cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-container');

    // Clear current display
    cartContainer.innerHTML = '';

    // Render each item
    cartItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.textContent = `${item.name} - Quantity: ${item.quantity}`;
        cartContainer.appendChild(itemElement);
    });
}