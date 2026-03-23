import express from 'express';
import db from '../db.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import crypto from 'crypto';

const router = express.Router();

// Get assignments
router.get('/', authenticate, (req: any, res) => {
  try {
    const assignments = db.prepare('SELECT * FROM assignments ORDER BY dueDate ASC').all();
    if (req.user.role === 'admin') {
      res.json(assignments);
    } else {
      // Filter for student
      const filtered = assignments.filter((a: any) => a.assignedTo === 'all' || a.assignedTo === req.user.linkedStudentId);
      res.json(filtered);
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create assignment
router.post('/', authenticate, authorize(['admin']), (req, res) => {
  try {
    const { title, description, subject, dueDate, assignedTo } = req.body;
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO assignments (id, title, description, subject, dueDate, assignedTo) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, title, description, subject, dueDate, assignedTo || 'all');
    
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete assignment
router.delete('/:id', authenticate, authorize(['admin']), (req, res) => {
  try {
    db.prepare('DELETE FROM assignments WHERE id = ?').run(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

export default router;
