import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DataSource } from 'typeorm';
import { Room } from './entities/Room';
import { Question } from './entities/Question';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTION'],
    allowedHeaders: ['Content-Type'],
  },
});

const AppDataSource = new DataSource({
  type: 'mariadb',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'Tw080401!!**',
  database: 'yes_or_no',
  synchronize: true,
  logging: false,
  entities: [Room, Question],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database initialized');
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
  });

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTION'],
  allowedHeaders: ['Content-Type'],
}));

app.post('/rooms', async (req, res) => {
  const room = new Room();
  await AppDataSource.manager.save(room);
  res.status(201).json({ code: room.id });
});

app.get('/rooms/:id/questions', async (req, res) => {
  const questions = await AppDataSource.getRepository(Question).findOneBy({ room: { id: req.params.id }});
  res.status(200).json(questions);
});

app.get('/rooms/:id/exist', async (req, res) => {
  const { id } = req.params;
  const isExist = await AppDataSource.getRepository(Room).existsBy({ id });
  res.status(200).json(isExist);
})

app.post('/rooms/:id/questions', async (req, res) => {
  const { topic } = req.body;
  const question = new Question();
  question.text = topic;
  const room = await AppDataSource.getRepository(Room).findOneBy({ id: req.params.id });
  if(!room) {
    res.status(404).json({ message: "can't find room" });
  }else{
    room.isWritingQuestion = false;
    question.room = room;
    await AppDataSource.manager.save(question);
    await AppDataSource.manager.save(room);
    io.emit('room:update', { roomId: room.id, isWritingQuestion: room.isWritingQuestion });
    io.emit('question:new', { question });
    res.status(201).json(question);
  }
});

app.post('/questions/:id/vote', async (req, res) => {
  const question = await AppDataSource.getRepository(Question).findOne({ where: { id: req.params.id }});
  const { vote }: { vote: "yes" | "no" } = await req.body;
  if(!question) {
    res.status(404).json({ message: "can't find question" });
  }else{
    vote === "yes" ? question.yesCount++ : question.noCount++;
    question.totalCount++;
    await AppDataSource.manager.save(question);
    io.emit('question:update', { question });
    res.status(200).json(question);
  }
});

app.post("/room/:id/next", async (req, res) => {
  const room = await AppDataSource.getRepository(Room).findOneBy({ id: req.params.id });
  if(!room) {
    res.status(404).json({ message: "can't find room" });
  }else{
    room.isWritingQuestion = true;
    await AppDataSource.manager.save(room);
    io.emit('room:update', { roomId: room.id, isWritingQuestion: room.isWritingQuestion });
    res.status(200).json(room);
  }
});

app.get('/rooms/:id', async (req, res) => {
  const room = await AppDataSource.getRepository(Room).findOneBy({ id: req.params.id });
  if (!room) {
    res.status(404).json({ message: "can't find room" });
  } else {
    const questions = await AppDataSource.getRepository(Question).find({ where: { room: { id: req.params.id } }, order: { id: 'ASC' } });
    res.status(200).json({ ...room, questions });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('room:end', async ({ code }) => {
    io.emit('room:end', { code });
  });
});

httpServer.listen(8080, () => {
  console.log(`Server is running on http://localhost:8080`);
});
