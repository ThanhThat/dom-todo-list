const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const inputTodo = $(".input-todo");
const todoList = $(".todo-list");
const todoItemTmp = $("#todoItemTmp"); // get todo Template

inputTodo.focus();

async function getTodoList() {
  const res = await fetch("http://localhost:3000/todoList");
  const data = await res.json();
  return data;
}

async function renderTodo(e) {
  let todoDb = await getTodoList();

  todoDb
    .filter((todo) => todo.deleted !== true)
    .forEach((todo) => {
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

renderTodo();

// add todo
$("#form-create-todo").addEventListener("submit", (e) => {
  e.preventDefault();
  e.stopPropagation();

  const inputValue = inputTodo.value.trim();

  if (inputValue) {
    const todoItem = {
      id: Date.now(),
      content: inputValue,
      complete: false,
    };

    fetch("http://localhost:3000/todoList", {
      method: "POST", // sending
      headers: {
        // Type data sending
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(todoItem),
    });

    addTodoUI(todoItem);

    inputTodo.value = "";
  }

  e.returnValue = false; // or return false;
});

// delete all
$(".delete-all").addEventListener("click", async () => {
  let todoDb = await getTodoList();

  const isDeleteAll = confirm("Bạn có muốn xóa hết!");
  if (isDeleteAll) {
    todoList.innerHTML = "";
    todoDb
      .filter((todo) => todo.deleted !== true)
      .forEach((todo) => {
        fetch(`http://localhost:3000/todoList/${todo.id}`, {
          method: "PATCH",
          body: JSON.stringify({ deleted: true }),
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
        });
      });
  }
});

todoList.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  // delete one
  const btnDelete = e.target.closest(".btn-delete");
  const liElm = e.target.closest(".todo-item");
  let todoDb = await getTodoList();

  if (btnDelete) {
    const btnId = btnDelete.dataset.id;
    const todoItemElem = $(`li[data-id="${btnId}"]`);

    fetch(`http://localhost:3000/todoList/${btnId}`, {
      method: "PATCH",
      body: JSON.stringify({
        deleted: true,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    todoItemElem.outerHTML = "";
  }

  // completed
  else if (liElm) {
    const todoId = liElm.dataset.id;

    if (liElm.dataset.complete === "false") {
      liElm.dataset.complete = true;
      liElm.classList.add("text-decoration-line-through");

      const todoIndex = todoDb.findIndex((todo) => {
        return todo.id == liElm.dataset.id;
      });

      fetch(`http://localhost:3000/todoList/${todoId}`, {
        method: "PATCH",
        body: JSON.stringify({
          complete: true,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    } else {
      liElm.dataset.complete = false;
      liElm.classList.remove("text-decoration-line-through");

      const todoIndex = todoDb.findIndex((todo) => {
        return todo.id == liElm.dataset.id;
      });

      fetch(`http://localhost:3000/todoList/${todoId}`, {
        method: "PATCH",
        body: JSON.stringify({
          complete: false,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    }
  }

  return false;
});

// filter todo item
const searchTodo = $("#searchTodo");
const todoItemList = $$(".todo-item");

searchTodo.addEventListener("input", async () => {
  let todoDb = await getTodoList();

  todoDb
    .filter((todo) => todo.deleted !== true)
    .forEach((todo) => {
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
