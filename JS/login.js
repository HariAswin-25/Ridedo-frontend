document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${window.API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const result = await response.json();
        console.log("Server response:", result);

        if (response.ok) {
            alert("Login successful!");
            localStorage.setItem("user_id", result.id);
            localStorage.setItem("user_role", result.role);

            // Role-based redirection
            if (result.role === "driver") {
                window.location.href = "driver_dashboard.html";
            } else if (result.role === "cab_driver") {
                window.location.href = "cab_driver_dashboard.html";
            } else if (result.role === "rental_provider") {
                window.location.href = "rental_provider_dashboard.html";
            } else {
                window.location.href = "../landingpage.html";
            }
        } else {
            if (typeof result.detail === "string") {
                alert(result.detail);
            } else if (Array.isArray(result.detail)) {
                alert(result.detail[0].msg);
            } else {
                alert("Invalid email or password!");
            }
        }

    } catch (error) {
        alert("Server error. Make sure backend is running at " + window.API_BASE_URL);
        console.error(error);
    }
});
