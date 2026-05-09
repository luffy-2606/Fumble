const { poolPromise } = require('./config/db');

async function alterTable() {
  try {
    const pool = await poolPromise;
    
    const result = await pool.request().query(`
      IF NOT EXISTS (
        SELECT *
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'password_hash'
      )
      BEGIN
        ALTER TABLE Users
        ADD password_hash VARCHAR(255) NULL;
        PRINT 'password_hash column added';
      END
      ELSE
      BEGIN
        PRINT 'password_hash column already exists';
      END
    `);
    
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
}
alterTable();
