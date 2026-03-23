import express from 'express';
import db from '../db.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import crypto from 'crypto';
import * as xlsx from 'xlsx';
const router = express.Router();
// Get attendance for a student
router.get('/:studentId', authenticate, (req, res) => {
    try {
        const { studentId } = req.params;
        const records = db.prepare('SELECT * FROM attendance_records WHERE studentId = ? ORDER BY date DESC').all(studentId);
        res.json(records);
    }
    catch (err) {
        res.status(500).send('Server error');
    }
});
// Admin gets all attendance for a date or general stats
router.get('/', authenticate, authorize(['admin']), (req, res) => {
    try {
        const records = db.prepare('SELECT a.*, s.name, s.rollNumber FROM attendance_records a JOIN students s ON a.studentId = s.id ORDER BY a.date DESC LIMIT 100').all();
        res.json(records);
    }
    catch (err) {
        res.status(500).send('Server error');
    }
});
// Admin marks attendance
router.post('/', authenticate, authorize(['admin']), (req, res) => {
    try {
        const { studentId, date, status } = req.body;
        const existing = db.prepare('SELECT id FROM attendance_records WHERE studentId = ? AND date = ?').get(studentId, date);
        if (existing) {
            db.prepare('UPDATE attendance_records SET status = ? WHERE id = ?').run(status, existing.id);
        }
        else {
            const id = crypto.randomUUID();
            db.prepare('INSERT INTO attendance_records (id, studentId, date, status) VALUES (?, ?, ?, ?)').run(id, studentId, date, status);
        }
        // Also update student total attendance %
        const allRecords = db.prepare('SELECT status FROM attendance_records WHERE studentId = ?').all(studentId);
        const present = allRecords.filter(r => r.status === 'Present').length;
        const percentage = allRecords.length > 0 ? Math.round((present / allRecords.length) * 100) : 0;
        db.prepare('UPDATE students SET attendance = ? WHERE id = ?').run(percentage, studentId);
        // Create In-App Notification (Announcement targeted to the student/parent)
        const announcementId = crypto.randomUUID();
        db.prepare(`
      INSERT INTO announcements (id, title, message, targetType, targetId)
      VALUES (?, ?, ?, ?, ?)
    `).run(announcementId, `Daily Attendance Update - ${date}`, `Your child's attendance for ${date} has been marked as: ${status}. Current Attendance Percentage: ${percentage}%`, 'student', studentId);
        res.json({ message: 'Attendance marked and notification sent' });
    }
    catch (err) {
        res.status(500).send('Server error');
    }
});
// Export attendance & send to parents (simulation)
router.post('/export-and-send', authenticate, authorize(['admin']), (req, res) => {
    try {
        const { date } = req.body;
        const records = db.prepare('SELECT s.name, s.rollNumber, a.status FROM attendance_records a JOIN students s ON a.studentId = s.id WHERE a.date = ?').all(date);
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(records);
        xlsx.utils.book_append_sheet(wb, ws, `Attendance_${date}`);
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        // Simulated email sending logic would go here.
        console.log(`Sending attendance report for ${date} to all parents...`);
        res.setHeader('Content-Disposition', `attachment; filename=attendance_${date}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    }
    catch (err) {
        res.status(500).send('Server error');
    }
});
export default router;
