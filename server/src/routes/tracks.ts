import { Router, Response } from 'express';
import db from '../database';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/tracks/:deviceId - Get track history for a device
router.get('/:deviceId', (req: AuthRequest, res: Response) => {
  const { startTime, endTime, limit } = req.query;
  const deviceId = req.params.deviceId;

  // Verify device belongs to user
  const device = db.prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?').get(deviceId, req.userId);
  if (!device) {
    res.status(404).json({ error: '设备不存在' });
    return;
  }

  let sql = 'SELECT * FROM gps_records WHERE device_id = ?';
  const params: any[] = [deviceId];

  if (startTime) {
    sql += ' AND gps_time >= ?';
    params.push(startTime);
  }
  if (endTime) {
    sql += ' AND gps_time <= ?';
    params.push(endTime);
  }

  sql += ' ORDER BY gps_time ASC';
  
  const maxLimit = parseInt(limit as string) || 5000;
  sql += ` LIMIT ${Math.min(maxLimit, 10000)}`;

  const records = db.prepare(sql).all(...params);
  res.json(records);
});

// GET /api/tracks/:deviceId/summary - Get daily summary for a device
router.get('/:deviceId/summary', (req: AuthRequest, res: Response) => {
  const deviceId = req.params.deviceId;
  const { date } = req.query;

  const device = db.prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?').get(deviceId, req.userId);
  if (!device) {
    res.status(404).json({ error: '设备不存在' });
    return;
  }

  const targetDate = date || new Date().toISOString().split('T')[0];
  const records = db.prepare(`
    SELECT * FROM gps_records 
    WHERE device_id = ? AND gps_time >= ? AND gps_time < ?
    ORDER BY gps_time ASC
  `).all(deviceId, `${targetDate}T00:00:00`, `${targetDate}T23:59:59`) as any[];

  if (records.length === 0) {
    res.json({ date: targetDate, distance: 0, maxSpeed: 0, avgSpeed: 0, points: 0 });
    return;
  }

  let totalDistance = 0;
  let maxSpeed = 0;
  let totalSpeed = 0;
  let speedCount = 0;

  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1];
    const curr = records[i];
    const dist = getDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    totalDistance += dist;
    
    if (curr.speed > maxSpeed) maxSpeed = curr.speed;
    if (curr.speed > 0) {
      totalSpeed += curr.speed;
      speedCount++;
    }
  }

  res.json({
    date: targetDate,
    distance: Math.round(totalDistance),
    maxSpeed: Math.round(maxSpeed),
    avgSpeed: speedCount > 0 ? Math.round(totalSpeed / speedCount) : 0,
    points: records.length,
  });
});

// GET /api/tracks/:deviceId/stops - Get stop points (>5 min stationary)
router.get('/:deviceId/stops', (req: AuthRequest, res: Response) => {
  const deviceId = req.params.deviceId;
  const { startTime, endTime } = req.query;

  const device = db.prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?').get(deviceId, req.userId);
  if (!device) {
    res.status(404).json({ error: '设备不存在' });
    return;
  }

  const sql = `
    SELECT * FROM gps_records 
    WHERE device_id = ? AND gps_time >= ? AND gps_time <= ?
    ORDER BY gps_time ASC
    LIMIT 10000
  `;
  const records = db.prepare(sql).all(
    deviceId,
    startTime || '2020-01-01',
    endTime || new Date().toISOString()
  ) as any[];

  const stops: any[] = [];
  let stopStart: any = null;

  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1];
    const curr = records[i];
    const timeDiff = (new Date(curr.gps_time).getTime() - new Date(prev.gps_time).getTime()) / 1000;

    if (curr.speed < 1 && timeDiff < 300) {
      if (!stopStart) stopStart = prev;
    } else if (stopStart) {
      const stopDuration = (new Date(prev.gps_time).getTime() - new Date(stopStart.gps_time).getTime()) / 1000;
      if (stopDuration > 300) {
        stops.push({
          lat: stopStart.lat,
          lng: stopStart.lng,
          startTime: stopStart.gps_time,
          endTime: prev.gps_time,
          duration: Math.round(stopDuration / 60),
        });
      }
      stopStart = null;
    }
  }

  res.json(stops);
});

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default router;
