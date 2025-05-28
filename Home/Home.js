 
    
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

    cardList.style.transform = `translateX(-${startIndex * 315}px)`; // 295px width + 20px margin

    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    if (prevButton && nextButton) {
        prevButton.disabled = startIndex === 0;
        nextButton.disabled = (startIndex + 1) * 315 >= cardList.scrollWidth - (4 * 315);
    } else {
        console.error('Slider buttons not found');
    }

    console.log(`Rendered products, showing from index ${startIndex} (transform: -${startIndex * 315}px)`);
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
        } else {
            console.error('Buttons not found for event listeners');
        }
    });
}

document.addEventListener('DOMContentLoaded', initSlider);