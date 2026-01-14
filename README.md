# TodoApp Codex

Aplicação web de lista de tarefas construída com Vue 3 + Vite no front-end e Node.js + Express + SQLite no back-end.

## ✅ Fluxo de trabalho proposto

1. **Backend**: expor uma API REST com SQLite para persistir as tarefas.
2. **Frontend**: consumir a API e permitir criar, editar, concluir e remover tarefas.
3. **Integração local**: o Vite faz proxy para a API durante o desenvolvimento.
4. **Documentação**: instruções de execução e comandos para cada parte.

## ✅ Histórias atendidas

- Adicionar nova tarefa.
- Editar tarefa existente.
- Marcar tarefa como concluída.
- Remover tarefa.

## Requisitos

- Node.js 18+
- npm

## Backend (Express + SQLite)

```bash
cd server
npm install
npm run dev
```

A API ficará disponível em `http://localhost:3001`.

## Frontend (Vue 3 + Vite)

```bash
cd client
npm install
npm run dev
```

A aplicação web ficará disponível em `http://localhost:5173`.

## Endpoints

- `GET /api/todos`
- `POST /api/todos` `{ "title": "Minha tarefa" }`
- `PUT /api/todos/:id` `{ "title": "Novo título", "completed": true }`
- `DELETE /api/todos/:id`
