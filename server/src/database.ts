import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'data', 'carhere.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Device groups (tree structure)
    CREATE TABLE IF NOT EXISTS device_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      user_id TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES device_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Devices (GPS trackers)
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      imei TEXT UNIQUE,
      name TEXT NOT NULL,
      model TEXT,
      group_id TEXT,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'offline',
      icon TEXT DEFAULT 'car',
      sim_number TEXT,
      plate_number TEXT,
      driver_name TEXT,
      driver_phone TEXT,
      install_date TEXT,
      expire_date TEXT,
      battery_level INTEGER DEFAULT 100,
      last_lat REAL,
      last_lng REAL,
      last_speed REAL DEFAULT 0,
      last_direction REAL DEFAULT 0,
      last_online_time TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES device_groups(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- GPS position records
    CREATE TABLE IF NOT EXISTS gps_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      speed REAL DEFAULT 0,
      direction REAL DEFAULT 0,
      altitude REAL DEFAULT 0,
      accuracy REAL DEFAULT 0,
      gps_time TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    );

    -- Index for fast track queries
    CREATE INDEX IF NOT EXISTS idx_gps_device_time 
      ON gps_records(device_id, gps_time);
    CREATE INDEX IF NOT EXISTS idx_gps_time 
      ON gps_records(gps_time);

    -- Geofences (electronic fences)
    CREATE TABLE IF NOT EXISTS geofences (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT DEFAULT 'circle',
      center_lat REAL NOT NULL,
      center_lng REAL NOT NULL,
      radius REAL DEFAULT 500,
      points TEXT,
      alarm_type TEXT DEFAULT 'in_out',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Geofence-device bindings
    CREATE TABLE IF NOT EXISTS geofence_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      geofence_id TEXT NOT NULL,
      device_id TEXT NOT NULL,
      FOREIGN KEY (geofence_id) REFERENCES geofences(id) ON DELETE CASCADE,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
      UNIQUE(geofence_id, device_id)
    );

    -- Alerts / Alarms
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      lat REAL,
      lng REAL,
      status TEXT DEFAULT 'unread',
      severity TEXT DEFAULT 'info',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Index for alert queries
    CREATE INDEX IF NOT EXISTS idx_alerts_user_status 
      ON alerts(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_alerts_device 
      ON alerts(device_id);
  `);

  // Insert default admin user if not exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(
      'INSERT INTO users (id, username, password, email, role) VALUES (?, ?, ?, ?, ?)'
    ).run('u-admin-001', 'admin', hashedPassword, 'admin@carhere.local', 'admin');
    
    // Create a default group
    db.prepare(
      'INSERT INTO device_groups (id, name, parent_id, user_id, sort_order) VALUES (?, ?, ?, ?, ?)'
    ).run('g-root', '全部设备', null, 'u-admin-001', 0);
    
    console.log('Default admin user created: admin / admin123');
  }
}

export default db;