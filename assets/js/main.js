const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const inputTodo = $(".input-todo");
const todoList = $(".todo-list");
const todoItemTmp = $("#todoItemTmp"); // get todo Template

let todoDb = JSON.parse(localStorage.getItem("todoDb")) || [];

inputTodo.focus();

function renderTodo(todoDb) {
  todoDb.forEach((todo) => {
    addTodoUI(todo);
  });
}

function addTodoUI(todo) {
  const todoItemClone = todoItemTmp.content.firstElementChild.cloneNode(true);
  todoItemClone.firstChild.textContent = todo.content;
  todoItemClone.dataset.id = todo.id;
  todoItemClone.dataset.complete = todo.complete;

  if (todo.complete === true) {
    todoItemClone.classList.add("text-decoration-line-through");
  }

  const btnDelete = todoItemClone.querySelector(".btn-delete");
  btnDelete.dataset.id = todo.id;

  todoList.appendChild(todoItemClone);
}

function save() {
  localStorage.setItem("todoDb", JSON.stringify(todoDb));
}

renderTodo(todoDb);

// add todo
$("#form-create-todo").addEventListener("submit", (e) => {
  e.preventDefault();

  const todoItem = {
    id: Date.now(),
    content: inputTodo.value,
    complete: false,
  };

  todoDb.push(todoItem);

  addTodoUI(todoItem);

  inputTodo.value = "";

  // save into localStorage
  save();
});

// delete all
$(".delete-all").addEventListener("click", () => {
  const isDeleteAll = confirm("Bạn có muốn xóa hết!");
  if (isDeleteAll) {
    todoList.innerHTML = "";
    todoDb = [];
    save();
  }
});

todoList.addEventListener("click", (e) => {
  // delete one
  const btnDelete = e.target.closest(".btn-delete");
  const liElm = e.target.closest(".todo-item");

  if (btnDelete) {
    const btnId = btnDelete.dataset.id;
    const todoItemElem = $(`li[data-id="${btnId}"]`);
    const indexDelete = todoDb.findIndex((todo) => {
      return todo.id === Number(btnId);
    });

    todoDb = todoDb.slice(0, indexDelete).concat(todoDb.slice(indexDelete + 1));

    todoItemElem.outerHTML = "";
    save();
  }

  // completed
  else if (liElm) {
    // e.stopPropagation();
    // console.log(liElm.dataset.complete);

    if (liElm.dataset.complete === "false") {
      liElm.dataset.complete = true;
      liElm.classList.add("text-decoration-line-through");

      const todoIndex = todoDb.findIndex((todo) => {
        return todo.id == liElm.dataset.id;
      });

      todoDb[todoIndex].complete = true;
    } else {
      liElm.dataset.complete = false;
      liElm.classList.remove("text-decoration-line-through");

      const todoIndex = todoDb.findIndex((todo) => {
        return todo.id == liElm.dataset.id;
      });

      todoDb[todoIndex].complete = false;
    }
  }
  save();
});

// filter todo item
const searchTodo = $("#searchTodo");
const todoItemList = $$(".todo-item");

searchTodo.addEventListener("input", () => {
  todoDb.forEach((todo) => {
    const todoItemElm = $(`li[data-id='${todo.id}']`);
    const todoContent = todo.content.toLowerCase();
    if (!todoContent.includes(searchTodo.value.toLowerCase())) {
      console.log(todoItemElm);
      todoItemElm.classList.remove("d-block");
      todoItemElm.classList.add("d-none");
    } else {
      todoItemElm.classList.remove("d-none");
      todoItemElm.classList.add("d-block");
    }
  });
});
