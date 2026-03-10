document.getElementById("bookingForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const pickup_location = document.getElementById("pickup").value;
    const destination = document.getElementById("destination").value;
    const cab_type = document.getElementById("cab_type").value;
    const booking_date = document.getElementById("date").value;
    const booking_time = document.getElementById("time").value;

    try {
        const response = await fetch(`${window.API_BASE_URL}/cab-bookings/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: parseInt(user_id),
                pickup_location: pickup_location,
                destination: destination,
                cab_type: cab_type,
                booking_date: booking_date,
                booking_time: booking_time
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Store details for confirmation page
            const bookingData = {
                pickup: pickup_location,
                destination: destination,
                date: booking_date,
                time: booking_time,
                cab_type: cab_type
            };
            localStorage.setItem("last_booking", JSON.stringify(bookingData));

            alert("Cab booked successfully!");
            window.location.href = "cab_confirmation.html";
        } else {
            alert("Booking failed: " + (result.detail || "Unknown error"));
        }
    } catch (error) {
        alert("Server error. Make sure backend is running.");
        console.error(error);
    }
});
