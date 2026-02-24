import React, { useState } from 'react';
import { Button, Space, Dropdown, Modal, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  UserAddOutlined,
  FileSearchOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/project';
import { useAuthStore } from '@/store/authStore';
import { deleteProject } from '@/api/project';
import {
  canEditProject,
  canClaimProject,
  canAssignProject,
  canDeleteProject,
  canCompleteProject,
} from '@/utils/projectPermission';

interface ProjectQuickActionsProps {
  project: Project;
  onActionComplete?: () => void;
}

const ProjectQuickActions: React.FC<ProjectQuickActionsProps> = ({ project, onActionComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const handleView = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = () => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteProject(project.id);
      message.success('项目删除成功');
      setDeleteModalVisible(false);
      onActionComplete?.();
    } catch (error) {
      message.error('项目删除失败');
      console.error('Delete project error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleClaim = () => {
    // 导航到详情页，在详情页进行领取操作
    navigate(`/projects/${project.id}?action=claim`);
  };

  const handleAssign = () => {
    // 导航到详情页，在详情页进行分配操作
    navigate(`/projects/${project.id}?action=assign`);
  };

  const handleReview = () => {
    // 导航到详情页，在详情页进行审核操作
    navigate(`/projects/${project.id}?action=review`);
  };

  const handleComplete = () => {
    // 导航到详情页，在详情页进行完成操作
    navigate(`/projects/${project.id}?action=complete`);
  };

  // 构建操作菜单项
  const menuItems: MenuProps['items'] = [];

  // 查看详情（所有用户）
  menuItems.push({
    key: 'view',
    icon: <EyeOutlined />,
    label: '查看详情',
    onClick: handleView,
  });

  // 审核/确认（项目经理/管理员，待评审状态）
  if (
    ['admin', 'project_manager'].includes(user.role) &&
    project.status === 'pending_review'
  ) {
    // 根据是否有负责人，显示不同的操作文本
    const reviewLabel = project.ownerId ? '确认并开始' : '审核';
    menuItems.push({
      key: 'review',
      icon: <FileSearchOutlined />,
      label: reviewLabel,
      onClick: handleReview,
    });
  }

  // 分配（项目经理/管理员，未完成的项目）
  if (canAssignProject(project, user)) {
    menuItems.push({
      key: 'assign',
      icon: <UserAddOutlined />,
      label: '分配',
      onClick: handleAssign,
    });
  }

  // 领取（开发者，未分配的已提交数据开发项目）
  // 业务规则：开发者只能领取数据开发项目
  if (canClaimProject(project, user)) {
    menuItems.push({
      key: 'claim',
      icon: <RocketOutlined />,
      label: '领取',
      onClick: handleClaim,
    });
  }

  // 完成（负责人/项目经理，进行中的项目）
  if (canCompleteProject(project, user)) {
    menuItems.push({
      key: 'complete',
      icon: <CheckOutlined />,
      label: '完成',
      onClick: handleComplete,
    });
  }

  // 编辑（有编辑权限）
  if (canEditProject(project, user)) {
    menuItems.push({
      type: 'divider',
    });
    menuItems.push({
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: handleEdit,
    });
  }

  // 删除（仅管理员）
  if (canDeleteProject(project, user)) {
    if (menuItems[menuItems.length - 1]?.type !== 'divider') {
      menuItems.push({
        type: 'divider',
      });
    }
    menuItems.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => setDeleteModalVisible(true),
    });
  }

  return (
    <>
      <Space size="small">
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={handleView}>
          查看
        </Button>
        {menuItems.length > 1 && (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="link" size="small">
              更多
            </Button>
          </Dropdown>
        )}
      </Space>

      {/* 删除确认对话框 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={deleting}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确认要删除项目"{project.name}"吗？</p>
        <p style={{ color: '#ff4d4f', marginTop: 8 }}>
          注意：删除后数据将无法恢复！
        </p>
      </Modal>
    </>
  );
};

export default ProjectQuickActions;
