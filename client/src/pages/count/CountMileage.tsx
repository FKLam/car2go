import { useState } from 'react';
import { Card, Table, Button, DatePicker, Select, Radio, Typography, Tree, Input, Tabs, Tag } from 'antd';
import { SearchOutlined, ExportOutlined } from '@ant-design/icons';
import api from '../../api';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const agentTree = [
  { title: '体验账号 (6/9)', key: 'agent-0', children: [
    { title: '杭州帅骑科技 (1/3)', key: 'agent-1', isLeaf: true },
  ]},
];

export default function CountMileage() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('today');
  const [data, setData] = useState<any[]>([]);

  const columns = [
    { title: 'IMEI号', dataIndex: 'imei', key: 'imei', width: 180 },
    { title: '里程 (km)', dataIndex: 'mileage', key: 'mileage', sorter: (a: any, b: any) => a.mileage - b.mileage },
    { title: '油耗 (L)', dataIndex: 'fuel', key: 'fuel', sorter: (a: any, b: any) => a.fuel - b.fuel },
    { title: '统计日期', dataIndex: 'date', key: 'date', width: 160 },
  ];

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
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Radio.Group value={timeRange} onChange={(e) => setTimeRange(e.target.value)} optionType="button" size="small"
            options={[{ value: 'yesterday', label: '昨天' }, { value: 'three-days', label: '三天' }, { value: 'week', label: '一周' }, { value: 'month', label: '近30天' }, { value: 'custom', label: '自定义' }]} />
          <RangePicker size="small" />
          <Select size="small" defaultValue="10.0L" style={{ width: 100 }} options={[{ value: '10.0L', label: '10.0L' }]} />
          <Button type="primary" size="small">查询</Button>
          <Button size="small" icon={<ExportOutlined />}>导出表格</Button>
        </div>

        <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong>当前车辆里程统计</Text>
            <div style={{ display: 'flex', gap: 16 }}>
              <Tag color="blue">里程</Tag>
              <Tag color="green">油耗</Tag>
            </div>
          </div>
          <div style={{ height: 280, background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text type="secondary">ECharts 柱状折线复合图 — 里程 + 油耗双轴</Text>
          </div>
        </Card>

        <Table columns={columns} dataSource={data} rowKey="imei" loading={loading} size="small"
          pagination={{ pageSize: 10, showTotal: (t: number) => `共 ${t} 条`, showSizeChanger: true }} />
      </div>
    </div>
  );
}
