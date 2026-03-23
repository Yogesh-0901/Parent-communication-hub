import express from 'express';
import db from '../db.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import * as xlsx from 'xlsx';
import crypto from 'crypto';
const router = express.Router();
// CRUD Operations
router.get('/', authenticate, async (req, res) => {
    try {
        const students = db.prepare('SELECT * FROM students').all();
        const formatted = students.map(s => ({
            ...s,
            _id: s.id,
            marks: JSON.parse(s.marks || '[]'),
            aiFeedback: JSON.parse(s.aiFeedback || '{}')
        }));
        res.json(formatted);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { name, rollNumber, department, marks, attendance, behavior, parentId, parentName, parentEmail, aiFeedback } = req.body;
        const id = crypto.randomUUID();
        db.prepare(`
      INSERT INTO students (id, name, rollNumber, department, marks, attendance, behavior, parentId, parentName, parentEmail, aiFeedback)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, rollNumber, department, JSON.stringify(marks || []), attendance || 0, behavior || 'Good', parentId || null, parentName || null, parentEmail || null, JSON.stringify(aiFeedback || {}));
        const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
        res.status(201).json({
            ...student,
            _id: student.id,
            marks: JSON.parse(student.marks || '[]'),
            aiFeedback: JSON.parse(student.aiFeedback || '{}')
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { name, rollNumber, department, marks, attendance, behavior, parentId, parentName, parentEmail, aiFeedback } = req.body;
        db.prepare(`
      UPDATE students 
      SET name = ?, rollNumber = ?, department = ?, marks = ?, attendance = ?, behavior = ?, parentId = ?, parentName = ?, parentEmail = ?, aiFeedback = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, rollNumber, department, JSON.stringify(marks || []), attendance || 0, behavior || 'Good', parentId || null, parentName || null, parentEmail || null, JSON.stringify(aiFeedback || {}), req.params.id);
        const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
        if (!student)
            return res.status(404).json({ message: 'Student not found' });
        res.json({
            ...student,
            _id: student.id,
            marks: JSON.parse(student.marks || '[]'),
            aiFeedback: JSON.parse(student.aiFeedback || '{}')
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const studentId = req.params.id;
        // Delete child records first to avoid constraint validation
        db.prepare('DELETE FROM semester_marks WHERE studentId = ?').run(studentId);
        db.prepare('DELETE FROM attendance_records WHERE studentId = ?').run(studentId);
        db.prepare("DELETE FROM announcements WHERE targetType = 'student' AND targetId = ?").run(studentId);
        // Finally delete student
        db.prepare('DELETE FROM students WHERE id = ?').run(studentId);
        res.json({ message: 'Student deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
// Excel Export
router.get('/export', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const students = db.prepare('SELECT * FROM students').all();
        const data = students.map(s => {
            const ai = JSON.parse(s.aiFeedback || '{}');
            return {
                'Student Name': s.name,
                'Roll Number': s.rollNumber,
                'Department': s.department,
                'Attendance (%)': s.attendance,
                'Behavior': s.behavior,
                'Strengths': ai.strengths?.join(', ') || '',
                'Weaknesses': ai.weaknesses?.join(', ') || '',
                'Suggestions': ai.suggestions?.join(', ') || ''
            };
        });
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, 'Students');
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', 'attachment; filename=students_report.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
export default router;
