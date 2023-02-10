const moonSun = document.getElementById("toggle-moon-light");
const header = document.querySelector("header");

moonSun.addEventListener("click", function () {
    const currentMode = this.dataset.mode;
    if (currentMode === "light") {
        this.dataset.mode = "dark";
        this.firstElementChild.src = "./images/icon-sun.svg";
        document.documentElement.style.setProperty("--bg-color", "#181824");
        document.documentElement.style.setProperty("--todo-color", "#25273c");
        document.documentElement.style.setProperty(
            "--todo-input-color",
            "#fff"
        );
        document.documentElement.style.setProperty("--border-color", "#4d5066");
        header.style.backgroundImage = "url(../../images/bg-desktop-dark.jpg)";
    } else {
        this.dataset.mode = "light";
        this.firstElementChild.src = "./images/icon-moon.svg";
        document.documentElement.style.setProperty("--bg-color", "#e4e5f1");
        document.documentElement.style.setProperty("--todo-color", "#fff");
        document.documentElement.style.setProperty(
            "--todo-input-color",
            "#000"
        );
        document.documentElement.style.setProperty("--border-color", "#d2d3db");
        header.style.backgroundImage = "url(../../images/bg-desktop-light.jpg)";
    }
});

// Start Todo

class Todo {
    constructor(todoText, input, todos, empty, whenTodosArrayUpdate,status) {
        this.text = todoText;
        this.status = status || "active all";
        this.todos = document.querySelector(".todos");
        this.emptyDiv = empty;
        this.input = input;
        this.todosArr = todos;
        this.whenTodosArrayUpdate = whenTodosArrayUpdate;
        this.render();
    }

    render() {
        this.todo = document.createElement("div");
        this.todo.className = "todo";
        this.todo.dataset.status = status || this.status;
        this.todo.innerHTML = `
            <div class="checker">
                <span>
                    <img src="./images/icon-check.svg" alt="">
                </span>
            </div>
            <p>${this.text}</p>
            <button class="remove">
                <img src="./images/icon-cross.svg" alt="">
            </button>
        `;
        const removeButton = this.todo.querySelector(".remove");
        removeButton.addEventListener("click", this.remove.bind(this));
        this.todo.addEventListener("click", this.toggleCompleteTodo.bind(this));
        this.todos.append(this.todo);
        this.input.value = "";
    }
    toggleCompleteTodo(e) {
        if (e.target.className === "remove") return;
        this.todo.dataset.status = this.status = this.status.includes(
            "completed"
        )
            ? "active all"
            : "completed all";
        this.whenTodosArrayUpdate(this.todosArr);
    }
    remove() {
        this.todo.classList.add("remove-todo");
        setTimeout(() => {
            const currentIndex = this.todosArr.findIndex(
                item => item.todo === this.todo
            );
            this.todosArr.splice(currentIndex, 1);
            if (!this.todosArr.length) this.emptyDiv.style.height = "90px";
            this.todo.remove();
            this.whenTodosArrayUpdate(this.todosArr);
        }, 300);
    }
    hide() {
        this.todo.classList.add("hide");
    }
    show() {
        this.todo.classList.remove("hide");
    }
}
class FilterControls {
    constructor(todosArr) {
        this.filterBtns = document.querySelectorAll("button[data-filter]");
        this.lastActive = this.filterBtns[0];
        this.todosArr = todosArr;
    }
    filterTodos(e) {
        if (e.target.dataset.filter.includes("completed")) {
            const filteredTodosLength = this.todosArr.filter(item =>
                item.status.includes("completed")
            ).length;
            if (!filteredTodosLength) {
                swal({
                    title: "There is no Completed Tasks",
                    icon: "error",
                });
                return;
            }
        }
        this.lastActive.classList.remove("active");
        e.target.classList.add("active");
        this.lastActive = e.target;

        for (let i = 0; i < this.todosArr.length; i++) {
            const item = this.todosArr[i];
            if (item.status.includes(e.target.dataset.filter)) {
                item.show();
            } else {
                item.hide();
            }
        }
    }
    clearCompletedHandler() {
        this.todosArr
            .filter(item => item.status.includes("completed"))
            .forEach(item => {
                item.remove();
            });
    }
    init() {
        for (let i = 0; i < this.filterBtns.length; i++) {
            this.filterBtns[i].addEventListener(
                "click",
                this.filterTodos.bind(this)
            );
        }
        const clearCompletedBtn = document.querySelector(
            ".clear-completed button"
        );
        clearCompletedBtn.addEventListener(
            "click",
            this.clearCompletedHandler.bind(this)
        );
    }
}

class TodoApp {
     todosArr = [];
    static countActiveTodos = document.querySelector("#count");
    constructor() {
        this.input = document.querySelector("input[type='text']");
        this.emptyDiv = document.querySelector(".empty");
    }
    static updateLocalStorage(arr){
        const newArr = arr.map(item => {
            return {
                text: item.text,
                status: item.status
            }
        })
        localStorage.setItem("todosArr",JSON.stringify(newArr))
    }
    static checkForCountOfActiveItems(arr){
        TodoApp.countActiveTodos.textContent = arr.filter(item =>
            item.status.includes("active")
        ).length;
    }
    whenTodosArrayUpdate(arr) {
        
        TodoApp.updateLocalStorage(arr)
        TodoApp.checkForCountOfActiveItems(arr)
    }
    addTodoHandler(e) {
        e.preventDefault();
        const form = document.querySelector("form");
        const todoText = form.firstElementChild.value;
        if (!todoText.trim()) {
            swal({
                title: "Empty Todo",
                text: "Please enter a valid Todo!",
                icon: "error",
            });
            return;
        }
        this.todosArr.push(
            new Todo(
                todoText,
                this.input,
                this.todosArr,
                this.emptyDiv,
                this.whenTodosArrayUpdate
            )
        );
        this.emptyDiv.style.height = "0px";
        this.whenTodosArrayUpdate(this.todosArr);
    }
    initilizeLocalStorage(){
        const oldArr = localStorage.getItem("todosArr") && JSON.parse(localStorage.getItem("todosArr"))
        if(!oldArr || !oldArr.length){
            return;
        }
        this.emptyDiv.style.transition = 'none'
        this.emptyDiv.style.height = "0px";
        setTimeout(() => this.emptyDiv.style.transition = '.3s all linear',10)
        oldArr.forEach(item => {
            this.todosArr.push(new Todo(
                item.text,
                this.input,
                this.todosArr,
                this.emptyDiv,
                this.whenTodosArrayUpdate,
                item.status
            ))
        })
        this.whenTodosArrayUpdate(this.todosArr)
    }
    init() {
        this.initilizeLocalStorage()
        this.input.parentElement.onsubmit = this.addTodoHandler.bind(this);
        const filterControls = new FilterControls(this.todosArr);
        filterControls.init();
    }
}

const todo = new TodoApp();
todo.init();