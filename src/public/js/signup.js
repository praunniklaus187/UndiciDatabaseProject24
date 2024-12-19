function navigateToHome() {
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const responseMessage = document.getElementById('response-message');

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        responseMessage.innerHTML = '';

        // Gather form data
        const formData = {
            name: document.getElementById('name').value,
            street_name: document.getElementById('street_name').value,
            house_number: document.getElementById('house_number').value,
            postal_code: document.getElementById('postal_code').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value,
        };

        try {
            // POST the data to the backend
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to sign up');
            }

            const data = await response.json();
            responseMessage.innerHTML = `<p>Signup successful! Your Customer ID is ${data.customer_id}.</p>`;
        } catch (error) {
            console.error('Error during signup:', error);
            responseMessage.innerHTML = `<p style="color: red;">An error occurred: ${error.message}</p>`;
        }
    });
});
