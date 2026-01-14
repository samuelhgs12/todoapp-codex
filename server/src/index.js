import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'todos.db');

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )`
  );
});

const app = express();
app.use(cors());
app.use(express.json());

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

const mapTodo = (row) => ({
  id: row.id,
  title: row.title,
  completed: Boolean(row.completed),
  createdAt: row.created_at,
});

app.get('/api/todos', async (_req, res) => {
  try {
    const rows = await allAsync('SELECT * FROM todos ORDER BY id DESC');
    res.json(rows.map(mapTodo));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar tarefas.' });
  }
});

app.post('/api/todos', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string') {
    res.status(400).json({ message: 'Título é obrigatório.' });
    return;
  }
  try {
    const createdAt = new Date().toISOString();
    const result = await runAsync(
      'INSERT INTO todos (title, completed, created_at) VALUES (?, ?, ?)',
      [title.trim(), 0, createdAt]
    );
    const row = await getAsync('SELECT * FROM todos WHERE id = ?', [result.id]);
    res.status(201).json(mapTodo(row));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar tarefa.' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    const existing = await getAsync('SELECT * FROM todos WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ message: 'Tarefa não encontrada.' });
      return;
    }
    const nextTitle = typeof title === 'string' ? title.trim() : existing.title;
    const nextCompleted = typeof completed === 'boolean' ? completed : Boolean(existing.completed);
    await runAsync('UPDATE todos SET title = ?, completed = ? WHERE id = ?', [
      nextTitle,
      nextCompleted ? 1 : 0,
      id,
    ]);
    const updated = await getAsync('SELECT * FROM todos WHERE id = ?', [id]);
    res.json(mapTodo(updated));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar tarefa.' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await runAsync('DELETE FROM todos WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover tarefa.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`TodoApp API rodando na porta ${PORT}`);
});
