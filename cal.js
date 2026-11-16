
// =====================================
// TASKVAULT - CALENDAR
// =====================================

const STORAGE_KEY = "taskvault_tasks";


// =====================================
// HTML ELEMENTS
// =====================================

const monthYear = document.getElementById("monthYear");
const calendarDates = document.getElementById("calendarDates");

const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

const selectedDateTitle = document.getElementById("selectedDateTitle");
const selectedDateTasks = document.getElementById("selectedDateTasks");

const upcomingList = document.getElementById("upcomingList");

const studentGreeting = document.getElementById("studentGreeting");


// =====================================
// CALENDAR VARIABLES
// =====================================

const today = new Date();

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

let selectedDate = formatDateKey(today);


// =====================================
// STUDENT NAME
// =====================================

function displayStudentName() {

    const name = sessionStorage.getItem("studentName") || "Student";

    studentGreeting.textContent = "Hello, " + name + "!";

}


// =====================================
// GET TASKS FROM LOCAL STORAGE
// =====================================

function getTasks() {

    try {

        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const tasks = JSON.parse(savedTasks);

        return Array.isArray(tasks) ? tasks : [];

    } catch (error) {

        console.error("Error loading tasks:", error);

        return [];

    }

}


// =====================================
// FORMAT DATE AS YYYY-MM-DD
// =====================================

function formatDateKey(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// =====================================
// GET TASK STATUS
// =====================================

function getTaskStatus(task) {

    if (task.completed === true || task.status === "Completed") {
        return "Completed";
    }

    if (task.status === "In Progress" || task.inProgress === true) {
        return "In Progress";
    }

    return "Pending";

}


// =====================================
// GET STATUS CLASS
// =====================================

function getStatusClass(status) {

    if (status === "Completed") {
        return "completed";
    }

    if (status === "In Progress") {
        return "progress";
    }

    return "pending";

}


// =====================================
// FORMAT DATE FOR DISPLAY
// =====================================

function formatDisplayDate(dateString) {

    if (!dateString) {
        return "No deadline";
    }

    const date = new Date(dateString + "T00:00:00");

    if (isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });

}


// =====================================
// GENERATE CALENDAR
// =====================================

