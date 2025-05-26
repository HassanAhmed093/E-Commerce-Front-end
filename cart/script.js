// Select DOM elements
const cartItemsContainer = document.getElementById('cartItems');
const subtotalDisplay = document.getElementById('subtotal');
const discountDisplay = document.getElementById('discount');
const totalDisplay = document.getElementById('total');

// Array to store cart items (with quantities)
let cartItems = [];

// Function to fetch JSON data and initialize the cart
function loadCartItems() {
    // Fetch data from the local products.json file
    fetch('../Json/products.json') // Relative path from cart folder
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok ' + response.status);
            return response.json(); // Parse JSON
        })
        .then(products => {
            // Simulate cart with selected products (e.g., IDs 3, 12, 10)
            const selectedProductIds = [3, 12, 10]; // Slim Fit Jeans, Plaid Flannel Shirt, Classic White T-Shirt
            cartItems = selectedProductIds.map(id => {
                const product = products.find(p => p.ID === id);
                return product ? { ...product, quantity: 1 } : null;
            }).filter(item => item !== null); // Filter out null if product not found

            // Check if cartItems is populated
            if (cartItems.length === 0) {
                cartItemsContainer.innerHTML = '<p>No items in cart.</p>';
                return;
            }

            // Display cart items
            displayCartItems();
            // Update total
            updateTotal();
        
       })};


// Function to display cart items in the DOM
function displayCartItems() {
    // Clear current items
    cartItemsContainer.innerHTML = '';

    // Loop through cart items and create HTML for each
    cartItems.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <img src="https://via.placeholder.com/80x80?text=${item.Name.replace('#', '')}" alt="${item.Name}">
            <div class="item-details">
                <h3>${item.Name}</h3>
                <p>${item.Details}</p>
                <p class="price">$${item.Price.toFixed(2)}</p>
            </div>
            <div class="quantity-control">
                <button class="decrease">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="increase">+</button>
            </div>
            <button class="remove-item"><i class="fas fa-trash"></i></button>
        `;

        // Add event listeners for quantity controls and remove button
        cartItem.querySelector('.decrease').addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity--;
                cartItem.querySelector('.quantity').textContent = item.quantity;
                updateTotal();
            }
        });

        cartItem.querySelector('.increase').addEventListener('click', () => {
            item.quantity++;
            cartItem.querySelector('.quantity').textContent = item.quantity;
            updateTotal();
        });

        cartItem.querySelector('.remove-item').addEventListener('click', () => {
            cartItems.splice(index, 1); // Remove item from array
            displayCartItems(); // Re-render items
            updateTotal();
        });

        cartItemsContainer.appendChild(cartItem);
    });
}

// Function to update cart total
function updateTotal() {
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.Price * item.quantity;
    });
    const discount = subtotal * 0.1; // 10% discount
    const deliveryFee = 15; // $15 delivery fee
    const total = subtotal - discount + deliveryFee;

    // Update DOM with formatted values
    subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
    discountDisplay.textContent = `-$${discount.toFixed(2)}`;
    totalDisplay.textContent = `$${total.toFixed(2)}`;
}

// Load cart items when the page loads
document.addEventListener('DOMContentLoaded', loadCartItems);