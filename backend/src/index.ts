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
  const questions = await AppDataSource.getRepository(Question).findOneBy({ roomId: req.params.id});
  res.status(200).json(questions);
});

// --------------------------------------------
// 투표 상태 저장용 Map
// roomId(string) => Map(socketId => 'yes' | 'no')
// --------------------------------------------
const voteMap = new Map<string, Map<string, 'yes' | 'no'>>();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', (roomId: number) => {
    const roomIdStr = roomId.toString();
    socket.join(roomIdStr);
  });

  socket.on('question:new', (data: { roomId: number; text: string }) => {
    io.to(data.roomId.toString()).emit('question:new', data);
    
  });

  socket.on('vote', (data: { roomId: number; vote: 'yes' | 'no' }) => {
    const roomIdStr = data.roomId.toString();

    // 소켓 ID 기준으로 투표 상태 저장
    if (!voteMap.has(roomIdStr)) {
      voteMap.set(roomIdStr, new Map());
    }
    voteMap.get(roomIdStr)!.set(socket.id, data.vote);

    // 클라이언트에 단순 vote 내용 전달
    io.to(roomIdStr).emit('vote:update', data);

    // 집계
    const votes = voteMap.get(roomIdStr)!;
    const totalVotes = votes.size;
    let yesVotes = 0;
    let noVotes = 0;

    for (const vote of votes.values()) {
      if (vote === 'yes') yesVotes++;
      if (vote === 'no') noVotes++;
    }

    io.to(roomIdStr).emit('vote:counts', {
      totalVotes,
      yesVotes,
      noVotes,
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');

    // 모든 방 순회하여 해당 소켓의 투표 기록 제거
    for (const [roomId, votes] of voteMap.entries()) {
      if (votes.delete(socket.id)) {
        // 투표 결과 재집계
        const totalVotes = votes.size;
        let yesVotes = 0;
        let noVotes = 0;

        for (const vote of votes.values()) {
          if (vote === 'yes') yesVotes++;
          if (vote === 'no') noVotes++;
        }

        io.to(roomId).emit('vote:counts', {
          totalVotes,
          yesVotes,
          noVotes,
        });
      }
    }
  });
});

httpServer.listen(8080, () => {
  console.log(`Server is running on http://localhost:8080`);
});
