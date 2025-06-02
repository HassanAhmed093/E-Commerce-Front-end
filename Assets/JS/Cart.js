const cartItemsContainer = document.getElementById('cartItems');
const subtotalDisplay = document.getElementById('subtotal');
const discountDisplay = document.getElementById('discount');
const totalDisplay = document.getElementById('total');
const xmark = document.getElementById('xmark');
const checkoutBtn = document.getElementById('checkout-btn');
let cartItems = [];


function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
  
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userCarts = JSON.parse(localStorage.getItem('userCarts') || '{}');
    const userCartItems = userCarts[loggedInUser] || [];

    let totalItems = 0;
    for (const item of userCartItems) {
        totalItems += item.quantity;
    }

    cartCount.textContent = totalItems;
}

xmark.addEventListener("click", function () {
    document.getElementsByClassName('sign-up')[0].style.display = 'none';
});
checkoutBtn.addEventListener("click",createOrder);
function loadCartItems() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        cartItemsContainer.innerHTML = 'Please log in to view your cart';
        updateCartCount();
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', './Assets/Json/products.json', true);
    xhr.send();
    xhr.onreadystatechange = function () {
        console.log('XMLHttpRequest state:', xhr.readyState, 'Status:', xhr.status);
        if (xhr.readyState === 4 && xhr.status === 200) {
            const products = JSON.parse(xhr.responseText);
            const userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
            cartItems = userCarts[loggedInUser] || [];
            cartItems = cartItems.map(item => {
                const product = products.find(p => p.ID === item.ID);
                return product ? { ...product, quantity: item.quantity } : null;
            }).filter(item => item !== null);

            if (cartItems.length === 0) {
                cartItemsContainer.innerHTML = 'No items in cart';
            } else {
                displayCartItems();
            }
            updateTotal();
            updateCartCount();
        }
    };
}

function displayCartItems() {
    cartItemsContainer.innerHTML = '';

    cartItems.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <img src="${item.Image}" alt="${item.Name}">
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

        cartItem.querySelector('.decrease').addEventListener('click', function () {
            if (item.quantity > 1) {
                item.quantity--;
                updateUserCart();
                cartItem.querySelector('.quantity').textContent = item.quantity;
                updateTotal();
                updateCartCount();
            }
        });

        cartItem.querySelector('.increase').addEventListener('click', function () {
            if (item.quantity + 1 <= item.UnitsInStock) {
                item.quantity++;
                updateUserCart();
                cartItem.querySelector('.quantity').textContent = item.quantity;
                updateTotal();
                updateCartCount();
            } else {
                showToast("Cannot add more items; stock limit reached.");
            }
        });

        cartItem.querySelector('.remove-item').addEventListener('click', function () {
            cartItems.splice(index, 1);
            updateUserCart();
            displayCartItems();
            updateTotal();
            updateCartCount();
        });

        cartItemsContainer.appendChild(cartItem);
    });
}

function updateUserCart() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        userCarts[loggedInUser] = cartItems;
        localStorage.setItem('userCarts', JSON.stringify(userCarts));
        console.log('Updated user cart in localStorage:', userCarts);
    }
}

function updateTotal() {
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.Price * item.quantity;
    });
    const discount = subtotal * 0.1;
    const deliveryFee = 15;
    const total = subtotal - discount + deliveryFee;

    subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
    discountDisplay.textContent = `-$${discount.toFixed(2)}`;
    totalDisplay.textContent = `$${total.toFixed(2)}`;
}

function createOrder() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser || cartItems.length === 0) {
        showToast('No items to checkout or user not logged in.');
        return;
    }

    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.Price * item.quantity;
    });
    const discount = subtotal * 0.1;
    const deliveryFee = 15;
    const total = subtotal - discount + deliveryFee;

    let userOrders = JSON.parse(localStorage.getItem('userOrders')) || {};
    const userOrderCount = (userOrders[loggedInUser] || []).length;
    const orderId = userOrderCount + 1;

    const order = {
        orderId: orderId,
        user: loggedInUser,
        items: cartItems.map(item => ({
            ID: item.ID,
            Name: item.Name,
            quantity: item.quantity,
            Price: item.Price
        })),
        total: total
    };

    if (!userOrders[loggedInUser]) {
        userOrders[loggedInUser] = [];
    }
    userOrders[loggedInUser].push(order);
    localStorage.setItem('userOrders', JSON.stringify(userOrders));

    
    const orderPanel = document.getElementById('order-panel');
    const orderIdElement = document.getElementById('order-id');
    const orderTotalElement = document.getElementById('order-total');
    const orderSubtotalElement = document.getElementById('order-subtotal'); 
    const orderDiscountElement = document.getElementById('order-discount'); 
    const orderItemsContainer = document.getElementById('order-items');

    orderIdElement.textContent = orderId;
    orderTotalElement.textContent = `$${total.toFixed(2)}`;
    orderSubtotalElement.textContent = `$${subtotal.toFixed(2)}`; 
    orderDiscountElement.textContent = `-$${discount.toFixed(2)}`; 

    orderItemsContainer.innerHTML = '';
    order.items.forEach((item, index) => {
        const cartItem = cartItems.find(cartItem => cartItem.ID === item.ID);
        const itemElement = document.createElement('div');
        itemElement.classList.add('order-item');
        itemElement.innerHTML = `
            <div class="order-item-content">
                <img src="${cartItem.Image } ">
                <div class="order-item-details">
                    <p><strong>Product:</strong> ${item.Name}</p>
                    <p><strong>Quantity:</strong> ${item.quantity}</p>
                    <p><strong>Price:</strong> $${(item.Price * item.quantity).toFixed(2)}</p>
                </div>
            </div> `;
        orderItemsContainer.appendChild(itemElement);
    });

    
    orderPanel.classList.add('active');

 
    let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
    userCarts[loggedInUser] = [];
    localStorage.setItem('userCarts', JSON.stringify(userCarts));
    cartItems = [];
    displayCartItems();
    updateTotal();
    updateCartCount();
    cartItemsContainer.innerHTML = 'Order placed successfully! Your cart is now empty.';

    
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        orderPanel.classList.remove('active');
    });
}
function updateUserUI() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const signupMessage = document.getElementById('signup-message');
    const userIconLink = document.getElementById('user-icon');

    if (loggedInUser) {
        signupMessage.innerHTML = `Welcome back, ${loggedInUser}! <a href="#" id="logout-link">Logout</a>`;
        userIconLink.href = "#";
        userIconLink.onclick = (e) => {
            e.preventDefault();
            showtoast(`You are already logged in as ${loggedInUser}`);
        };

        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                updateUserUI();
                window.location.reload();
            };
        }
    } else {
        signupMessage.innerHTML = 
        'Sign up and get 20% off your first order. <a href="../LoginandRegister.html?form=register">Sign Up Now</a>';
        userIconLink.href = "../LoginandRegister.html";
        userIconLink.onclick = null;
    }
    updateCartCount();
}

document.addEventListener('DOMContentLoaded', function () {
    loadCartItems();
    updateUserUI();
});