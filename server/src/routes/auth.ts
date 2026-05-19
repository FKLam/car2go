import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { AuthRequest, generateToken, authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? AND status = ?').get(username, 'active') as any;
  if (!user) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  const token = generateToken(user.id, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// POST /api/auth/register
router.post('/register', (req: AuthRequest, res: Response) => {
  const { username, password, email, phone } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: '密码长度不能少于6位' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    res.status(409).json({ error: '用户名已存在' });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = `u-${uuidv4().substring(0, 8)}`;
  
  db.prepare(
    'INSERT INTO users (id, username, password, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, username, hashedPassword, email || null, phone || null, 'user');

  // Create default group for new user
  db.prepare(
    'INSERT INTO device_groups (id, name, parent_id, user_id, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(`g-${id}`, '全部设备', null, id, 0);

  const token = generateToken(id, 'user');
  res.status(201).json({
    token,
    user: { id, username, email: email || '', phone: phone || '', role: 'user' },
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare(
    'SELECT id, username, email, phone, role, status, created_at FROM users WHERE id = ?'
  ).get(req.userId) as any;
  
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  res.json(user);
});

export default router;
