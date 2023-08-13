const http = require('http');
const url = require('url');
const db = require('./db');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  if (path === '/students') {
    if (method === 'GET') {
      try {
        const students = await db.getAllStudents();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(students));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const { name, age } = JSON.parse(body);
          const newStudent = await db.createStudent(name, age);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newStudent));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      });
    }
  } else if (path.startsWith('/students/')) {
    const parts = path.split('/');
    const studentId = parseInt(parts[2]);

    if (method === 'GET') {
      try {
        const student = await db.getStudentById(studentId);
        if (student) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(student));
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Student not found');
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const { name, age } = JSON.parse(body);
          const updatedStudent = await db.updateStudent(studentId, name, age);
          if (updatedStudent) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedStudent));
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Student not found');
          }
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      });
    } else if (method === 'DELETE') {
      try {
        const deleted = await db.deleteStudent(studentId);
        if (deleted) {
          res.writeHead(204, { 'Content-Type': 'text/plain' });
          res.end();
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Student not found');
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
