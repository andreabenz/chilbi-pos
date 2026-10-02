import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * Global Drizzle ORM database instance initialized with SQLite LibSQL driver.
 */
export const db = drizzle(process.env.DB_FILE_NAME!, { schema, casing: 'snake_case' });

/**
 * Placeholder for future database setup procedures.
 */
export default function setupDatabase() {
  // Connect to the database
  // Setup IPC
  // ipcMain.on;
}
