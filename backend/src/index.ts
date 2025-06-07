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
const io = new Server(httpServer);
const PORT = process.env.PORT || 4000;

const AppDataSource = new DataSource({
  type: 'mariadb',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'Tw080401!!**',
  database: 'yes_no_app',
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
  origin: 'http://localhost:5174',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// REST API for room creation
app.post('/rooms', async (req, res) => {
  const room = new Room();
  await AppDataSource.manager.save(room);
  res.json({ roomId: room.id });
});

// REST API for fetching questions
app.get('/rooms/:id/questions', async (req, res) => {
  const questions = await AppDataSource.manager.find(Question, {
    where: { roomId: parseInt(req.params.id, 10) },
  });
  res.json(questions);
});

// WebSocket for real-time communication
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', (roomId: number) => {
    socket.join(roomId.toString());
  });

  socket.on('question:new', (data: { roomId: number; text: string }) => {
    io.to(data.roomId.toString()).emit('question:new', data);
  });

  socket.on('vote', (data: { roomId: number; vote: 'yes' | 'no' }) => {
    io.to(data.roomId.toString()).emit('vote:update', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
