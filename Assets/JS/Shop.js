let products = [];
let filteredProducts = [];

function setLoadingState(loading) {
    const overlay = document.getElementById('loading-overlay');
    if (loading) {
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

function fetchProducts() {
    setLoadingState(true);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'Assets/Json/products.json', true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            products = JSON.parse(xhr.responseText);
            filteredProducts = [...products];
            
            const selectedBrand = localStorage.getItem('selectedBrand');
            if (selectedBrand) {
                const brandCheckbox = document.querySelector(`.brands-list input[value="${selectedBrand}"]`);
                if (brandCheckbox) {
                    brandCheckbox.checked = true;
                    applyFilters();
                
                }
                localStorage.removeItem('selectedBrand');
            }
            
            displayProducts();
            setupEventListeners();
            setLoadingState(false);
        }
    };
    
    xhr.onerror = function() {
        console.error('Error loading products:', xhr.statusText);
        setLoadingState(false);
    };
    
    xhr.send();
}

function displayProducts() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    filteredProducts.forEach((product, index) => {
        const productCard = `
            <div class="product-card"  style="animation-delay: ${index * 0.1}s">
                <div class="product-image">
                    <img onclick="showProductDetails(${product.ID})" src=${product.Image} alt="${product.Name}"
                         onload="this.style.opacity='1'"
                         style="opacity: 0; transition: opacity 0.5s;">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.Name}</h3>
                    <p class="product-details">${product.Details}</p>
                    <div class="product-rating">
                        ${getStarRating(product.Ratings)}
                        <span class="rating-number">${product.Ratings}</span>
                    </div>
                    <div class="price-section">
                        <p class="product-price">
                            ${product.UnitsInStock < 100 ? 
                                `<span class="original-price">$${(product.Price * 1.2).toFixed(2)}</span>` : 
                                ''
                            }
                            <span class="current-price">$${product.Price.toFixed(2)}</span>
                        </p>
                        ${product.UnitsInStock < 100 ? '<span class="sale-badge">Sale</span>' : ''}
                    </div>
                    <button class="add-to-cart" onclick="addToCart(${product.ID})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}

function showProductDetails(productId) {
    const product = products.find(p => p.ID === productId);
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'productDetails.html';
    }
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

function setupEventListeners() {
    document.querySelectorAll('.categories-list input').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    document.getElementById('priceRange').addEventListener('input', applyFilters);
    document.getElementById('minPrice').addEventListener('input', applyFilters);
    document.getElementById('maxPrice').addEventListener('input', applyFilters);

    document.querySelectorAll('.ratings-filter input').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    document.querySelectorAll('.brands-list input').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
}

// Update the applyFilters function
function applyFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('.categories-list input:checked'))
        .map(checkbox => checkbox.value);
    
    const selectedBrands = Array.from(document.querySelectorAll('.brands-list input:checked'))
        .map(checkbox => checkbox.value);

    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;

    const selectedRating = document.querySelector('.ratings-filter input:checked')?.value || 0;

    filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategories.length === 0 || 
            selectedCategories.includes(product.Categories);
        const matchesBrand = selectedBrands.length === 0 || 
            selectedBrands.includes(product.Brand);
        const matchesPrice = product.Price >= minPrice && product.Price <= maxPrice;
        const matchesRating = product.Ratings >= selectedRating;

        return matchesCategory && matchesBrand && matchesPrice && matchesRating;
    });

    const sortMethod = document.getElementById('sortSelect').value;
    switch(sortMethod) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.Price - b.Price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.Price - a.Price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.Ratings - a.Ratings);
            break;
    }

    displayProducts();
}

function addToCart(productId) {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        alert('Please log in to add items to your cart.');
        window.location.href = 'LoginandRegister.html';
        return;
    }

    const product = products.find(p => p.ID === productId);
    if (!product) return;

    // Get the user's cart from localStorage
    let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
    if (!userCarts[loggedInUser]) {
        userCarts[loggedInUser] = [];
    }

    // Check if product is already in cart
    const existingItem = userCarts[loggedInUser].find(item => item.ID === productId);
    if (existingItem) {
        // Validate stock
        if (existingItem.quantity + 1 <= product.UnitsInStock) {
            existingItem.quantity += 1;
        } else {
            alert('Cannot add more items; stock limit reached.');
            return;
        }
    } else {
        // Add new item with quantity 1
        if (product.UnitsInStock > 0) {
            userCarts[loggedInUser].push({ ...product, quantity: 1 });
        } else {
            alert('This product is out of stock.');
            return;
        }
    }

    // Save updated cart to localStorage
    localStorage.setItem('userCarts', JSON.stringify(userCarts));

    // Update cart count immediately
    updateCartCount();

    // Visual feedback on button
    const button = event.currentTarget;
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.background = '#4CAF50';
    button.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        button.style.background = '#000';
        button.style.transform = 'scale(1)';
    }, 2000);
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

function updateUserUI() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const signupMessage = document.getElementById('signup-message');
    const userIconLink = document.getElementById('user-icon');

    if (loggedInUser) {
        signupMessage.innerHTML = `Welcome back, ${loggedInUser}! <a href="#" id="logout-link">Logout</a>`;
        userIconLink.href = "#";
        userIconLink.onclick = (e) => {
            e.preventDefault();
            alert(`You are already logged in as ${loggedInUser}`);
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
        signupMessage.innerHTML = 'Sign up and get 20% off your first order. <a href="../LoginandRegister.html?form=register">Sign Up Now</a>';
        userIconLink.href = "../LoginandRegister.html";
        userIconLink.onclick = null;
    }
    updateCartCount();
}
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) {
        console.error('Search input or results container not found');
        return;
    }

    searchInput.addEventListener('input', debounce(function () {
        const query = searchInput.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (query.length === 0) {
            searchResults.classList.remove('show');
            return;
        }

        const filteredProducts = products.filter(product =>
            product.Name.toLowerCase().includes(query) ||
            product.Brand.toLowerCase().includes(query)
        );

        if (filteredProducts.length > 0) {
            filteredProducts.forEach(product => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.innerHTML = `
                    <img src="../${product.Image || 'Assets/Img/Default.webp'}" alt="${product.Name}" onerror="this.src='../Assets/Img/Default.webp';">
                    <div class="result-details">
                        <h5 class="item-name">${product.Name}</h5>
                        <h5 class="item-price">$${product.Price ? product.Price.toFixed(2) : 'N/A'}</h5>
                        <div class="product-rating">
                            ${getStarRating(product.Ratings)}
                            <span class="rating-number">${product.Ratings}</span>
                        </div>
                    </div>
                `;
                resultItem.addEventListener('click', () => {
                    showProductDetails(product.ID);
                    searchResults.innerHTML = '';
                    searchResults.classList.remove('show');
                    searchInput.value = '';
                });
                searchResults.appendChild(resultItem);
            });
            searchResults.classList.add('show');
        } else {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No products found';
            searchResults.appendChild(noResults);
            searchResults.classList.add('show');
        }
    }, 300));

    document.addEventListener('click', function (event) {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('show');
        }
    });
}

handleSearch();

fetchProducts();

updateUserUI();