
// =====================================
// TASKVAULT - MY ASSIGNMENTS
// =====================================

const STORAGE_KEY = "taskvault_tasks";


// =====================================
// HTML ELEMENTS
// =====================================

const studentGreeting = document.getElementById("studentGreeting");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const progressTasks = document.getElementById("progressTasks");
const completedTasks = document.getElementById("completedTasks");

const searchTask = document.getElementById("searchTask");
const subjectFilter = document.getElementById("subjectFilter");
const statusFilter = document.getElementById("statusFilter");

const assignmentList = document.getElementById("assignmentList");


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

        if (!Array.isArray(tasks)) {
            return [];
        }

        // Give older tasks an ID if they do not have one
        let changed = false;

        tasks.forEach(task => {

            if (!task.id) {
                task.id = Date.now().toString() +
                    Math.random().toString(36).slice(2, 7);

                changed = true;
            }

        });

        if (changed) {
            saveTasks(tasks);
        }

        return tasks;

    } catch (error) {

        console.error("Error loading assignments:", error);
        return [];

    }

}


// =====================================
// SAVE TASKS
// =====================================

function saveTasks(tasks) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );

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
// FORMAT DEADLINE
// =====================================

function formatDeadline(deadline) {

    if (!deadline) {
        return "No deadline set";
    }

    const date = new Date(deadline + "T00:00:00");

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
// UPDATE SUMMARY CARDS
// =====================================

function updateSummary(tasks) {

    totalTasks.textContent = tasks.length;

    pendingTasks.textContent = tasks.filter(task =>
        getTaskStatus(task) === "Pending"
    ).length;

    progressTasks.textContent = tasks.filter(task =>
        getTaskStatus(task) === "In Progress"
    ).length;

    completedTasks.textContent = tasks.filter(task =>
        getTaskStatus(task) === "Completed"
    ).length;

}


// =====================================
// DISPLAY ASSIGNMENTS
// =====================================

function displayAssignments(tasks) {

    assignmentList.innerHTML = "";

    if (tasks.length === 0) {

        assignmentList.innerHTML = `
            <div class="assignment-card glass empty-message">
                <div>
                    <h3>📭 No Assignments Found</h3>
                    <p>Add a new task or change your search and filters.</p>
                </div>
            </div>
        `;

        return;
    }


    tasks.forEach(task => {

        const status = getTaskStatus(task);

        const priority = String(task.priority || "Medium").toLowerCase();

        const safePriority = ["high", "medium", "low"].includes(priority)
            ? priority
            : "medium";

        let statusClass = "pending";

        if (status === "In Progress") {
            statusClass = "progress";
        } else if (status === "Completed") {
            statusClass = "completed";
        }

        const card = document.createElement("div");

        card.className = "assignment-card glass";

        card.innerHTML = `

            <!-- TASK INFORMATION -->
            <div class="task-info">

                <span class="subject">
                    ${escapeHTML(task.subject || "General")}
                </span>

                <h3>
                    ${escapeHTML(task.title || "Untitled Task")}
                </h3>

                <p>
                    ${escapeHTML(task.description || "No description available.")}
                </p>

                <small>
                    📅 Deadline: ${escapeHTML(formatDeadline(task.deadline))}
                </small>

            </div>


            <!-- TASK CONTROLS -->
            <div class="task-controls">

                <!-- STATUS DROPDOWN -->
                <select
                    class="status-select ${statusClass}"
                    data-action="change-status"
                    data-id="${escapeHTML(task.id)}"
                    aria-label="Change assignment status">

                    <option value="Pending" ${status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="In Progress" ${status === "In Progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option value="Completed" ${status === "Completed" ? "selected" : ""}>
                        Completed
                    </option>

                </select>


                <!-- PRIORITY -->
                <span class="priority ${safePriority}">
                    ${safePriority.charAt(0).toUpperCase() + safePriority.slice(1)}
                    Priority
                </span>


                <!-- OPTIONS MENU -->
                <div class="options-menu">

                    <button
                        type="button"
                        class="options-button"
                        data-action="toggle-menu">
                        ⋮ Options
                    </button>

                    <div class="options-content">

                        <button
                            type="button"
                            data-action="view"
                            data-id="${escapeHTML(task.id)}">
                            👁 View Details
                        </button>

                        ${
                            status === "Completed"
                            ? `
                                <button
                                    type="button"
                                    data-action="undo"
                                    data-id="${escapeHTML(task.id)}">
                                    ↩ Undo Completion
                                </button>
                            `
                            : `
                                <button
                                    type="button"
                                    data-action="complete"
                                    data-id="${escapeHTML(task.id)}">
                                    ✓ Mark Completed
                                </button>
                            `
                        }

                        <button
                            type="button"
                            class="delete-option"
                            data-action="delete"
                            data-id="${escapeHTML(task.id)}">
                            🗑 Delete Assignment
                        </button>

                    </div>

                </div>

            </div>

        `;

        assignmentList.appendChild(card);

    });

}


// =====================================
// SEARCH AND FILTER
// =====================================

function filterAssignments() {

    const tasks = getTasks();

    const searchValue = searchTask.value.toLowerCase().trim();

    const selectedSubject = subjectFilter.value;
    const selectedStatus = statusFilter.value;


    const filteredTasks = tasks.filter(task => {

        const title = String(task.title || "").toLowerCase();
        const subject = String(task.subject || "").toLowerCase();
        const description = String(task.description || "").toLowerCase();

        const matchesSearch =
            title.includes(searchValue) ||
            subject.includes(searchValue) ||
            description.includes(searchValue);

        const matchesSubject =
            selectedSubject === "all" ||
            subject === selectedSubject.toLowerCase();

        const matchesStatus =
            selectedStatus === "all" ||
            getTaskStatus(task) === selectedStatus;

        return matchesSearch && matchesSubject && matchesStatus;

    });

    displayAssignments(filteredTasks);

}


// =====================================
// FIND TASK BY ID
// =====================================

function findTask(tasks, id) {

    return tasks.find(task =>
        String(task.id) === String(id)
    );

}


// =====================================
// VIEW DETAILS
// =====================================

function viewDetails(task) {

    alert(
        "ASSIGNMENT DETAILS\n\n" +
        "Title: " + (task.title || "Untitled Task") + "\n\n" +
        "Subject: " + (task.subject || "General") + "\n\n" +
        "Description: " + (task.description || "No description") + "\n\n" +
        "Deadline: " + formatDeadline(task.deadline) + "\n\n" +
        "Priority: " + (task.priority || "Medium") + "\n\n" +
        "Status: " + getTaskStatus(task)
    );

}


// =====================================
// CLOSE ALL DROPDOWN MENUS
// =====================================

function closeAllMenus() {

    document.querySelectorAll(".options-menu.open").forEach(menu => {
        menu.classList.remove("open");
    });

}


// =====================================
// HANDLE DROPDOWN AND BUTTON ACTIONS
// =====================================

assignmentList.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;


    // OPEN OR CLOSE OPTIONS MENU
    if (action === "toggle-menu") {

        const currentMenu = button.closest(".options-menu");

        const wasOpen = currentMenu.classList.contains("open");

        closeAllMenus();

        if (!wasOpen) {
            currentMenu.classList.add("open");
        }

        return;

    }


    // OTHER ACTIONS
    const taskId = button.dataset.id;

    const tasks = getTasks();

    const task = findTask(tasks, taskId);

    if (!task) return;


    // VIEW DETAILS
    if (action === "view") {

        closeAllMenus();

        viewDetails(task);

    }


    // MARK COMPLETED
    else if (action === "complete") {

        task.completed = true;
        task.status = "Completed";

        saveTasks(tasks);

        refreshAssignments();

    }


    // UNDO COMPLETION
    else if (action === "undo") {

        task.completed = false;
        task.status = "Pending";

        saveTasks(tasks);

        refreshAssignments();

    }


    // DELETE ASSIGNMENT
    else if (action === "delete") {

        const confirmed = confirm(
            "Are you sure you want to delete this assignment?"
        );

        if (confirmed) {

            const updatedTasks = tasks.filter(item =>
                String(item.id) !== String(taskId)
            );

            saveTasks(updatedTasks);

            refreshAssignments();

        }

    }

});


