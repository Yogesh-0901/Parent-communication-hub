import express from 'express';
import db from '../db.ts';
import nodemailer from 'nodemailer';
import multer from 'multer';

// Extend Request interface to include file
interface MulterRequest extends express.Request {
  file?: Express.Multer.File;
}

const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// File upload configuration
const upload = multer({ storage: multer.memoryStorage() });

// Get all parents for messaging
router.get('/parents', (req, res) => {
  try {
    const parents = db.prepare(`
      SELECT DISTINCT 
        u.id, 
        u.name, 
        u.email, 
        s.parentEmail as studentParentEmail,
        s.parentPhone as studentParentPhone,
        s.name as studentName
      FROM users u
      LEFT JOIN students s ON u.linkedStudentId = s.id
      WHERE u.role = 'parent'
    `).all() as any[];

    res.json(parents);
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send email to parents
router.post('/send-email', upload.single('attachment'), async (req: MulterRequest, res) => {
  // Validate credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({
      error: 'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file'
    });
  }

  try {
    const { recipients, subject, message, sendToAll } = req.body;
    const file = req.file;

    let parentEmails: string[] = [];

    if (sendToAll === 'true') {
      // Get all parent emails
      const allParents = db.prepare(`
        SELECT DISTINCT u.email, s.parentEmail
        FROM users u
        LEFT JOIN students s ON u.linkedStudentId = s.id
        WHERE u.role = 'parent'
      `).all() as any[];

      parentEmails = allParents.map(p => p.email || p.parentEmail).filter(Boolean);
    } else {
      // Use specific recipients
      parentEmails = Array.isArray(recipients) ? recipients : [recipients];
    }

    if (parentEmails.length === 0) {
      return res.status(400).json({ error: 'No recipients specified' });
    }

    // Prepare email attachments
    const attachments = file ? [{
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype
    }] : [];

    // Send email to each parent
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: parentEmails.join(', '),
      subject: subject || 'Notification from Parent Communication Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            ${subject || 'Important Notification'}
          </h2>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          ${attachments.length > 0 ? `
            <div style="background-color: #e9ecef; padding: 10px; border-radius: 5px; margin: 10px 0;">
              <strong>Attachment:</strong> ${attachments[0].filename}
            </div>
          ` : ''}
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This message was sent from the Parent Communication Hub portal.
          </p>
        </div>
      `,
      attachments
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: `Email sent successfully to ${parentEmails.length} parent(s)`,
      recipients: parentEmails.length
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Send SMS to parents (using Twilio or similar service)
router.post('/send-sms', async (req, res) => {
  try {
    const { recipients, message, sendToAll } = req.body;

    let parentPhones: string[] = [];

    if (sendToAll === 'true') {
      // Get all parent phone numbers
      const allParents = db.prepare(`
        SELECT DISTINCT u.email, s.parentPhone
        FROM users u
        LEFT JOIN students s ON u.linkedStudentId = s.id
        WHERE u.role = 'parent' AND s.parentPhone IS NOT NULL
      `).all() as any[];
      
      parentPhones = allParents.map(p => p.parentPhone).filter(Boolean);
    } else {
      // Use specific recipients
      parentPhones = Array.isArray(recipients) ? recipients : [recipients];
    }

    if (parentPhones.length === 0) {
      return res.status(400).json({ error: 'No phone numbers specified' });
    }

    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('SMS would be sent to:', parentPhones);
      console.log('Message:', message);
      return res.json({ 
        message: `SMS simulation: Would send to ${parentPhones.length} parent(s)`,
        recipients: parentPhones.length,
        note: 'Twilio credentials not configured - SMS not sent'
      });
    }

    // Send SMS using Twilio
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const sendPromises = parentPhones.map(async (phone: string) => {
      try {
        const result = await twilio.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });
        console.log('SMS sent to:', phone, 'SID:', result.sid);
        return { phone, success: true, sid: result.sid };
      } catch (error) {
        console.error('Failed to send SMS to:', phone, error);
        return { phone, success: false, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({ 
      message: `SMS sent to ${successful} parent(s), ${failed} failed`,
      recipients: parentPhones.length,
      successful,
      failed,
      results
    });
  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

export default router;
