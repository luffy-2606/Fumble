const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('./config/db');

async function setAdminPassword() {
    try {
        const pool = await poolPromise;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const result = await pool.request()
            .input('roll_number', sql.VarChar, 'A00-0001')
            .input('password_hash', sql.VarChar, hashedPassword)
            .query('UPDATE Users SET password_hash = @password_hash WHERE roll_number = @roll_number');

        if (result.rowsAffected[0] > 0) {
            console.log('✅ Admin password set to: admin123');
            console.log('Admin Roll Number: A00-0001');
        } else {
            console.log('❌ Admin user (A00-0001) not found in database.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

setAdminPassword();
