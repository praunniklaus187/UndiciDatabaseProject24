document.addEventListener('DOMContentLoaded', async () => {
    const storageContainer = document.getElementById('storage-container');
    const filterForm = document.getElementById('filter-form');
    const branchSelect = document.getElementById('branch');

    // Load branches for filter dropdown
    async function loadBranches() {
        try {
            const response = await fetch('/api/admin/storage/branches');
            const { data } = await response.json();
            if (data && data.length > 0) {
                data.forEach(branch => {
                    const option = document.createElement('option');
                    option.value = branch.BRANCH_ID;
                    option.textContent = `Branch ${branch.BRANCH_ID}`;
                    branchSelect.appendChild(option);
                });
            } else {
                console.error('No branches available to display.');
            }
        } catch (error) {
            console.error('Error loading branches:', error);
        }
    }

    // Load storage data
    // Load storage data
    async function loadStorage(branchId = null) {
        const url = branchId ? `/api/admin/storage/filter?branch=${branchId}` : `/api/admin/storage/filter`;

        console.log('Loading storage for branch:', branchId || 'All branches'); // Debugging log

        try {
            const response = await fetch(url);
            const { data } = await response.json();

            console.log('Received storage data:', data); // Debugging log for API response

            storageContainer.innerHTML = data.map(item => `
            <tr>
                <td>${item.INGREDIENT_ID}</td>
                <td>${item.INGREDIENT_NAME}</td>
                <td>${item.QUANTITY}</td>
                <td>${item.COST}</td>
                <td>
                    <button onclick="updateQuantity(${item.BRANCH_ID}, ${item.INGREDIENT_ID})">Update</button>
                </td>
            </tr>
        `).join('');
        } catch (err) {
            console.error('Error loading storage data:', err); // Debugging log for errors
            alert('Failed to load storage data. Please try again.');
        }
    }



    filterForm.addEventListener('submit', e => {
        e.preventDefault();
        const branchId = branchSelect.value;
        loadStorage(branchId);
    });

    loadBranches();
    loadStorage();
});
