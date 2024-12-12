document.addEventListener('DOMContentLoaded', async () => {
    const storageContainer = document.getElementById('storage-container');
    const filterForm = document.getElementById('filter-form');
    const branchSelect = document.getElementById('branch');

    // Load branches for filter dropdown
    async function loadBranches() {
        try {
            const response = await fetch('/api/admin/storage/branches');
            if (!response.ok) throw new Error('Failed to fetch branches');
            const { data } = await response.json();

            if (data && data.length > 0) {
                branchSelect.innerHTML = '<option value="">All Branches</option>'; // Default option
                data.forEach(branch => {
                    const option = document.createElement('option');
                    option.value = branch.BRANCH_ID;
                    option.textContent = `Branch ${branch.BRANCH_ID}`;
                    branchSelect.appendChild(option);
                });
            } else {
                console.warn('No branches available.');
            }
        } catch (error) {
            console.error('Error loading branches:', error);
            alert('Failed to load branch data.');
        }
    }

    // Load storage data
    async function loadStorage(branchId = null) {
        const url = branchId ? `/api/admin/storage/filter?branch=${branchId}` : '/api/admin/storage/filter';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch storage data');
            const { data } = await response.json();

            if (data.length > 0) {
                storageContainer.innerHTML = data.map(item => `
                    <tr>
                        <td>${item.INGREDIENT_ID}</td>
                        <td>${item.INGREDIENT_NAME}</td>
                        <td>${item.QUANTITY}</td>
                        <td>${item.COST}</td>
                        <td>
                            <input 
                                type="number" 
                                placeholder="Adjust quantity" 
                                data-branch-id="${item.BRANCH_ID}" 
                                data-ingredient-id="${item.INGREDIENT_ID}" 
                                class="adjust-quantity"
                            />
                            <button 
                                class="update-button" 
                                data-branch-id="${item.BRANCH_ID}" 
                                data-ingredient-id="${item.INGREDIENT_ID}">
                                Update
                            </button>
                        </td>
                    </tr>
                `).join('');
                attachUpdateEventListeners();
            } else {
                storageContainer.innerHTML = '<tr><td colspan="5">No storage data available.</td></tr>';
            }
        } catch (error) {
            console.error('Error loading storage data:', error);
            alert('Failed to load storage data. Please try again.');
        }
    }

    // Attach event listeners to update buttons
    function attachUpdateEventListeners() {
        const updateButtons = document.querySelectorAll('.update-button');
        updateButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const branchId = button.dataset.branchId;
                console.log('branchId:', branchId); // Debugging log for branchId

                const ingredientId = button.dataset.ingredientId;
                console.log('ingredientId:', ingredientId); // Debugging log for ingredientId

                const quantityInput = document.querySelector(`input[data-branch-id="${branchId}"][data-ingredient-id="${ingredientId}"]`);
                console.log('quantityInput element:', quantityInput); // Debugging log for the input element

                const adjustment = parseFloat(quantityInput.value);
                console.log('adjustment:', adjustment); // Debugging log for adjustment value


                if (isNaN(adjustment)) {
                    alert('Please enter a valid number for quantity adjustment.');
                    return;
                }

                try {
                    const response = await fetch('/api/admin/storage/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            adjustment,
                            branch_id: branchId,
                            ingredient_id: ingredientId
                        })
                    });

                    condole.log(response);

                    alert('Storage updated successfully!');
                    loadStorage(branchSelect.value); // Reload the storage data after update
                } catch (error) {
                    loadStorage(branchSelect.value);
                }
            });
        });
    }


    // Handle filter form submission
    filterForm.addEventListener('submit', e => {
        e.preventDefault();
        const branchId = branchSelect.value;
        loadStorage(branchId);
    });

    // Initial load
    await loadBranches();
    await loadStorage();
});
