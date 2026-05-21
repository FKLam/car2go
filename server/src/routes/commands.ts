import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const COMMAND_TIMEOUT_SECONDS = 30;

const COMMANDS: Record<string, { title: string; code: string; needsOperation?: boolean; description: string }> = {
  move_alert: { title: '位移报警', code: 'MOVE_ALERT', needsOperation: true, description: '设备异常移动告警开关' },
  power_off: { title: '断电报警', code: 'POWER_OFF_ALERT', needsOperation: true, description: '设备断电告警开关' },
  speed_limit: { title: '超速报警', code: 'SPEED_LIMIT', needsOperation: true, description: '设置车辆超速阈值' },
  restart: { title: '重启设备', code: 'RESTART', description: '远程重启 GPS 终端' },
  vibrate: { title: '震动报警', code: 'VIBRATE_ALERT', needsOperation: true, description: '震动传感器告警开关' },
  custom: { title: '自定义指令', code: 'CUSTOM', description: '自定义指令码下发' },
};

router.get('/types', (_req: AuthRequest, res: Response) => {
  res.json(Object.entries(COMMANDS).map(([type, item]) => ({ type, ...item })));
});

router.get('/', (req: AuthRequest, res: Response) => {
  markTimedOutCommands(req.userId);

  const { deviceId, status, type, keyword, startTime, endTime, limit } = req.query;
  let sql = `
    SELECT c.*, d.name as device_name, d.imei as device_imei, d.status as device_status
    FROM commands c
    LEFT JOIN devices d ON c.device_id = d.id
    WHERE c.user_id = ?
  `;
  const params: any[] = [req.userId];

  if (deviceId) {
    sql += ' AND c.device_id = ?';
    params.push(deviceId);
  }
  if (status) {
    sql += ' AND c.status = ?';
    params.push(status);
  }
  if (type) {
    sql += ' AND c.type = ?';
    params.push(type);
  }
  if (keyword) {
    sql += ' AND (d.name LIKE ? OR d.imei LIKE ? OR c.title LIKE ? OR c.result LIKE ?)';
    const like = `%${keyword}%`;
    params.push(like, like, like, like);
  }
  if (startTime) {
    sql += ' AND c.sent_at >= ?';
    params.push(startTime);
  }
  if (endTime) {
    sql += ' AND c.sent_at <= ?';
    params.push(endTime);
  }

  sql += ' ORDER BY c.sent_at DESC';
  const maxLimit = parseInt(limit as string) || 50;
  sql += ` LIMIT ${Math.min(maxLimit, 200)}`;

  res.json(db.prepare(sql).all(...params));
});

router.get('/stats', (req: AuthRequest, res: Response) => {
  markTimedOutCommands(req.userId);

  const total = (db.prepare('SELECT COUNT(*) as count FROM commands WHERE user_id = ?').get(req.userId) as any).count;
  const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM commands WHERE user_id = ? GROUP BY status').all(req.userId);
  const byType = db.prepare('SELECT type, title, COUNT(*) as count FROM commands WHERE user_id = ? GROUP BY type, title').all(req.userId);
  res.json({ total, byStatus, byType });
});

