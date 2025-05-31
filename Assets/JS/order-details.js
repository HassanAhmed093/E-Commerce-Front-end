const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');
const total = parseFloat(urlParams.get('total'));
const items = JSON.parse(urlParams.get('items')); 


document.getElementById('order-id').textContent = orderId;
document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;


let subtotal = 0;
items.forEach(item => {
    subtotal += item.Price * item.quantity;
});
const discount = subtotal * 0.1; 
const deliveryFee = 15; 


document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;


const orderItemsContainer = document.getElementById('order-items');
orderItemsContainer.innerHTML = ''; 
items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('order-item');
    itemElement.innerHTML = `
        <p><strong>Product:</strong> ${item.Name}</p>
        <p><strong>Quantity:</strong> ${item.quantity}</p>
        <p><strong>Price:</strong> $${(item.Price * item.quantity).toFixed(2)}</p>
        <hr/>
    `;
    orderItemsContainer.appendChild(itemElement);
});