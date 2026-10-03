import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';

/**
 * Returns the absolute SQLite database file path.
 * In production: Uses Electron's userData folder.
 * In development: Uses local project root or process.env.DB_FILE_NAME.
 */
export function getDatabasePath(): string {
  if (app && app.isPackaged) {
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    return path.join(userDataPath, 'chilbi.db');
  }

  const envUrl = process.env.DB_FILE_NAME || 'file:chilbi.db';
  return envUrl.startsWith('file:') ? envUrl.slice(5) : envUrl;
}

const dbFilePath = getDatabasePath();
const client = createClient({
  url: `file:${path.resolve(dbFilePath)}`,
});

export const db = drizzle(client, { schema, casing: 'snake_case' });
/**
 * Placeholder for future database setup procedures.
 */
export default function setupDatabase() {
  // Connect to the database
  // Setup IPC
  // ipcMain.on;
}
