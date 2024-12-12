document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        console.log("Form submission intercepted!");

        const employeeId = document.getElementById('employee_id').value.trim();
        const password = document.getElementById('password').value.trim();
        console.log("Employee ID:", employeeId);
        console.log("Password:", password);

        if (!employeeId || !password) {
            alert('Please fill in both Employee ID and Password.');
            return;
        }

        try {
            // Send the login data to the server
            const response = await fetch('/employee/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId, password: password }),
            });

            console.log("Response:", response);

            if (response.redirected) {
                // If the server issues a redirect, follow it
                console.log("Redirecting to:", response.url);
                window.location.href = response.url;
            } else if (response.ok) {
                // Handle non-redirect successful responses (if any)
                console.log("Response OK:", await response.text());
            } else if (response.status === 401) {
                alert('Invalid Employee ID or Password.');
            } else {
                alert('An error occurred. Please try again later.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred while connecting to the server.');
        }
    });
});

// Home button navigation logic
function navigateToHome() {
    window.location.href = '/';
}
