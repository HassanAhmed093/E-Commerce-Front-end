document.addEventListener('DOMContentLoaded', () => {
    const productData = JSON.parse(localStorage.getItem('selectedProduct'));
    if (productData) {
        displayProductDetails(productData);
    } else {
        window.location.href = 'Shop.html';
    }
});
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
  
function displayProductDetails(product) {
    document.getElementById('mainImage').src = product.Image;
    document.getElementById('productName').textContent = product.Name;
    document.getElementById('productDetails').textContent = product.Details;
    document.getElementById('ratingNumber').textContent = product.Ratings.toFixed(1);
    document.getElementById('productRating').innerHTML = getStarRating(product.Ratings);
    
    const priceDisplay = document.getElementById('priceDisplay');
    if (product.UnitsInStock < 100) {
        priceDisplay.innerHTML = `
            <span class="current-price">$${product.Price.toFixed(2)}</span>
        `;
    } else {
        priceDisplay.innerHTML = `<span class="current-price">$${product.Price.toFixed(2)}</span>`;
    }
    
    document.getElementById('stockInfo').textContent = 
        `${product.UnitsInStock} units in stock`;
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    return stars;
}

function updateQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let newValue = parseInt(quantityInput.value) + change;
    if (newValue < 1) newValue = 1;
    quantityInput.value = newValue;
}

function addToCartFromDetails() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        showToast('Please log in to add items to your cart.');
        window.location.href = 'LoginandRegister.html';
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').value);
    const product = JSON.parse(localStorage.getItem('selectedProduct'));
    
    if (quantity <= 0) {
        showToast('Please select a valid quantity.');
        return;
    }

    if (quantity > product.UnitsInStock) {
        showToast(`Cannot add ${quantity} items; only ${product.UnitsInStock} units in stock.`);
        return;
    }

    let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
    if (!userCarts[loggedInUser]) {
        userCarts[loggedInUser] = [];
    }

    const existingItem = userCarts[loggedInUser].find(item => item.ID === product.ID);
    if (existingItem) {
        if (existingItem.quantity + quantity <= product.UnitsInStock) {
            existingItem.quantity += quantity;
        } else {
            showToast('Cannot add more items; stock limit reached.');
            return;
        }
    } else {
        userCarts[loggedInUser].push({ ...product, quantity });
    }

    localStorage.setItem('userCarts', JSON.stringify(userCarts));

    const button = document.querySelector('.add-to-cart');
    button.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        button.style.background = '#000';
    }, 2000);
}