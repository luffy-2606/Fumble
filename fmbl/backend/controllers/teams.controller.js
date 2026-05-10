const { sql, poolPromise } = require('../config/db');

// GET /api/teams - optional ?sport_id=1&status=pending|approved
const getAllTeams = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { sport_id, status } = req.query;
        const isAdmin = req.user?.role === 'admin';

        const request = pool.request();
        let conditions = [];

        if (sport_id) conditions.push(`t.sport_id = ${parseInt(sport_id)}`);

        // Students only see approved teams; admins can filter by status
        if (!isAdmin) {
            conditions.push(`t.status = 'approved'`);
        } else if (status) {
            request.input('status', sql.VarChar, status);
            conditions.push(`t.status = @status`);
        }

        let query = `
            SELECT t.team_id, t.team_name, s.sport_name,
                   (u.first_name + ' ' + u.last_name) AS captain_name, u.roll_number AS captain_roll,
                   t.created_at, t.status
            FROM Teams t
            JOIN Sports s ON t.sport_id   = s.sport_id
            JOIN Users  u ON t.captain_id = u.user_id`;

        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/teams/:id
const getTeamById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const team = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT t.*, s.sport_name, (u.first_name + ' ' + u.last_name) AS captain_name
                    FROM Teams t
                    JOIN Sports s ON t.sport_id   = s.sport_id
                    JOIN Users  u ON t.captain_id = u.user_id
                    WHERE t.team_id = @id`);
        if (!team.recordset.length) return res.status(404).json({ error: 'Team not found' });

        const members = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT u.user_id, u.full_name, u.roll_number
                    FROM Team_Members tm
                    JOIN Users u ON tm.user_id = u.user_id
                    WHERE tm.team_id = @id`);

        res.json({ ...team.recordset[0], members: members.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/teams
const createTeam = async (req, res) => {
    const { team_name, sport_id, captain_id } = req.body;
    if (!team_name || !sport_id || !captain_id)
        return res.status(400).json({ error: 'team_name, sport_id, and captain_id are required' });
    try {
        const pool = await poolPromise;
        // Admin-created teams are immediately approved; student-created are pending
        const initialStatus = req.user?.role === 'admin' ? 'approved' : 'pending';
        const result = await pool.request()
            .input('team_name', sql.VarChar, team_name)
            .input('sport_id', sql.Int, sport_id)
            .input('captain_id', sql.Int, captain_id)
            .input('status', sql.VarChar, initialStatus)
            .query(`INSERT INTO Teams (team_name, sport_id, captain_id, status)
                    OUTPUT INSERTED.*
                    VALUES (@team_name, @sport_id, @captain_id, @status)`);

        // Auto-add captain as member
        await pool.request()
            .input('team_id', sql.Int, result.recordset[0].team_id)
            .input('user_id', sql.Int, captain_id)
            .query('INSERT INTO Team_Members (team_id, user_id) VALUES (@team_id, @user_id)');

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/teams/:id/approve  (admin only)
const approveTeam = async (req, res) => {
    const { status } = req.body;
    const allowed = ['approved', 'pending', 'rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('status', sql.VarChar, status)
            .query(`UPDATE Teams SET status = @status OUTPUT INSERTED.* WHERE team_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Team not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/teams/:id/members - add a member
const addMember = async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('team_id', sql.Int, req.params.id)
            .input('user_id', sql.Int, user_id)
            .query(`INSERT INTO Team_Members (team_id, user_id)
                    OUTPUT INSERTED.*
                    VALUES (@team_id, @user_id)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/teams/:id/members/:userId - remove a member
const removeMember = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('team_id', sql.Int, req.params.id)
            .input('user_id', sql.Int, req.params.userId)
            .query(`DELETE FROM Team_Members OUTPUT DELETED.member_id
                    WHERE team_id = @team_id AND user_id = @user_id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Member not found in team' });
        res.json({ message: 'Member removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/teams/:id
const deleteTeam = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().input('id', sql.Int, req.params.id)
            .query('DELETE FROM Team_Members WHERE team_id = @id');
        const result = await pool.request().input('id', sql.Int, req.params.id)
            .query('DELETE FROM Teams OUTPUT DELETED.team_id WHERE team_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Team not found' });
        res.json({ message: 'Team deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/teams/opponents/:sport_id/:team_id - opponent search
const getOpponents = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('sport_id', sql.Int, req.params.sport_id)
            .input('team_id', sql.Int, req.params.team_id)
            .query(`SELECT t.team_id, t.team_name, (u.first_name + ' ' + u.last_name) AS captain_name
                    FROM Teams t
                    JOIN Users u ON t.captain_id = u.user_id
                    WHERE t.sport_id = @sport_id AND t.team_id <> @team_id`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllTeams, getTeamById, createTeam, approveTeam, addMember, removeMember, deleteTeam, getOpponents };