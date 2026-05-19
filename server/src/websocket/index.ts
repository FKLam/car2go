import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'carhere-secret-key-change-in-production';

let io: Server;

export function initWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      next(new Error('未提供认证令牌'));
      return;
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
      next();
    } catch {
      next(new Error('认证令牌无效'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`WebSocket client connected: ${socket.id}, user: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle device tracking subscription
    socket.on('subscribe:device', (deviceId: string) => {
      socket.join(`device:${deviceId}`);
      console.log(`Client ${socket.id} subscribed to device ${deviceId}`);
    });

    socket.on('unsubscribe:device', (deviceId: string) => {
      socket.leave(`device:${deviceId}`);
    });

    socket.on('disconnect', () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Broadcast latest position update for a device
export function broadcastDevicePosition(deviceId: string, position: {
  lat: number;
  lng: number;
  speed: number;
  direction: number;
  gpsTime: string;
  deviceName?: string;
}) {
  if (!io) return;
  io.to(`device:${deviceId}`).emit('device:position', {
    deviceId,
    ...position,
  });
}

// Broadcast new alert for a user
export function broadcastAlert(userId: string, alert: {
  id: string;
  type: string;
  title: string;
  deviceId: string;
  deviceName: string;
  severity: string;
  lat?: number;
  lng?: number;
}) {
  if (!io) return;
  io.to(`user:${userId}`).emit('alert:new', alert);
}

// Broadcast device status change
export function broadcastDeviceStatus(deviceId: string, userId: string, status: string) {
  if (!io) return;
  io.to(`user:${userId}`).emit('device:status', { deviceId, status });
  io.to(`device:${deviceId}`).emit('device:status', { deviceId, status });
}

export function getIO(): Server {
  return io;
}
