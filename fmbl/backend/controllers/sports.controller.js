const { sql, poolPromise } = require('../config/db');

const getAllSports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Sports');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getSportById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Sports WHERE sport_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Sport not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createSport = async (req, res) => {
    const { sport_name, max_team_size, min_team_size } = req.body;
    if (!sport_name || !max_team_size || !min_team_size)
        return res.status(400).json({ error: 'sport_name, max_team_size, and min_team_size are required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('sport_name', sql.VarChar, sport_name)
            .input('max_team_size', sql.Int, max_team_size)
            .input('min_team_size', sql.Int, min_team_size)
            .query(`INSERT INTO Sports (sport_name, max_team_size, min_team_size)
                    OUTPUT INSERTED.*
                    VALUES (@sport_name, @max_team_size, @min_team_size)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateSport = async (req, res) => {
    const { max_team_size, min_team_size } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('max_team_size', sql.Int, max_team_size)
            .input('min_team_size', sql.Int, min_team_size)
            .query(`UPDATE Sports SET
                        max_team_size = ISNULL(@max_team_size, max_team_size),
                        min_team_size = ISNULL(@min_team_size, min_team_size)
                    OUTPUT INSERTED.*
                    WHERE sport_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Sport not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteSport = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Sports OUTPUT DELETED.sport_id WHERE sport_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Sport not found' });
        res.json({ message: 'Sport deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllSports, getSportById, createSport, updateSport, deleteSport };