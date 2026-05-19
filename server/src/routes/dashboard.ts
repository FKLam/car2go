import { Router, Response } from 'express';
import db from '../database';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/dashboard - Get dashboard overview data
router.get('/', (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  // Total devices
  const totalDevices = (db.prepare(
    'SELECT COUNT(*) as count FROM devices WHERE user_id = ?'
  ).get(userId) as any).count;

  // Online devices
  const onlineDevices = (db.prepare(
    "SELECT COUNT(*) as count FROM devices WHERE user_id = ? AND status = 'online'"
  ).get(userId) as any).count;

  // Total geofences
  const totalGeofences = (db.prepare(
    'SELECT COUNT(*) as count FROM geofences WHERE user_id = ?'
  ).get(userId) as any).count;

  // Unread alerts
  const unreadAlerts = (db.prepare(
    "SELECT COUNT(*) as count FROM alerts WHERE user_id = ? AND status = 'unread'"
  ).get(userId) as any).count;

  // Today's track points
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = (db.prepare(
    `SELECT COUNT(*) as count FROM gps_records 
     INNER JOIN devices ON gps_records.device_id = devices.id 
     WHERE devices.user_id = ? AND gps_records.gps_time >= ?`
  ).get(userId, `${today}T00:00:00`) as any).count;

  // Alerts by type (today)
  const alertsToday = db.prepare(
    `SELECT type, COUNT(*) as count FROM alerts 
     WHERE user_id = ? AND created_at >= ? 
     GROUP BY type ORDER BY count DESC`
  ).all(userId, `${today}T00:00:00`);

  // Device status distribution
  const deviceStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM devices WHERE user_id = ? GROUP BY status'
  ).all(userId);

  // Recent alerts (last 10)
  const recentAlerts = db.prepare(
    `SELECT a.*, d.name as device_name 
     FROM alerts a LEFT JOIN devices d ON a.device_id = d.id 
     WHERE a.user_id = ? 
     ORDER BY a.created_at DESC LIMIT 10`
  ).all(userId);

  // Geo distribution of devices (for heatmap)
  const devicePositions = db.prepare(
    'SELECT id, name, last_lat, last_lng, status FROM devices WHERE user_id = ? AND last_lat IS NOT NULL'
  ).all(userId);

  res.json({
    overview: {
      totalDevices,
      onlineDevices,
      offlineDevices: totalDevices - onlineDevices,
      totalGeofences,
      unreadAlerts,
      todayRecords,
    },
    alertsToday,
    deviceStatus,
    recentAlerts,
    devicePositions,
  });
});

export default router;
