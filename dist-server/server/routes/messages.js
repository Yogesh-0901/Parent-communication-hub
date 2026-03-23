import express from 'express';
import db from '../db.ts';
import { authenticate } from '../middleware/auth.ts';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
const router = express.Router();
async function sendNotification(email, msg) {
    try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await transporter.sendMail({
            from: '"Parent Hub Admin" <admin@parenthub.com>',
            to: email,
            subject: "New Administrative Message",
            text: msg,
        });
        console.log("Email Notification Sent: %s", nodemailer.getTestMessageUrl(info));
    }
    catch (err) {
        console.error("Nodemailer error:", err);
    }
}
router.get('/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentRole = req.user.role;
        const currentUserId = req.user.role === 'admin' ? req.user.id : (req.user.role === 'parent' ? 'parent_' + req.user.linkedStudentId : 'student_' + req.user.linkedStudentId);
        const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (senderId = ? AND receiverId = ?) 
      OR (senderId = ? AND receiverId = ?)
      OR (receiverId = 'all' AND (? = 'all' OR ? LIKE 'parent_%' OR ? = 'parent'))
      OR (receiverId = 'all_students' AND (? = 'all_students' OR ? LIKE 'student_%' OR ? = 'student'))
      ORDER BY timestamp ASC
    `).all(currentUserId, userId, userId, currentUserId, userId, userId, currentRole, userId, userId, currentRole);
        res.json(messages);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
router.post('/translate', authenticate, async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;
        const langMap = {
            'Tamil': 'ta',
            'Hindi': 'hi',
            'Telugu': 'te',
            'Malayalam': 'ml',
            'Kannada': 'kn',
            'Spanish': 'es',
            'French': 'fr'
        };
        const tl = langMap[targetLanguage] || 'ta';
        // First try the free Google Translate API which requires no API key!
        try {
            const fetch = (await import('node-fetch')).default || globalThis.fetch;
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
            const gRes = await fetch(url);
            const data = await gRes.json();
            if (data && data[0] && Array.isArray(data[0])) {
                const translatedText = data[0].map((t) => t[0]).join('');
                return res.json({ translation: translatedText });
            }
        }
        catch (apiErr) {
            console.error('Free API failed, falling back to gemini...', apiErr);
        }
        // Safety fallback to Gemini if Free API structurally fails
        if (process.env.GEMINI_API_KEY) {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Translate the following text strictly into ${targetLanguage}. Do not output any conversational text, just the direct translation:\n\n"${text}"`,
            });
            return res.json({ translation: response.text?.replace(/"/g, '').trim() });
        }
        res.json({ translation: `[Demo: Translated to ${targetLanguage}]: ${text}` });
    }
    catch (err) {
        console.error('Translation error:', err);
        res.json({ translation: `[Translated]: ${req.body.text}` });
    }
});
router.post('/', authenticate, async (req, res) => {
    try {
        const { receiverId, message, fileUrl, fileName, fileType } = req.body;
        const senderId = req.user.role === 'admin' ? req.user.id : (req.user.role === 'parent' ? 'parent_' + req.user.linkedStudentId : 'student_' + req.user.linkedStudentId);
        // Guarantee pseudo-ids exist in users table to comfortably pass SQLite Foreign Key constraints
        db.prepare("INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (?, 'System_Mock', ?, 'none', 'parent')")
            .run(senderId, senderId + '@system.local');
        db.prepare("INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (?, 'System_Mock', ?, 'none', 'parent')")
            .run(receiverId, receiverId + '@system.local');
        if (receiverId === 'all') {
            const id = crypto.randomUUID();
            db.prepare(`
        INSERT INTO messages (id, senderId, receiverId, message, fileUrl, fileName, fileType)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, senderId, 'all', message, fileUrl || null, fileName || null, fileType || null);
            const parentEmails = db.prepare('SELECT parentEmail FROM students WHERE parentEmail IS NOT NULL').all();
            parentEmails.forEach(p => {
                if (p.parentEmail)
                    sendNotification(p.parentEmail, message);
            });
            return res.status(201).json({ id, receiverId: 'all', message, fileUrl, fileName, fileType, senderId });
        }
        else if (receiverId === 'all_students') {
            const id = crypto.randomUUID();
            db.prepare(`
        INSERT INTO messages (id, senderId, receiverId, message, fileUrl, fileName, fileType)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, senderId, 'all_students', message, fileUrl || null, fileName || null, fileType || null);
            return res.status(201).json({ id, receiverId: 'all_students', message, fileUrl, fileName, fileType, senderId });
        }
        else {
            let finalMessage = message;
            if (receiverId.startsWith('parent_')) {
                const studentId = receiverId.replace('parent_', '');
                const student = db.prepare('SELECT name, parentEmail FROM students WHERE id = ?').get(studentId);
                if (student) {
                    finalMessage = `[To Parent of ${student.name}]: ${message}`;
                    if (student.parentEmail)
                        sendNotification(student.parentEmail, message);
                }
            }
            else if (receiverId.startsWith('student_')) {
                const studentId = receiverId.replace('student_', '');
                const student = db.prepare('SELECT name FROM students WHERE id = ?').get(studentId);
                if (student)
                    finalMessage = `[To Student ${student.name}]: ${message}`;
            }
            const id = crypto.randomUUID();
            db.prepare(`
        INSERT INTO messages (id, senderId, receiverId, message, fileUrl, fileName, fileType)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, senderId, receiverId, finalMessage, fileUrl || null, fileName || null, fileType || null);
            const newMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
            return res.status(201).json(newMessage);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const currentUserId = req.user.role === 'admin' ? req.user.id : (req.user.role === 'parent' ? 'parent_' + req.user.linkedStudentId : 'student_' + req.user.linkedStudentId);
        const msg = db.prepare('SELECT senderId FROM messages WHERE id = ?').get(id);
        if (!msg || msg.senderId !== currentUserId) {
            return res.status(403).json({ error: 'Not authorized to edit this message' });
        }
        db.prepare(`
      UPDATE messages 
      SET message = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(message, id);
        res.json({ success: true, message });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.role === 'admin' ? req.user.id : (req.user.role === 'parent' ? 'parent_' + req.user.linkedStudentId : 'student_' + req.user.linkedStudentId);
        const msg = db.prepare('SELECT senderId FROM messages WHERE id = ?').get(id);
        if (!msg || msg.senderId !== currentUserId) {
            return res.status(403).json({ error: 'Not authorized to delete this message' });
        }
        db.prepare('DELETE FROM messages WHERE id = ?').run(id);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
export default router;
