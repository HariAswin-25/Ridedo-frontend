document.addEventListener("DOMContentLoaded", async function() {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    if (!window.API_BASE_URL) {
        console.error("API_BASE_URL is not defined! Check if api.js is loaded correctly.");
        alert("Configuration Error: API_BASE_URL missing.");
    }

    // --- Tab Switching Logic ---
    const tabVehicles = document.getElementById("tabVehicles");
    const tabDrivers = document.getElementById("tabDrivers");
    const sectionVehicles = document.getElementById("sectionVehicles");
    const sectionDrivers = document.getElementById("sectionDrivers");

    tabVehicles.addEventListener("click", () => {
        sectionVehicles.style.display = "block";
        sectionDrivers.style.display = "none";
        tabVehicles.style.background = "#4f46e5";
        tabVehicles.style.color = "#fff";
        tabDrivers.style.background = "#e2e8f0";
        tabDrivers.style.color = "#64748b";
    });

    tabDrivers.addEventListener("click", () => {
        sectionVehicles.style.display = "none";
        sectionDrivers.style.display = "block";
        tabDrivers.style.background = "#4f46e5";
        tabDrivers.style.color = "#fff";
        tabVehicles.style.background = "#e2e8f0";
        tabVehicles.style.color = "#64748b";
        fetchMyDrivers();
    });

    // --- Vehicle Management ---
    const vehicleForm = document.getElementById("vehicleListingForm");
    const vContainer = document.getElementById("myVehiclesContainer");
    const vFormHeading = document.getElementById("formHeading");
    const vEditIdInput = document.getElementById("edit_vehicle_id");

    let allMyVehicles = [];

    const vTableBody = document.getElementById("vehicleTableBody");

    async function fetchMyVehicles() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/vehicles/`);
            const allVehicles = await response.json();
            allMyVehicles = allVehicles.filter(v => v.owner_id == user_id);
            vTableBody.innerHTML = allMyVehicles.length === 0 ? "<tr><td colspan='4' style='text-align:center;'>No vehicles yet.</td></tr>" : 
                allMyVehicles.map(v => renderTableRow(v, 'vehicle')).join('');
        } catch (error) { console.error(error); }
    }

    // --- Driver Management ---
    const driverForm = document.getElementById("driverListingForm");
    const dContainer = document.getElementById("myDriversContainer");
    const dFormHeading = document.getElementById("driverFormHeading");
    const dEditIdInput = document.getElementById("edit_driver_id");

    let allMyDrivers = [];

    const dTableBody = document.getElementById("driverTableBody");

    async function fetchMyDrivers() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/drivers/owner/${user_id}`);
            allMyDrivers = await response.json();
            dTableBody.innerHTML = allMyDrivers.length === 0 ? "<tr><td colspan='4' style='text-align:center;'>No drivers registered yet.</td></tr>" : 
                allMyDrivers.map(d => renderTableRow(d, 'driver')).join('');
        } catch (error) { console.error(error); }
    }

    function renderTableRow(item, type) {
        const isVehicle = type === 'vehicle';
        const title = isVehicle ? item.vehicle_name : item.full_name;
        const sub1 = isVehicle ? `Num: ${item.vehicle_number}` : `Lic: ${item.license_no}`;
        const sub2 = isVehicle ? `Rent: ₹${item.rent_per_day}` : `Exp: ${item.experience_years}y`;
        const badge = isVehicle ? item.vehicle_type : item.driver_type;
        const editFn = isVehicle ? `startEditVehicle(${item.id})` : `startEditDriver(${item.id})`;
        const delFn = isVehicle ? `deleteVehicle(${item.id})` : `deleteDriver(${item.id})`;
        
        // Use placeholder if no image
        const fallbackImg = isVehicle ? 
            (item.vehicle_type === 'bike' ? '../assets/rental_bike_img.png' : '../assets/self_rentalcar_img.png') : 
            '../assets/hire_driver_img.png';
        const imgUrl = item.image_url || fallbackImg;

        return `
            <tr>
                <td><img src="${imgUrl}" class="thumbnail" alt="photo"></td>
                <td>
                    <strong>${title}</strong> <span style="font-size: 0.7rem; background: #eee; padding: 1px 4px; border-radius: 3px;">${badge}</span>
                    <br><span style="color: #64748b; font-size: 0.8rem;">${sub1} | ${sub2}</span>
                </td>
                <td><span style="color: #10b981; font-weight: 600;">${isVehicle ? item.availability : item.status}</span></td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button onclick="${editFn}" class="btn-mini" style="background: #4f46e5; color: #fff;">Edit</button>
                        <button onclick="${delFn}" class="btn-mini" style="background: #ef4444; color: #fff;">Del</button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Vehicle Submits
    vehicleForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = vEditIdInput.value;
        
        const formData = new FormData();
        formData.append("vehicle_name", document.getElementById("vehicle_name").value);
        formData.append("vehicle_number", document.getElementById("vehicle_number").value);
        formData.append("vehicle_type", document.getElementById("vehicle_type").value);
        formData.append("fuel_type", document.getElementById("fuel_type").value);
        const rentPerDay = parseInt(document.getElementById("rent_per_day").value);
        formData.append("rent_per_day", isNaN(rentPerDay) ? 0 : rentPerDay);
        formData.append("owner_id", parseInt(user_id) || 0);

        const imageFile = document.getElementById("vehicle_file").files[0];
        if (imageFile) {
            formData.append("image_file", imageFile);
        }

        const url = id ? `${window.API_BASE_URL}/vehicles/${id}` : `${window.API_BASE_URL}/vehicles/create`;
        
        try {
            const res = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                body: formData
            });
            if(res.ok) { 
                alert("Vehicle saved!"); 
                vehicleForm.reset(); 
                vEditIdInput.value=""; 
                fetchMyVehicles(); 
            } else {
                const err = await res.json();
                console.error("Server Error Response:", err);
                alert("Error: " + (JSON.stringify(err.detail) || "Could not save vehicle"));
            }
        } catch (error) {
            console.error("Fetch Exception:", error);
            alert("Network/Server Error: " + error.message);
        }
    });

    // Driver Submits
    driverForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = dEditIdInput.value;
        
        const formData = new FormData();
        formData.append("full_name", document.getElementById("driver_name").value);
        formData.append("email", document.getElementById("driver_email").value);
        formData.append("phone", document.getElementById("driver_phone").value);
        formData.append("password", document.getElementById("driver_password").value);
        formData.append("license_no", document.getElementById("driver_license").value);
        const expYears = parseInt(document.getElementById("driver_exp").value);
        formData.append("experience_years", isNaN(expYears) ? 0 : expYears);
        formData.append("driver_type", document.getElementById("driver_type").value);
        formData.append("owner_id", parseInt(user_id) || 0);
        
        const imageFile = document.getElementById("driver_image").files[0];
        if (imageFile) {
            formData.append("image_file", imageFile);
        }

        const url = id ? `${window.API_BASE_URL}/drivers/${id}` : `${window.API_BASE_URL}/drivers/create`;
        console.log("Attempting fetch to:", url);
        
        try {
            const res = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                body: formData
            });
            console.log("Fetch response received. OK:", res.ok);
            if (res.ok) {
                alert("Driver details saved!");
                driverForm.reset();
                dEditIdInput.value = "";
                fetchMyDrivers();
            } else {
                const err = await res.json();
                console.error("Server Error Response:", err);
                alert("Error: " + (JSON.stringify(err.detail) || "Could not save driver"));
            }
        } catch (error) {
            console.error("Fetch Exception:", error);
            alert("Network/Server Error: " + error.message);
        }
    });

    window.startEditVehicle = (id) => {
        const v = allMyVehicles.find(x => x.id === id);
        vEditIdInput.value = v.id;
        document.getElementById("vehicle_name").value = v.vehicle_name;
        document.getElementById("vehicle_number").value = v.vehicle_number;
        document.getElementById("vehicle_type").value = v.vehicle_type;
        document.getElementById("fuel_type").value = v.fuel_type;
        document.getElementById("rent_per_day").value = v.rent_per_day;
        // document.getElementById("vehicle_file").value = ""; // Cannot set value to file input
        vFormHeading.innerText = "Edit Vehicle";
    };

    window.startEditDriver = (id) => {
        const d = allMyDrivers.find(x => x.id === id);
        dEditIdInput.value = d.id;
        document.getElementById("driver_name").value = d.full_name;
        document.getElementById("driver_email").value = d.email;
        document.getElementById("driver_phone").value = d.phone;
        document.getElementById("driver_password").value = d.password;
        document.getElementById("driver_license").value = d.license_no;
        document.getElementById("driver_exp").value = d.experience_years;
        document.getElementById("driver_type").value = d.driver_type;
        // document.getElementById("driver_image").value = d.image_url || ""; // Cannot set value to file input
        dFormHeading.innerText = "Edit Driver Details";
    };

    window.deleteVehicle = async (id) => {
        if(!confirm("Delete vehicle?")) return;
        await fetch(`${window.API_BASE_URL}/vehicles/delete/${id}`, { method: 'DELETE' });
        fetchMyVehicles();
    };

    window.deleteDriver = async (id) => {
        if(!confirm("Remove driver?")) return;
        await fetch(`${window.API_BASE_URL}/drivers/${id}`, { method: 'DELETE' });
        fetchMyDrivers();
    };

    fetchMyVehicles();
});
