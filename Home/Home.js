function fetchProducts(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../Json/products.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const products = JSON.parse(xhr.responseText);
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

function renderProducts(products, startIndex) {
    const cardList = document.getElementById('card-list');
    if (!cardList) {
        console.error('Card list element not found');
        return;
    }
    cardList.innerHTML = '';

    if (products.length === 0) {
        console.warn('No products to display.');
        displayError('No products available to display.');
        return;
    }

    products.forEach((product, index) => {
        const li = document.createElement('li');
        li.className = 'card-item';
        li.innerHTML = `
            <a href="#" class="card-link">
                <img src="../${product.Image || 'Assets/Img/Default.webp'}" alt="${product.Name}" class="card-image" onerror="this.src='../Assets/Img/Default.webp';">
                <h5 class="item-name">${product.Name}</h5>
                <h5 class="item-price">$${product.Price ? product.Price.toFixed(2) : 'N/A'}</h5>
                <div class="rating">
                    <div class="stars filled" style="width: ${(product.Ratings / 5) * 100}%">★★★★★</div>
                    <span class="rating-value"> ${product.Ratings}/5</span>
                </div>
            </a>
        `;
        cardList.appendChild(li);
    });

    cardList.style.transform = `translateX(-${startIndex * 315}px)`;

    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    if (prevButton && nextButton) {
        prevButton.disabled = startIndex === 0;
        nextButton.disabled = (startIndex + 1) * 315 >= cardList.scrollWidth - (4 * 315);
    } else {
        console.error('Slider buttons not found');
    }
}

function initSlider() {
    fetchProducts(function (products) {
        let currentIndex = 0;

        renderProducts(products, currentIndex);

        const nextButton = document.getElementById('next-button');
        const prevButton = document.getElementById('prev-button');
        if (nextButton && prevButton) {
            nextButton.addEventListener('click', () => {
                if (currentIndex * 315 < (products.length - 4) * 315) {
                    currentIndex += 1;
                    renderProducts(products, currentIndex);
                }
            });

            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex -= 1;
                    renderProducts(products, currentIndex);
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

document.addEventListener('DOMContentLoaded', function() {
    initSlider();
    updateUserUI();
});