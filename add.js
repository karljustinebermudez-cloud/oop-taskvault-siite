const STORAGE_KEY = "taskvault_tasks";


const taskForm = document.getElementById("taskForm");

const titleInput = document.getElementById("title");
const subjectInput = document.getElementById("subject");
const descriptionInput = document.getElementById("description");
const deadlineInput = document.getElementById("deadline");
const priorityInput = document.getElementById("priority");

const studentGreeting = document.getElementById("studentGreeting");
const formMessage = document.getElementById("formMessage");

function displayStudentName() {

    const studentName =
        sessionStorage.getItem("studentName") || "Student";

    studentGreeting.textContent = "Hello, " + studentName + "!";

}

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

function saveTasks(tasks) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );

}


function setMinimumDeadline() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    deadlineInput.min = formattedDate;

}


function showMessage(message, type) {

    formMessage.textContent = message;

    formMessage.className = "form-message " + type;

}


function clearMessage() {

    formMessage.textContent = "";

    formMessage.className = "form-message";

}


taskForm.addEventListener("submit", function (event) {

   
    event.preventDefault();


    const title = titleInput.value.trim();

    const subject = subjectInput.value;

    const description = descriptionInput.value.trim();

    const deadline = deadlineInput.value;

    const priority = priorityInput.value;


    if (!title || !subject || !deadline || !priority) {

        showMessage(
            "Please complete all required fields.",
            "error"
        );

        return;

    }


    
    const selectedDate = new Date(deadline + "T00:00:00");

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime()) || selectedDate < today) {

        showMessage(
            "Please select today or a future deadline.",
            "error"
        );

        return;

    }


 
    const tasks = getTasks();



    const newTask = {

        id: Date.now().toString(),

        title: title,

        subject: subject,

        description: description,

        deadline: deadline,

        priority: priority,

        status: "Pending",

        completed: false,

        createdAt: new Date().toISOString()

    };


  
    tasks.push(newTask);



    try {

        saveTasks(tasks);

        showMessage(
            "Task successfully saved! Redirecting to My Assignments...",
            "success"
        );

   
        const saveButton = taskForm.querySelector(".save-button");
        saveButton.disabled = true;

   
        setTimeout(function () {

            window.location.href = "myass.html";

        }, 1000);

    } catch (error) {

        console.error("Error saving task:", error);

        showMessage(
            "Unable to save task. Please check your browser storage.",
            "error"
        );

    }

});


taskForm.addEventListener("reset", function () {

    clearMessage();

});



const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", function () {

    sessionStorage.clear();

});



displayStudentName();

setMinimumDeadline();