// =====================================
// CHANGE STATUS DROPDOWN
// =====================================

assignmentList.addEventListener("change", function (event) {

    const select = event.target.closest(
        'select[data-action="change-status"]'
    );

    if (!select) return;

    const taskId = select.dataset.id;

    const newStatus = select.value;

    const tasks = getTasks();

    const task = findTask(tasks, taskId);

    if (!task) return;


    task.status = newStatus;

    task.completed = newStatus === "Completed";

    saveTasks(tasks);

    refreshAssignments();

});


// =====================================
// CLOSE MENU WHEN CLICKING OUTSIDE
// =====================================

document.addEventListener("click", function (event) {

    if (!event.target.closest(".options-menu")) {
        closeAllMenus();
    }

});


// =====================================
// REFRESH ASSIGNMENTS
// =====================================

function refreshAssignments() {

    const tasks = getTasks();

    updateSummary(tasks);

    filterAssignments();

}


// =====================================
// LOG OUT
// =====================================

document.getElementById("logoutButton").addEventListener("click", function () {

    sessionStorage.clear();

});


// =====================================
// SEARCH AND FILTER EVENTS
// =====================================

searchTask.addEventListener("input", filterAssignments);

subjectFilter.addEventListener("change", filterAssignments);

statusFilter.addEventListener("change", filterAssignments);


// =====================================
// INITIALIZE PAGE
// =====================================

displayStudentName();

refreshAssignments();


// UPDATE WHEN ANOTHER TAB CHANGES TASKS
window.addEventListener("storage", function (event) {

    if (event.key === STORAGE_KEY) {
        refreshAssignments();
    }

});
