const { sql, poolPromise } = require('../config/db');

// GET /api/issuance - optional ?status=issued|overdue|returned
const getAllIssuances = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { status } = req.query;

        const request = pool.request();
        let query = `
            SELECT ii.issuance_id, u.first_name, u.last_name, u.roll_number,
                   si.item_name, ii.quantity,
                   ii.issued_at, ii.due_date, ii.returned_at, ii.status
            FROM Item_Issuance ii
            JOIN Users        u  ON ii.user_id = u.user_id
            JOIN Sports_Items si ON ii.item_id = si.item_id`;

        if (status) {
            request.input('status', sql.VarChar, status);
            query += ' WHERE ii.status = @status';
        }
        query += ' ORDER BY ii.due_date';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/issuance/:id
const getIssuanceById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT ii.*, u.first_name, u.last_name, si.item_name
                    FROM Item_Issuance ii
                    JOIN Users        u  ON ii.user_id = u.user_id
                    JOIN Sports_Items si ON ii.item_id = si.item_id
                    WHERE ii.issuance_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Issuance not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/issuance - issue an item
const issueItem = async (req, res) => {
    const { user_id, item_id, quantity, due_date } = req.body;
    if (!user_id || !item_id || !due_date)
        return res.status(400).json({ error: 'user_id, item_id, and due_date are required' });

    const qty = quantity || 1;

    try {
        const pool = await poolPromise;

        // check available stock
        const stockCheck = await pool.request()
            .input('item_id', sql.Int, item_id)
            .query(`SELECT si.total_qty, si.item_name,
                           (si.total_qty - ISNULL(SUM(ii.quantity), 0)) AS available_qty
                    FROM Sports_Items si
                    LEFT JOIN Item_Issuance ii ON si.item_id = ii.item_id AND ii.status IN ('issued', 'overdue')
                    WHERE si.item_id = @item_id
                    GROUP BY si.item_id, si.item_name, si.total_qty`);

        if (!stockCheck.recordset.length) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const { available_qty, item_name } = stockCheck.recordset[0];
        if (available_qty < qty) {
            return res.status(409).json({
                error: `Insufficient stock. Requested: ${qty}, Available: ${available_qty} (${item_name})`
            });
        }

        // We don't decrease available_qty anymore because it's dynamically calculated.

        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('item_id', sql.Int, item_id)
            .input('quantity', sql.Int, qty)
            .input('due_date', sql.Date, due_date)
            .query(`INSERT INTO Item_Issuance (user_id, item_id, quantity, due_date)
                    OUTPUT INSERTED.*
                    VALUES (@user_id, @item_id, @quantity, @due_date)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/issuance/:id/return - return an item
const returnItem = async (req, res) => {
    try {
        const pool = await poolPromise;
        const fetch = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Item_Issuance WHERE issuance_id = @id');
        if (!fetch.recordset.length) return res.status(404).json({ error: 'Issuance not found' });

        const { item_id, quantity, status } = fetch.recordset[0];
        if (status === 'returned') return res.status(400).json({ error: 'Already returned' });

        // We don't restore available_qty manually anymore.

        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`UPDATE Item_Issuance
                    SET status = 'returned', returned_at = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE issuance_id = @id`);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/issuance/:id
const deleteIssuance = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Item_Issuance OUTPUT DELETED.issuance_id WHERE issuance_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Issuance not found' });
        res.json({ message: 'Issuance deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllIssuances, getIssuanceById, issueItem, returnItem, deleteIssuance };