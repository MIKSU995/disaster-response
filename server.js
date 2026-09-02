const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const shelterRoutes = require('./routes/shelterRoutes');
const needRoutes = require('./routes/needRoutes');
const matchRoutes = require('./routes/matchRoutes');
const sosRoutes = require('./routes/sosRoutes'); 
const inventoryRoutes = require('./routes/inventoryRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const reportRoutes = require('./routes/reportRoutes');
const forecastRoutes = require('./routes/forecastRoutes');

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

// Routes API Backend
app.use('/api/shelters', shelterRoutes);
app.use('/api/needs', needRoutes);
app.use('/api/match', matchRoutes); 
app.use('/api/sos', sosRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/forecast', forecastRoutes);

// Endpoint Health Check API
app.get('/api/health', (req, res) => {
  res.send({ status: 'OK', message: 'API Disaster System Real-Time Aktif!' });
});

// -------------------------------------------------------------------
// Path disesuaikan ke folder 'disaster-response-frontend/dist'
// -------------------------------------------------------------------
const frontendBuildPath = path.join(__dirname, '../disaster-response-frontend/dist');

app.use(express.static(frontendBuildPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('🔌 Klien terhubung ke WebSocket:', socket.id);
});

server.listen(PORT, () => {
  console.log(`🚀 Server Real-Time berjalan di http://localhost:${PORT}`);
});