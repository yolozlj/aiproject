import React, { useEffect, useState } from 'react';
import { Timeline, Tag, Spin, Empty, Typography, Space } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UserAddOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import type { ProjectHistory } from '@/types/project';
import { getProjectHistory } from '@/api/project';
import { getStatusLabel } from '@/utils/projectStatusFlow';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text, Paragraph } = Typography;

interface ProjectHistoryTimelineProps {
  projectId: string;
}

const ProjectHistoryTimeline: React.FC<ProjectHistoryTimelineProps> = ({ projectId }) => {
  const [histories, setHistories] = useState<ProjectHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHistories();
  }, [projectId]);

  const loadHistories = async () => {
    try {
      setLoading(true);
      const data = await getProjectHistory(projectId);
      setHistories(data);
    } catch (error) {
      console.error('Load project history error:', error);
      // 如果 API 未实现，显示空状态
      setHistories([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpandedIds = new Set(expandedIds);
    if (newExpandedIds.has(id)) {
      newExpandedIds.delete(id);
    } else {
      newExpandedIds.add(id);
    }
    setExpandedIds(newExpandedIds);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileAddOutlined style={{ color: '#52c41a' }} />;
      case 'status_changed':
        return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
      case 'assigned':
        return <UserAddOutlined style={{ color: '#722ed1' }} />;
      case 'updated':
        return <EditOutlined style={{ color: '#faad14' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#999' }} />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: '创建项目',
      status_changed: '状态变更',
      assigned: '分配项目',
      updated: '更新项目',
    };
    return labels[action] || action;
  };

  const renderChangeDetails = (history: ProjectHistory) => {
    const { action, changes } = history;

    if (action === 'status_changed') {
      return (
        <Space>
          <Tag color="default">{getStatusLabel(changes.from)}</Tag>
          <span>→</span>
          <Tag color="processing">{getStatusLabel(changes.to)}</Tag>
          {changes.remarks && (
            <Text type="secondary">（{changes.remarks}）</Text>
          )}
        </Space>
      );
    }

    if (action === 'assigned') {
      return (
        <Text>
          分配给 <strong>{changes.ownerName}</strong>
          {changes.remarks && <Text type="secondary">（{changes.remarks}）</Text>}
        </Text>
      );
    }

    if (action === 'created') {
      return <Text>创建了该项目</Text>;
    }

    if (action === 'updated') {
      const isExpanded = expandedIds.has(history.id);
      return (
        <div>
          <Text>更新了项目信息</Text>
          {Object.keys(changes).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <a onClick={() => toggleExpand(history.id)}>
                {isExpanded ? '收起详情' : '查看详情'}
              </a>
              {isExpanded && (
                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {Object.entries(changes).map(([key, value]: [string, any]) => (
                    <div key={key} style={{ marginBottom: 4 }}>
                      <Text strong>{key}:</Text>{' '}
                      <Text type="secondary">{JSON.stringify(value)}</Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return <Text>执行了 {getActionLabel(action)} 操作</Text>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  if (histories.length === 0) {
    return (
      <Empty
        description="暂无历史记录"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '40px 0' }}
      />
    );
  }

  return (
    <Timeline
      items={histories.map((history) => ({
        dot: getActionIcon(history.action),
        children: (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Space>
                <Tag color="blue">{getActionLabel(history.action)}</Tag>
                <Text strong>{history.userName}</Text>
                <Text type="secondary">
                  {dayjs(history.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
                <Text type="secondary">({dayjs(history.createdAt).fromNow()})</Text>
              </Space>
            </div>
            <div style={{ marginTop: 8 }}>{renderChangeDetails(history)}</div>
          </div>
        ),
      }))}
    />
  );
};

export default ProjectHistoryTimeline;
