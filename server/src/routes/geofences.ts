import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/geofences - List all geofences for user
router.get('/', (req: AuthRequest, res: Response) => {
  const fences = db.prepare('SELECT * FROM geofences WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  
  // Attach device bindings
  const result = (fences as any[]).map((fence: any) => {
    const devices = db.prepare(
      `SELECT d.id, d.name FROM devices d 
       INNER JOIN geofence_devices gd ON d.id = gd.device_id 
       WHERE gd.geofence_id = ?`
    ).all(fence.id);
    return { ...fence, devices };
  });

  res.json(result);
});

// GET /api/geofences/:id
router.get('/:id', (req: AuthRequest, res: Response) => {
  const fence = db.prepare('SELECT * FROM geofences WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!fence) {
    res.status(404).json({ error: '围栏不存在' });
    return;
  }
  const devices = db.prepare(
    `SELECT d.id, d.name FROM devices d 
     INNER JOIN geofence_devices gd ON d.id = gd.device_id 
     WHERE gd.geofence_id = ?`
  ).all(req.params.id);
  res.json({ ...fence as any, devices });
});

// POST /api/geofences - Create geofence
router.post('/', (req: AuthRequest, res: Response) => {
  const { name, type, centerLat, centerLng, radius, points, alarmType, deviceIds } = req.body;
  if (!name || centerLat == null || centerLng == null) {
    res.status(400).json({ error: '缺少必要参数' });
    return;
  }

  const id = `f-${uuidv4().substring(0, 8)}`;
  const trx = db.transaction(() => {
    db.prepare(`
      INSERT INTO geofences (id, name, user_id, type, center_lat, center_lng, radius, points, alarm_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, req.userId, type || 'circle', centerLat, centerLng, radius || 500, points || null, alarmType || 'in_out');

    if (deviceIds && Array.isArray(deviceIds)) {
      const insert = db.prepare('INSERT OR IGNORE INTO geofence_devices (geofence_id, device_id) VALUES (?, ?)');
      for (const dId of deviceIds) {
        insert.run(id, dId);
      }
    }
  });
  trx();

  const fence = db.prepare('SELECT * FROM geofences WHERE id = ?').get(id);
  res.status(201).json(fence);
});

// PUT /api/geofences/:id
router.put('/:id', (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT * FROM geofences WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) {
    res.status(404).json({ error: '围栏不存在' });
    return;
  }

  const { name, type, centerLat, centerLng, radius, points, alarmType, deviceIds, status } = req.body;
  const trx = db.transaction(() => {
    db.prepare(`
      UPDATE geofences SET 
        name = COALESCE(?, name), type = COALESCE(?, type),
        center_lat = COALESCE(?, center_lat), center_lng = COALESCE(?, center_lng),
        radius = COALESCE(?, radius), points = COALESCE(?, points),
        alarm_type = COALESCE(?, alarm_type), status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name, type, centerLat, centerLng, radius, points, alarmType, status, req.params.id);

    if (deviceIds) {
      db.prepare('DELETE FROM geofence_devices WHERE geofence_id = ?').run(req.params.id);
      const insert = db.prepare('INSERT OR IGNORE INTO geofence_devices (geofence_id, device_id) VALUES (?, ?)');
      for (const dId of deviceIds) {
        insert.run(req.params.id, dId);
      }
    }
  });
  trx();

  const fence = db.prepare('SELECT * FROM geofences WHERE id = ?').get(req.params.id);
  res.json(fence);
});

// DELETE /api/geofences/:id
router.delete('/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM geofences WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: '围栏已删除' });
});

export default router;
