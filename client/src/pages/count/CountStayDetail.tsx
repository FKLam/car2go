import { Card, Table, Button, Select, Typography, Tree, Input, Tabs } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

const agentTree = [{ title: '体验账号 (6/9)', key: 'agent-0', children: [] }];

export default function CountStayDetail() {
  const columns = [
    { title: 'IMEI号', dataIndex: 'imei', width: 140 },
    { title: '起始日期', dataIndex: 'startDate', width: 160 },
    { title: '定位类型', dataIndex: 'locationType', width: 100 },
    { title: '结束日期', dataIndex: 'endDate', width: 160 },
    { title: '停留点位置', dataIndex: 'address', minWidth: 240 },
    { title: '天', dataIndex: 'durationDay', width: 70, align: 'center' as const },
    { title: '小时', dataIndex: 'durationHour', width: 70, align: 'center' as const },
    { title: '分钟', dataIndex: 'durationMinute', width: 70, align: 'center' as const },
    { title: '操作', width: 120, fixed: 'right' as const, render: () => <Button type="link" size="small">停留点详情</Button> },
  ];

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <Card size="small" style={{ width: 300, flexShrink: 0 }}>
        <Input prefix={<SearchOutlined />} placeholder="代理商搜索" size="small" style={{ marginBottom: 8 }} />
        <Tree.DirectoryTree treeData={agentTree} defaultExpandAll />
        <div style={{ margin: '12px 0', borderTop: '1px solid #f0f0f0' }} />
        <Input prefix={<SearchOutlined />} placeholder="搜索设备" size="small" style={{ marginBottom: 8 }} />
        <Tabs size="small" items={[{ key: 'all', label: '全部' }, { key: 'online', label: '在线' }, { key: 'offline', label: '离线' }]} />
      </Card>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Select defaultValue="today" style={{ width: 160 }} size="small" options={[{ value: 'today', label: '今天' }]} />
            <Button type="primary" size="small">查询</Button>
          </div>
          <Button icon={<DownloadOutlined />} type="link" size="small">导出表格</Button>
        </div>
        <Table columns={columns} dataSource={[]} rowKey="id" size="small"
          pagination={{ pageSize: 20, showTotal: (t: number) => `共 ${t} 条`, showSizeChanger: true, showQuickJumper: true }} />
      </div>
    </div>
  );
}
