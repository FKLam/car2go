import db, { initDatabase } from './database';

// Initialize tables if needed
initDatabase();

const ADMIN_ID = 'u-admin-001';

// Beijing area coordinates for realistic simulation
const BEIJING_CENTER = { lat: 39.9042, lng: 116.4074 };
const GUANGZHOU_CENTER = { lat: 23.1291, lng: 113.2644 };
const SHANGHAI_CENTER = { lat: 31.2304, lng: 121.4737 };

function randomAround(center: { lat: number; lng: number }, spread: number = 0.05) {
  return {
    lat: center.lat + (Math.random() - 0.5) * spread,
    lng: center.lng + (Math.random() - 0.5) * spread,
  };
}

// Create sample device groups
const groups = [
  { id: 'g-beijing', name: '北京车队', parentId: 'g-root' },
  { id: 'g-shanghai', name: '上海车队', parentId: 'g-root' },
  { id: 'g-guangzhou', name: '广州车队', parentId: 'g-root' },
  { id: 'g-beijing-truck', name: '货运车', parentId: 'g-beijing' },
  { id: 'g-beijing-car', name: '小轿车', parentId: 'g-beijing' },
];

for (const g of groups) {
  db.prepare(
    'INSERT OR IGNORE INTO device_groups (id, name, parent_id, user_id, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(g.id, g.name, g.parentId, ADMIN_ID, 0);
}

console.log(`Created ${groups.length} device groups`);

// Create sample devices
const devices = [
  { id: 'd-001', name: '京A·88888', imei: '860123456789001', groupId: 'g-beijing-car', plateNumber: '京A88888', driverName: '张师傅', driverPhone: '13800138001' },
  { id: 'd-002', name: '京B·66666', imei: '860123456789002', groupId: 'g-beijing-car', plateNumber: '京B66666', driverName: '李师傅', driverPhone: '13800138002' },
  { id: 'd-003', name: '京C·12345', imei: '860123456789003', groupId: 'g-beijing-truck', plateNumber: '京C12345', driverName: '王师傅', driverPhone: '13800138003' },
  { id: 'd-004', name: '沪A·99999', imei: '860123456789004', groupId: 'g-shanghai', plateNumber: '沪A99999', driverName: '赵师傅', driverPhone: '13800138004' },
  { id: 'd-005', name: '沪B·77777', imei: '860123456789005', groupId: 'g-shanghai', plateNumber: '沪B77777', driverName: '孙师傅', driverPhone: '13800138005' },
  { id: 'd-006', name: '粤A·55555', imei: '860123456789006', groupId: 'g-guangzhou', plateNumber: '粤A55555', driverName: '周师傅', driverPhone: '13800138006' },
  { id: 'd-007', name: '粤B·33333', imei: '860123456789007', groupId: 'g-guangzhou', plateNumber: '粤B33333', driverName: '吴师傅', driverPhone: '13800138007' },
  { id: 'd-008', name: '京D·11111', imei: '860123456789008', groupId: 'g-beijing-truck', plateNumber: '京D11111', driverName: '郑师傅', driverPhone: '13800138008' },
];

const centerMap: Record<string, { lat: number; lng: number }> = {
  'd-001': BEIJING_CENTER,
  'd-002': BEIJING_CENTER,
  'd-003': BEIJING_CENTER,
  'd-004': SHANGHAI_CENTER,
  'd-005': SHANGHAI_CENTER,
  'd-006': GUANGZHOU_CENTER,
  'd-007': GUANGZHOU_CENTER,
  'd-008': BEIJING_CENTER,
};

for (const d of devices) {
  const center = centerMap[d.id];
  const pos = randomAround(center, 0.02);
  db.prepare(`
    INSERT OR IGNORE INTO devices (id, imei, name, model, group_id, user_id, status, sim_number, plate_number, driver_name, driver_phone, last_lat, last_lng, last_speed, last_online_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    d.id, d.imei, d.name, 'GT06N', d.groupId, ADMIN_ID,
    Math.random() > 0.3 ? 'online' : 'offline',
    `138${Math.floor(Math.random() * 100000000)}`, d.plateNumber, d.driverName, d.driverPhone,
    pos.lat, pos.lng, Math.floor(Math.random() * 60), new Date().toISOString()
  );
}

console.log(`Created ${devices.length} devices`);

// Generate GPS track data for the past 24 hours
const now = Date.now();
const insertRecord = db.prepare(`
  INSERT INTO gps_records (device_id, lat, lng, speed, direction, gps_time)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const updateDevice = db.prepare(`
  UPDATE devices SET last_lat = ?, last_lng = ?, last_speed = ?, last_direction = ?, last_online_time = ? WHERE id = ?
`);

console.log('Generating GPS track data...');

const trx = db.transaction(() => {
  for (const d of devices) {
    const center = centerMap[d.id];
    let lat = center.lat + (Math.random() - 0.5) * 0.02;
    let lng = center.lng + (Math.random() - 0.5) * 0.02;

    // Generate a point roughly every 2 minutes for the past 12 hours (360 points)
    for (let i = 360; i >= 0; i--) {
      const time = new Date(now - i * 120 * 1000).toISOString();

      // Simulate movement: random walk
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      const speed = Math.floor(Math.random() * 80); // km/h
      const direction = Math.floor(Math.random() * 360);

      insertRecord.run(d.id, lat, lng, speed, direction, time);
    }

    // Update to latest position
    updateDevice.run(lat, lng, 30, 90, new Date().toISOString(), d.id);
  }
});

trx();
console.log(`Generated ${devices.length * 361} GPS records`);

// Create sample geofences
const geofences = [
  { id: 'f-001', name: '北京五环内', lat: 39.9042, lng: 116.4074, radius: 15000, alarmType: 'in_out' },
  { id: 'f-002', name: '上海外环', lat: 31.2304, lng: 121.4737, radius: 10000, alarmType: 'out' },
  { id: 'f-003', name: '广州天河区', lat: 23.1291, lng: 113.2644, radius: 5000, alarmType: 'in' },
];

for (const f of geofences) {
  db.prepare(`
    INSERT OR IGNORE INTO geofences (id, name, user_id, type, center_lat, center_lng, radius, alarm_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(f.id, f.name, ADMIN_ID, 'circle', f.lat, f.lng, f.radius, f.alarmType);
}

console.log(`Created ${geofences.length} geofences`);

// Bind devices to geofences
db.prepare('INSERT OR IGNORE INTO geofence_devices (geofence_id, device_id) VALUES (?, ?)').run('f-001', 'd-001');
db.prepare('INSERT OR IGNORE INTO geofence_devices (geofence_id, device_id) VALUES (?, ?)').run('f-001', 'd-002');
db.prepare('INSERT OR IGNORE INTO geofence_devices (geofence_id, device_id) VALUES (?, ?)').run('f-002', 'd-004');
db.prepare('INSERT OR IGNORE INTO geofence_devices (geofence_id, device_id) VALUES (?, ?)').run('f-003', 'd-006');

console.log('Bound devices to geofences');

// Create sample alerts
const alertTypes = ['overspeed', 'geofence_out', 'geofence_in', 'power_off', 'vibration'];
const alertSeverities = ['info', 'warning', 'error'];

for (let i = 0; i < 15; i++) {
  const d = devices[Math.floor(Math.random() * devices.length)];
  const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  const pos = randomAround(centerMap[d.id], 0.03);
  const time = new Date(now - Math.floor(Math.random() * 86400000)).toISOString();
  const severity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];

  db.prepare(`
    INSERT OR IGNORE INTO alerts (id, device_id, user_id, type, title, message, lat, lng, severity, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `a-demo-${i}`, d.id, ADMIN_ID, type,
    type === 'overspeed' ? '超速告警' : type === 'geofence_out' ? '离开围栏' : type === 'geofence_in' ? '进入围栏' : '设备告警',
    `${d.name} 于 ${new Date(time).toLocaleString()} 触发${type}告警`,
    pos.lat, pos.lng, severity,
    Math.random() > 0.5 ? 'unread' : 'read',
    time
  );
}

console.log(`Created 15 sample alerts`);
console.log('\n✅ Seed data generation complete!');
console.log('Default login: admin / admin123');
console.log('Demo devices: 8 devices across 3 cities');

db.close();