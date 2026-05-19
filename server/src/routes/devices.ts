import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/devices - List all devices for user
router.get('/', (req: AuthRequest, res: Response) => {
  const { groupId, status, search } = req.query;
  let sql = 'SELECT * FROM devices WHERE user_id = ?';
  const params: any[] = [req.userId];

  if (groupId) {
    sql += ' AND group_id = ?';
    params.push(groupId);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (name LIKE ? OR imei LIKE ? OR plate_number LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  sql += ' ORDER BY created_at DESC';
  const devices = db.prepare(sql).all(...params);
  res.json(devices);
});

// GET /api/devices/:id
router.get('/:id', (req: AuthRequest, res: Response) => {
  const device = db.prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!device) {
    res.status(404).json({ error: '设备不存在' });
    return;
  }
  res.json(device);
});

// POST /api/devices - Create device
router.post('/', (req: AuthRequest, res: Response) => {
  const { name, imei, model, groupId, simNumber, plateNumber, driverName, driverPhone, icon } = req.body;
  if (!name) {
    res.status(400).json({ error: '设备名称不能为空' });
    return;
  }

  const id = `d-${uuidv4().substring(0, 8)}`;
  db.prepare(`
    INSERT INTO devices (id, name, imei, model, group_id, user_id, sim_number, plate_number, driver_name, driver_phone, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, imei || null, model || 'GT06', groupId || null, req.userId, simNumber || null, plateNumber || null, driverName || null, driverPhone || null, icon || 'car');

  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
  res.status(201).json(device);
});

// PUT /api/devices/:id - Update device
router.put('/:id', (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) {
    res.status(404).json({ error: '设备不存在' });
    return;
  }

  const { name, imei, model, groupId, simNumber, plateNumber, driverName, driverPhone, icon, expireDate } = req.body;
  db.prepare(`
    UPDATE devices SET 
      name = COALESCE(?, name), imei = COALESCE(?, imei), model = COALESCE(?, model),
      group_id = COALESCE(?, group_id), sim_number = COALESCE(?, sim_number),
      plate_number = COALESCE(?, plate_number), driver_name = COALESCE(?, driver_name),
      driver_phone = COALESCE(?, driver_phone), icon = COALESCE(?, icon),
      expire_date = COALESCE(?, expire_date), updated_at = datetime('now')
    WHERE id = ?
  `).run(name, imei, model, groupId, simNumber, plateNumber, driverName, driverPhone, icon, expireDate, req.params.id);

  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  res.json(device);
});

// DELETE /api/devices/:id
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) {
    res.status(404).json({ error: '设备不存在' });
    return;
  }
  db.prepare('DELETE FROM devices WHERE id = ?').run(req.params.id);
  res.json({ message: '设备已删除' });
});

// GET /api/devices/groups/tree - Get device group tree
router.get('/groups/tree', (req: AuthRequest, res: Response) => {
  const groups = db.prepare(
    'SELECT * FROM device_groups WHERE user_id = ? ORDER BY sort_order'
  ).all(req.userId) as any[];

  const buildTree = (parentId: string | null): any[] => {
    return groups
      .filter((g: any) => g.parent_id === parentId)
      .map((g: any) => ({
        ...g,
        children: buildTree(g.id),
        deviceCount: db.prepare('SELECT COUNT(*) as count FROM devices WHERE group_id = ?').get(g.id),
      }));
  };

  res.json(buildTree(null));
});

// POST /api/devices/groups - Create group
router.post('/groups', (req: AuthRequest, res: Response) => {
  const { name, parentId } = req.body;
  if (!name) {
    res.status(400).json({ error: '分组名称不能为空' });
    return;
  }
  const id = `g-${uuidv4().substring(0, 8)}`;
  db.prepare(
    'INSERT INTO device_groups (id, name, parent_id, user_id) VALUES (?, ?, ?, ?)'
  ).run(id, name, parentId || null, req.userId);

  const group = db.prepare('SELECT * FROM device_groups WHERE id = ?').get(id);
  res.status(201).json(group);
});

// PUT /api/devices/groups/:id
router.put('/groups/:id', (req: AuthRequest, res: Response) => {
  const { name, parentId } = req.body;
  db.prepare('UPDATE device_groups SET name = COALESCE(?, name), parent_id = ? WHERE id = ? AND user_id = ?')
    .run(name, parentId, req.params.id, req.userId);
  const group = db.prepare('SELECT * FROM device_groups WHERE id = ?').get(req.params.id);
  res.json(group);
});

// DELETE /api/devices/groups/:id
router.delete('/groups/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM device_groups WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: '分组已删除' });
});

export default router;
