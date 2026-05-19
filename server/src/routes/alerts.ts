import { Router, Response } from 'express';
import db from '../database';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/alerts - List alerts for user
router.get('/', (req: AuthRequest, res: Response) => {
  const { deviceId, type, status, severity, limit } = req.query;
  let sql = `
    SELECT a.*, d.name as device_name
    FROM alerts a 
    LEFT JOIN devices d ON a.device_id = d.id 
    WHERE a.user_id = ?
  `;
  const params: any[] = [req.userId];

  if (deviceId) {
    sql += ' AND a.device_id = ?';
    params.push(deviceId);
  }
  if (type) {
    sql += ' AND a.type = ?';
    params.push(type);
  }
  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }
  if (severity) {
    sql += ' AND a.severity = ?';
    params.push(severity);
  }

  sql += ' ORDER BY a.created_at DESC';
  const maxLimit = parseInt(limit as string) || 100;
  sql += ` LIMIT ${Math.min(maxLimit, 500)}`;

  const alerts = db.prepare(sql).all(...params);
  res.json(alerts);
});

// GET /api/alerts/unread-count
router.get('/unread-count', (req: AuthRequest, res: Response) => {
  const row = db.prepare(
    'SELECT COUNT(*) as count FROM alerts WHERE user_id = ? AND status = ?'
  ).get(req.userId, 'unread') as any;
  res.json({ count: row.count });
});

// PUT /api/alerts/:id/read - Mark alert as read
router.put('/:id/read', (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE alerts SET status = ? WHERE id = ? AND user_id = ?')
    .run('read', req.params.id, req.userId);
  res.json({ message: '已标记为已读' });
});

// PUT /api/alerts/read-all - Mark all alerts as read
router.put('/read-all', (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE alerts SET status = ? WHERE user_id = ? AND status = ?')
    .run('read', req.userId, 'unread');
  res.json({ message: '全部已标记为已读' });
});

// GET /api/alerts/stats - Alert statistics
router.get('/stats', (req: AuthRequest, res: Response) => {
  const total = (db.prepare('SELECT COUNT(*) as count FROM alerts WHERE user_id = ?').get(req.userId) as any).count;
  const unread = (db.prepare('SELECT COUNT(*) as count FROM alerts WHERE user_id = ? AND status = ?').get(req.userId, 'unread') as any).count;
  const byType = db.prepare(
    'SELECT type, COUNT(*) as count FROM alerts WHERE user_id = ? GROUP BY type'
  ).all(req.userId);

  res.json({ total, unread, byType });
});

export default router;
