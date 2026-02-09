// Database client for Vercel Postgres

import { sql } from '@vercel/postgres';

export { sql };

// Helper function to safely query the database
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const result = await sql.query(text, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize database (run schema)
export async function initializeDatabase(): Promise<void> {
  try {
    // This would be called once to set up the database
    // In production, you'd run the schema.sql file manually or via migration
    console.log('Database initialization would happen here');
    console.log('Run the schema.sql file in your Vercel Postgres dashboard');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}
