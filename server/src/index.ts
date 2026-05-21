import express from 'express';
import cors from 'cors';
import http from 'http';
import { initDatabase } from './database';
import { initWebSocket } from './websocket';
import authRoutes from './routes/auth';
import deviceRoutes from './routes/devices';
import gpsRoutes from './routes/gps';
import trackRoutes from './routes/tracks';
import geofenceRoutes from './routes/geofences';
import alertRoutes from './routes/alerts';
import dashboardRoutes from './routes/dashboard';
import commandRoutes from './routes/commands';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database
initDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/commands', commandRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server and attach WebSocket
const server = http.createServer(app);
initWebSocket(server);

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ 端口 ${PORT} 已被占用`);
    console.error(`   请先释放端口: lsof -ti:${PORT} | xargs kill -9`);
    console.error(`   或设置环境变量: PORT=3002 npm run dev\n`);
  } else if (err.code === 'EACCES') {
    console.error(`\n❌ 没有权限使用端口 ${PORT}`);
    console.error(`   请使用大于 1024 的端口: PORT=3002 npm run dev\n`);
  } else {
    console.error('服务器启动失败:', err.message);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🚀 CarHere Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready`);
  console.log(`🔑 Default login: admin / admin123`);
});

export default app;
