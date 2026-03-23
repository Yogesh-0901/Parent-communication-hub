import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.ts';
import crypto from 'crypto';
const router = express.Router();
router.post('/seed', async (req, res) => {
    try {
        // Clear existing data (respect foreign key dependencies)
        db.prepare('DELETE FROM messages').run();
        db.prepare('DELETE FROM semester_marks').run();
        db.prepare('DELETE FROM attendance_records').run();
        db.prepare('DELETE FROM assignments').run();
        db.prepare('DELETE FROM announcements').run();
        db.prepare('DELETE FROM students').run();
        db.prepare('DELETE FROM users').run();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        // Create Admin
        const adminId = crypto.randomUUID();
        db.prepare(`
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, 'Admin Staff', 'admin@college.edu', hashedPassword, 'admin');
        // Create Students
        const student1Id = crypto.randomUUID();
        const student1Marks = [
            { subject: 'Coding', score: 90, maxScore: 100 },
            { subject: 'Math', score: 65, maxScore: 100 },
            { subject: 'Physics', score: 80, maxScore: 100 }
        ];
        const student1AI = {
            strengths: ['Strong coding skills', 'Logical thinking'],
            weaknesses: ['Needs improvement in Math'],
            suggestions: ['Practice more calculus problems']
        };
        db.prepare(`
      INSERT INTO students (id, name, rollNumber, department, marks, attendance, behavior, aiFeedback, parentName, parentEmail, parentPhone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(student1Id, 'John Doe', 'CS101', 'Computer Science', JSON.stringify(student1Marks), 82, 'Excellent', JSON.stringify(student1AI), 'Mr. Doe', 'parent1@example.com', '+1234567890');
        const student2Id = crypto.randomUUID();
        const student2Marks = [
            { subject: 'Coding', score: 75, maxScore: 100 },
            { subject: 'Math', score: 85, maxScore: 100 },
            { subject: 'Physics', score: 70, maxScore: 100 }
        ];
        const student2AI = {
            strengths: ['Good at Math', 'Consistent performer'],
            weaknesses: ['Low attendance'],
            suggestions: ['Attend 3 more classes to reach 75%']
        };
        db.prepare(`
      INSERT INTO students (id, name, rollNumber, department, marks, attendance, behavior, aiFeedback, parentName, parentEmail, parentPhone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(student2Id, 'Jane Smith', 'CS102', 'Computer Science', JSON.stringify(student2Marks), 68, 'Good', JSON.stringify(student2AI), 'Mrs. Smith', 'parent2@example.com', '+0987654321');
        // Create Parents
        const parent1Id = crypto.randomUUID();
        db.prepare(`
      INSERT INTO users (id, name, email, password, role, linkedStudentId)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(parent1Id, 'Mr. Doe', 'parent1@example.com', hashedPassword, 'parent', student1Id);
        const parent2Id = crypto.randomUUID();
        db.prepare(`
      INSERT INTO users (id, name, email, password, role, linkedStudentId)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(parent2Id, 'Mrs. Smith', 'parent2@example.com', hashedPassword, 'parent', student2Id);
        // Seed Marks
        const mark1Id = crypto.randomUUID();
        db.prepare(`
      INSERT INTO semester_marks (id, studentId, semester, subject, score, maxScore)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(mark1Id, student1Id, 'Semester 1', 'Mathematics', 85, 100);
        const mark2Id = crypto.randomUUID();
        db.prepare(`
      INSERT INTO semester_marks (id, studentId, semester, subject, score, maxScore)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(mark2Id, student1Id, 'Semester 1', 'Computer Science', 92, 100);
        // Seed Announcements
        const ann1Id = crypto.randomUUID();
        db.prepare(`
      INSERT INTO announcements (id, title, message, targetType)
      VALUES (?, ?, ?, ?)
    `).run(ann1Id, 'Welcome to ParentHub', 'We are excited to launch our new communication portal for parents and students.', 'all');
        res.json({ message: 'Database seeded successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
export default router;
