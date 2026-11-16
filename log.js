document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    const nameInput = document.getElementById("name");

    const schoolIDInput = document.getElementById("schoolID");

    if (!loginForm) return;

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const studentName = nameInput.value.trim();
        const schoolID = schoolIDInput.value.trim();

        if (!studentName || !schoolID) {
            alert("Please complete all fields.");
            return;
        }

        if (studentName.length < 3) {
            alert("Please enter your complete name.");
            return;
        }

  
        sessionStorage.setItem("studentName", studentName);
        sessionStorage.setItem("schoolID", schoolID);
        sessionStorage.setItem("isLoggedIn", "true");

     
        console.log("Login status:",
            sessionStorage.getItem("isLoggedIn"));

        console.log("Student:",
            sessionStorage.getItem("studentName"));

        alert("Welcome to TaskVault, " + studentName + "!");


        window.location.href = "student_dash.html";

    });

});
