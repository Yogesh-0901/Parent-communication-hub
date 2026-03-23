import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.ts';
import crypto from 'crypto';
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, linkedStudentId } = req.body;
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const id = crypto.randomUUID();
        db.prepare(`
      INSERT INTO users (id, name, email, password, role, linkedStudentId)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email, hashedPassword, role, linkedStudentId || null);
        const payload = { id, role, linkedStudentId: linkedStudentId || null };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id, name, email, role } });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = { id: user.id, role: user.role, linkedStudentId: user.linkedStudentId };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                linkedStudentId: user.linkedStudentId
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
router.get('/users', async (req, res) => {
    try {
        const users = db.prepare('SELECT id as _id, name, email, role, linkedStudentId FROM users').all();
        res.json(users);
    }
    catch (err) {
        res.status(500).send('Server error');
    }
});
export default router;
