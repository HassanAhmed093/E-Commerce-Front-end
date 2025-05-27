// Select DOM elements
const cartItemsContainer = document.getElementById('cartItems');
const subtotalDisplay = document.getElementById('subtotal');
const discountDisplay = document.getElementById('discount');
const totalDisplay = document.getElementById('total');

// Array to store cart items (with quantities)
let cartItems = [];

// Function to load cart items for the logged-in user
function loadCartItems() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        cartItemsContainer.innerHTML = '<p>Please log in to view your cart.</p>';
        return;
    }

    // Fetch data from the local products.json file
    fetch('../Json/products.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok ' + response.status);
            return response.json();
        })
        .then(products => {
            // Get the user's cart from localStorage
            const userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
            cartItems = userCarts[loggedInUser] || [];

            // Validate cart items against products.json
            cartItems = cartItems.map(item => {
                const product = products.find(p => p.ID === item.ID);
                return product ? { ...product, quantity: item.quantity } : null;
            }).filter(item => item !== null);

            if (cartItems.length === 0) {
                cartItemsContainer.innerHTML = '<p>No items in cart.</p>';
                return;
            }

            // Display cart items
            displayCartItems();
            // Update total
            updateTotal();
        })
        .catch(error => {
            console.error('Error loading cart:', error);
            cartItemsContainer.innerHTML = '<p>Error loading cart. Please try again.</p>';
        });
}

// Function to display cart items in the DOM
function displayCartItems() {
    cartItemsContainer.innerHTML = '';

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
                updateUserCart();
                cartItem.querySelector('.quantity').textContent = item.quantity;
                updateTotal();
            }
        });

        cartItem.querySelector('.increase').addEventListener('click', () => {
            // Validate stock
            if (item.quantity + 1 <= item.UnitsInStock) {
                item.quantity++;
                updateUserCart();
                cartItem.querySelector('.quantity').textContent = item.quantity;
                updateTotal();
            } else {
                alert('Cannot add more items; stock limit reached.');
            }
        });

        cartItem.querySelector('.remove-item').addEventListener('click', () => {
            cartItems.splice(index, 1);
            updateUserCart();
            displayCartItems();
            updateTotal();
        });

        cartItemsContainer.appendChild(cartItem);
    });
}

// Function to update the user's cart in localStorage
function updateUserCart() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        userCarts[loggedInUser] = cartItems;
        localStorage.setItem('userCarts', JSON.stringify(userCarts));
    }
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

    subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
    discountDisplay.textContent = `-$${discount.toFixed(2)}`;
    totalDisplay.textContent = `$${total.toFixed(2)}`;
}

// Load cart items when the page loads
document.addEventListener('DOMContentLoaded', loadCartItems);