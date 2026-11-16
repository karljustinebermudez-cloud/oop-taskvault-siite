document.addEventListener("DOMContentLoaded", function () {

    if (sessionStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "student.html";
        return;
    }

    displayStudentName();
    displayCurrentDate();
    updateDashboard();
    setupLogout();

    document.addEventListener("click", function (event) {

        const button = event.target.closest("[data-task-index]");

        if (!button) return;

        const index = Number(button.dataset.taskIndex);

        if (!Number.isInteger(index)) return;

        toggleTaskCompletion(index);

    });

    window.addEventListener("storage", function (event) {
        if (event.key === "taskvault_tasks") {
            updateDashboard();
        }
    });

});

function displayStudentName() {

    const studentName = sessionStorage.getItem("studentName");
    const greeting = document.getElementById("studentGreeting");

    if (greeting && studentName) {
        greeting.textContent = "Hello, " + studentName + "!";
    }

}

function displayCurrentDate() {

    const dateElement = document.getElementById("currentDate");

    if (!dateElement) return;

    const today = new Date();

    dateElement.textContent = "📅 " + today.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

}

function getDashboardTasks() {

    try {

        const savedTasks = JSON.parse(
            localStorage.getItem("taskvault_tasks")
        );

        return Array.isArray(savedTasks) ? savedTasks : [];

    } catch (error) {

        console.error("Error loading tasks:", error);
        return [];

    }

}

function saveDashboardTasks(tasks) {

    localStorage.setItem(
        "taskvault_tasks",
        JSON.stringify(tasks)
    );

}

function updateDashboard() {

    const tasks = getDashboardTasks();
    const today = getToday();

    const completed = tasks.filter(task =>
        task.completed === true
    ).length;

    const pending = tasks.filter(task =>
        task.completed !== true
    ).length;

    const upcoming = tasks.filter(task =>
        task.completed !== true &&
        task.deadline &&
        task.deadline >= today
    ).length;

    setDashboardText("completedTasks", completed);
    setDashboardText("pendingTasks", pending);
    setDashboardText("upcomingDeadlines", upcoming);

    displayRecentAssignments(tasks);
    displayUpcomingDeadlines(tasks);

}

function displayRecentAssignments(tasks) {

    const container = document.getElementById("recentAssignments");

    if (!container) return;

    const recentTasks = tasks
        .map((task, index) => ({
            ...task,
            originalIndex: index
        }))
        .sort((a, b) => {

            return new Date(b.createdAt || 0) -
                   new Date(a.createdAt || 0);

        })
        .slice(0, 5);

    if (recentTasks.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No assignments yet. Start by adding a task!
            </p>
        `;

        return;

    }

    container.innerHTML = recentTasks.map(task => {

        const completed = task.completed === true;
        const today = getToday();

        let statusText = "Pending";

        if (completed) {

            statusText = "Completed";

        } else if (task.deadline && task.deadline < today) {

            statusText = "Overdue";

        } else if (task.deadline) {

            statusText = "Due: " + formatShortDate(task.deadline);

        }

        return `
            <div class="task">

                <div class="task-info">

                    <span class="circle ${completed ? "green" : ""}">
                        ${completed ? "✓" : ""}
                    </span>

                    <p>${escapeHTML(task.title || "Untitled Task")}</p>

                </div>

                <span class="status ${completed ? "completed" : "upcoming"}">
                    ${statusText}
                </span>

                <button
                    type="button"
                    class="task-action"
                    data-task-index="${task.originalIndex}"
                >
                    ${completed ? "Undo" : "Complete"}
                </button>

            </div>
        `;

    }).join("");

}

function displayUpcomingDeadlines(tasks) {

    const container = document.getElementById("upcomingList");

    if (!container) return;

    const today = getToday();

    const upcomingTasks = tasks
        .filter(task =>
            task.completed !== true &&
            task.deadline &&
            task.deadline >= today
        )
        .sort((a, b) =>
            a.deadline.localeCompare(b.deadline)
        )
        .slice(0, 5);

    if (upcomingTasks.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No upcoming deadlines. You're all caught up!
            </p>
        `;

        return;

    }

    container.innerHTML = upcomingTasks.map(task => {

        const date = new Date(task.deadline + "T00:00:00");

        const month = date.toLocaleDateString("en-US", {
            month: "short"
        }).toUpperCase();

        const day = date.getDate();

        const fullDate = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        return `
            <div class="deadline-item">

                <div class="date-box">
                    <h3>${month}</h3>
                    <h1>${day}</h1>
                </div>

                <div class="deadline-info">
                    <h3>${escapeHTML(task.title || "Untitled Task")}</h3>
                    <p>${fullDate}</p>
                </div>

            </div>
        `;

    }).join("");

}

function toggleTaskCompletion(index) {

    const tasks = getDashboardTasks();

    if (!tasks[index]) return;

    tasks[index].completed = !(
        tasks[index].completed === true
    );

    saveDashboardTasks(tasks);

    updateDashboard();

}

function setupLogout() {

    const logoutButton = document.querySelector(".logout");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", function (event) {

        event.preventDefault();

        const confirmLogout = confirm(
            "Are you sure you want to log out?"
        );

        if (confirmLogout) {

            sessionStorage.removeItem("isLoggedIn");
            sessionStorage.removeItem("studentName");
            sessionStorage.removeItem("schoolID");

            window.location.href = "home.html";

        }

    });

}

function setDashboardText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}

function getToday() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

function formatShortDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });

}

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

}
