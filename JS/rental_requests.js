document.addEventListener("DOMContentLoaded", async function() {
    const owner_id = localStorage.getItem("user_id");
    if (!owner_id) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const carsContainer = document.getElementById("carsContainer");
    const bikesContainer = document.getElementById("bikesContainer");
    const cabContainer = document.getElementById("cabContainer");

    async function fetchAllBookingRequests() {
        console.log("Fetching all booking requests for owner:", owner_id);
        try {
            // 1. Fetch Owner's Vehicles (get all, even booked ones)
            console.log("Step 1: Fetching all vehicles...");
            const vRes = await fetch(`${window.API_BASE_URL}/vehicles/all`);
            if(!vRes.ok) throw new Error("Could not fetch vehicles (Status: " + vRes.status + ")");
            const allVehicles = await vRes.json();
            console.log("Fetched vehicles count:", allVehicles.length);
            const myVehicles = allVehicles.filter(v => v.owner_id == owner_id);
            const vMap = {};
            myVehicles.forEach(v => {
                vMap[v.id] = { name: v.vehicle_name, type: v.vehicle_type, img: v.image_url };
            });

            // 2. Fetch All Rentals for this owner
            console.log("Step 2: Fetching rentals for owner...");
            const rRes = await fetch(`${window.API_BASE_URL}/rentals/owner/${owner_id}`);
            if(!rRes.ok) throw new Error("Could not fetch rentals (Status: " + rRes.status + ")");
            const requests = await rRes.json();
            console.log("Fetched rentals count:", requests.length);

            // 3. (Filtering happens here as before)
            const carReqs = requests.filter(r => vMap[r.vehicle_id]?.type === 'car');
            const bikeReqs = requests.filter(r => vMap[r.vehicle_id]?.type === 'bike');

            // 4. Fetch Driver Hiring Bookings
            console.log("Step 4: Fetching driver bookings...");
            const dRes = await fetch(`${window.API_BASE_URL}/driver-bookings/`);
            if(!dRes.ok) throw new Error("Could not fetch driver bookings (Status: " + dRes.status + ")");
            const driverRequests = await dRes.json();
            console.log("Fetched driver bookings count:", driverRequests.length);

            // 5. Fetch Cab Bookings
            console.log("Step 5: Fetching cab bookings...");
            const cRes = await fetch(`${window.API_BASE_URL}/cab-bookings/`);
            if(!cRes.ok) throw new Error("Could not fetch cab bookings (Status: " + cRes.status + ")");
            const cabRequests = await cRes.json();
            console.log("Fetched cab bookings count:", cabRequests.length);

            // Render Containers
            renderVehicleRequests(carReqs, carsContainer, vMap, 'Car');
            renderVehicleRequests(bikeReqs, bikesContainer, vMap, 'Bike');
            
            // Combine Driver hires and Cab bookings in the "Cab" tab
            renderCombinedDriverRequests(driverRequests, cabRequests, cabContainer);

        } catch (error) {
            console.error("Error fetching requests:", error);
            const errorMsg = "<p style='text-align: center; color: #ef4444;'>Failed to load requests.</p>";
            carsContainer.innerHTML = errorMsg;
            bikesContainer.innerHTML = errorMsg;
            cabContainer.innerHTML = errorMsg;
        }
    }

    function renderVehicleRequests(items, container, vMap, typeLabel) {
        if (items.length === 0) {
            container.innerHTML = `<tr><td colspan="6" style='text-align: center; color: #94a3b8;'>No ${typeLabel} requests found.</td></tr>`;
            return;
        }

        container.innerHTML = items.map(req => {
            const vData = vMap[req.vehicle_id] || { name: `Vehicle #${req.vehicle_id}` };
            const imgUrl = vData.img || 'https://via.placeholder.com/50x35?text=Ride';
            const status = (req.status || 'pending').toLowerCase();
            
            let actionButtons = "";
            if (status === 'pending') {
                actionButtons = `
                    <button onclick="updateRentalStatus(${req.id}, 'accepted')" class="btn-acc">Accept</button>
                    <button onclick="updateRentalStatus(${req.id}, 'rejected')" class="btn-rej">Reject</button>
                `;
            } else if (status === 'accepted' || status === 'confirmed') {
                actionButtons = `
                    <button onclick="updateRentalStatus(${req.id}, 'completed')" class="btn-acc" style="background-color: #3b82f6;">Complete</button>
                `;
            } else {
                actionButtons = `<span style="color: #94a3b8; font-size: 0.75rem;">${req.status}</span>`;
            }

            return `
            <tr>
                <td><img src="${imgUrl}" class="request-thumb" alt="v"></td>
                <td>
                    <strong>${vData.name}</strong>
                    <br><span style="font-size: 0.75rem; color: #64748b;">ID: #${req.id}</span>
                </td>
                <td>
                    ${req.pickup_location}
                    <br><span style="font-size: 0.8rem; color: #64748b;">${req.pickup_date}</span>
                </td>
                <td>${req.phone_number}</td>
                <td><span class="status-tag tag-${status}">${req.status || 'pending'}</span></td>
                <td>
                    <div class="req-actions">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    }

    function renderCombinedDriverRequests(driverHires, cabBookings, container) {
        if (driverHires.length === 0 && cabBookings.length === 0) {
            container.innerHTML = "<tr><td colspan='5' style='text-align: center; color: #94a3b8;'>No driver or cab requests found.</td></tr>";
            return;
        }

        let html = "";

        // Render Cab Bookings first
        html += cabBookings.map(req => {
            const status = (req.status || 'pending').toLowerCase();
            let actionButtons = "";
            if (status === 'pending') {
                actionButtons = `
                    <button onclick="updateCabStatus(${req.id}, 'accepted')" class="btn-acc">Accept</button>
                    <button onclick="updateCabStatus(${req.id}, 'rejected')" class="btn-rej">Reject</button>
                `;
            } else if (status === 'accepted' || status === 'confirmed') {
                actionButtons = `
                    <button onclick="updateCabStatus(${req.id}, 'completed')" class="btn-acc" style="background-color: #3b82f6;">Complete</button>
                `;
            } else {
                actionButtons = `<button onclick="deleteCabBooking(${req.id})" class="btn-rej">Remove</button>`;
            }

            return `
            <tr>
                <td><strong>Cab Service</strong></td>
                <td>
                    <strong>${req.cab_type}</strong>
                    <br><span style="font-size: 0.8rem; color: #64748b;">${req.pickup_location} ➔ ${req.destination}</span>
                    <br><span style="font-size: 0.75rem; color: #94a3b8;">${req.booking_date} @ ${req.booking_time}</span>
                </td>
                <td>-</td>
                <td><span class="status-tag tag-${status}">${req.status || 'pending'}</span></td>
                <td>
                    <div class="req-actions">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `; }).join('');

        // Render Driver Hires
        html += driverHires.map(req => {
            const status = (req.status || 'pending').toLowerCase();
            let actionButtons = "";
            if (status === 'pending') {
                actionButtons = `
                    <button onclick="updateDriverStatus(${req.id}, 'accepted')" class="btn-acc">Accept</button>
                    <button onclick="updateDriverStatus(${req.id}, 'rejected')" class="btn-rej">Reject</button>
                `;
            } else if (status === 'accepted' || status === 'confirmed') {
                actionButtons = `
                    <button onclick="updateDriverStatus(${req.id}, 'completed')" class="btn-acc" style="background-color: #3b82f6;">Complete</button>
                `;
            } else {
                actionButtons = `<button onclick="deleteDriverBooking(${req.id})" class="btn-rej">Remove</button>`;
            }

            return `
            <tr>
                <td><strong>Driver Hire</strong></td>
                <td>
                    <strong>Manual Hire</strong>
                    <br><span style="font-size: 0.8rem; color: #64748b;">Pickup: ${req.pickup_location}</span>
                    <br><span style="font-size: 0.75rem; color: #94a3b8;">${req.duration_hours} hrs</span>
                </td>
                <td>${req.contact_number}</td>
                <td><span class="status-tag tag-${status}">${req.status || 'pending'}</span></td>
                <td>
                    <div class="req-actions">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `; }).join('');

        container.innerHTML = html;
    }

    // UPDATERS
    window.updateRentalStatus = async function(id, status) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/rentals/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: status })
            });
            if (response.ok) {
                alert(`Rental ${status}!`);
                fetchAllBookingRequests();
            }
        } catch (error) { console.error(error); }
    };

    window.updateDriverStatus = async function(id, status) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/driver-bookings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: status })
            });
            if (response.ok) {
                alert(`Driver booking ${status}!`);
                fetchAllBookingRequests();
            }
        } catch (error) { console.error(error); }
    };

    window.updateCabStatus = async function(id, status) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/cab-bookings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: status })
            });
            if (response.ok) {
                alert(`Cab booking ${status}!`);
                fetchAllBookingRequests();
            }
        } catch (error) { console.error(error); }
    };

    window.deleteDriverBooking = async function(id) {
        if (!confirm("Are you sure you want to remove this driver request?")) return;
        try {
            const response = await fetch(`${window.API_BASE_URL}/driver-bookings/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                alert("Request removed.");
                fetchAllBookingRequests();
            }
        } catch (error) { console.error(error); }
    };

    window.deleteCabBooking = async function(id) {
        if (!confirm("Are you sure you want to remove this cab booking?")) return;
        try {
            const response = await fetch(`${window.API_BASE_URL}/cab-bookings/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                alert("Cab booking removed.");
                fetchAllBookingRequests();
            }
        } catch (error) { console.error(error); }
    };

    fetchAllBookingRequests();
});
