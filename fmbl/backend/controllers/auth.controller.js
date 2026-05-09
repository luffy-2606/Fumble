const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fumble_secret_key', {
        expiresIn: '30d',
    });
};

// POST /api/auth/register
const registerUser = async (req, res) => {
    const { roll_number, first_name, last_name, email, phone, role, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const nuEmailRegex = /^[^\s@]+@[^\s@]+\.nu\.edu\.pk$/i;

    if (!roll_number || !first_name || !last_name || !normalizedEmail || !password) {
        return res.status(400).json({ error: 'Please provide all required fields (roll_number, first_name, last_name, email, password)' });
    }
    if (!nuEmailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: 'Only emails matching *@*.nu.edu.pk are allowed' });
    }

    try {
        const pool = await poolPromise;

        const userExists = await pool.request()
            .input('roll_number', sql.VarChar, roll_number)
            .input('email', sql.VarChar, normalizedEmail)
            .query('SELECT user_id FROM Users WHERE roll_number = @roll_number OR email = @email');

        if (userExists.recordset.length > 0) {
            return res.status(400).json({ error: 'User with this roll number or email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.request()
            .input('roll_number', sql.VarChar, roll_number)
            .input('first_name', sql.VarChar, first_name)
            .input('last_name', sql.VarChar, last_name)
            .input('email', sql.VarChar, normalizedEmail)
            .input('phone', sql.VarChar, phone || null)
            .input('role', sql.VarChar, role || 'student')
            .input('password_hash', sql.VarChar, hashedPassword)
            .query(`INSERT INTO Users (roll_number, first_name, last_name, email, phone, role, password_hash)
                    OUTPUT INSERTED.user_id, INSERTED.roll_number, INSERTED.first_name, INSERTED.last_name, INSERTED.email, INSERTED.role
                    VALUES (@roll_number, @first_name, @last_name, @email, @phone, @role, @password_hash)`);

        const newUser = result.recordset[0];

        res.status(201).json({
            user_id: newUser.user_id,
            roll_number: newUser.roll_number,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(newUser.user_id, newUser.role)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
    const { roll_number, password } = req.body;

    if (!roll_number || !password) {
        return res.status(400).json({ error: 'Please provide roll_number and password' });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('roll_number', sql.VarChar, roll_number)
            .query('SELECT user_id, roll_number, first_name, last_name, email, role, password_hash FROM Users WHERE roll_number = @roll_number');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.recordset[0];

        if (!user.password_hash) {
            return res.status(401).json({ error: 'Please contact admin to set up your password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            res.json({
                user_id: user.user_id,
                roll_number: user.roll_number,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                token: generateToken(user.user_id, user.role)
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/auth/me - requires protect middleware
const getMe = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.user.id)
            .query('SELECT user_id, roll_number, first_name, last_name, email, phone, role FROM Users WHERE user_id = @id');

        if (!result.recordset.length) return res.status(404).json({ error: 'User not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerUser, loginUser, getMe };