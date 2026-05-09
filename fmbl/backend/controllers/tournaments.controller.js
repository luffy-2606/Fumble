const { sql, poolPromise } = require('../config/db');

// GET /api/tournaments - optional ?status=approved
const getAllTournaments = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { status } = req.query;

        const request = pool.request();
        let query = `
            SELECT t.tournament_id, t.name, s.sport_name,
                   (u.first_name + ' ' + u.last_name) AS organizer_name, v.venue_name,
                   t.start_date, t.end_date, t.status
            FROM Tournaments t
            JOIN Sports s ON t.sport_id     = s.sport_id
            JOIN Users  u ON t.organizer_id = u.user_id
            LEFT JOIN Venues v ON t.venue_id = v.venue_id`;

        if (status) {
            request.input('status', sql.VarChar, status);
            query += ' WHERE t.status = @status';
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/tournaments/:id - includes registered teams
const getTournamentById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const tourney = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT t.*, s.sport_name, (u.first_name + ' ' + u.last_name) AS organizer_name, v.venue_name
                    FROM Tournaments t
                    JOIN Sports s ON t.sport_id     = s.sport_id
                    JOIN Users  u ON t.organizer_id = u.user_id
                    LEFT JOIN Venues v ON t.venue_id = v.venue_id
                    WHERE t.tournament_id = @id`);
        if (!tourney.recordset.length) return res.status(404).json({ error: 'Tournament not found' });

        const teams = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT tr.reg_id, tm.team_name, tr.status, tr.registered_at
                    FROM Tournament_Registrations tr
                    JOIN Teams tm ON tr.team_id = tm.team_id
                    WHERE tr.tournament_id = @id`);

        res.json({ ...tourney.recordset[0], registrations: teams.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/tournaments
const createTournament = async (req, res) => {
    const { name, sport_id, organizer_id, start_date, end_date, venue_id } = req.body;
    if (!name || !sport_id || !organizer_id)
        return res.status(400).json({ error: 'name, sport_id, and organizer_id are required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.VarChar, name)
            .input('sport_id', sql.Int, sport_id)
            .input('organizer_id', sql.Int, organizer_id)
            .input('start_date', sql.Date, start_date)
            .input('end_date', sql.Date, end_date)
            .input('venue_id', sql.Int, venue_id)
            .query(`INSERT INTO Tournaments (name, sport_id, organizer_id, start_date, end_date, venue_id)
                    OUTPUT INSERTED.*
                    VALUES (@name, @sport_id, @organizer_id, @start_date, @end_date, @venue_id)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/tournaments/:id/status
const updateTournamentStatus = async (req, res) => {
    const { status } = req.body;
    const allowed = ['proposed', 'approved', 'ongoing', 'completed', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('status', sql.VarChar, status)
            .query(`UPDATE Tournaments SET status = @status
                    OUTPUT INSERTED.*
                    WHERE tournament_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Tournament not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/tournaments/:id/register
const registerTeam = async (req, res) => {
    const { team_id } = req.body;
    if (!team_id) return res.status(400).json({ error: 'team_id required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('tournament_id', sql.Int, req.params.id)
            .input('team_id', sql.Int, team_id)
            .query(`INSERT INTO Tournament_Registrations (tournament_id, team_id)
                    OUTPUT INSERTED.*
                    VALUES (@tournament_id, @team_id)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/tournaments/registrations/:reg_id/status
const updateRegistrationStatus = async (req, res) => {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'disqualified'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('reg_id', sql.Int, req.params.reg_id)
            .input('status', sql.VarChar, status)
            .query(`UPDATE Tournament_Registrations SET status = @status
                    OUTPUT INSERTED.*
                    WHERE reg_id = @reg_id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Registration not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/tournaments/:id
const deleteTournament = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Tournaments OUTPUT DELETED.tournament_id WHERE tournament_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Tournament not found' });
        res.json({ message: 'Tournament deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllTournaments, getTournamentById, createTournament,
    updateTournamentStatus, registerTeam, updateRegistrationStatus, deleteTournament
};