const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let tasks = [
  { id: 1, text: 'ฝึกสร้าง REST API ด้วย Express.js', done: true },
  { id: 2, text: 'ฝึกตรวจ Request และ Response ผ่าน Chrome DevTools', done: false },
  { id: 3, text: 'ฝึก Debug ฝั่ง Server ด้วย VS Code', done: false },
];
let nextId = 4;

app.get('/api/tasks', (req, res) => {
  const { done } = req.query;
  if (done === undefined) return res.json(tasks);
  if (done !== 'true' && done !== 'false') {
    return res.status(400).json({ error: 'done ต้องเป็น true หรือ false' });
  }
  return res.json(tasks.filter((task) => String(task.done) === done));
});

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find((item) => item.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'ไม่พบรายการนี้' });
  return res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!text) return res.status(400).json({ error: 'ต้องระบุ text' });
  const task = { id: nextId++, text, done: false };
  tasks.push(task);
  return res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const task = tasks.find((item) => item.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'ไม่พบรายการนี้' });
  task.done = !task.done;
  return res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'ไม่พบรายการนี้' });
  tasks.splice(index, 1);
  return res.status(204).end();
});

app.use('/api', (req, res) => res.status(404).json({ error: 'ไม่พบ API ที่เรียก' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
});

app.listen(PORT, () => console.log(`Resume server is running at http://localhost:${PORT}/`));

