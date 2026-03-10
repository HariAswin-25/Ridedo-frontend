document.addEventListener("DOMContentLoaded", async function() {
    const container = document.getElementById("driverListContainer");

    try {
        const response = await fetch(`${window.API_BASE_URL}/drivers/`);
        const drivers = await response.json();

        if (drivers.length === 0) {
            container.innerHTML = `<p>No drivers found.</p>`;
            return;
        }

        container.innerHTML = `
            <table class="public-table">
                <thead>
                    <tr>
                        <th>Photo</th>
                        <th>Name</th>
                        <th>Experience</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${drivers.map(driver => `
                        <tr>
                            <td><img src="${driver.image_url || 'https://via.placeholder.com/60?text=Driver'}" class="table-img" alt="${driver.full_name}"></td>
                            <td><strong>${driver.full_name}</strong></td>
                            <td>${driver.experience_years || 0}+ Years</td>
                            <td><span class="status-available">Available</span></td>
                            <td><button onclick="hireDriver(${driver.id})" class="hire-btn-small">Hire</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error("Error fetching drivers:", error);
        container.innerHTML = "<p>Error loading drivers. Make sure the backend is running.</p>";
    }

    window.hireDriver = function(driverId) {
        localStorage.setItem("selected_driver_id", driverId);
        window.location.href = 'hire_driver_form.html';
    };
});
