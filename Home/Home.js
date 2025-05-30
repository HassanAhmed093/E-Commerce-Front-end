 
let products = [];
let currentIndex = 0; // Initialize currentIndex globally or manage it within initSlider scope

function fetchProducts(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../Json/products.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    products = JSON.parse(xhr.responseText);
                    console.log('Products loaded:', products.length, 'items');
                    callback(products);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    displayError('Failed to parse product data. Check the console for details.');
                    callback([]);
                }
            } else {
                console.error('Error fetching products:', xhr.status, xhr.statusText);
                displayError(`Failed to load products. Status: ${xhr.status}. Ensure the server is running and 'products.json' exists.`);
                callback([]);
            }
        }
    };
    xhr.onerror = function () {
        console.error('Network error while fetching products. Are you using a local server?');
        displayError('Network error: Cannot load products. Please use a local server (e.g., python -m http.server 8000).');
        callback([]);
    };
    xhr.send();
}

function displayError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        console.error('Error div not found:', message);
    }
}

function renderProducts(productsToRender) { // Renamed parameter for clarity
    const cardList = document.getElementById('card-list');
    if (!cardList) {
        console.error('Card list element not found');
        return;
    }

    // Only update innerHTML if products are different or list is empty initially
    if (cardList.children.length === 0 || productsToRender !== products) {
        cardList.innerHTML = ''; // Clear existing cards before rendering new ones
        if (productsToRender.length === 0) {
            console.warn('No products to display.');
            displayError('No products available to display.');
            return;
        }

        productsToRender.forEach((product) => {
            const li = document.createElement('li');
            li.className = 'card-item';
            li.innerHTML = `
                <div class='card-link' onclick='showProductDetails(${product.ID})'>
                    <img src="../${product.Image || 'Assets/Img/Default.webp'}" alt="${product.Name}" class="card-image" onerror="this.src='../Assets/Img/Default.webp';">
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

    // Apply the transform based on the current index
    const itemWidth = 315; // Width of a card-item + its right margin (295px + 20px)
    cardList.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

    updateSliderButtons(productsToRender.length);
}

function updateSliderButtons(totalProducts) {
    const cardList = document.getElementById('card-list');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    if (prevButton && nextButton && cardList) {
        prevButton.disabled = currentIndex === 0;

        // Calculate max index based on how many items are visible at once
        // Assuming 4 items are visible, adjust '4' if your layout changes
        const visibleItems = Math.floor(cardList.offsetWidth / 315);
        nextButton.disabled = currentIndex >= (totalProducts - visibleItems);

        // Fallback for when there are fewer than 4 items, disable next button
        if (totalProducts <= visibleItems) {
            nextButton.disabled = true;
        }
    } else {
        console.error('Slider buttons or card list not found for update.');
    }
}


function showProductDetails(productId) {
    const product = products.find(p => p.ID === productId);
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = '../Shop/productDetails.html';
    } else {
        console.error('Product not found with ID:', productId);
    }
}

function initSlider() {
    fetchProducts(function (fetchedProducts) {
        products = fetchedProducts; // Store fetched products globally
        if (products.length > 0) {
            renderProducts(products); // Initial render
        }

        const nextButton = document.getElementById('next-button');
        const prevButton = document.getElementById('prev-button');

        if (nextButton && prevButton) {
            nextButton.addEventListener('click', () => {
                const visibleItems = Math.floor(document.getElementById('card-list').offsetWidth / 315);
                if (currentIndex < (products.length - visibleItems)) {
                    currentIndex += 1;
                    renderProducts(products);
                }
            });

            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex -= 1;
                    renderProducts(products);
                }
            });
        }
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
        signupMessage.innerHTML = 'Sign up and get 20% off your first order. <a href="../Login and Register/LoginandRegister.html?form=register">Sign Up Now</a>';
        userIconLink.href = "../Login and Register/LoginandRegister.html";
        userIconLink.onclick = null;
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
document.addEventListener('DOMContentLoaded', function() {
    initSlider();
    updateUserUI();
});
