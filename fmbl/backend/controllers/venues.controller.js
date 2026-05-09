const { sql, poolPromise } = require('../config/db');

const getAllVenues = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT v.*, s.sport_name FROM Venues v
            JOIN Sports s ON v.sport_id = s.sport_id`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getVenueById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT v.*, s.sport_name FROM Venues v
                    JOIN Sports s ON v.sport_id = s.sport_id
                    WHERE v.venue_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Venue not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createVenue = async (req, res) => {
    const { venue_name, sport_id, location, capacity } = req.body;
    if (!venue_name || !sport_id) return res.status(400).json({ error: 'venue_name and sport_id are required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('venue_name', sql.VarChar, venue_name)
            .input('sport_id', sql.Int, sport_id)
            .input('location', sql.VarChar, location)
            .input('capacity', sql.Int, capacity)
            .query(`INSERT INTO Venues (venue_name, sport_id, location, capacity)
                    OUTPUT INSERTED.*
                    VALUES (@venue_name, @sport_id, @location, @capacity)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateVenueAvailability = async (req, res) => {
    const { is_available } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('is_available', sql.Bit, is_available)
            .query(`UPDATE Venues SET is_available = @is_available
                    OUTPUT INSERTED.*
                    WHERE venue_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Venue not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteVenue = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Venues OUTPUT DELETED.venue_id WHERE venue_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Venue not found' });
        res.json({ message: 'Venue deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllVenues, getVenueById, createVenue, updateVenueAvailability, deleteVenue };