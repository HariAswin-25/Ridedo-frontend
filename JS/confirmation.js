document.addEventListener("DOMContentLoaded", function () {
    // 1. Check for Cab Booking Details
    const lastBooking = localStorage.getItem("last_booking");
    if (lastBooking && document.getElementById("confirm_pickup")) {
        const data = JSON.parse(lastBooking);
        document.getElementById("confirm_pickup").textContent = data.pickup;
        document.getElementById("confirm_dest").textContent = data.destination;
        document.getElementById("confirm_date").textContent = data.date;
        document.getElementById("confirm_time").textContent = data.time;
        document.getElementById("confirm_cab").textContent = data.cab_type;
    }

    // 2. Check for Driver Hiring Details
    const lastHiring = localStorage.getItem("last_hiring");
    if (lastHiring && document.getElementById("hire_pickup")) {
        const data = JSON.parse(lastHiring);
        document.getElementById("hire_pickup").textContent = data.pickup;
        document.getElementById("hire_date").textContent = data.date + " at " + data.time;
        document.getElementById("hire_duration").textContent = data.duration + " hours";
    }

    // 3. Check for Rental Details
    const lastRental = localStorage.getItem("last_rental");
    if (lastRental && document.getElementById("rent_pickup")) {
        const data = JSON.parse(lastRental);
        document.getElementById("rent_pickup").textContent = data.pickup;
    }
});
