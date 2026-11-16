
// =====================================
// TASKVAULT - SETTINGS
// =====================================


// =====================================
// HTML ELEMENTS
// =====================================

const profileForm = document.getElementById("profileForm");

const fullnameInput = document.getElementById("fullname");
const studentIDInput = document.getElementById("studentID");

const studentGreeting = document.getElementById("studentGreeting");

const profileMessage = document.getElementById("profileMessage");
const notificationMessage = document.getElementById("notificationMessage");
const themeMessage = document.getElementById("themeMessage");

const themeSelect = document.getElementById("theme");


// =====================================
// LOAD STUDENT PROFILE
// =====================================

function loadProfile() {

    const savedProfile = JSON.parse(
        localStorage.getItem("taskvault_profile") || "{}"
    );

    const studentName =
        sessionStorage.getItem("studentName") ||
        savedProfile.name ||
        "";

    const schoolID =
        sessionStorage.getItem("schoolID") ||
        savedProfile.schoolID ||
        "";

    fullnameInput.value = studentName;
    studentIDInput.value = schoolID;

    updateGreeting(studentName);

}


// =====================================
// UPDATE SIDEBAR GREETING
// =====================================

function updateGreeting(name) {

    if (name.trim() !== "") {

        studentGreeting.textContent = "Hello, " + name + "!";

    } else {

        studentGreeting.textContent = "Hello, Student!";

    }

}


// =====================================
// SAVE PROFILE INFORMATION
// =====================================

profileForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const studentName = fullnameInput.value.trim();
    const schoolID = studentIDInput.value.trim();


    // CHECK EMPTY FIELDS
    if (studentName === "" || schoolID === "") {

        profileMessage.textContent = "Please complete all fields.";

        return;

    }


    // SAVE TO SESSION STORAGE
    sessionStorage.setItem("studentName", studentName);
    sessionStorage.setItem("schoolID", schoolID);


    // SAVE PROFILE FOR FUTURE VISITS
    const profile = {
        name: studentName,
        schoolID: schoolID
    };

    localStorage.setItem(
        "taskvault_profile",
        JSON.stringify(profile)
    );


    // UPDATE GREETING
    updateGreeting(studentName);


    // SUCCESS MESSAGE
    profileMessage.textContent = "✓ Profile information saved successfully!";

});


// =====================================
// NOTIFICATION SETTINGS
// =====================================

const notificationInputs = {

    deadlineReminder: document.getElementById("deadlineReminder"),

    overdueReminder: document.getElementById("overdueReminder"),

    dailyReminder: document.getElementById("dailyReminder")

};


// =====================================
// LOAD NOTIFICATION PREFERENCES
// =====================================

function loadNotifications() {

    const savedSettings = JSON.parse(
        localStorage.getItem("taskvault_notifications") || "{}"
    );

    notificationInputs.deadlineReminder.checked =
        savedSettings.deadlineReminder ?? true;

    notificationInputs.overdueReminder.checked =
        savedSettings.overdueReminder ?? true;

    notificationInputs.dailyReminder.checked =
        savedSettings.dailyReminder ?? false;

}


// =====================================
// SAVE NOTIFICATION PREFERENCES
// =====================================

function saveNotifications() {

    const settings = {

        deadlineReminder:
            notificationInputs.deadlineReminder.checked,

        overdueReminder:
            notificationInputs.overdueReminder.checked,

        dailyReminder:
            notificationInputs.dailyReminder.checked

    };


    localStorage.setItem(
        "taskvault_notifications",
        JSON.stringify(settings)
    );


    notificationMessage.textContent =
        "✓ Notification preferences saved!";

}


// =====================================
// DETECT NOTIFICATION SWITCH CHANGES
// =====================================

Object.values(notificationInputs).forEach(input => {

    input.addEventListener("change", saveNotifications);

});


// =====================================
// LOAD WEBSITE THEME
// =====================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem("taskvault_theme") || "purple";

    themeSelect.value = savedTheme;

    applyTheme(savedTheme);

}


// =====================================
// APPLY WEBSITE THEME
// =====================================

function applyTheme(theme) {

    document.body.classList.remove(
        "theme-purple",
        "theme-blue",
        "theme-dark"
    );


    // APPLY SELECTED THEME
    if (["purple", "blue", "dark"].includes(theme)) {

        document.body.classList.add("theme-" + theme);

    }

}


// =====================================
// CHANGE WEBSITE THEME
// =====================================

themeSelect.addEventListener("change", function() {

    const selectedTheme = themeSelect.value;


    // SAVE SELECTED THEME
    localStorage.setItem(
        "taskvault_theme",
        selectedTheme
    );


    // APPLY THEME
    applyTheme(selectedTheme);


    themeMessage.textContent =
        "✓ Theme changed to " +
        selectedTheme.charAt(0).toUpperCase() +
        selectedTheme.slice(1) +
        "!";

});


// =====================================
// LOG OUT
// =====================================

function logout() {

    sessionStorage.clear();

}


// SIDEBAR LOGOUT
document.getElementById("sidebarLogout").addEventListener(
    "click",
    logout
);


// BOTTOM LOGOUT
document.getElementById("bottomLogout").addEventListener(
    "click",
    logout
);


// =====================================
// INITIALIZE SETTINGS
// =====================================

loadProfile();

loadNotifications();

loadTheme();
