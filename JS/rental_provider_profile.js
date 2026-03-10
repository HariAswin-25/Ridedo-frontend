document.addEventListener("DOMContentLoaded", async function() {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    // UI Elements
    const editToggleBtn = document.getElementById("editToggleBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const viewMode = document.getElementById("viewMode");
    const editMode = document.getElementById("providerProfileForm");

    // Display values
    const valName = document.getElementById("val_name");
    const valEmail = document.getElementById("val_email");
    const valPhone = document.getElementById("val_phone");
    const topName = document.getElementById("topName");
    const topEmail = document.getElementById("topEmail");
    const profileAvatar = document.getElementById("profileAvatar");

    // Form inputs
    const editFullName = document.getElementById("edit_full_name");
    const editPhone = document.getElementById("edit_phone");

    const listingContainer = document.getElementById("readOnlyListingsContainer");

    // Toggle Edit Mode
    editToggleBtn.addEventListener("click", () => {
        viewMode.classList.add("hidden");
        editMode.classList.remove("hidden");
        editToggleBtn.classList.add("hidden");
    });

    cancelEditBtn.addEventListener("click", () => {
        viewMode.classList.remove("hidden");
        editMode.classList.add("hidden");
        editToggleBtn.classList.remove("hidden");
    });

    // Fetch Profile Data
    async function fetchProfile() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/users/${user_id}`);
            if (response.ok) {
                const user = await response.json();
                
                // Set Static Views
                valName.innerText = user.full_name || "N/A";
                valEmail.innerText = user.email || "N/A";
                valPhone.innerText = user.phone || "N/A";
                
                // Set Header Views
                topName.innerText = user.full_name || "Rental Provider";
                topEmail.innerText = user.email || "";
                
                // Set Avatar or Profile Image
                if (user.image_url) {
                    profileAvatar.innerHTML = `<img src="${user.image_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                    profileAvatar.style.background = "transparent";
                } else if (user.full_name) {
                    const initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
                    profileAvatar.innerText = initials.substring(0, 2);
                }

                // Set Form Inputs
                editFullName.value = user.full_name || "";
                editPhone.value = user.phone || "";
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }

    // Fetch Read-Only Listings
    async function fetchMyListings() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/vehicles/`);
            const allVehicles = await response.json();
            const myVehicles = allVehicles.filter(v => v.owner_id == user_id);

            if (myVehicles.length === 0) {
                listingContainer.innerHTML = "<p class='loading-text'>No active listings.</p>";
                return;
            }

            listingContainer.innerHTML = myVehicles.map(v => `
                <div class="item-mini">
                    <div>
                        <strong>${v.vehicle_name}</strong>
                        <p style="font-size: 11px; color: #94a3b8;">${v.vehicle_number}</p>
                    </div>
                    <span>₹${v.rent_per_day}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error("Error fetching listings:", error);
            listingContainer.innerHTML = "<p class='loading-text'>Error loading inventory.</p>";
        }
    }

    // Update Profile
    editMode.addEventListener("submit", async function(e) {
        e.preventDefault();
        const updatedData = {
            full_name: editFullName.value,
            phone: editPhone.value
        };

        try {
            const response = await fetch(`${window.API_BASE_URL}/users/${user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert("Profile updated successfully!");
                fetchProfile(); // Refresh data
                // Exit edit mode
                viewMode.classList.remove("hidden");
                editMode.classList.add("hidden");
                editToggleBtn.classList.remove("hidden");
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Server error.");
        }
    });

    fetchProfile();
    fetchMyListings();
});
