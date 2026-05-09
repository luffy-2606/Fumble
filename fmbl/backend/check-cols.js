const { poolPromise } = require('./config/db');

async function getCols() {
  const pool = await poolPromise;
  const result = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users'");
  process.exit(0);
}
getCols();