router.post('/send', (req: AuthRequest, res: Response) => {
  const { deviceId, deviceIds, type, operation, speedLimit, customCommand, saveOffline = true } = req.body;
  const targetDeviceIds = Array.isArray(deviceIds) && deviceIds.length > 0 ? deviceIds : deviceId ? [deviceId] : [];

  if (targetDeviceIds.length === 0 || !type) {
    res.status(400).json({ error: '请选择设备和指令类型' });
    return;
  }

  const command = COMMANDS[type];
  if (!command) {
    res.status(400).json({ error: '指令类型无效' });
    return;
  }

  if (command.needsOperation && !['open', 'close'].includes(operation)) {
    res.status(400).json({ error: '请选择操作类型' });
    return;
  }
  if (type === 'speed_limit' && (!speedLimit || Number(speedLimit) <= 0)) {
    res.status(400).json({ error: '请输入有效的超速阈值' });
    return;
  }
  if (type === 'custom' && !customCommand) {
    res.status(400).json({ error: '请输入自定义指令码' });
    return;
  }

  const payload = buildPayload(type, operation, speedLimit, customCommand);
  const created: any[] = [];
  const skipped: any[] = [];

  const trx = db.transaction(() => {
    for (const targetId of targetDeviceIds) {
      const device = db.prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?').get(targetId, req.userId) as any;
      if (!device) {
        skipped.push({ deviceId: targetId, reason: '设备不存在' });
        continue;
      }

      const isOnline = device.status === 'online';
      if (!isOnline && !saveOffline) {
        skipped.push({ deviceId: targetId, deviceName: device.name, reason: '设备离线' });
        continue;
      }

      const status = isOnline ? 'sent' : 'queued';
      const result = isOnline ? '指令已发送，等待设备执行' : '设备离线，指令已转存离线队列';
      const timeoutAt = isOnline ? new Date(Date.now() + COMMAND_TIMEOUT_SECONDS * 1000).toISOString() : null;
      const id = `cmd-${uuidv4().substring(0, 8)}`;

      db.prepare(`
        INSERT INTO commands (id, device_id, user_id, type, title, operation, payload, status, result, timeout_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, targetId, req.userId, type, command.title, operation || null, JSON.stringify(payload), status, result, timeoutAt);
      created.push(id);
    }
  });
  trx();

  const records = created.length > 0 ? db.prepare(`
    SELECT c.*, d.name as device_name, d.imei as device_imei, d.status as device_status
    FROM commands c LEFT JOIN devices d ON c.device_id = d.id
    WHERE c.id IN (${created.map(() => '?').join(',')})
    ORDER BY c.sent_at DESC
  `).all(...created) : [];

  res.status(201).json({ records, skipped });
});

router.post('/offline/dispatch/:deviceId', (req: AuthRequest, res: Response) => {
  const dispatched = dispatchQueuedCommands(req.params.deviceId, req.userId);
  res.json({ dispatched });
});

router.put('/:id/status', (req: AuthRequest, res: Response) => {
  const { status, result } = req.body;
  if (!['pending', 'queued', 'sent', 'success', 'failed', 'timeout'].includes(status)) {
    res.status(400).json({ error: '状态无效' });
    return;
  }

  const executedAt = ['success', 'failed', 'timeout'].includes(status) ? new Date().toISOString() : null;
  db.prepare(`
    UPDATE commands SET status = ?, result = COALESCE(?, result), executed_at = COALESCE(?, executed_at)
    WHERE id = ? AND user_id = ?
  `).run(status, result, executedAt, req.params.id, req.userId);

  const command = db.prepare('SELECT * FROM commands WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!command) {
    res.status(404).json({ error: '指令记录不存在' });
    return;
  }
  res.json(command);
});

function buildPayload(type: string, operation?: string, speedLimit?: number, customCommand?: string) {
  if (type === 'custom') return { code: customCommand };
  if (type === 'speed_limit') return { code: COMMANDS[type].code, operation, speedLimit: Number(speedLimit) };
  return { code: COMMANDS[type].code, operation: operation || 'execute' };
}

function markTimedOutCommands(userId?: string): number {
  const now = new Date().toISOString();
  let sql = `
    UPDATE commands
    SET status = 'timeout', result = '发送超时，需否转存为离线指令？', executed_at = ?
    WHERE status = 'sent' AND timeout_at IS NOT NULL AND timeout_at < ?
  `;
  const params: any[] = [now, now];
  if (userId) {
    sql += ' AND user_id = ?';
    params.push(userId);
  }
  return db.prepare(sql).run(...params).changes;
}

export function dispatchQueuedCommands(deviceId: string, userId?: string): number {
  let sql = `
    UPDATE commands
    SET status = 'sent', result = '设备上线，离线指令已自动下发', timeout_at = ?
    WHERE device_id = ? AND status = 'queued'
  `;
  const params: any[] = [new Date(Date.now() + COMMAND_TIMEOUT_SECONDS * 1000).toISOString(), deviceId];
  if (userId) {
    sql += ' AND user_id = ?';
    params.push(userId);
  }
  return db.prepare(sql).run(...params).changes;
}

export default router;
