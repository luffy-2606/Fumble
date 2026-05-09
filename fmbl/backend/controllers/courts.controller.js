const { sql, poolPromise } = require('../config/db');

// GET /api/courts - optional ?status=confirmed
const getAllBookings = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { status } = req.query;

        const request = pool.request();
        let query = `
            SELECT cr.booking_id, u.first_name, u.last_name, u.roll_number,
                   v.venue_name, s.sport_name,
                   cr.booking_date, cr.start_time, cr.end_time, cr.status, cr.created_at
            FROM Court_Registrations cr
            JOIN Users  u ON cr.user_id  = u.user_id
            JOIN Venues v ON cr.venue_id = v.venue_id
            JOIN Sports s ON v.sport_id  = s.sport_id`;

        if (status) {
            request.input('status', sql.VarChar, status);
            query += ' WHERE cr.status = @status';
        }
        query += ' ORDER BY cr.booking_date, cr.start_time';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/courts/:id
const getBookingById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT cr.*, u.first_name, u.last_name, v.venue_name
                    FROM Court_Registrations cr
                    JOIN Users  u ON cr.user_id  = u.user_id
                    JOIN Venues v ON cr.venue_id = v.venue_id
                    WHERE cr.booking_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Booking not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/courts
const createBooking = async (req, res) => {
    const { user_id, venue_id, booking_date, start_time, end_time } = req.body;
    if (!user_id || !venue_id || !booking_date || !start_time || !end_time)
        return res.status(400).json({ error: 'user_id, venue_id, booking_date, start_time, end_time required' });

    // Validate booking is for today
    const today = new Date().toISOString().split('T')[0];
    if (booking_date !== today) {
        return res.status(400).json({ error: 'Bookings can only be made for today.' });
    }

    // Validate booking time is between 9 AM and 5 PM
    if (start_time < '09:00' || end_time > '17:00' || start_time >= end_time) {
        return res.status(400).json({ error: 'Bookings must be between 09:00 and 17:00, and start time must be before end time.' });
    }

    // Enforce exactly 1 hour slot
    const startHour = parseInt(start_time.split(':')[0], 10);
    const startMinute = parseInt(start_time.split(':')[1], 10);
    const endHour = parseInt(end_time.split(':')[0], 10);
    const endMinute = parseInt(end_time.split(':')[1], 10);
    if (endHour - startHour !== 1 || startMinute !== 0 || endMinute !== 0) {
        return res.status(400).json({ error: 'Only exactly 1-hour slots starting on the hour (e.g. 09:00 to 10:00) are allowed.' });
    }

    try {
        const pool = await poolPromise;

        // Check if user already booked today
        const userQuota = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('booking_date', sql.Date, booking_date)
            .query(`SELECT booking_id FROM Court_Registrations 
                    WHERE user_id = @user_id 
                      AND booking_date = @booking_date 
                      AND status <> 'cancelled'`);
        if (userQuota.recordset.length > 0) {
            return res.status(409).json({ error: 'You are only allowed one court booking per day.' });
        }

        // Check for time-slot conflict
        const conflict = await pool.request()
            .input('venue_id', sql.Int, venue_id)
            .input('booking_date', sql.Date, booking_date)
            .input('start_time', sql.VarChar, start_time)
            .input('end_time', sql.VarChar, end_time)
            .query(`SELECT booking_id FROM Court_Registrations
                    WHERE venue_id     = @venue_id
                      AND booking_date = @booking_date
                      AND status      <> 'cancelled'
                      AND start_time  <  @end_time
                      AND end_time    >  @start_time`);

        if (conflict.recordset.length > 0) {
            return res.status(409).json({ error: 'Venue is already booked for this time slot' });
        }

        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('venue_id', sql.Int, venue_id)
            .input('booking_date', sql.Date, booking_date)
            .input('start_time', sql.VarChar, start_time)
            .input('end_time', sql.VarChar, end_time)
            .query(`INSERT INTO Court_Registrations (user_id, venue_id, booking_date, start_time, end_time)
                    OUTPUT INSERTED.*
                    VALUES (@user_id, @venue_id, @booking_date, @start_time, @end_time)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/courts/:id/status
const updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('status', sql.VarChar, status)
            .query(`UPDATE Court_Registrations SET status = @status
                    OUTPUT INSERTED.*
                    WHERE booking_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Booking not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/courts/:id
const deleteBooking = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Court_Registrations OUTPUT DELETED.booking_id WHERE booking_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Booking not found' });
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllBookings, getBookingById, createBooking, updateBookingStatus, deleteBooking };