function generateCalendar() {

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const daysInMonth = new Date(
        currentYear,
        currentMonth + 1,
        0
    ).getDate();


    // DISPLAY MONTH AND YEAR
    const monthName = new Date(
        currentYear,
        currentMonth
    ).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    monthYear.textContent = monthName;


    // CLEAR OLD DATES
    calendarDates.innerHTML = "";


    const tasks = getTasks();


    // EMPTY SPACES BEFORE FIRST DAY
    for (let i = 0; i < firstDay; i++) {

        const emptyDay = document.createElement("div");

        emptyDay.className = "day empty";

        calendarDates.appendChild(emptyDay);

    }


    // GENERATE DAYS
    for (let day = 1; day <= daysInMonth; day++) {

        const dateString =
            `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        // FIND TASKS DUE ON THIS DATE
        const dayTasks = tasks.filter(task =>
            task.deadline === dateString
        );


        const dayElement = document.createElement("div");

        dayElement.className = "day";

        dayElement.dataset.date = dateString;


        // CHECK IF TODAY
        if (dateString === formatDateKey(today)) {
            dayElement.classList.add("today");
        }


        // CHECK IF SELECTED
        if (dateString === selectedDate) {
            dayElement.classList.add("selected");
        }


        // DAY NUMBER
        let dayContent = `
            <span class="day-number">${day}</span>
        `;


        // DISPLAY ASSIGNMENTS
        dayTasks.slice(0, 2).forEach(task => {

            const status = getTaskStatus(task);

            const statusClass = getStatusClass(status);

            dayContent += `
                <span class="event ${statusClass}"
                    title="${escapeHTML(task.title || "Untitled Task")}">
                    ${escapeHTML(task.title || "Untitled Task")}
                </span>
            `;

        });


        // SHOW REMAINING TASK COUNT
        if (dayTasks.length > 2) {

            dayContent += `
                <span class="more-events">
                    +${dayTasks.length - 2} more
                </span>
            `;

        }


        dayElement.innerHTML = dayContent;

        calendarDates.appendChild(dayElement);

    }


    // DISPLAY SELECTED DATE TASKS
    displaySelectedDateTasks();

}


// =====================================
// DISPLAY TASKS FOR SELECTED DATE
// =====================================

function displaySelectedDateTasks() {

    const tasks = getTasks();

    const dayTasks = tasks.filter(task =>
        task.deadline === selectedDate
    );


    selectedDateTitle.textContent =
        "📅 " + formatDisplayDate(selectedDate);


    selectedDateTasks.innerHTML = "";


    if (dayTasks.length === 0) {

        selectedDateTasks.innerHTML = `
            <p class="empty-message">
                No assignments are due on this date.
            </p>
        `;

        return;

    }


    dayTasks.forEach(task => {

        const status = getTaskStatus(task);

        const statusClass = getStatusClass(status);

        const taskElement = document.createElement("div");

        taskElement.className = "selected-task";

        taskElement.innerHTML = `

            <div class="selected-task-info">

                <h3>${escapeHTML(task.title || "Untitled Task")}</h3>

                <p>
                    ${escapeHTML(task.subject || "General")}
                    ·
                    ${escapeHTML(task.description || "No description")}
                </p>

            </div>

            <span class="selected-task-status ${statusClass}">
                ${escapeHTML(status)}
            </span>

        `;

        selectedDateTasks.appendChild(taskElement);

    });

}


// =====================================
// DISPLAY UPCOMING DEADLINES
// =====================================

function displayUpcomingDeadlines() {

    const tasks = getTasks();

    const todayString = formatDateKey(today);


    // ONLY UNCOMPLETED TASKS WITH TODAY OR FUTURE DEADLINES
    const upcomingTasks = tasks
        .filter(task => {

            return task.deadline &&
                task.deadline >= todayString &&
                getTaskStatus(task) !== "Completed";

        })
        .sort((a, b) => {

            return a.deadline.localeCompare(b.deadline);

        })
        .slice(0, 8);


    upcomingList.innerHTML = "";


    if (upcomingTasks.length === 0) {

        upcomingList.innerHTML = `
            <p class="empty-message">
                🎉 No upcoming deadlines!
            </p>
        `;

        return;

    }


    upcomingTasks.forEach(task => {

        const date = new Date(task.deadline + "T00:00:00");

        const month = date.toLocaleDateString("en-US", {
            month: "short"
        }).toUpperCase();

        const day = date.getDate();

        const status = getTaskStatus(task);

        const priority = String(task.priority || "medium").toLowerCase();

        const safePriority = ["high", "medium", "low"].includes(priority)
            ? priority
            : "medium";


        const item = document.createElement("div");

        item.className = "upcoming-item";

        item.innerHTML = `

            <div class="date-box">

                <h3>${month}</h3>

                <h2>${day}</h2>

            </div>

            <div class="task-info">

                <h3>${escapeHTML(task.title || "Untitled Task")}</h3>

                <p>${escapeHTML(task.subject || "General")}</p>

            </div>

            <span class="priority ${safePriority}">
                ${safePriority.charAt(0).toUpperCase() + safePriority.slice(1)}
            </span>

        `;


        // CLICK UPCOMING TASK TO SHOW ITS DATE
        item.style.cursor = "pointer";

        item.addEventListener("click", function () {

            selectedDate = task.deadline;

            const taskDate = new Date(task.deadline + "T00:00:00");

            currentMonth = taskDate.getMonth();

            currentYear = taskDate.getFullYear();

            generateCalendar();

            document.querySelector(".calendar-container").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });


        upcomingList.appendChild(item);

    });

}


// =====================================
// CLICK A DATE
// =====================================

calendarDates.addEventListener("click", function (event) {

    const selectedDay = event.target.closest(".day[data-date]");

    if (!selectedDay) return;


    selectedDate = selectedDay.dataset.date;


    // UPDATE SELECTED DATE STYLE AND TASKS
    generateCalendar();

});


// =====================================
// PREVIOUS MONTH
// =====================================

prevMonthButton.addEventListener("click", function () {

    currentMonth--;

    if (currentMonth < 0) {

        currentMonth = 11;

        currentYear--;

    }

    generateCalendar();

});


// =====================================
// NEXT MONTH
// =====================================

nextMonthButton.addEventListener("click", function () {

    currentMonth++;

    if (currentMonth > 11) {

        currentMonth = 0;

        currentYear++;

    }

    generateCalendar();

});


// =====================================
// LOG OUT
// =====================================

document.getElementById("logoutButton").addEventListener("click", function () {

    sessionStorage.clear();

});


// =====================================
// REFRESH WHEN TASKS CHANGE
// =====================================

window.addEventListener("storage", function (event) {

    if (event.key === STORAGE_KEY) {

        generateCalendar();

        displayUpcomingDeadlines();

    }

});


// =====================================
// INITIALIZE CALENDAR
// =====================================

displayStudentName();

generateCalendar();

displayUpcomingDeadlines();
