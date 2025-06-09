import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST;
  const filename = isTest 
    ? ':memory:'
    : path.join(process.cwd(), 'data.sqlite');

  db = await open({
    filename,
    driver: sqlite3.Database
  });

  await initializeTables();
  return db;
}

async function initializeTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const database = await getDatabase();
  
  const result = await database.run(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash]
  );

  const user = await database.get<User>(
    'SELECT * FROM users WHERE id = ?',
    [result.lastID]
  );

  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const database = await getDatabase();
  
  const user = await database.get<User>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  return user || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const database = await getDatabase();
  
  const user = await database.get<User>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );

  return user || null;
}

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export async function createTodo(userId: number, title: string): Promise<Todo> {
  const database = await getDatabase();
  
  const result = await database.run(
    'INSERT INTO todos (user_id, title) VALUES (?, ?)',
    [userId, title]
  );

  const todo = await database.get<Todo>(
    'SELECT * FROM todos WHERE id = ?',
    [result.lastID]
  );

  if (!todo) {
    throw new Error('Failed to create todo');
  }

  return todo;
}

export async function getTodosByUserId(userId: number): Promise<Todo[]> {
  const database = await getDatabase();
  
  const todos = await database.all<Todo[]>(
    'SELECT * FROM todos WHERE user_id = ? ORDER BY id DESC',
    [userId]
  );

  return todos || [];
}

export async function updateTodo(id: number, userId: number, updates: Partial<Pick<Todo, 'title' | 'completed'>>): Promise<Todo | null> {
  const database = await getDatabase();
  
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  
  await database.run(
    `UPDATE todos SET ${fields} WHERE id = ? AND user_id = ?`,
    [...values, id, userId]
  );

  const todo = await database.get<Todo>(
    'SELECT * FROM todos WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  return todo || null;
}

export async function deleteTodo(id: number, userId: number): Promise<boolean> {
  const database = await getDatabase();
  
  const result = await database.run(
    'DELETE FROM todos WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  return (result.changes || 0) > 0;
}