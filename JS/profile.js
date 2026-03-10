document.addEventListener("DOMContentLoaded", async function () {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        // If not logged in, redirect to login page
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/users/${user_id}`);
        const user = await response.json();

        if (response.ok) {
            // Populate the form fields with user data
            document.getElementById("full_name").value = user.full_name;
            document.getElementById("email").value = user.email;
            document.getElementById("phone").value = user.phone || "";
            document.getElementById("dob").value = user.dob || "";
        } else {
            alert("Could not load profile details.");
        }

        // --- Fetch and Render Activity ---
        fetchActivity(user_id);

    } catch (error) {
        console.error("Error loading profile:", error);
    }
});

async function fetchActivity(user_id) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/users/${user_id}/activity`);
        const data = await response.json();

        if (response.ok) {
            renderList("cabBookingsContainer", data.cab_bookings, ride => `
                <tr>
                    <td><strong>${ride.pickup_location}</strong> to ${ride.destination}</td>
                    <td>${new Date(ride.created_at).toLocaleDateString()}</td>
                    <td><span class="status-badge status-${ride.status.toLowerCase()}">${ride.status}</span></td>
                </tr>
            `, 3);

            renderList("vehicleRentalsContainer", data.vehicle_rentals, rental => `
                <tr>
                    <td>Vehicle #${rental.vehicle_id}</td>
                    <td>${rental.pickup_date} - ${rental.return_date}</td>
                    <td><span class="status-badge status-confirmed">${rental.status}</span></td>
                </tr>
            `, 3);

            renderList("driverBookingsContainer", data.driver_bookings, booking => `
                <tr>
                    <td>${booking.pickup_location} to ${booking.drop_location}</td>
                    <td>${booking.booking_date} (${booking.duration_hours}h)</td>
                    <td><span class="status-badge status-pending">${booking.status}</span></td>
                </tr>
            `, 3);
        }
    } catch (error) {
        console.error("Error fetching activity:", error);
    }
}

function renderList(containerId, items, templateFn, colSpan) {
    const container = document.getElementById(containerId);
    if (items.length === 0) {
        container.innerHTML = `<tr><td colspan="${colSpan}" style="text-align: center;">No recent activity.</td></tr>`;
        return;
    }
    container.innerHTML = items.map(templateFn).join('');
}

// Update Profile logic
document.getElementById("profileForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const user_id = localStorage.getItem("user_id");

    const data = {
        full_name: document.getElementById("full_name").value,
        phone: document.getElementById("phone").value,
        dob: document.getElementById("dob").value
    };

    try {
        const response = await fetch(`${window.API_BASE_URL}/users/${user_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Profile updated successfully!");
        } else {
            alert("Failed to update profile.");
        }
    } catch (error) {
        alert("Server error.");
    }
});

// Logout logic
const logoutBtn = document.querySelector(".logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        localStorage.removeItem("user_id");
        alert("Logged out successfully!");
    });
}
