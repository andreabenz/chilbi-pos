import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

export const db = drizzle(process.env.DB_FILE_NAME!, { casing: 'snake_case' });

export default function setupDatabase() {
  // Connect to the database
  // Setup IPC
  // ipcMain.on;
}
