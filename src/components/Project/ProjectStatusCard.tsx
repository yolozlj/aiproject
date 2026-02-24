import React, { useState } from 'react';
import { Card, Steps, Button, Space, Modal, Form, Input, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Project } from '@/types/project';
import type { ProjectStatus } from '@/types/common';
import { useAuthStore } from '@/store/authStore';
import { updateProject } from '@/api/project';
import { canChangeStatus } from '@/utils/projectPermission';
import {
  STATUS_STEPS,
  getStatusStepIndex,
  getNextAllowedStatuses,
  getStatusLabel,
  getStatusTransitionAction as getStatusTransitionActionUtil,
  getStatusTransitionConfirmMessage as getStatusTransitionConfirmMessageUtil,
} from '@/utils/projectStatusFlow';

const { TextArea } = Input;

interface ProjectStatusCardProps {
  project: Project;
  onUpdate?: () => void;
}

const ProjectStatusCard: React.FC<ProjectStatusCardProps> = ({ project, onUpdate }) => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const currentStepIndex = getStatusStepIndex(project.status);
  const nextAllowedStatuses = getNextAllowedStatuses(project.status);

  // 获取状态转换的操作名称
  const getStatusTransitionAction = (status: ProjectStatus) => {
    return getStatusTransitionActionUtil(project.status, status, !!project.ownerId);
  };

  // 获取状态转换的确认提示
  const getStatusTransitionConfirmMessage = (status: ProjectStatus) => {
    return getStatusTransitionConfirmMessageUtil(project.status, status, !!project.ownerId);
  };

  const handleStatusChange = (status: ProjectStatus) => {
    setTargetStatus(status);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!targetStatus) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      const updateData: any = {
        status: targetStatus,
      };

      // 如果是完成项目，设置实际完成时间
      if (targetStatus === 'completed') {
        updateData.actualEndDate = new Date().toISOString();
      }

      // 如果有备注，添加到更新数据中
      if (values.remarks) {
        updateData.remarks = values.remarks;
      }

      await updateProject(project.id, updateData);

      message.success('项目状态更新成功');
      form.resetFields();
      setModalVisible(false);
      setTargetStatus(null);
      onUpdate?.();
    } catch (error) {
      message.error('项目状态更新失败');
      console.error('Update project status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
    setTargetStatus(null);
  };

  return (
    <>
      <Card
        title="项目状态流程"
        bordered={false}
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            {nextAllowedStatuses.map((status) => {
              const canChange = canChangeStatus(project, user, status);
              if (!canChange) return null;

              const action = getStatusTransitionAction(status);
              const buttonType =
                status === 'completed' ? 'primary' :
                (project.status === 'pending_review' && status === 'in_progress' && project.ownerId) ? 'primary' :
                'default';

              return (
                <Button
                  key={status}
                  type={buttonType}
                  onClick={() => handleStatusChange(status)}
                >
                  {action}
                </Button>
              );
            })}
          </Space>
        }
      >
        <Steps
          current={currentStepIndex}
          items={STATUS_STEPS.map((step, index) => ({
            title: step.title,
            icon:
              index < currentStepIndex ? (
                <CheckCircleOutlined />
              ) : index === currentStepIndex ? (
                <ClockCircleOutlined />
              ) : undefined,
          }))}
        />

        <div style={{ marginTop: 24, padding: '16px', backgroundColor: '#fafafa', borderRadius: 4 }}>
          <p style={{ margin: 0 }}>
            <strong>当前状态：</strong>
            {getStatusLabel(project.status)}
          </p>

          {/* 显示当前状态的说明 */}
          {project.status === 'pending_review' && (
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '13px' }}>
              {project.ownerId ? (
                <>
                  <strong>负责人：</strong>{project.ownerName}
                  <span style={{ marginLeft: 8 }}>
                    （{project.type === 'data_development' ? '开发者已领取，' : ''}等待项目经理确认）
                  </span>
                </>
              ) : (
                <>等待项目经理审核并分配</>
              )}
            </p>
          )}

          {nextAllowedStatuses.length > 0 && (
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              <strong>可执行操作：</strong>
              {nextAllowedStatuses.map((status) => getStatusTransitionAction(status)).join('、')}
            </p>
          )}
        </div>
      </Card>

      {/* 状态变更确认对话框 */}
      <Modal
        title={targetStatus ? getStatusTransitionAction(targetStatus) : '变更状态'}
        open={modalVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <p>
            {targetStatus && getStatusTransitionConfirmMessage(targetStatus)}
          </p>

          <Form.Item name="remarks" label="备注说明">
            <TextArea
              rows={4}
              placeholder="填写变更原因或说明（可选）"
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* 完成项目提示 */}
          {targetStatus === 'completed' && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 4,
              }}
            >
              <p style={{ margin: 0, color: '#389e0d' }}>
                <strong>完成后：</strong>
              </p>
              <ul style={{ marginBottom: 0, paddingLeft: 20, color: '#389e0d' }}>
                <li>项目状态将标记为"已完成"</li>
                <li>实际完成时间将设为当前时间</li>
                <li>项目将不再可编辑（仅管理员可重新开发）</li>
              </ul>
            </div>
          )}

          {/* 确认开始开发提示 */}
          {targetStatus === 'in_progress' && project.status === 'pending_review' && project.ownerId && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 4,
              }}
            >
              <p style={{ margin: 0, color: '#389e0d' }}>
                <strong>确认后：</strong>
              </p>
              <ul style={{ marginBottom: 0, paddingLeft: 20, color: '#389e0d' }}>
                <li>确认开发者"{project.ownerName}"的领取</li>
                <li>项目状态将变更为"进行中"</li>
                <li>实际开始时间将设为当前时间</li>
                <li>项目正式进入开发阶段</li>
              </ul>
            </div>
          )}

          {targetStatus === 'submitted' && project.status === 'pending_review' && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: 4,
              }}
            >
              <p style={{ margin: 0, color: '#d46b08' }}>
                <strong>退回后：</strong>
              </p>
              <ul style={{ marginBottom: 0, paddingLeft: 20, color: '#d46b08' }}>
                <li>项目将退回到"已提交"状态</li>
                <li>需要重新提交审核</li>
                <li>建议填写退回原因</li>
              </ul>
            </div>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default ProjectStatusCard;
