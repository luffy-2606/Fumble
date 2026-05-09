const { sql, poolPromise } = require('../config/db');

const getAllItems = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT si.item_id, si.item_name, si.sport_id, si.total_qty, s.sport_name,
                   (si.total_qty - ISNULL(SUM(ii.quantity), 0)) AS available_qty
            FROM Sports_Items si
            LEFT JOIN Sports s ON si.sport_id = s.sport_id
            LEFT JOIN Item_Issuance ii ON si.item_id = ii.item_id AND ii.status IN ('issued', 'overdue')
            GROUP BY si.item_id, si.item_name, si.sport_id, si.total_qty, s.sport_name`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getItemById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT si.item_id, si.item_name, si.sport_id, si.total_qty, s.sport_name,
                           (si.total_qty - ISNULL(SUM(ii.quantity), 0)) AS available_qty
                    FROM Sports_Items si
                    LEFT JOIN Sports s ON si.sport_id = s.sport_id
                    LEFT JOIN Item_Issuance ii ON si.item_id = ii.item_id AND ii.status IN ('issued', 'overdue')
                    WHERE si.item_id = @id
                    GROUP BY si.item_id, si.item_name, si.sport_id, si.total_qty, s.sport_name`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Item not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createItem = async (req, res) => {
    const { item_name, sport_id, total_qty } = req.body;
    if (!item_name || total_qty == null) return res.status(400).json({ error: 'item_name and total_qty are required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('item_name', sql.VarChar, item_name)
            .input('sport_id', sql.Int, sport_id)
            .input('total_qty', sql.Int, total_qty)
            .query(`INSERT INTO Sports_Items (item_name, sport_id, total_qty)
                    OUTPUT INSERTED.*
                    VALUES (@item_name, @sport_id, @total_qty)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateItem = async (req, res) => {
    const { total_qty } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('total_qty', sql.Int, total_qty)
            .query(`UPDATE Sports_Items SET
                        total_qty     = ISNULL(@total_qty, total_qty)
                    OUTPUT INSERTED.*
                    WHERE item_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Item not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Sports_Items OUTPUT DELETED.item_id WHERE item_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem };