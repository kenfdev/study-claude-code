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