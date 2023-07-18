// querySelector
const formEl = document.querySelector("#task-form");
const tasksToDoEl = document.querySelector("#tasks-to-do");
const pageContentEl = document.querySelector("#page-content");
const tasksInProgressEl = document.querySelector("#tasks-in-progress");
const tasksCompletedEl = document.querySelector("#tasks-completed");

// Task related variables
let tasks = [];
let taskIdCounter = 0;

const taskFormHandler = function (event) {
    event.preventDefault();

    const taskNameInput = document.querySelector("input[name='task-name']").value;
    const taskTypeInput = document.querySelector("select[name='task-type']").value;

    // check if input values are empty strings
    if (!taskNameInput || !taskTypeInput) {
        alert("You need to fill out the task form!");
        return false;
    }

    formEl.reset();

    const isEdit = formEl.hasAttribute("data-task-id");

    // has data attribute, so get task id and call function to complete edit process.   
    if (isEdit) {
        const taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);        
    }

    // no data attribute, so create object as normal and pass to createTaskEl function
    else {
        // package up data as an object
        let taskDataObj = {
            name: taskNameInput,
            type: taskTypeInput,
            status: "to do"
        };

        // send it as an argument to createTaskEl
        createTaskEl(taskDataObj);
    };
};

let createTaskEl = function(taskDataObj) {
    // create list item
    const listItemEl = document.createElement("li");
    listItemEl.className = "task-item";
    listItemEl.setAttribute("data-task-id", taskIdCounter);
    listItemEl.setAttribute("draggable", "true");

    const taskInfoEl = document.createElement("div");
    taskInfoEl.className = "task-info";
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
    listItemEl.appendChild(taskInfoEl);
 
    const taskActionsEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);

    switch (taskDataObj.status) {
        case "to do":
            taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 0;
            tasksToDoEl.append(listItemEl);
            break;
        case "in progress":
            taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 1;
            tasksInProgressEl.append(listItemEl);
            break;
        case "completed":
            taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 2;
            tasksCompletedEl.append(listItemEl);
            break;
        default:
            console.log("Uh-Oh, something went wrong!");
    }

    // taskDataObj grabs the id from taskIdCounter
    taskDataObj.id = taskIdCounter;

    // Then taskDataObj's id is then pushed into the empty 'tasks' array
    tasks.push(taskDataObj);

    // save to localStorage
    saveTasks();

    // increase task counter for next unique id
    taskIdCounter++;
};

const createTaskActions = function(taskId) {
    const actionContainerEl = document.createElement("div");
    actionContainerEl.className = "task-actions";

    // create edit button
    const editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);
    editButtonEl.style.backgroundColor = "var(--editing)";
    actionContainerEl.appendChild(editButtonEl);

    // create delete button
    const deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);
    deleteButtonEl.style.backgroundColor = "var(--red)";
    actionContainerEl.appendChild(deleteButtonEl);

    // dropdown select element
    const statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);
    actionContainerEl.appendChild(statusSelectEl);

    // for loop array options
    const statusChoices = ["To Do", "In Progress", "Completed"];

    for (let i = 0; i < statusChoices.length; i++) {
        // create option element
        const statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        // append to select menu
        statusSelectEl.appendChild(statusOptionEl);
    }

    return actionContainerEl;
};

const taskButtonHandler = function(event){
    // gets target element from event
    const targetEl = event.target;

    // edit button was clicked
    if (targetEl.matches(".edit-btn")) {
        const taskId = targetEl.getAttribute("data-task-id");
        editTask(taskId);
    } else if (event.target.matches(".delete-btn")) {
        // delete button was clicked 
        const taskId = event.target.getAttribute("data-task-id");
        deleteTask(taskId);
    }
};

// This function should edit the task
const editTask = function(taskId) {
    // get task list item element
    const taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // get content from task name and type
    const taskName = taskSelected.querySelector("h3.task-name").textContent;
    const taskType = taskSelected.querySelector("span.task-type").textContent;

    // console.logs
    console.log(taskName);
    console.log(taskType);

    // write the taskName and taskType values onto the form
    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType

    // set data attribute to the form with a value of the task's id so it knows which one is being edited
    formEl.setAttribute("data-task-id", taskId);

    // update form button to notify user 
    formEl.querySelector("#save-task").textContent = "Update Task";

    // CHANGE COLOR OF THE BUTTON FOR FURTHER NOTIFICATION
    formEl.querySelector("#save-task").style.backgroundColor = "var(--editing)"
};

