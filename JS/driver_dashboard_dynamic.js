document.addEventListener("DOMContentLoaded", function() {
    const driver_id = localStorage.getItem("driver_id");
    if (!driver_id) {
        alert("Please login as a driver!");
        window.location.href = "login.html";
        return;
    }

    const container = document.getElementById("driverRidesContainer");

    async function fetchRequests() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/driver-bookings/unassigned`);
            const requests = await response.json();

            if (requests.length === 0) {
                container.innerHTML = "<p>No available requests.</p>";
                return;
            }

            const tableBody = document.getElementById("ridesTableBody");
            tableBody.innerHTML = requests.map(req => `
                <tr>
                    <td><strong>${req.pickup_location}</strong> ➔ ${req.drop_location}</td>
                    <td>${req.booking_date} | ${req.booking_time}</td>
                    <td>${req.duration_hours} hrs</td>
                    <td>
                        <button class="btn-mini" style="background: #4f46e5; color: #fff;" onclick="acceptRequest(${req.id})">Accept</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    }

    window.acceptRequest = async function(id) {
        if (!confirm("Accept this driver request?")) return;
        try {
            const response = await fetch(`${window.API_BASE_URL}/driver-bookings/${id}/accept?driver_id=${driver_id}`, {
                method: "PUT"
            });

            if (response.ok) {
                alert("Request accepted!");
                fetchRequests();
            }
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    fetchRequests();
});
