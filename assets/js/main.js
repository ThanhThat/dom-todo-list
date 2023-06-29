const API = "https://todo-list-json-server-zal6.vercel.app/todolist/";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const inputTodo = $(".input-todo");
const todoList = $(".todo-list");
const todoItemTmp = $("#todoItemTmp"); // get todo Template

inputTodo.focus();

// GET: get all Todo List
async function getTodoList() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log("There was an error", err);
  }
}

// Render todo list into UI
async function renderTodo(e) {
  let todoDb = await getTodoList();

  todoDb
    .filter((todo) => todo.deleted !== true)
    .forEach((todo) => {
      addTodoUI(todo);
    });
}

// Render todo Item
function addTodoUI(todo) {
  const todoItemClone = todoItemTmp.content.firstElementChild.cloneNode(true);
  todoItemClone.firstChild.textContent = todo.content;
  todoItemClone.dataset.id = todo.id;
  todoItemClone.dataset.completed = todo.completed;

  if (todo.completed === true) {
    todoItemClone.classList.add("text-decoration-line-through");
  }

  const btnDelete = todoItemClone.querySelector(".btn-delete");
  btnDelete.dataset.id = todo.id;

  todoList.appendChild(todoItemClone);
}

// Call method render
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
      completed: false,
      deleted: false,
    };

    fetch(API, {
      method: "POST", // sending
      headers: {
        // Type data sending
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(todoItem),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.log(err));

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
        fetch(API + todo.id, {
          method: "PATCH",
          body: JSON.stringify({ deleted: true }),
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
        })
          .then((res) => res.json())
          .then((data) => console.log(data))
          .catch((err) => console.log(err));
      });
  }
});

todoList.addEventListener("click", async (e) => {
  // delete one
  const btnDelete = e.target.closest(".btn-delete");
  const liElm = e.target.closest(".todo-item");
  let todoDb = await getTodoList();

  if (btnDelete) {
    const btnId = btnDelete.dataset.id;
    const todoItemElem = $(`li[data-id="${btnId}"]`);

    fetch(API + btnId, {
      method: "PATCH",
      body: JSON.stringify({
        deleted: true,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.log(err));

    todoItemElem.outerHTML = "";
  }

  // completed
  else if (liElm) {
    const todoId = liElm.dataset.id;

    if (liElm.dataset.completed === "false") {
      liElm.dataset.completed = true;
      liElm.classList.add("text-decoration-line-through");

      const todoIndex = todoDb.findIndex((todo) => {
        return todo.id == liElm.dataset.id;
      });

      fetch(API + todoId, {
        method: "PATCH",
        body: JSON.stringify({
          completed: true,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((error) => console.log(error));
    } else {
      liElm.dataset.completed = false;
      liElm.classList.remove("text-decoration-line-through");

      const todoIndex = todoDb.findIndex((todo) => {
        return todo.id === +liElm.dataset.id;
      });

      fetch(API + todoId, {
        method: "PATCH",
        body: JSON.stringify({
          completed: false,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((error) => console.log(error));
    }
  }
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
