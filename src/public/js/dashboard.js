// Ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard JS loaded');

    // Handle "Complete Order" buttons
    const completeOrderButtons = document.querySelectorAll('.complete-order-btn');
    completeOrderButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent form submission
            const orderId = event.target.dataset.orderId; // Get the order ID from the button's data attribute

            try {
                const response = await fetch('/employee/handle-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId }),
                });

                if (response.ok) {
                    alert('Order completed successfully!');
                    // Reload the page to refresh the orders list
                    location.reload();
                } else {
                    const errorMessage = await response.text();
                    alert(`Failed to complete order: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error completing order:', error);
                alert('An error occurred while completing the order.');
            }
        });
    });

    // Example: Fetch storage data dynamically (if needed)
    const storageButton = document.getElementById('storage-button');
    if (storageButton) {
        storageButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/employee/storage');
                if (response.ok) {
                    const storageData = await response.json();
                    console.log('Storage data:', storageData);
                    // Update the DOM to display storage data (implement your UI logic)
                } else {
                    alert('Failed to fetch storage data.');
                }
            } catch (error) {
                console.error('Error fetching storage data:', error);
            }
        });
    }
});
