document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById("adminVehicleBody");
    const vehicleForm = document.getElementById("adminVehicleForm");
    const modal = document.getElementById("vehicleModal");
    const modalTitle = document.getElementById("modalTitle");
    const editIdInput = document.getElementById("editVehicleId");

    async function fetchAll() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/vehicles/all`);
            const vehicles = await response.json();

            tableBody.innerHTML = vehicles.map(v => `
                <tr>
                    <td><img src="${v.image_url || 'https://via.placeholder.com/40'}" style="width: 40px; height: 40px; border-radius: 5px; object-fit: cover;"></td>
                    <td>${v.vehicle_name}</td>
                    <td>${v.vehicle_type}</td>
                    <td>${v.vehicle_number}</td>
                    <td>₹${v.rent_per_day}</td>
                    <td>${v.availability}</td>
                    <td>
                        <button class="btn-action btn-edit" onclick="editVehicle(${JSON.stringify(v).replace(/"/g, '&quot;')})">Edit</button>
                        <button class="btn-action btn-delete" onclick="deleteVehicle(${v.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        }
    }

    vehicleForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const id = editIdInput.value;
        const data = {
            vehicle_name: document.getElementById("admin_v_name").value,
            vehicle_number: document.getElementById("admin_v_number").value,
            vehicle_type: document.getElementById("admin_v_type").value,
            fuel_type: document.getElementById("admin_v_fuel").value,
            rent_per_day: parseInt(document.getElementById("admin_v_rent").value),
            image_url: document.getElementById("admin_v_image").value || null,
            owner_id: 0 // Admin/System
        };

        const url = id 
            ? `${window.API_BASE_URL}/vehicles/${id}` 
            : `${window.API_BASE_URL}/vehicles/create`;
        const method = id ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Success!");
                closeModal();
                fetchAll();
            }
        } catch (error) {
            console.error("Error saving vehicle:", error);
        }
    });

    window.openAddModal = function() {
        modalTitle.innerText = "Add Vehicle";
        editIdInput.value = "";
        vehicleForm.reset();
        modal.style.display = "flex";
    };

    window.editVehicle = function(v) {
        modalTitle.innerText = "Edit Vehicle";
        editIdInput.value = v.id;
        document.getElementById("admin_v_name").value = v.vehicle_name;
        document.getElementById("admin_v_number").value = v.vehicle_number;
        document.getElementById("admin_v_type").value = v.vehicle_type;
        document.getElementById("admin_v_fuel").value = v.fuel_type;
        document.getElementById("admin_v_rent").value = v.rent_per_day;
        document.getElementById("admin_v_image").value = v.image_url || "";
        modal.style.display = "flex";
    };

    window.closeModal = function() {
        modal.style.display = "none";
    };

    window.deleteVehicle = async function(id) {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`${window.API_BASE_URL}/vehicles/${id}`, { method: "DELETE" });
            fetchAll();
        } catch (error) {
            console.error("Error deleting vehicle:", error);
        }
    };

    fetchAll();
});
