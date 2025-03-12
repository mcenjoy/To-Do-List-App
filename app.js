const inputTaskBox = document.querySelector('.todo-input');
const addNewTaskBtn = document.querySelector('.todo-add-new-task-button');
const deleteAllTaskBtn = document.querySelector('.clear-all');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todo');

document.addEventListener('DOMContentLoaded', showLocalTodos);

addNewTaskBtn.addEventListener('click', addTodo);
todoList.addEventListener('click', handleTaskActions);
filterOption.addEventListener('change', filterTodo);

inputTaskBox.addEventListener('keyup', () => {
  addNewTaskBtn.classList.toggle('active', inputTaskBox.value.trim() !== '');
});

function getTodosFromStorage() {
  return localStorage.getItem('todos')
    ? JSON.parse(localStorage.getItem('todos'))
    : { allTasks: [] };
}

function updatePendingCount() {
  const todos = getTodosFromStorage();
  const pendingCount = todos.allTasks.filter((task) => !task.completed).length;
  document.querySelector('.pendingTasks').textContent = pendingCount;
  deleteAllTaskBtn.classList.toggle('active', todos.allTasks.length !== 0);
}

function showLocalTodos() {
  const todos = getTodosFromStorage();
  todoList.innerHTML = '';

  todos.allTasks.forEach((task) => createTodoElement(task));

  updatePendingCount();
}

function filterTodo(e) {
  const filterValue = e.target.value;
  const todos = getTodosFromStorage().allTasks;

  todoList.innerHTML = '';

  todos.forEach((task) => {
    let shouldDisplay = true;

    if (filterValue === 'completed' && !task.completed) {
      shouldDisplay = false;
    } else if (filterValue === 'incomplete' && task.completed) {
      shouldDisplay = false;
    }

    if (shouldDisplay) {
      createTodoElement(task);
    }
  });
}

function addTodo() {
  const taskText = inputTaskBox.value.trim();
  if (!taskText) return;

  const todos = getTodosFromStorage();

  const task = {
    id: Date.now(),
    text: taskText,
    completed: false,
  };

  todos.allTasks.push(task);
  localStorage.setItem('todos', JSON.stringify(todos));

  createTodoElement(task);
  inputTaskBox.value = '';
  addNewTaskBtn.classList.remove('active');
  updatePendingCount();
}

function createTodoElement(task) {
  const todoDiv = document.createElement('div');
  todoDiv.classList.add('todo');
  if (task.completed) {
    todoDiv.classList.add('completed');
  }

  const completedIcon = task.completed
    ? '<i class="fa-solid fa-circle-check"></i>'
    : '<i class="fa-regular fa-circle"></i>';

  todoDiv.innerHTML = `
    <button class="complete-btn">${completedIcon}</i></button>
    <li class="todo-item">${task.text}</li>
    <button class="edit-btn"${
      task.completed ? 'disabled' : ''
    }><i class="fas fa-edit"></i></button>
    <button class="trash-btn"><i class="fas fa-trash"></i></button>
  `;

  todoDiv.dataset.id = task.id;
  todoList.appendChild(todoDiv);
}

function handleTaskActions(e) {
  const item = e.target;
  const todo = item.closest('.todo');
  if (!todo) return;

  const taskId = Number(todo.dataset.id);
  let todos = getTodosFromStorage();

  if (item.classList.contains('complete-btn')) {
    toggleTaskCompletion(taskId, todos);
  }

  if (item.classList.contains('edit-btn')) {
    editTask(taskId, todo, todos);
  }

  if (item.classList.contains('trash-btn')) {
    todos.allTasks = todos.allTasks.filter((task) => task.id !== taskId);
    todo.classList.add('slide');
    todo.addEventListener('transitionend', () => todo.remove());
  }

  localStorage.setItem('todos', JSON.stringify(todos));
  updatePendingCount();
}

function toggleTaskCompletion(taskId, todos) {
  todos.allTasks = todos.allTasks.map((task) => {
    if (task.id === taskId) {
      task.completed = !task.completed;
    }
    return task;
  });

  const todoElement = document.querySelector(`[data-id='${taskId}']`);
  if (todoElement) {
    const completeBtn = todoElement.querySelector('.complete-btn');
    const editBtn = todoElement.querySelector('.edit-btn');
    if (completeBtn) {
      if (todos.allTasks.find((task) => task.id === taskId).completed) {
        todoElement.classList.add('completed');
        completeBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        editBtn.disabled = true;
      } else {
        todoElement.classList.remove('completed');
        completeBtn.innerHTML = '<i class="fa-regular fa-circle"></i>';
        editBtn.disabled = false;
      }
    }
  }
  const filterValue = filterOption.value;
  if (shouldRemoveElement(filterValue, todoElement)) {
    todoElement.remove();
  }
}

function shouldRemoveElement(filterValue, todoElement) {
  switch (filterValue) {
    case 'incomplete':
      return todoElement.classList.contains('completed');
    case 'completed':
      return !todoElement.classList.contains('completed');
    default:
      return false;
  }
}

function editTask(taskId, todoElement, todos) {
  const taskItem = todoElement.querySelector('.todo-item');
  const currentText = taskItem.textContent;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.classList.add('edit-input');

  taskItem.replaceWith(input);
  input.focus();

  input.addEventListener('blur', () => {
    finishEdit(taskId, input.value.trim(), todoElement, todos);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      input.blur();
    } else if (event.key === 'Escape') {
      finishEdit(taskId, currentText, todoElement, todos);
    }
  });
}

function finishEdit(taskId, newText, todoElement, todos) {
  const taskItem = document.createElement('li');
  taskItem.classList.add('todo-item');
  taskItem.textContent = newText;

  const input = todoElement.querySelector('.edit-input');
  input.replaceWith(taskItem);

  if (newText) {
    todos.allTasks = todos.allTasks.map((task) => {
      if (task.id === taskId) {
        task.text = newText;
      }
      return task;
    });

    localStorage.setItem('todos', JSON.stringify(todos));
  }
}

deleteAllTaskBtn.onclick = () => {
  localStorage.removeItem('todos');
  todoList.innerHTML = '';
  updatePendingCount();
};
