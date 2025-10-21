import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { DATABASE_URL, PORT } from './constants.js';
import Task from './task.js';

const app = express();
app.use(cors());

await mongoose.connect(DATABASE_URL);
// mongodb에 있는 데이터를 가지고 실행해야하므로 web DB 연결

// GET : 데이터 불러오기
app.get('/tasks', async (req, res) => {
  const sort = req.query.sort;
  const count = Number(req.query.count) || 0;

  if (count === 0) {
    return res.json([]);
  }

  const sortOption =
    sort === 'oldest' ? ['createdAt', 'asc'] : ['createdAt', 'desc'];

  const tasks = await Task.find().limit(count).sort([sortOption]);

  res.send(tasks);
});

app.get('/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    res.send(task);
  } else {
    res.status(404).send({ message: 'Cannot find given id' });
  }
});

// POST : 데이터 입력하기
app.post('/tasks', async (req, res) => {
  const data = req.body;
  const newTask = await Task.create(data);

  res.status(201).send(newTask);
});

// PATCH : 데이터 수정하기
app.patch('/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    const { body } = req;
    Object.keys(body).forEach((key) => {
      task[key] = body[key];
    });
    await task.save();
    res.send(task);
  } else {
    res.status(404).send({ message: 'Cannot find given id' });
  }
});

// DELETE : 데이터 삭제하기
app.delete('/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (task) {
    res.sendStatus(200);
  } else {
    res.status(404).send({ message: 'Cannot find given id' });
  }
});

app.listen(PORT, (err) => {
  console.log(`Example app listening on port ${PORT}`);
  console.log(err);
});
