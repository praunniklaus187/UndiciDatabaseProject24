document.addEventListener('DOMContentLoaded', () => {
    const storageTableBody = document.getElementById('storage-table-body');
    const noDataMessage = document.getElementById('no-data-message');
    const branchFilterForm = document.getElementById('branch-filter-form');
    const branchFilter = document.getElementById('branch-filter');
    const navigateHomeButton = document.getElementById('navigate-home');

    // Load branches for filtering
    async function loadBranches() {
        try {
            const response = await fetch('/api/employee/storage/branches');
            if (!response.ok) throw new Error('Failed to fetch branches.');

            const { data } = await response.json();
            data.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.BRANCH_ID;
                option.textContent = `Branch ${branch.BRANCH_ID}`;
                branchFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading branches:', error);
        }
    }

    // Fetch and render storage data
    async function fetchStorageData(branchId = '') {
        try {
            const response = await fetch(`/api/employee/storage${branchId ? `?branch=${branchId}` : ''}`);
            if (!response.ok) throw new Error('Failed to fetch storage data.');

            const { data } = await response.json();
            storageTableBody.innerHTML = ''; // Clear the table

            if (!data || data.length === 0) {
                storageTableBody.style.display = 'none';
                noDataMessage.style.display = 'block';
                return;
            }

            noDataMessage.style.display = 'none';
            storageTableBody.style.display = 'table-row-group';

            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
          <td>${item.BRANCH_ID}</td>
          <td>${item.INGREDIENT_ID}</td>
          <td>${item.INGREDIENT_NAME}</td>
          <td>${parseFloat(item.QUANTITY).toFixed(2)}</td>
          <td>${parseFloat(item.COST).toFixed(2)}</td>
        `;
                storageTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching storage data:', error);
            noDataMessage.textContent = 'Error loading storage data. Please try again later.';
            noDataMessage.style.display = 'block';
        }
    }

    // Handle branch filter form submission
    branchFilterForm.addEventListener('submit', event => {
        event.preventDefault();
        const branchId = branchFilter.value;
        fetchStorageData(branchId);
    });

    // Navigate back to home page
    navigateHomeButton.addEventListener('click', () => {
        window.location.href = '/employee/home';
    });

    // Initialize
    loadBranches();
    fetchStorageData();
});
