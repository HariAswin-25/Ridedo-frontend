document.addEventListener("DOMContentLoaded", async function() {
    const driver_id = localStorage.getItem("driver_id");
    if (!driver_id) {
        alert("Please login as a driver first!");
        window.location.href = "driver_login.html";
        return;
    }

    const ridesContainer = document.getElementById("availableRidesContainer");

    async function fetchRides() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/cab-bookings/unassigned`);
            const rides = await response.json();

            if (rides.length === 0) {
                ridesContainer.innerHTML = "<p>No available rides at the moment.</p>";
                return;
            }

            ridesContainer.innerHTML = rides.map(ride => `
                <div class="ride-card" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 8px;">
                    <p><strong>From:</strong> ${ride.pickup_location}</p>
                    <p><strong>To:</strong> ${ride.destination}</p>
                    <p><strong>Date:</strong> ${ride.booking_date} | <strong>Time:</strong> ${ride.booking_time}</p>
                    <p><strong>Type:</strong> ${ride.cab_type}</p>
                    <button class="accept-btn" onclick="acceptRide(${ride.id})" style="background-color: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Accept Ride</button>
                </div>
            `).join('');

        } catch (error) {
            console.error("Error fetching rides:", error);
            ridesContainer.innerHTML = "<p>Error loading rides. Is the backend running?</p>";
        }
    }

    window.acceptRide = async function(rideId) {
        if (!confirm("Are you sure you want to accept this ride?")) return;

        try {
            const response = await fetch(`${window.API_BASE_URL}/cab-bookings/${rideId}/accept?driver_id=${driver_id}`, {
                method: "PUT"
            });

            if (response.ok) {
                alert("Ride accepted successfully!");
                fetchRides();
            } else {
                const result = await response.json();
                alert("Failed to accept ride: " + (result.detail || "Unknown error"));
            }
        } catch (error) {
            console.error("Error accepting ride:", error);
            alert("Server error while accepting ride.");
        }
    };

    fetchRides();
});
