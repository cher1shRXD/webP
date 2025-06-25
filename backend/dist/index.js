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
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTION'],
        allowedHeaders: ['Content-Type'],
    },
});
const AppDataSource = new typeorm_1.DataSource({
    type: 'mariadb',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'Tw080401!!**',
    database: 'yes_or_no',
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
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTION'],
    allowedHeaders: ['Content-Type'],
}));
app.post('/rooms', async (req, res) => {
    const room = new Room_1.Room();
    await AppDataSource.manager.save(room);
    res.status(201).json({ code: room.id });
});
app.get('/rooms/:id/questions', async (req, res) => {
    const questions = await AppDataSource.getRepository(Question_1.Question).findOneBy({ room: { id: req.params.id } });
    res.status(200).json(questions);
});
app.get('/rooms/:id/exist', async (req, res) => {
    const { id } = req.params;
    const isExist = await AppDataSource.getRepository(Room_1.Room).existsBy({ id });
    res.status(200).json(isExist);
});
app.post('/rooms/:id/questions', async (req, res) => {
    const { topic } = req.body;
    const question = new Question_1.Question();
    question.text = topic;
    const room = await AppDataSource.getRepository(Room_1.Room).findOneBy({ id: req.params.id });
    if (!room) {
        res.status(404).json({ message: "can't find room" });
    }
    else {
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
    const question = await AppDataSource.getRepository(Question_1.Question).findOne({ where: { id: req.params.id } });
    const { vote } = await req.body;
    if (!question) {
        res.status(404).json({ message: "can't find question" });
    }
    else {
        vote === "yes" ? question.yesCount++ : question.noCount++;
        question.totalCount++;
        await AppDataSource.manager.save(question);
        io.emit('question:update', { question });
        res.status(200).json(question);
    }
});
app.post("/room/:id/next", async (req, res) => {
    const room = await AppDataSource.getRepository(Room_1.Room).findOneBy({ id: req.params.id });
    if (!room) {
        res.status(404).json({ message: "can't find room" });
    }
    else {
        room.isWritingQuestion = true;
        await AppDataSource.manager.save(room);
        io.emit('room:update', { roomId: room.id, isWritingQuestion: room.isWritingQuestion });
        res.status(200).json(room);
    }
});
app.get('/rooms/:id', async (req, res) => {
    const room = await AppDataSource.getRepository(Room_1.Room).findOneBy({ id: req.params.id });
    if (!room) {
        res.status(404).json({ message: "can't find room" });
    }
    else {
        const questions = await AppDataSource.getRepository(Question_1.Question).find({ where: { room: { id: req.params.id } }, order: { id: 'ASC' } });
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
