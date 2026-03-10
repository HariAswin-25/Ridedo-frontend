document.addEventListener("DOMContentLoaded", async function() {
    const carContainer = document.getElementById("carListContainer");
    const bikeContainer = document.getElementById("bikeListContainer");

    const container = carContainer || bikeContainer;
    const type = carContainer ? "car" : "bike";

    if (!container) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/vehicles/`);
        const allVehicles = await response.json();

        // Filter by type (car/bike)
        const vehicles = allVehicles.filter(v => (v.vehicle_type || "").toLowerCase() === type);

        if (vehicles.length === 0) {
            container.innerHTML = `<p>No available ${type}s at the moment.</p>`;
            return;
        }

        container.innerHTML = `
            <table class="public-table">
                <thead>
                    <tr>
                        <th>Preview</th>
                        <th>Vehicle Details</th>
                        <th>Rate</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${vehicles.map(vehicle => `
                        <tr>
                            <td><img src="${vehicle.image_url || 'https://via.placeholder.com/80x50?text=Vehicle'}" class="table-img-rect" alt="${vehicle.vehicle_name}"></td>
                            <td>
                                <strong>${vehicle.vehicle_name}</strong>
                                <br><span style="font-size: 0.8rem; color: #666;">${vehicle.fuel_type}</span>
                            </td>
                            <td>₹${vehicle.rent_per_day}/day</td>
                            <td><span class="status-available">${vehicle.availability || 'Available'}</span></td>
                            <td>
                                <button onclick="rentVehicle(${vehicle.id})" class="rent-btn-small">
                                    Rent
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error("Error fetching vehicles:", error);
        container.innerHTML = `<p>Error loading ${type}s. Make sure the backend is running.</p>`;
    }

    window.rentVehicle = function(vehicleId) {
        localStorage.setItem("selected_vehicle_id", vehicleId);
        window.location.href = 'rentvehicleform.html';
    };
});
