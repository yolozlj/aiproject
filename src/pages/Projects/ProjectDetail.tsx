import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, RocketOutlined, UserAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getProjectById, deleteProject } from '@/api';
import { useAuthStore, usePermission } from '@/store/authStore';
import type { Project, ProjectStatus, Priority } from '@/types';
import { Loading, showConfirmModal } from '@/components/Common';
import ProjectStatusCard from '@/components/Project/ProjectStatusCard';
import ProjectClaimModal from '@/components/Project/ProjectClaimModal';
import ProjectAssignModal from '@/components/Project/ProjectAssignModal';
import ProjectAttachmentManager from '@/components/Project/ProjectAttachmentManager';
import ProjectHistoryTimeline from '@/components/Project/ProjectHistoryTimeline';
import { canClaimProject, canAssignProject } from '@/utils/projectPermission';
import dayjs from 'dayjs';
import './ProjectDetail.css';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { canUpdate, canDelete } = usePermission();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  // 处理 URL 参数中的操作
  useEffect(() => {
    if (!project || !user) return;

    const action = searchParams.get('action');
    if (action === 'claim' && canClaimProject(project, user)) {
      setClaimModalVisible(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    } else if (action === 'assign' && canAssignProject(project, user)) {
      setAssignModalVisible(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [project, user, searchParams]);

  const fetchProject = async (projectId: string) => {
    setLoading(true);
    try {
      const data = await getProjectById(projectId);
      setProject(data);
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;

    showConfirmModal({
      title: t('common.confirmDelete'),
      content: t('common.deleteWarning'),
      onConfirm: async () => {
        try {
          await deleteProject(id);
          message.success(t('common.success'));
          navigate('/projects');
        } catch (error: any) {
          message.error(error.message || t('common.error'));
        }
      },
    });
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

  if (loading) {
    return <Loading />;
  }

  if (!project) {
    return null;
  }

  return (
    <div className="project-detail">
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/projects')}
        >
          {t('common.back')}
        </Button>
        <Space>
          {user && canClaimProject(project, user) && (
            <Button
              type="primary"
              icon={<RocketOutlined />}
              onClick={() => setClaimModalVisible(true)}
            >
              领取项目
            </Button>
          )}
          {user && canAssignProject(project, user) && (
            <Button
              icon={<UserAddOutlined />}
              onClick={() => setAssignModalVisible(true)}
            >
              分配项目
            </Button>
          )}
          {canUpdate('project') && (
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/projects/${id}/edit`)}
            >
              {t('common.edit')}
            </Button>
          )}
          {canDelete('project') && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              {t('common.delete')}
            </Button>
          )}
        </Space>
      </div>

      {/* 项目状态卡片 */}
      <ProjectStatusCard project={project} onUpdate={() => fetchProject(id!)} />

      <Card title={t('project.basicInfo')} bordered={false}>
        <Descriptions column={2}>
          <Descriptions.Item label={t('project.name')}>
            {project.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('project.type')}>
            {t(`project.type_${project.type}`)}
          </Descriptions.Item>
          <Descriptions.Item label={t('project.priority')}>
            <Tag color={getPriorityColor(project.priority)}>
              {t(`project.priority_${project.priority}`)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('project.status')}>
            <Tag color={getStatusColor(project.status)}>
              {t(`project.status_${project.status}`)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('project.description')} span={2}>
            {project.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('project.personnelInfo')} bordered={false} style={{ marginTop: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label={t('project.submitter')}>
            {project.submitterName}
          </Descriptions.Item>
          <Descriptions.Item label={t('project.owner')}>
            {project.ownerName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('project.participants')} span={2}>
            {project.participantIds.length > 0 ? project.participantIds.join(', ') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('project.timeInfo')} bordered={false} style={{ marginTop: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label={t('project.estimatedStartDate')}>
            {project.estimatedStartDate ? dayjs(project.estimatedStartDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('project.estimatedEndDate')}>
            {project.estimatedEndDate ? dayjs(project.estimatedEndDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('project.actualStartDate')}>
            {project.actualStartDate ? dayjs(project.actualStartDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('project.actualEndDate')}>
            {project.actualEndDate ? dayjs(project.actualEndDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {project.remarks && (
        <Card title={t('project.remarks')} bordered={false} style={{ marginTop: 16 }}>
          <p>{project.remarks}</p>
        </Card>
      )}

      {/* 附件管理 */}
      <Card title={t('project.attachments')} bordered={false} style={{ marginTop: 16 }}>
        <ProjectAttachmentManager project={project} onUpdate={() => fetchProject(id!)} />
      </Card>

      {/* 项目历史记录 */}
      <Card title="项目历史" bordered={false} style={{ marginTop: 16 }}>
        <ProjectHistoryTimeline projectId={project.id} />
      </Card>

      {/* 领取项目对话框 */}
      <ProjectClaimModal
        project={project}
        visible={claimModalVisible}
        onClose={() => setClaimModalVisible(false)}
        onSuccess={() => fetchProject(id!)}
      />

      {/* 分配项目对话框 */}
      <ProjectAssignModal
        project={project}
        visible={assignModalVisible}
        onClose={() => setAssignModalVisible(false)}
        onSuccess={() => fetchProject(id!)}
      />
    </div>
  );
};

export default ProjectDetail;
