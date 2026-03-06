import { useEffect, useState, useMemo } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '@/store';
import { usePermission } from '@/store/authStore';
import type { Project, ProjectType, ProjectStatus, Priority } from '@/types';
import ProjectQuickActions from '@/components/Project/ProjectQuickActions';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import './ProjectList.css';

const { RangePicker } = DatePicker;
type DateRange = [Dayjs | null, Dayjs | null] | null;

const { Option } = Select;

const ProjectList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 使用单一选择器订阅整个 store 状态
  const store = useProjectStore();
  const { projects, total, page, pageSize, loading, fetchProjects, setFilters } = store;

  const { canCreate } = usePermission();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProjectType | undefined>();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>();
  const [initialFilterApplied, setInitialFilterApplied] = useState(false);
  // 日期范围筛选（客户端过滤）
  const [actualEndRange, setActualEndRange] = useState<DateRange>(null);
  const [createdAtRange, setCreatedAtRange] = useState<DateRange>(null);
  // 筛选区折叠状态
  const [filterCollapsed, setFilterCollapsed] = useState(true);

  // 使用 useMemo 确保 dataSource 更新，并在客户端应用日期范围过滤
  const tableData = useMemo(() => {
    let data = projects.map(p => ({ ...p }));

    const inRange = (date: Date | undefined, range: DateRange) => {
      if (!range || (!range[0] && !range[1])) return true;
      if (!date) return false;
      const d = dayjs(date);
      if (range[0] && d.isBefore(range[0], 'day')) return false;
      if (range[1] && d.isAfter(range[1], 'day')) return false;
      return true;
    };

    if (actualEndRange) data = data.filter(p => inRange(p.actualEndDate, actualEndRange));
    if (createdAtRange) data = data.filter(p => inRange(p.createdAt, createdAtRange));

    console.log('🔔 [ProjectList] tableData 重新计算，数量:', data.length);
    return data;
  }, [projects, actualEndRange, createdAtRange]);

  // 监听 projects 变化
  useEffect(() => {
    console.log('🔔 [ProjectList] projects 状态变化，当前数量:', projects.length);
    console.log('🔔 [ProjectList] projects 内容:', projects);
  }, [projects]);

  // 初始化：从 URL 参数读取筛选条件
  useEffect(() => {
    console.log('🎬 ProjectList 组件挂载，检查 URL 参数');

    // 从 URL 读取筛选参数
    const urlStatus = searchParams.get('status') as ProjectStatus | null;
    const urlType = searchParams.get('type') as ProjectType | null;
    const urlPriority = searchParams.get('priority') as Priority | null;
    const urlKeyword = searchParams.get('keyword');

    console.log('📋 URL 参数:', { urlStatus, urlType, urlPriority, urlKeyword });

    // 如果有 URL 参数，应用到筛选器
    if (urlStatus || urlType || urlPriority || urlKeyword) {
      console.log('✨ 发现 URL 筛选参数，自动应用筛选');

      // 设置筛选器状态
      if (urlStatus) setStatusFilter(urlStatus);
      if (urlType) setTypeFilter(urlType);
      if (urlPriority) setPriorityFilter(urlPriority);
      if (urlKeyword) setSearchText(urlKeyword);

      // 构建筛选参数并应用
      const filters: any = {};
      if (urlStatus) filters.status = urlStatus;
      if (urlType) filters.type = urlType;
      if (urlPriority) filters.priority = urlPriority;
      if (urlKeyword) filters.keyword = urlKeyword;

      setFilters(filters);
      setInitialFilterApplied(true);
    } else {
      // 没有 URL 参数，正常加载
      console.log('📋 无 URL 筛选参数，加载全部项目');
      fetchProjects();
      setInitialFilterApplied(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    // 构建筛选参数，只传递有值的参数
    const filters: any = {};
    if (searchText) filters.keyword = searchText;
    if (typeFilter) filters.type = typeFilter;
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;

    console.log('🔍 [ProjectList] 执行筛选，参数:', filters);
    await setFilters(filters);
    console.log('✅ [ProjectList] setFilters 完成');
  };

  const handleReset = async () => {
    console.log('🔄 [ProjectList] 重置筛选');
    setSearchText('');
    setTypeFilter(undefined);
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    setActualEndRange(null);
    setCreatedAtRange(null);
    await setFilters({});
    console.log('✅ [ProjectList] 重置完成');
  };

  const handleTableChange = (pagination: any) => {
    fetchProjects(pagination.current, pagination.pageSize);
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      submitted: 'default',
      pending_review: 'warning',
      in_progress: 'processing',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: Priority) => {
    const colors: Record<Priority, string> = {
      low: 'default',
      medium: 'blue',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      title: t('project.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: t('project.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: ProjectType) => t(`project.type_${type}`),
    },
    {
      title: t('project.priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: Priority) => (
        <Tag color={getPriorityColor(priority)}>
          {t(`project.priority_${priority}`)}
        </Tag>
      ),
    },
    {
      title: t('project.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: ProjectStatus) => (
        <Tag color={getStatusColor(status)}>
          {t(`project.status_${status}`)}
        </Tag>
      ),
    },
    {
      title: t('project.submitter'),
      dataIndex: 'submitterName',
      key: 'submitterName',
      render: (text: string) => text || '-',
    },
    {
      title: t('project.owner'),
      dataIndex: 'ownerName',
      key: 'ownerName',
      render: (text: string) => text || '-',
    },
    {
      title: t('project.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      fixed: 'right' as const,
      width: 180,
      render: (_: any, record: Project) => (
        <ProjectQuickActions project={record} onActionComplete={() => fetchProjects()} />
      ),
    },
  ];

  return (
    <div className="project-list">
      <div className="page-header">
        <h1 className="page-title">{t('project.title')}</h1>
        {canCreate('project') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/projects/new')}
          >
            {t('project.createProject')}
          </Button>
        )}
      </div>

      <Card bordered={false} className="filter-card">
        {/* 第一行：始终显示 */}
        <Space size="middle" wrap>
          <Input
            placeholder="搜索项目名称或描述"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ width: 220 }}
          />
          <Select
            placeholder={t('project.type')}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="data_development">{t('project.type_data')}</Option>
            <Option value="system_development">{t('project.type_system')}</Option>
          </Select>
          <Select
            placeholder={t('project.status')}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            allowClear
            style={{ width: 140 }}
          >
            <Option value="submitted">{t('project.status_submitted')}</Option>
            <Option value="pending_review">{t('project.status_review')}</Option>
            <Option value="in_progress">{t('project.status_progress')}</Option>
            <Option value="completed">{t('project.status_completed')}</Option>
          </Select>
          <Select
            placeholder={t('project.priority')}
            value={priorityFilter}
            onChange={(value) => setPriorityFilter(value)}
            allowClear
            style={{ width: 110 }}
          >
            <Option value="low">{t('project.priority_low')}</Option>
            <Option value="medium">{t('project.priority_medium')}</Option>
            <Option value="high">{t('project.priority_high')}</Option>
            <Option value="urgent">{t('project.priority_urgent')}</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>查询</Button>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
          <Button
            type="link"
            size="small"
            icon={filterCollapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={() => setFilterCollapsed(!filterCollapsed)}
            style={{ padding: '0 4px' }}
          >
            {filterCollapsed ? '展开' : '收起'}
          </Button>
        </Space>

        {/* 第二行：折叠时隐藏 */}
        {!filterCollapsed && (
          <Space size="middle" wrap style={{ marginTop: 12 }}>
            <RangePicker
              placeholder={['实际完成时间 起', '实际完成时间 止']}
              value={actualEndRange}
              onChange={(val) => setActualEndRange(val as DateRange)}
              style={{ width: 300 }}
            />
            <RangePicker
              placeholder={['创建时间 起', '创建时间 止']}
              value={createdAtRange}
              onChange={(val) => setCreatedAtRange(val as DateRange)}
              style={{ width: 280 }}
            />
          </Space>
        )}
      </Card>

      <Card bordered={false} style={{ marginTop: 16 }}>
        <Table
          key={`table-${total}-${page}`}
          columns={columns}
          dataSource={tableData}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default ProjectList;
