document.getElementById("hiringForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const pickup_location = document.getElementById("pickup").value;
    const drop_location = document.getElementById("destination").value;
    const booking_date = document.getElementById("date").value;
    const booking_time = document.getElementById("time").value;
    const duration_hours = document.getElementById("duration").value;
    const contact_number = document.getElementById("phone").value;

    try {
        const response = await fetch(`${window.API_BASE_URL}/driver-bookings/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: parseInt(user_id),
                driver_id: parseInt(localStorage.getItem("selected_driver_id") || 0),
                pickup_location: pickup_location,
                drop_location: drop_location,
                booking_date: booking_date,
                booking_time: booking_time,
                duration_hours: parseInt(duration_hours),
                contact_number: contact_number
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Store details for confirmation page
            const hiringData = {
                pickup: pickup_location,
                destination: drop_location,
                date: booking_date,
                time: booking_time,
                duration: duration_hours
            };
            localStorage.setItem("last_hiring", JSON.stringify(hiringData));

            alert("Driver hired successfully!");
            window.location.href = "hire_driver.html";
        } else {
            alert("Hiring failed: " + (result.detail || "Unknown error"));
        }
    } catch (error) {
        alert("Server error. Make sure backend is running.");
        console.error(error);
    }
});
