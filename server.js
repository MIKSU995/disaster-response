const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const shelterRoutes = require('./routes/shelterRoutes');
const needRoutes = require('./routes/needRoutes');
const matchRoutes = require('./routes/matchRoutes'); 

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/shelters', shelterRoutes);
app.use('/api/needs', needRoutes);
app.use('/api/match', matchRoutes); 

app.get('/', (req, res) => {
  res.send({ status: 'OK', message: 'API Disaster System Real-Time Aktif!' });
});

io.on('connection', (socket) => {
  console.log('🔌 Klien terhubung ke WebSocket:', socket.id);
});

server.listen(PORT, () => {
  console.log(`🚀 Server Real-Time berjalan di http://localhost:${PORT}`);
});