document.getElementById("driverLoginForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${window.API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Login successful!");
            localStorage.setItem("user_id", result.id);
            localStorage.setItem("user_role", result.role);

            if (result.role === "rental_provider") {
                window.location.href = "rental_provider_dashboard.html";
            } else if (result.role === "cab_driver") {
                window.location.href = "cab_driver_dashboard.html";
            } else {
                window.location.href = "driver_dashboard.html";
            }
        } else {
            alert(result.detail || "Login failed");
        }

    } catch (error) {
        alert("Server error.");
    }
});
