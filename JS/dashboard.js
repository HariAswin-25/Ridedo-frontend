document.addEventListener("DOMContentLoaded", function () {
    const user_id = localStorage.getItem("user_id");

    // Simple check to see if user is logged in
    if (!user_id) {
        console.log("User not logged in.");
        // We can optionally redirect or just hide profile links
    } else {
        console.log("Logged in user ID:", user_id);
    }
});

// Logout logic for landing page
const logoutLink = document.querySelector(".logout");
if (logoutLink) {
    logoutLink.addEventListener("click", function () {
        localStorage.removeItem("user_id");
        alert("Logged out successfully!");
    });
}
