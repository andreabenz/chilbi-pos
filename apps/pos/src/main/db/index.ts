import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export const db = drizzle(process.env.DB_FILE_NAME!, { schema, casing: 'snake_case' });

export default function setupDatabase() {
  // Connect to the database
  // Setup IPC
  // ipcMain.on;
}
