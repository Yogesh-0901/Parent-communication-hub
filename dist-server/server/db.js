import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(process.cwd(), 'database.sqlite'));
db.pragma('foreign_keys = ON');
// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'parent', 'student')) NOT NULL,
    linkedStudentId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rollNumber TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    marks TEXT, -- JSON string
    attendance INTEGER DEFAULT 0,
    behavior TEXT DEFAULT 'Good',
    parentId TEXT,
    aiFeedback TEXT, -- JSON string
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    senderId TEXT NOT NULL,
    receiverId TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id),
    FOREIGN KEY (receiverId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS semester_marks (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    semester TEXT NOT NULL,
    subject TEXT NOT NULL,
    score INTEGER NOT NULL,
    maxScore INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    targetType TEXT CHECK(targetType IN ('all', 'student')) NOT NULL,
    targetId TEXT, -- studentId if targetType is 'student'
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT CHECK(status IN ('Present', 'Absent')) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    assignedTo TEXT, -- 'all' or studentId
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
// Safely add new columns to semester_marks if they don't exist
try {
    db.exec("ALTER TABLE semester_marks ADD COLUMN internalScore INTEGER DEFAULT 0;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE semester_marks ADD COLUMN internalMax INTEGER DEFAULT 50;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE semester_marks ADD COLUMN internal1Score INTEGER DEFAULT 0;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE semester_marks ADD COLUMN internal1Max INTEGER DEFAULT 50;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE semester_marks ADD COLUMN internal2Score INTEGER DEFAULT 0;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE semester_marks ADD COLUMN internal2Max INTEGER DEFAULT 50;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE semester_marks ADD COLUMN externalScore INTEGER DEFAULT 0;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE semester_marks ADD COLUMN externalMax INTEGER DEFAULT 100;");
}
catch (e) { }
// Safely add parent details to students
try {
    db.exec("ALTER TABLE students ADD COLUMN parentName TEXT;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE students ADD COLUMN parentEmail TEXT;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE students ADD COLUMN parentPhone TEXT;");
}
catch (e) { }
// Safely add password reset fields to users
try {
    db.exec("ALTER TABLE users ADD COLUMN resetToken TEXT;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE users ADD COLUMN resetTokenExpiry DATETIME;");
}
catch (e) { }
// Safely add file attachments to messages
try {
    db.exec("ALTER TABLE messages ADD COLUMN fileUrl TEXT;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE messages ADD COLUMN fileName TEXT;");
}
catch (e) { }
try {
    db.exec("ALTER TABLE messages ADD COLUMN fileType TEXT;");
}
catch (e) { }
export default db;
