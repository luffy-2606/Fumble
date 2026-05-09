const { sql, poolPromise } = require('../config/db');

const getAllMatches = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT m.match_id, t.name AS tournament_name,
                   ta.team_name AS team_a, tb.team_name AS team_b,
                   tw.team_name AS winner,
                   m.match_date, m.match_time, m.status
            FROM Matches m
            LEFT JOIN Tournaments t  ON m.tournament_id = t.tournament_id
            JOIN Teams ta ON m.team_a_id = ta.team_id
            JOIN Teams tb ON m.team_b_id = tb.team_id
            LEFT JOIN Teams tw ON m.winner_id = tw.team_id
            ORDER BY m.match_date`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMatchById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT m.*, ta.team_name AS team_a_name, tb.team_name AS team_b_name,
                           tw.team_name AS winner_name, t.name AS tournament_name
                    FROM Matches m
                    LEFT JOIN Tournaments t  ON m.tournament_id = t.tournament_id
                    JOIN Teams ta ON m.team_a_id = ta.team_id
                    JOIN Teams tb ON m.team_b_id = tb.team_id
                    LEFT JOIN Teams tw ON m.winner_id = tw.team_id
                    WHERE m.match_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Match not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createMatch = async (req, res) => {
    const { tournament_id, team_a_id, team_b_id, match_date, match_time } = req.body;
    if (!team_a_id || !team_b_id) return res.status(400).json({ error: 'team_a_id and team_b_id are required' });
    if (team_a_id === team_b_id) return res.status(400).json({ error: 'Teams must be different' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('tournament_id', sql.Int, tournament_id)
            .input('team_a_id', sql.Int, team_a_id)
            .input('team_b_id', sql.Int, team_b_id)
            .input('match_date', sql.Date, match_date)
            .input('match_time', sql.VarChar, match_time)
            .query(`INSERT INTO Matches (tournament_id, team_a_id, team_b_id, match_date, match_time)
                    OUTPUT INSERTED.*
                    VALUES (@tournament_id, @team_a_id, @team_b_id, @match_date, @match_time)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/matches/:id/result - update winner and status
const updateMatchResult = async (req, res) => {
    const { winner_id, status } = req.body;
    const allowed = ['scheduled', 'ongoing', 'completed', 'cancelled'];
    if (status && !allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('winner_id', sql.Int, winner_id)
            .input('status', sql.VarChar, status)
            .query(`UPDATE Matches SET
                        winner_id = ISNULL(@winner_id, winner_id),
                        status    = ISNULL(@status, status)
                    OUTPUT INSERTED.*
                    WHERE match_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Match not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteMatch = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Matches OUTPUT DELETED.match_id WHERE match_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Match not found' });
        res.json({ message: 'Match deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllMatches, getMatchById, createMatch, updateMatchResult, deleteMatch };