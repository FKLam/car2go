import { useState } from 'react';
import { Card, Table, Button, DatePicker, Radio, Typography, Tree, Input, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const agentTree = [{ title: '体验账号 (6/9)', key: 'agent-0', children: [] }];

const ALARM_COLUMNS = [
  { title: '统计日期', dataIndex: 'date', key: 'date', width: 120, fixed: 'left' as const },
  { title: '电池报警', dataIndex: 'alarm_battery', key: 'battery' },
  { title: '切断报警', dataIndex: 'alarm_cut', key: 'cut' },
  { title: '盲区报警', dataIndex: 'alarm_blind', key: 'blind' },
  { title: '拆除报警', dataIndex: 'alarm_remove', key: 'remove' },
  { title: '位移报警', dataIndex: 'alarm_move', key: 'move' },
  { title: '围栏报警', dataIndex: 'alarm_fence', key: 'fence' },
  { title: 'SOS报警', dataIndex: 'alarm_sos', key: 'sos' },
  { title: '正常报警', dataIndex: 'alarm_normal', key: 'normal' },
  { title: '开机报警', dataIndex: 'alarm_poweron', key: 'poweron' },
  { title: '超速报警', dataIndex: 'alarm_overspeed', key: 'overspeed' },
  { title: '震动报警', dataIndex: 'alarm_vibration', key: 'vibration' },
  { title: '离线报警', dataIndex: 'alarm_offline', key: 'offline' },
];

export default function CountAlarms() {
  const [timeRange, setTimeRange] = useState('today');

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <Card size="small" style={{ width: 300, flexShrink: 0 }}>
        <Input prefix={<SearchOutlined />} placeholder="代理商搜索" size="small" style={{ marginBottom: 8 }} />
        <Tree.DirectoryTree treeData={agentTree} defaultExpandAll style={{ fontSize: 12 }} />
        <div style={{ margin: '12px 0', borderTop: '1px solid #f0f0f0' }} />
        <Input prefix={<SearchOutlined />} placeholder="搜索设备" size="small" style={{ marginBottom: 8 }} />
        <Tabs size="small" items={[{ key: 'all', label: '全部' }, { key: 'online', label: '在线' }, { key: 'offline', label: '离线' }]} />
      </Card>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <Radio.Group value={timeRange} onChange={(e: any) => setTimeRange(e.target.value)} optionType="button" size="small"
            options={[{ value: 'yesterday', label: '昨天' }, { value: 'three-days', label: '三天' }, { value: 'week', label: '一周' }, { value: 'month', label: '近30天' }, { value: 'custom', label: '自定义' }]} />
          <RangePicker size="small" />
          <Button type="primary" size="small">查询</Button>
        </div>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>设备报警统计</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>该时间段内的报警总数提示</Text>
          <div style={{ height: 300, background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
            <Text type="secondary">ECharts 多类目离散柱状图 — 13 种报警类型</Text>
          </div>
        </Card>

        <Table columns={ALARM_COLUMNS} dataSource={[]} rowKey="date" size="small"
          pagination={{ pageSize: 10, showSizeChanger: true }} scroll={{ x: 1600 }} />
      </div>
    </div>
  );
}
