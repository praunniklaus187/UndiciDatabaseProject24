document.addEventListener('DOMContentLoaded', async () => {
    const addEmployeeForm = document.getElementById('add-employee-form');
    const addBranchForm = document.getElementById('add-branch-form');
    const addMenuItemForm = document.getElementById('add-menu-item-form');
    const ingredientsContainer = document.getElementById('ingredients-container');
    const addIngredientButton = document.getElementById('add-ingredient-button');
    const giveSalaryForm = document.getElementById('give-promotion-form');
    const filterTopProductsBtn = document.getElementById('filter-top-products-btn');
    const topProductsCountInput = document.getElementById('top-products-count');

    const branchIdInput = document.getElementById('branch-id');

    // Event Listener for Filter Button
    filterTopProductsBtn.addEventListener('click', async () => {
        const count = parseInt(topProductsCountInput.value, 10);
        const branchId = branchIdInput.value.trim();

        if (!count || count < 1) {
            alert('Please enter a valid number greater than 0.');
            return;
        }

        await loadTopOrderedProducts(count, branchId);

    // Function to Load Top Ordered Products
    async function loadTopOrderedProducts(count, branchId) {
        try {
            const url = `/api/admin/top-ordered-products?count=${count}&branch_id=${branchId}`;
            const response = await fetch(url);
            const data = await response.json();

            const tableBody = document.querySelector('#topOrderedProductsTable tbody');
            tableBody.innerHTML = ''; // Clear existing rows

            data.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
          <td>${product.PRODUCT_ID}</td>
          <td>${product.NAME}</td>
          <td>${product.TOTAL_QUANTITY}</td>
        `;
                tableBody.appendChild(row);
            });
        } catch (err) {
            console.error('Error loading top ordered products:', err);
        }
    }
});
    // Fetch Ingredients for Menu Item
    async function fetchIngredients() {
        const response = await fetch('/api/admin/get-ingredients');
        const ingredients = await response.json();
        return ingredients.data;
    }

    // Add Ingredient Row for Menu Item
    function addIngredientRow(ingredients) {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <select name="ingredient_id" required>
                <option value="">-- Select Ingredient --</option>
                ${ingredients
            .map(
                (ingredient) =>
                    `<option value="${ingredient.INGREDIENT_ID}">${ingredient.NAME}</option>`
            )
            .join('')}
            </select>
            <input type="number" name="quantity_required" placeholder="Quantity" step="0.01" required>
            <button type="button" class="remove-ingredient-button">Remove</button>
        `;
        ingredientsContainer.appendChild(row);

        // Remove Ingredient Row
        row.querySelector('.remove-ingredient-button').addEventListener('click', () => {
            row.remove();
        });
    }

    // Submit Add Employee Form
    addEmployeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addEmployeeForm);
        const employeeData = Object.fromEntries(formData.entries());

        const response = await fetch('/api/admin/add-employee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData),
        });

        const result = await response.text();
        alert(result);
        if (response.ok) addEmployeeForm.reset();
    });

    // Submit Add Branch Form
    addBranchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addBranchForm);
        const branchData = Object.fromEntries(formData.entries());

        const response = await fetch('/api/admin/add-branch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(branchData),
        });

        const result = await response.text();
        alert(result);
        if (response.ok) addBranchForm.reset();
    });

    // Submit Add Menu Item Form
    addMenuItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(addMenuItemForm);
        const menuItemData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            ingredients: [],
        };

        // Collect ingredients
        const ingredientRows = ingredientsContainer.querySelectorAll('.ingredient-row');
        ingredientRows.forEach((row) => {
            const ingredientId = row.querySelector('select[name="ingredient_id"]').value;
            const quantity = parseFloat(row.querySelector('input[name="quantity_required"]').value);

            if (ingredientId && !isNaN(quantity)) {
                menuItemData.ingredients.push({
                    ingredient_id: ingredientId,
                    quantity_required: quantity,
                });
            }
        });

        if (menuItemData.ingredients.length === 0) {
            alert('Please add at least one ingredient.');
            return;
        }

        const response = await fetch('/api/admin/add-menu-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(menuItemData),
        });

        const result = await response.text();
        alert(result);
        if (response.ok) {
            addMenuItemForm.reset();
            ingredientsContainer.innerHTML = ''; // Clear ingredient rows
        }
    });

    // Submit Give Salary Form
    giveSalaryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(giveSalaryForm);
        const salaryData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/admin/give-promotion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salaryData),
            });

            const result = await response.json();
            alert(result.message || 'Promotion applied successfully!');
            if (response.ok) giveSalaryForm.reset();
        } catch (error) {
            console.error('Error applying promotion:', error);
            alert('Failed to disburse salary. Please try again.');
        }
    });

    // Add Initial Ingredient Row
    const ingredients = await fetchIngredients();
    addIngredientRow(ingredients);

    // Add More Ingredient Rows
    addIngredientButton.addEventListener('click', () => {
        addIngredientRow(ingredients);
    });
});
