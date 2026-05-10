/**
 * One-time migration: add approval workflow columns
 * Run: node alter-approval-columns.js
 */
const { poolPromise } = require('./config/db');

async function migrate() {
    try {
        const pool = await poolPromise;

        // 1. Add status column to Teams (if not exists)
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('Teams') AND name = 'status'
            )
            BEGIN
                ALTER TABLE Teams
                ADD status VARCHAR(20) DEFAULT 'approved'
                    CHECK (status IN ('pending', 'approved', 'rejected'));
            END
        `);
        console.log('✅  Teams.status column ready');

        // 2. Drop the existing CHECK constraint on Matches.status and recreate it
        //    to include 'pending_approval'
        const chkResult = await pool.request().query(`
            SELECT cc.name
            FROM sys.check_constraints cc
            JOIN sys.columns c
              ON cc.parent_column_id = c.column_id
             AND cc.parent_object_id = c.object_id
            WHERE cc.parent_object_id = OBJECT_ID('Matches')
              AND c.name = 'status'
        `);

        if (chkResult.recordset.length) {
            const constraintName = chkResult.recordset[0].name;
            await pool.request().query(
                `ALTER TABLE Matches DROP CONSTRAINT [${constraintName}]`
            );
            console.log(`✅  Dropped old Matches.status constraint: ${constraintName}`);
        }

        await pool.request().query(`
            ALTER TABLE Matches
            ADD CONSTRAINT chk_match_status
            CHECK (status IN ('pending_approval','scheduled','ongoing','completed','cancelled'))
        `);
        console.log('✅  Matches.status constraint updated');

        // 3. Set existing teams to 'approved' so they show to everyone
        await pool.request().query(`UPDATE Teams SET status = 'approved' WHERE status IS NULL`);
        console.log('✅  Existing teams set to approved');

        console.log('\n🎉 Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌  Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
