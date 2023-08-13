const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:'); // You can replace this with a real database file

db.serialize(() => {
  db.run('CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)');

  // Sample data
  const stmt = db.prepare('INSERT INTO students (name, age) VALUES (?, ?)');
  stmt.run('Alice', 20);
  stmt.run('Bob', 22);
  stmt.run('Charlie', 21);
  stmt.finalize();
});

const getAllStudents = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM students', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const getStudentById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const createStudent = (name, age) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO students (name, age) VALUES (?, ?)');
    stmt.run(name, age, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, name, age });
      }
    });
    stmt.finalize();
  });
};

const updateStudent = (id, name, age) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE students SET name = ?, age = ? WHERE id = ?', [name, age, id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        resolve(null);
      } else {
        resolve({ id, name, age });
      }
    });
  });
};

const deleteStudent = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM students WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
