"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const typeorm_1 = require("typeorm");
const Room_1 = require("./entities/Room");
const Question_1 = require("./entities/Question");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
const PORT = process.env.PORT || 4000;
const AppDataSource = new typeorm_1.DataSource({
    type: 'mariadb',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'Tw080401!!**',
    database: 'yes_no_app',
    synchronize: true,
    logging: false,
    entities: [Room_1.Room, Question_1.Question],
});
AppDataSource.initialize()
    .then(() => {
    console.log('Database initialized');
})
    .catch((err) => {
    console.error('Database initialization failed:', err);
});
app.use(express_1.default.json());
// REST API for room creation
app.post('/rooms', async (req, res) => {
    const room = new Room_1.Room();
    await AppDataSource.manager.save(room);
    res.json({ roomId: room.id });
});
// REST API for fetching questions
app.get('/rooms/:id/questions', async (req, res) => {
    const questions = await AppDataSource.manager.find(Question_1.Question, {
        where: { roomId: parseInt(req.params.id, 10) },
    });
    res.json(questions);
});
// WebSocket for real-time communication
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId.toString());
    });
    socket.on('question:new', (data) => {
        io.to(data.roomId.toString()).emit('question:new', data);
    });
    socket.on('vote', (data) => {
        io.to(data.roomId.toString()).emit('vote:update', data);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
