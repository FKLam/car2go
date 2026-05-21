import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { dispatchQueuedCommands } from './commands';

const router = Router();
router.use(authMiddleware);

// POST /api/gps/report - Device reports its position
router.post('/report', (req: AuthRequest, res: Response) => {
  const { deviceId, lat, lng, speed, direction, altitude, accuracy, gpsTime } = req.body;
  if (!deviceId || lat == null || lng == null) {
    res.status(400).json({ error: '缺少必要参数' });
    return;
  }

  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(deviceId) as any;
  if (!device) {
    res.status(400).json({ error: '设备不存在' });
    return;
  }

  const now = new Date().toISOString();
  const gpsTimestamp = gpsTime || now;

  // Insert GPS record
  db.prepare(`
    INSERT INTO gps_records (device_id, lat, lng, speed, direction, altitude, accuracy, gps_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(deviceId, lat, lng, speed || 0, direction || 0, altitude || 0, accuracy || 0, gpsTimestamp);

  // Update device last position
  db.prepare(`
    UPDATE devices SET 
      last_lat = ?, last_lng = ?, last_speed = ?, last_direction = ?,
      status = 'online', last_online_time = ?, updated_at = ?
    WHERE id = ?
  `).run(lat, lng, speed || 0, direction || 0, now, now, deviceId);

  // Check geofences for this device
  checkGeofences(deviceId, lat, lng, device.user_id);
  dispatchQueuedCommands(deviceId, device.user_id);

  res.json({ message: '位置已上报' });
});

// GET /api/gps/latest/:deviceId - Get latest position
router.get('/latest/:deviceId', (req: AuthRequest, res: Response) => {
  const record = db.prepare(
    'SELECT * FROM gps_records WHERE device_id = ? ORDER BY gps_time DESC LIMIT 1'
  ).get(req.params.deviceId);
  res.json(record || null);
});

// GET /api/gps/latest-all - Get latest positions for all user devices
router.get('/latest-all', (req: AuthRequest, res: Response) => {
  const devices = db.prepare('SELECT id, name, last_lat, last_lng, last_speed, last_direction, status, last_online_time, icon FROM devices WHERE user_id = ?').all(req.userId);
  res.json(devices);
});

// POST /api/gps/batch - Batch report for multiple devices
router.post('/batch', (req: AuthRequest, res: Response) => {
  const { positions } = req.body;
  if (!Array.isArray(positions)) {
    res.status(400).json({ error: '参数格式错误' });
    return;
  }

  const insertRecord = db.prepare(`
    INSERT INTO gps_records (device_id, lat, lng, speed, direction, altitude, accuracy, gps_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateDevice = db.prepare(`
    UPDATE devices SET last_lat = ?, last_lng = ?, last_speed = ?, last_direction = ?, status = 'online', last_online_time = ?, updated_at = ? WHERE id = ?
  `);

  const now = new Date().toISOString();
  const trx = db.transaction(() => {
    for (const pos of positions) {
      const { deviceId, lat, lng, speed = 0, direction = 0, altitude = 0, accuracy = 0, gpsTime } = pos;
      insertRecord.run(deviceId, lat, lng, speed, direction, altitude, accuracy, gpsTime || now);
      updateDevice.run(lat, lng, speed, direction, now, now, deviceId);
      dispatchQueuedCommands(deviceId);
    }
  });
  trx();

  res.json({ message: `${positions.length} 条位置已上报` });
});

function checkGeofences(deviceId: string, lat: number, lng: number, userId: string): void {
  const bindings = db.prepare(
    `SELECT g.* FROM geofences g 
     INNER JOIN geofence_devices gd ON g.id = gd.geofence_id 
     WHERE gd.device_id = ? AND g.status = 'active'`
  ).all(deviceId) as any[];

  for (const fence of bindings) {
    let inside = false;
    if (fence.type === 'circle') {
      const distance = getDistance(lat, lng, fence.center_lat, fence.center_lng);
      inside = distance <= fence.radius;
    }

    if (fence.alarm_type === 'out' && !inside) {
      createAlert(deviceId, userId, 'geofence_out', `设备离开围栏: ${fence.name}`, lat, lng);
    } else if (fence.alarm_type === 'in' && inside) {
      createAlert(deviceId, userId, 'geofence_in', `设备进入围栏: ${fence.name}`, lat, lng);
    } else if (fence.alarm_type === 'in_out') {
      // Simple state tracking would need a cache; for now just log
    }
  }

  // Speed alert
  const device = db.prepare('SELECT last_speed FROM devices WHERE id = ?').get(deviceId) as any;
  if (device && device.last_speed > 120) {
    createAlert(deviceId, userId, 'overspeed', '超速告警', lat, lng, 'warning');
  }
}

function createAlert(deviceId: string, userId: string, type: string, title: string, lat: number, lng: number, severity: string = 'info'): void {
  const id = `a-${uuidv4().substring(0, 8)}`;
  db.prepare(
    'INSERT INTO alerts (id, device_id, user_id, type, title, message, lat, lng, severity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, deviceId, userId, type, title, title, lat, lng, severity);
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default router;
