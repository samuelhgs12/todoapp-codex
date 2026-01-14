<template>
  <div class="app">
    <main class="card">
      <header class="header">
        <div>
          <h1>TodoApp</h1>
          <p>Organize suas tarefas em um só lugar.</p>
        </div>
        <span class="status">{{ completedCount }} concluídas</span>
      </header>

      <form class="add-form" @submit.prevent="handleAdd">
        <input
          v-model.trim="newTitle"
          type="text"
          placeholder="Digite uma nova tarefa"
          aria-label="Nova tarefa"
          required
        />
        <button type="submit">Adicionar</button>
      </form>

      <section class="todos" v-if="todos.length">
        <article v-for="todo in todos" :key="todo.id" class="todo" :class="{ completed: todo.completed }">
          <input type="checkbox" :checked="todo.completed" @change="toggleTodo(todo)" />

          <div>
            <template v-if="editingId === todo.id">
              <input
                v-model.trim="editingTitle"
                type="text"
                aria-label="Editar tarefa"
                @keyup.enter="saveEdit(todo)"
                @keyup.esc="cancelEdit"
              />
            </template>
            <template v-else>
              <div class="title">{{ todo.title }}</div>
            </template>
          </div>

          <div class="todo-actions">
            <button v-if="editingId !== todo.id" type="button" @click="startEdit(todo)">Editar</button>
            <button v-else type="button" @click="saveEdit(todo)">Salvar</button>
            <button v-if="editingId === todo.id" type="button" @click="cancelEdit">Cancelar</button>
            <button type="button" @click="removeTodo(todo)">Remover</button>
          </div>
        </article>
      </section>
      <p v-else class="empty">Nenhuma tarefa adicionada ainda.</p>

      <footer class="footer">
        As alterações são salvas automaticamente no banco de dados SQLite.
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
};

const todos = ref<Todo[]>([]);
const newTitle = ref('');
const editingId = ref<number | null>(null);
const editingTitle = ref('');

const completedCount = computed(() => todos.value.filter((todo) => todo.completed).length);

const fetchTodos = async () => {
  const response = await fetch('/api/todos');
  if (!response.ok) {
    throw new Error('Erro ao carregar tarefas.');
  }
  todos.value = await response.json();
};

const handleAdd = async () => {
  if (!newTitle.value) return;
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle.value }),
  });
  if (!response.ok) {
    return;
  }
  const todo = await response.json();
  todos.value.unshift(todo);
  newTitle.value = '';
};

const toggleTodo = async (todo: Todo) => {
  const response = await fetch(`/api/todos/${todo.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !todo.completed }),
  });
  if (!response.ok) {
    return;
  }
  const updated = await response.json();
  updateLocalTodo(updated);
};

const startEdit = (todo: Todo) => {
  editingId.value = todo.id;
  editingTitle.value = todo.title;
};

const cancelEdit = () => {
  editingId.value = null;
  editingTitle.value = '';
};

const saveEdit = async (todo: Todo) => {
  if (!editingTitle.value.trim()) return;
  const response = await fetch(`/api/todos/${todo.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: editingTitle.value }),
  });
  if (!response.ok) {
    return;
  }
  const updated = await response.json();
  updateLocalTodo(updated);
  cancelEdit();
};

const removeTodo = async (todo: Todo) => {
  const response = await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
  if (!response.ok) {
    return;
  }
  todos.value = todos.value.filter((item) => item.id !== todo.id);
};

const updateLocalTodo = (updated: Todo) => {
  const index = todos.value.findIndex((todo) => todo.id === updated.id);
  if (index === -1) return;
  todos.value[index] = updated;
};

onMounted(() => {
  fetchTodos().catch(() => {
    todos.value = [];
  });
});
</script>
