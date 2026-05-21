import { useState } from 'react';
import { Button, DatePicker, Select, Space, Table, Typography } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const data = [{ imei: '862371741097523', mileage: 146.63, fuel: 14.66, date: '2026-05-20' }];
const days = ['2026-05-20', '2026-05-21', '2026-05-22', '2026-05-23', '2026-05-24', '2026-05-25', '2026-05-26'];

export default function CountMileage() {
  const [timeRange, setTimeRange] = useState('yesterday');

  return (
    <div>
      <Space size={14} wrap style={{ marginBottom: 18 }}>
        {[
          ['yesterday', '昨天'], ['three', '三天'], ['week', '一周'], ['month', '近30天'], ['custom', '自定义'],
        ].map(([value, label]) => (
          <Button key={value} type={timeRange === value ? 'primary' : 'default'} onClick={() => setTimeRange(value)}>{label}</Button>
        ))}
        <RangePicker disabled placeholder={['2026-05-20', '2026-05-21']} style={{ width: 260 }} />
        <Select defaultValue="10.0L" style={{ width: 90 }} options={[{ value: '10.0L', label: '10.0L' }]} />
        <Button type="primary">查询</Button>
        <Button icon={<ExportOutlined />}>导出表格</Button>
      </Space>

      <Title level={4} style={{ margin: '0 0 18px' }}>0544202917的里程统计</Title>
      <div style={{ height: 260, borderBottom: '1px solid #d9d9d9', position: 'relative', paddingLeft: 38, marginBottom: 20 }}>
        {[150, 120, 90, 60, 30, 0].map((tick, index) => (
          <div key={tick} style={{ position: 'absolute', left: 0, right: 0, top: index * 40, borderTop: '1px solid #d9d9d9' }}>
            <Text style={{ position: 'absolute', left: 6, top: -10, fontSize: 12, color: '#17406a' }}>{tick}</Text>
          </div>
        ))}
        <Space size={18} style={{ position: 'absolute', top: 0, left: '46%' }}>
          <Legend color="#67cdf0" label="里程" />
          <Legend color="#c4a6ff" label="油耗" />
        </Space>
        <div style={{ position: 'absolute', left: 58, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <Bar height={196} color="linear-gradient(#5cc9ef, #dff6ff)" label="146.63km" />
          <Bar height={22} color="linear-gradient(#b89cff, #efe7ff)" label="14.66L" labelColor="#a78bfa" />
        </div>
        <div style={{ position: 'absolute', left: 70, right: 10, bottom: -24, display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, color: '#14345a', fontSize: 13 }}>
          {days.map((day) => <span key={day}>{day}</span>)}
        </div>
      </div>

      <Table
        size="small"
        dataSource={data}
        rowKey="imei"
        pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条` }}
        columns={[
          { title: 'IMEI号', dataIndex: 'imei', align: 'center' as const },
          { title: '里程（km）', dataIndex: 'mileage', align: 'center' as const },
          { title: '油耗（L）', dataIndex: 'fuel', align: 'center' as const },
          { title: '统计日期', dataIndex: 'date', align: 'center' as const },
        ]}
      />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <Space size={5}><span style={{ width: 24, height: 12, background: color, display: 'inline-block' }} />{label}</Space>;
}

function Bar({ height, color, label, labelColor = '#14b8e7' }: { height: number; color: string; label: string; labelColor?: string }) {
  return <div style={{ width: 60, height, background: color, position: 'relative' }}><Text style={{ position: 'absolute', top: -20, width: 80, color: labelColor }}>{label}</Text></div>;
}
