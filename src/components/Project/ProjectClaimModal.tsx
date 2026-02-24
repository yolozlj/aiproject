import React, { useState } from 'react';
import { Modal, Form, Descriptions, message } from 'antd';
import type { Project } from '@/types/project';
import { updateProject } from '@/api/project';
import { useAuthStore } from '@/store/authStore';
import { getStatusLabel } from '@/utils/projectStatusFlow';
import dayjs from 'dayjs';

interface ProjectClaimModalProps {
  project: Project;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProjectClaimModal: React.FC<ProjectClaimModalProps> = ({
  project,
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    if (!user) {
      message.error('用户未登录');
      return;
    }

    try {
      setLoading(true);

      // 领取项目：设置负责人并变更状态为待审核（待项目经理确认）
      // 数据开发项目流程：submitted → (开发者领取) → pending_review → (项目经理确认) → in_progress
      await updateProject(project.id, {
        ownerId: user.id,
        ownerName: user.fullName,
        status: 'pending_review', // 变更为待审核，等待项目经理确认
        // 不设置 actualStartDate，需要项目经理确认后才正式开始
      });

      message.success('项目领取成功，等待项目经理确认');
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error('项目领取失败');
      console.error('Claim project error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="领取项目"
      open={visible}
      onOk={handleClaim}
      onCancel={onClose}
      confirmLoading={loading}
      okText="确认领取"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
          <Descriptions.Item label="项目类型">
            {project.type === 'data_development' ? '数据开发' : '系统开发'}
          </Descriptions.Item>
          <Descriptions.Item label="当前状态">
            {getStatusLabel(project.status)}
          </Descriptions.Item>
          <Descriptions.Item label="优先级">
            {project.priority === 'urgent' && '紧急'}
            {project.priority === 'high' && '高'}
            {project.priority === 'medium' && '中'}
            {project.priority === 'low' && '低'}
          </Descriptions.Item>
          <Descriptions.Item label="提交人">{project.submitterName}</Descriptions.Item>
          {project.estimatedStartDate && (
            <Descriptions.Item label="预计开始时间">
              {dayjs(project.estimatedStartDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
          )}
          {project.estimatedEndDate && (
            <Descriptions.Item label="预计完成时间">
              {dayjs(project.estimatedEndDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="项目描述">
            {project.description || '-'}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4 }}>
          <p style={{ margin: 0, color: '#0050b3' }}>
            <strong>领取后：</strong>
          </p>
          <ul style={{ marginBottom: 0, paddingLeft: 20, color: '#0050b3' }}>
            <li>您将成为该项目的负责人</li>
            <li>项目状态将变更为"待评审"</li>
            <li>需要等待项目经理确认后才能正式开始开发</li>
            <li>项目经理会评估分配的合理性和工作量</li>
          </ul>
        </div>
      </Form>
    </Modal>
  );
};

export default ProjectClaimModal;
