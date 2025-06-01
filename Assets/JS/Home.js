let products = [];
let newArrivalsIndex = 0;
let saleIndex = 0;
const xmark = document.getElementById('xmark');
xmark.addEventListener("click", function () {
    document.getElementsByClassName('sign-up')[0].style.display = 'none';
});
function fetchProducts(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'Assets/Json/products.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    products = JSON.parse(xhr.responseText);
                    console.log('Products loaded:', products.length, 'items');
                    callback(products);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    displayError('error-message', 'Failed to parse product data. Check the console for details.');
                    displayError('sale-error-message', 'Failed to parse product data. Check the console for details.');
                    callback([]);
                }
            } else {
                console.error('Error fetching products:', xhr.status, xhr.statusText);
                displayError('error-message', `Failed to load products. Status: ${xhr.status}. Ensure the server is running and 'products.json' exists.`);
                displayError('sale-error-message', `Failed to load products. Status: ${xhr.status}. Ensure the server is running and 'products.json' exists.`);
                callback([]);
            }
        }
    };
    xhr.onerror = function () {
        console.error('Network error while fetching products. Are you using a local server?');
        displayError('error-message', 'Network error: Cannot load products. Please use a local server (e.g., python -m http.server 8000).');
        displayError('sale-error-message', 'Network error: Cannot load products. Please use a local server (e.g., python -m http.server 8000).');
        callback([]);
    };
    xhr.send();
}

function displayError(errorDivId, message) {
    const errorDiv = document.getElementById(errorDivId);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        console.error(`Error div (${errorDivId}) not found:`, message);
    }
}

function renderProducts(productsToRender, cardListId, currentIndex) {
    const cardList = document.getElementById(cardListId);
    if (!cardList) {
        console.error(`Card list element (${cardListId}) not found`);
        return;
    }

    if (productsToRender.length === 0) {
        console.warn(`No products to display for ${cardListId}.`);
        displayError(cardListId === 'card-list' ? 'error-message' : 'sale-error-message', 'No products available to display.');
        cardList.innerHTML = '';
        return;
    }

    if (cardList.children.length === 0) {
        cardList.innerHTML = '';
        productsToRender.forEach((product) => {
            const li = document.createElement('li');
            li.className = 'card-item';
            li.innerHTML = `
                <div class='card-link' onclick='showProductDetails(${product.ID})'>
                    <img src="${product.Image}" alt="${product.Name}" class="card-image" onerror="this.src='../Assets/Img/Default.webp';">
                    <h5 class="item-name">${product.Name}</h5>
                    <h5 class="item-price">$${product.Price ? product.Price.toFixed(2) : 'N/A'}</h5>
                    <div class="product-rating">
                        ${getStarRating(product.Ratings)}
                        <span class="rating-number">${product.Ratings}</span>
                    </div>
                </div>
            `;
            cardList.appendChild(li);
        });
    }

    const itemWidth = 315;
    cardList.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

    updateSliderButtons(productsToRender.length, cardListId, currentIndex);
}

function updateSliderButtons(totalProducts, cardListId, currentIndex) {
    const cardList = document.getElementById(cardListId);
    const prevButton = document.getElementById(cardListId === 'card-list' ? 'prev-button' : 'sale-prev-button');
    const nextButton = document.getElementById(cardListId === 'card-list' ? 'next-button' : 'sale-next-button');

    if (prevButton && nextButton && cardList) {
        prevButton.disabled = currentIndex === 0;
        const visibleItems = Math.floor(cardList.offsetWidth / 315);
        nextButton.disabled = currentIndex >= totalProducts - visibleItems;

        if (totalProducts <= visibleItems) {
            nextButton.disabled = true;
        }
    } else {
        console.error(`Slider buttons or card list (${cardListId}) not found for update.`);
    }
}

function showProductDetails(productId) {
    const product = products.find(p => p.ID === productId);
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = '../productDetails.html';
    } else {
        console.error('Product not found with ID:', productId);
    }
}

function filterSaleProducts() {
    return products.filter(product => product.UnitsInStock < 100);
}

function filterNewArrivals() {
    return products.filter(product => product.UnitsInStock > 100);
}

function initSlider() {
    const newArrivalsProducts = filterNewArrivals();
    if (newArrivalsProducts.length > 0) {
        renderProducts(newArrivalsProducts, 'card-list', newArrivalsIndex);
    } else {
        console.warn('No products loaded yet for New Arrivals slider.');
        displayError('error-message', 'Products are still loading. Please wait.');
    }

    const nextButton = document.getElementById('next-button');
    const prevButton = document.getElementById('prev-button');

    if (nextButton && prevButton) {
        nextButton.addEventListener('click', () => {
            const visibleItems = Math.floor(document.getElementById('card-list').offsetWidth / 315);
            if (newArrivalsIndex < newArrivalsProducts.length - visibleItems) {
                newArrivalsIndex += 1;
                renderProducts(newArrivalsProducts, 'card-list', newArrivalsIndex);
            }
        });

        prevButton.addEventListener('click', () => {
            if (newArrivalsIndex > 0) {
                newArrivalsIndex -= 1;
                renderProducts(newArrivalsProducts, 'card-list', newArrivalsIndex);
            }
        });
    }
}

function initSaleSlider() {
    const saleProducts = filterSaleProducts();
    if (saleProducts.length > 0) {
        renderProducts(saleProducts, 'sale-card-list', saleIndex);
    } else {
        console.warn('No sale products loaded yet for On Sale slider.');
        displayError('sale-error-message', 'No sale products available to display.');
    }

    const nextButton = document.getElementById('sale-next-button');
    const prevButton = document.getElementById('sale-prev-button');

    if (nextButton && prevButton) {
        nextButton.addEventListener('click', () => {
            const visibleItems = Math.floor(document.getElementById('sale-card-list').offsetWidth / 315);
            if (saleIndex < saleProducts.length - visibleItems) {
                saleIndex += 1;
                renderProducts(saleProducts, 'sale-card-list', saleIndex);
            }
        });

        prevButton.addEventListener('click', () => {
            if (saleIndex > 0) {
                saleIndex -= 1;
                renderProducts(saleProducts, 'sale-card-list', saleIndex);
            }
        });
    }
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

 function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
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
                    <img src=${product.Image} alt="${product.Name}" onerror="this.src='../Assets/Img/Default.webp';">
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


document.addEventListener('DOMContentLoaded', function () {
    fetchProducts(function (loadedProducts) {
        products = loadedProducts;
        initSlider();
        initSaleSlider();
        updateUserUI();
        handleSearch();
     });
});



function selectBrand(element, brandName) {
    localStorage.setItem('selectedBrand', brandName);
    window.location.href = 'Shop.html';
}