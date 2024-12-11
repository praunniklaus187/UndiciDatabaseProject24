// Fetch and populate products dynamically
fetch('/products')
    .then(response => response.json())
    .then(products => {
        const productList = document.getElementById('productList');
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.innerHTML = `
        <input type="checkbox" id="product_${product.PRODUCT_ID}" name="products" value="${product.PRODUCT_ID}">
        <label for="product_${product.PRODUCT_ID}">
          <strong>${product.NAME}</strong> - $${product.PRICE}<br>
          <small>${product.DESCRIPTION}</small>
        </label>
        <label>
          Quantity:
          <input type="number" name="quantity_${product.PRODUCT_ID}" min="1" value="1" disabled>
        </label>
      `;
            productList.appendChild(productDiv);

            // Enable quantity input only if checkbox is checked
            const checkbox = productDiv.querySelector(`input[type="checkbox"]`);
            const quantityInput = productDiv.querySelector(`input[type="number"]`);
            checkbox.addEventListener('change', () => {
                quantityInput.disabled = !checkbox.checked;
            });
        });
    })
    .catch(error => {
        console.error('Error fetching products:', error);
        alert('Failed to load product list. Please try again later.');
    });

// Handle form submission
document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const customer_id = formData.get('customer_id');
    const branch_id = formData.get('branch_id');
    const products = [];

    formData.getAll('products').forEach(product_id => {
        const quantity = formData.get(`quantity_${product_id}`) || 1;
        products.push({ product_id: parseInt(product_id), quantity: parseInt(quantity) });
    });

    if (products.length === 0) {
        alert('Please select at least one product.');
        return;
    }

    // Send order data to the server
    fetch('/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id, branch_id, products }),
    })
        .then(response => response.text())
        .then(message => {
            alert(message);
            window.location.href = '/';
        })
        .catch(error => {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        });
});
