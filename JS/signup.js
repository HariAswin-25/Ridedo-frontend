document.getElementById("signupForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const full_name = document.querySelector("input[name='full_name']").value;
    const email = document.querySelector("input[name='email']").value;
    const phone = document.querySelector("input[name='phone']").value;
    const dob = document.querySelector("input[name='dob']").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/users/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name: full_name,
                email: email,
                phone: phone,
                dob: dob,
                password: password,
                confirm_password: confirmPassword
            })
        });

        const result = await response.json();
        console.log("Server response:", result); // 🔥 debug

        if (response.ok) {
            alert("Signup successful!");
            window.location.href = "login.html";
        } else {
            // 🔥 Handle all error formats safely
            if (typeof result.detail === "string") {
                alert(result.detail);
            } else if (Array.isArray(result.detail)) {
                alert(result.detail[0].msg);
            } else {
                alert("Something went wrong!");
            }
        }

    } catch (error) {
        alert("Server error. Make sure backend is running.");
        console.error(error);
    }
});