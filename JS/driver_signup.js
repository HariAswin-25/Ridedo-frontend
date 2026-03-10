document.getElementById("driverSignupForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const role = "rental_provider";

    try {
        const formData = new FormData();
        formData.append("full_name", full_name);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("password", password);
        formData.append("role", role);
        formData.append("dob", "");

        const photoFile = document.getElementById("driver_photo").files[0];
        if (photoFile) {
            formData.append("image_file", photoFile);
        }

        const response = await fetch(`${window.API_BASE_URL}/users/create-provider`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert("Rental Provider Account Created!");
            window.location.href = "driver_login.html";
        } else {
            alert(result.detail || "Signup failed");
        }

    } catch (error) {
        alert("Server error. Make sure backend is running.");
    }
});
