document.getElementById("rentalForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const pickup_location = document.getElementById("pickup").value;
    const phone_number = document.getElementById("phone").value;
    const driving_license_number = document.getElementById("license").value;
    const pickup_date = document.getElementById("pickup_date").value;
    const pickup_time = document.getElementById("pickup_time").value;
    const return_date = document.getElementById("return_date").value;
    const return_time = document.getElementById("return_time").value;

    try {
        const response = await fetch(`${window.API_BASE_URL}/rentals/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: parseInt(user_id),
                pickup_location: pickup_location,
                phone_number: phone_number,
                driving_license_number: driving_license_number,
                pickup_date: pickup_date,
                pickup_time: pickup_time,
                return_date: return_date,
                return_time: return_time,
                vehicle_id: parseInt(localStorage.getItem("selected_vehicle_id") || 0)
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Store details for confirmation page
            const rentalData = {
                pickup: pickup_location,
                phone: phone_number
            };
            localStorage.setItem("last_rental", JSON.stringify(rentalData));

            alert("Vehicle rented successfully!");
            window.location.href = "rent_confirmation.html";
        } else {
            alert("Rental failed: " + (result.detail || "Unknown error"));
        }
    } catch (error) {
        alert("Server error. Make sure backend is running.");
        console.error(error);
    }
});
