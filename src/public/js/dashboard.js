document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard JS loaded');

    const completeOrderButtons = document.querySelectorAll('.complete-order-btn');
    completeOrderButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const orderId = event.target.dataset.orderId;

            try {
                const response = await fetch('/employee/handle-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId }),
                });

                if (response.ok) {
                    alert('Order completed successfully!');
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

    const storageButton = document.getElementById('storage-button');
    if (storageButton) {
        storageButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/employee/storage');
                if (response.ok) {
                    const storageData = await response.json();
                    console.log('Storage data:', storageData);
                } else {
                    alert('Failed to fetch storage data.');
                }
            } catch (error) {
                console.error('Error fetching storage data:', error);
            }
        });
    }
});
