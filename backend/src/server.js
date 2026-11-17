const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const { connectDatabase } = require('./config/database');
const logger = require('./utils/logger');
const corsOptions = require('./config/cors');
const port = process.env.PORT || 5000;
connectDatabase().then(() => {
  const server = http.createServer(app);
  const io = new Server(server, { cors: corsOptions });
  io.on('connection', (socket) => { socket.on('subscribe', (userId) => { if (userId) socket.join(`user:${userId}`); }); });
  app.set('io', io);
  global.karigarConnectIo = io;
  server.listen(port, () => logger.info(`KarigarConnect API listening on ${port}`));
}).catch((error) => { logger.error(error, 'Unable to connect to MongoDB'); process.exit(1); });
