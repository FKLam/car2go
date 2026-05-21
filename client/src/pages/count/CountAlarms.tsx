import { useState } from 'react';
import { Button, DatePicker, Space, Table, Typography } from 'antd';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const alarms = [
  ['电池报警', 0], ['切断报警', 0], ['盲区报警', 0], ['拆除报警', 0], ['位移报警', 11], ['围栏报警', 0],
  ['SOS报警', 0], ['正常报警', 0], ['开机报警', 0], ['超速报警', 0], ['震动报警', 506], ['离线报警', 0],
];

export default function CountAlarms() {
  const [timeRange, setTimeRange] = useState('yesterday');
  const row = { date: '2026-05-20', battery: 0, cut: 0, blind: 0, remove: 0, move: 11, fence: 0, sos: 0, normal: 0, poweron: 0, overspeed: 0, vibration: 506, offline: 0 };

  return (
    <div>
      <Space size={14} wrap style={{ marginBottom: 20 }}>
        {[
          ['yesterday', '昨天'], ['three', '三天'], ['week', '一周'], ['month', '近30天'], ['custom', '自定义'],
        ].map(([value, label]) => <Button key={value} type={timeRange === value ? 'primary' : 'default'} onClick={() => setTimeRange(value)}>{label}</Button>)}
        <RangePicker disabled placeholder={['2026-05-20', '2026-05-21']} style={{ width: 260 }} />
        <Button type="primary">查询</Button>
      </Space>

      <Title level={4} style={{ margin: 0 }}>0544202917的报警统计</Title>
      <Text type="secondary">该时间段的报警总数：517条</Text>
      <div style={{ height: 255, borderBottom: '1px solid #d9d9d9', position: 'relative', paddingLeft: 40, margin: '10px 0 20px' }}>
        {[600, 500, 400, 300, 200, 100, 0].map((tick, index) => (
          <div key={tick} style={{ position: 'absolute', left: 0, right: 0, top: index * 33, borderTop: '1px solid #d9d9d9' }}>
            <Text style={{ position: 'absolute', left: 6, top: -10, fontSize: 12, color: '#17406a' }}>{tick}</Text>
          </div>
        ))}
        <div style={{ position: 'absolute', left: 70, right: 20, bottom: 0, display: 'grid', gridTemplateColumns: `repeat(${alarms.length}, 1fr)`, alignItems: 'end' }}>
          {alarms.map(([name, value]) => (
            <div key={name} style={{ textAlign: 'center' }}>
              <Text style={{ color: '#16baf0', fontSize: 12 }}>{value}条</Text>
              <div style={{ height: Math.max(Number(value) / 2.6, value ? 6 : 1), width: 80, margin: '2px auto 0', background: 'linear-gradient(#55c8ef, #dff6ff)' }} />
              <Text style={{ display: 'block', marginTop: 6, color: '#14345a', fontSize: 12 }}>{name}</Text>
            </div>
          ))}
        </div>
      </div>

      <Table
        size="small"
        dataSource={[row]}
        rowKey="date"
        pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 1400 }}
        columns={[
          { title: '统计日期', dataIndex: 'date', fixed: 'left', width: 100, align: 'center' as const },
          { title: '电池报警', dataIndex: 'battery', align: 'center' as const },
          { title: '切断报警', dataIndex: 'cut', align: 'center' as const },
          { title: '盲区报警', dataIndex: 'blind', align: 'center' as const },
          { title: '拆除报警', dataIndex: 'remove', align: 'center' as const },
          { title: '位移报警', dataIndex: 'move', align: 'center' as const },
          { title: '围栏报警', dataIndex: 'fence', align: 'center' as const },
          { title: 'SOS报警', dataIndex: 'sos', align: 'center' as const },
          { title: '正常报警', dataIndex: 'normal', align: 'center' as const },
          { title: '开机报警', dataIndex: 'poweron', align: 'center' as const },
          { title: '超速报警', dataIndex: 'overspeed', align: 'center' as const },
          { title: '震动报警', dataIndex: 'vibration', align: 'center' as const },
          { title: '离线报警', dataIndex: 'offline', align: 'center' as const },
        ]}
      />
    </div>
  );
}
