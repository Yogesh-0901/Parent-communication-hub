import express from 'express';
import db from '../db.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import crypto from 'crypto';
const router = express.Router();
// Get announcements for a user
router.get('/', authenticate, async (req, res) => {
    try {
        const { role, linkedStudentId } = req.user;
        let announcements;
        if (role === 'admin') {
            announcements = db.prepare('SELECT * FROM announcements ORDER BY createdAt DESC').all();
        }
        else {
            // For students and parents, show 'all' and those targeted to their studentId
            const studentId = linkedStudentId;
            announcements = db.prepare(`
        SELECT * FROM announcements 
        WHERE targetType = 'all' 
        OR (targetType = 'student' AND targetId = ?)
        ORDER BY createdAt DESC
      `).all(studentId);
        }
        res.json(announcements);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// Create announcement
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { title, message, targetType, targetId } = req.body;
        const id = crypto.randomUUID();
        db.prepare(`
      INSERT INTO announcements (id, title, message, targetType, targetId)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, title, message, targetType, targetId || null);
        const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
        res.status(201).json(announcement);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// Edit announcement
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { title, message, targetType, targetId } = req.body;
        db.prepare(`
      UPDATE announcements 
      SET title = ?, message = ?, targetType = ?, targetId = ?
      WHERE id = ?
    `).run(title, message, targetType, targetId || null, req.params.id);
        const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
        res.json(announcement);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// Delete announcement
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
        res.json({ message: 'Announcement deleted' });
    }
    catch (err) {
        res.status(500).send('Server error');
    }
});
export default router;
