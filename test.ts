import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
try {
  const tableInfo = db.prepare("PRAGMA table_info(students)").all();
  console.log("Columns:", tableInfo.map((c: any) => c.name));
  
  db.prepare(`
    INSERT INTO students (id, name, rollNumber, department, marks, attendance, behavior, parentId, parentName, parentEmail, aiFeedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('test-id-1234', 'bala', '23cse02-temp', 'CSE', '[]', 0, 'Good', null, 'test', 'test', '{}');
  console.log("Insert success!");
  db.prepare("DELETE FROM students WHERE id = 'test-id-1234'").run();
} catch (err: any) {
  console.error("Insert fail:", err.message);
}