const completeEditTask = function(taskName, taskType, taskId) {
    // find the matching task list item
    const taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // set new values
    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    // loop through tasks array and task object with new content
    for (let i = 0; i < tasks.length; i++) {
        // convert the id from a string to an integer
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    };

    // inform user of update
    alert("Task Updated!");

    // reset the form by removing the task id
    formEl.removeAttribute("data-task-id");
    // reset button to initial state
    document.querySelector("#save-task").textContent = "Add Task";
    // reset the color of the button
    document.querySelector("#save-task").style.backgroundColor = 'var(--primary)';

    // save to localStorage
    saveTasks();
};

const deleteTask = function(taskId) {
    const taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    // create new array to hold updated list of tasks
    const updatedTaskArr = [];

    // loop through current tasks
    for (let i = 0; i < tasks.length; i++) {
        // if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
        if (tasks[i].id !== parseInt(taskId)) {
            updatedTaskArr.push(tasks[i]);
        }
    }

    // reassign tasks array to be the same as updatedTaskArr
    tasks = updatedTaskArr;

    // save to localStorage
    saveTasks();
};

  const taskStatusChangeHandler = function(event) {
    // get the task item's id
    const taskId = event.target.getAttribute("data-task-id");

    // get the currently selected option's value and convert to lowercase
    const statusValue = event.target.value.toLowerCase();

    // find the parent task item element based on the id
    const taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    if (statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    }
    else if (statusValue === "in progress") {
        tasksInProgressEl.appendChild(taskSelected);
    }
        else if (statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    }

    // update task's in tasks array
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }
    
    // save to localStorage
    saveTasks();
};

// store task data in case of transfer
const dragTaskHandler = function(event) {
    const taskId = event.target.getAttribute("data-task-id");
    event.dataTransfer.setData("text/plain", taskId);
    const getId = event.dataTransfer.getData("text/plain");
};

// Responsible for adding a CSS effect for taskListEl
const dropZoneDragHandler = function(event) {
    const taskListEl = event.target.closest(".task-list");

    // If true, add a style that highlights the closest taskListEl to indicate where the task can be dropped 
    if (taskListEl) {
        event.preventDefault();
        taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");
    }
};

const dropTaskHandler = function(event) {
    const id = event.dataTransfer.getData("text/plain");
    const draggableElement = document.querySelector("[data-task-id='" + id + "']");
    const dropZoneEl = event.target.closest(".task-list");
    const statusType = dropZoneEl.id;

    // set status of task based on dropZone id
    const statusSelectEl = draggableElement.querySelector("select[name='status-change']");

    // note: selectedIndex allows ability to set displayed options in a list by specifying the option's 0-based position.
    // by assigning a number to selectedIndex, it's selecting the option to display in the <select> element. 
    // within the if-statement the statusType's id string values to option numbers, and sets the selectedIndex value appropriately.
    if (statusType === "tasks-to-do") {
        statusSelectEl.selectedIndex = 0;        
    } else if (statusType === "tasks-in-progress") {
        statusSelectEl.selectedIndex = 1;
    }    else if (statusType === "tasks-completed") {
        statusSelectEl.selectedIndex = 2;    
    }

    dropZoneEl.removeAttribute("style");

    // append draggeableElement to new parent element (dropZoneEl)
    dropZoneEl.appendChild(draggableElement);

    // loop through tasks array to find and update the updated task's status
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(id)) {
            tasks[i].status = statusSelectEl.value.toLowerCase();
        }
    }

    // save to localStorage
    saveTasks();
};

const dragLeaveHandler = function(event) {
    const taskListEl = event.target.closest(".task-list");

    if (taskListEl) {
        taskListEl.removeAttribute("style");
    }
};

const saveTasks = function() {
    // stringify tasks for localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

const loadTasks = function() {
    // collect saveTasks from the tasks object
    let savedTasks = localStorage.getItem("tasks");

    if (!savedTasks) {
        return false;
    }

    console.log('Saved tasks found');

    savedTasks = JSON.parse(savedTasks);

    // loop createTaskEl for every item in savedTasks array
    for (let i = 0; i < savedTasks.length; i++) {
        createTaskEl(savedTasks[i]);
    }
};

// Event Listeners
formEl.addEventListener("submit", taskFormHandler);
pageContentEl.addEventListener("change", taskStatusChangeHandler);
pageContentEl.addEventListener("click", taskButtonHandler);
pageContentEl.addEventListener("dragstart", dragTaskHandler);
pageContentEl.addEventListener("dragover", dropZoneDragHandler);
pageContentEl.addEventListener("drop", dropTaskHandler);
pageContentEl.addEventListener("dragleave", dragLeaveHandler);

loadTasks();