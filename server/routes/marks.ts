import express from 'express';
import db from '../db.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import crypto from 'crypto';

const router = express.Router();

// Get marks for a student
router.get('/:studentId', authenticate, async (req: any, res) => {
  try {
    const { studentId } = req.params;
    const marks = db.prepare('SELECT * FROM semester_marks WHERE studentId = ? ORDER BY semester ASC').all(studentId);
    res.json(marks);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add/Update marks
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { studentId, semester, subject, internal1Score, internal1Max, internal2Score, internal2Max, externalScore, externalMax } = req.body;
    
    const existing = db.prepare('SELECT id FROM semester_marks WHERE studentId = ? AND semester = ? AND subject = ?').get(studentId, semester, subject) as { id: string } | undefined;

    const finalInt1 = internal1Score !== undefined ? internal1Score : 0;
    const finalInt1Max = internal1Max !== undefined ? internal1Max : 50;
    const finalInt2 = internal2Score !== undefined ? internal2Score : 0;
    const finalInt2Max = internal2Max !== undefined ? internal2Max : 50;
    const finalExt = externalScore !== undefined ? externalScore : 0;
    const finalExtMax = externalMax !== undefined ? externalMax : 100;
    const totalScore = finalInt1 + finalInt2 + finalExt;
    const totalMax = finalInt1Max + finalInt2Max + finalExtMax;

    if (existing) {
      db.prepare(`
        UPDATE semester_marks 
        SET score = ?, maxScore = ?, internal1Score = ?, internal1Max = ?, internal2Score = ?, internal2Max = ?, externalScore = ?, externalMax = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(totalScore, totalMax, finalInt1, finalInt1Max, finalInt2, finalInt2Max, finalExt, finalExtMax, existing.id);
      res.json({ message: 'Mark updated' });
    } else {
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO semester_marks (id, studentId, semester, subject, score, maxScore, internal1Score, internal1Max, internal2Score, internal2Max, externalScore, externalMax)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, studentId, semester, subject, totalScore, totalMax, finalInt1, finalInt1Max, finalInt2, finalInt2Max, finalExt, finalExtMax);
      res.status(201).json({ message: 'Mark added' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete a mark
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    db.prepare('DELETE FROM semester_marks WHERE id = ?').run(req.params.id);
    res.json({ message: 'Mark deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

export default router;
