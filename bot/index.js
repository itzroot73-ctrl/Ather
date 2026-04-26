
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mineflayer from 'mineflayer';
import cors from 'cors';

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const bots = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('get-bots', () => {
    const botList = Array.from(bots.values()).map(b => ({
      id: b.id,
      name: b.name,
      ip: b.ip,
      status: b.status,
      adMessage: b.adMessage,
      adInterval: b.adInterval
    }));
    socket.emit('bot-list', botList);
  });

  socket.on('create-bot', (config) => {
    const { name, ip, adMessage, adInterval } = config;
    const id = Math.random().toString(36).substring(7);

    const botData = {
      id,
      name,
      ip,
      adMessage,
      adInterval: adInterval || 60000,
      status: 'offline',
      instance: null,
      adTimer: null
    };

    bots.set(id, botData);
    io.emit('bot-created', botData);
  });

  socket.on('start-bot', (id) => {
    const botData = bots.get(id);
    if (!botData || botData.status === 'online') return;

    try {
      botData.status = 'connecting';
      io.emit('bot-status', { id, status: 'connecting' });

      const bot = mineflayer.createBot({
        host: botData.ip,
        username: botData.name,
        version: false // auto version
      });

      botData.instance = bot;

      bot.on('spawn', () => {
        botData.status = 'online';
        io.emit('bot-status', { id, status: 'online' });

        // Start Ad interval
        if (botData.adMessage) {
          botData.adTimer = setInterval(() => {
            bot.chat(botData.adMessage);
          }, botData.adInterval);
        }
      });

      bot.on('chat', (username, message) => {
        io.emit('bot-chat', { botId: id, username, message });
      });

      bot.on('error', (err) => {
        console.error('Bot error:', err);
        io.emit('bot-error', { id, error: err.message });
      });

      bot.on('end', () => {
        botData.status = 'offline';
        if (botData.adTimer) clearInterval(botData.adTimer);
        io.emit('bot-status', { id, status: 'offline' });
      });

    } catch (err) {
      console.error('Failed to start bot:', err);
      botData.status = 'offline';
      io.emit('bot-status', { id, status: 'offline', error: err.message });
    }
  });

  socket.on('stop-bot', (id) => {
    const botData = bots.get(id);
    if (botData && botData.instance) {
      botData.instance.quit();
      if (botData.adTimer) clearInterval(botData.adTimer);
      botData.status = 'offline';
      io.emit('bot-status', { id, status: 'offline' });
    }
  });

  socket.on('remove-bot', (id) => {
    const botData = bots.get(id);
    if (botData) {
      if (botData.instance) botData.instance.quit();
      if (botData.adTimer) clearInterval(botData.adTimer);
      bots.delete(id);
      io.emit('bot-removed', id);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Bot manager server running on port ${PORT}`);
});
