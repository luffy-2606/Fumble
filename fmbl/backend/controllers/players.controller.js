const { sql, poolPromise } = require('../config/db');

// GET /api/players - optional ?sport_id=1&available=true
const getAllPlayers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { sport_id, available } = req.query;

        const request = pool.request();
        let query = `
            SELECT pp.profile_id, u.first_name, u.last_name, u.roll_number, u.email,
                   s.sport_name, pp.skill_level, pp.position, pp.is_available, pp.bio
            FROM Player_Profiles pp
            JOIN Users  u ON pp.user_id  = u.user_id
            JOIN Sports s ON pp.sport_id = s.sport_id
            WHERE 1=1`;

        if (sport_id) {
            request.input('sport_id', sql.Int, parseInt(sport_id));
            query += ' AND pp.sport_id = @sport_id';
        }
        if (available === 'true') {
            query += ' AND pp.is_available = 1';
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/players/:id
const getPlayerById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT pp.*, u.first_name, u.last_name, u.roll_number, u.email, s.sport_name
                    FROM Player_Profiles pp
                    JOIN Users  u ON pp.user_id  = u.user_id
                    JOIN Sports s ON pp.sport_id = s.sport_id
                    WHERE pp.profile_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Player profile not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/players
const createProfile = async (req, res) => {
    const { user_id, sport_id, skill_level, position, is_available, bio } = req.body;
    if (!user_id || !sport_id) return res.status(400).json({ error: 'user_id and sport_id are required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('sport_id', sql.Int, sport_id)
            .input('skill_level', sql.VarChar, skill_level || 'beginner')
            .input('position', sql.VarChar, position)
            .input('is_available', sql.Bit, is_available ?? 1)
            .input('bio', sql.Text, bio)
            .query(`INSERT INTO Player_Profiles (user_id, sport_id, skill_level, position, is_available, bio)
                    OUTPUT INSERTED.*
                    VALUES (@user_id, @sport_id, @skill_level, @position, @is_available, @bio)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/players/:id
const updateProfile = async (req, res) => {
    const { skill_level, position, is_available, bio } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('skill_level', sql.VarChar, skill_level)
            .input('position', sql.VarChar, position)
            .input('is_available', sql.Bit, is_available)
            .input('bio', sql.Text, bio)
            .query(`UPDATE Player_Profiles SET
                        skill_level  = ISNULL(@skill_level, skill_level),
                        position     = ISNULL(@position, position),
                        is_available = ISNULL(@is_available, is_available),
                        bio          = ISNULL(@bio, bio)
                    OUTPUT INSERTED.*
                    WHERE profile_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Profile not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/players/:id
const deleteProfile = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Player_Profiles OUTPUT DELETED.profile_id WHERE profile_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Profile not found' });
        res.json({ message: 'Profile deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllPlayers, getPlayerById, createProfile, updateProfile, deleteProfile };