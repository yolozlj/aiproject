import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Input, message, Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Project } from '@/types/project';
import type { UserSimple } from '@/types/user';
import { updateProject } from '@/api/project';
import { getUserList } from '@/api/user';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ProjectAssignModalProps {
  project: Project;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProjectAssignModal: React.FC<ProjectAssignModalProps> = ({
  project,
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState<UserSimple[]>([]);
  const [fetching, setFetching] = useState(false);

  // 加载开发者列表
  useEffect(() => {
    if (visible) {
      loadDevelopers();
    }
  }, [visible]);

  const loadDevelopers = async () => {
    try {
      setFetching(true);
      const result = await getUserList({
        role: 'developer',
        status: 'active',
        pageSize: 100,
      });

      // 转换为 UserSimple 格式
      const developerList: UserSimple[] = result.data.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        avatar: user.avatar,
        department: user.department,
      }));

      setDevelopers(developerList);
    } catch (error) {
      message.error('加载开发者列表失败');
      console.error('Load developers error:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleAssign = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 查找选中的开发者信息
      const selectedDeveloper = developers.find((dev) => dev.id === values.ownerId);
      if (!selectedDeveloper) {
        message.error('请选择开发者');
        return;
      }

      // 分配项目：设置负责人并变更状态
      // 业务逻辑：
      // - 数据项目在 pending_review 状态（开发者已领取）→ 确认后进入 in_progress
      // - 系统项目在 pending_review 状态（项目经理审核通过）→ 分配后进入 in_progress
      // - 其他情况 → 分配后进入 in_progress
      const updateData: any = {
        ownerId: selectedDeveloper.id,
        ownerName: selectedDeveloper.fullName,
        status: 'in_progress', // 分配后直接进入开发状态
        actualStartDate: values.actualStartDate
          ? values.actualStartDate.toISOString()
          : new Date().toISOString(),
      };

      if (values.remarks) {
        updateData.remarks = values.remarks;
      }

      await updateProject(project.id, updateData);

      message.success('项目分配成功');
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error('项目分配失败');
      console.error('Assign project error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="分配项目"
      open={visible}
      onOk={handleAssign}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      confirmLoading={loading}
      okText="确认分配"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="项目信息">
          <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <p style={{ margin: 0 }}>
              <strong>项目名称：</strong>
              {project.name}
            </p>
            <p style={{ margin: '8px 0 0 0' }}>
              <strong>项目类型：</strong>
              {project.type === 'data_development' ? '数据开发' : '系统开发'}
            </p>
          </div>
        </Form.Item>

        <Form.Item
          name="ownerId"
          label="选择开发者"
          rules={[{ required: true, message: '请选择开发者' }]}
        >
          <Select
            placeholder="请选择负责人"
            loading={fetching}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={developers.map((dev) => ({
              value: dev.id,
              label: dev.fullName,
              developer: dev,
            }))}
            optionRender={(option) => {
              const dev = (option.data as any).developer as UserSimple;
              return (
                <Space>
                  <Avatar size="small" src={dev.avatar} icon={<UserOutlined />} />
                  <span>{dev.fullName}</span>
                  {dev.department && (
                    <span style={{ color: '#999', fontSize: 12 }}>({dev.department})</span>
                  )}
                </Space>
              );
            }}
          />
        </Form.Item>

        <Form.Item name="actualStartDate" label="预计开始时间">
          <DatePicker
            style={{ width: '100%' }}
            placeholder="选择开始时间"
            format="YYYY-MM-DD"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <Form.Item name="remarks" label="备注">
          <TextArea
            rows={4}
            placeholder="填写分配说明或要求（可选）"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div
          style={{
            padding: '12px',
            backgroundColor: project.ownerId ? '#f6ffed' : '#e6f7ff',
            border: project.ownerId ? '1px solid #b7eb8f' : '1px solid #91d5ff',
            borderRadius: 4,
          }}
        >
          <p style={{ margin: 0, color: project.ownerId ? '#389e0d' : '#0050b3' }}>
            <strong>分配后：</strong>
          </p>
          <ul style={{ marginBottom: 0, paddingLeft: 20, color: project.ownerId ? '#389e0d' : '#0050b3' }}>
            {project.ownerId ? (
              <>
                <li>确认开发者"{project.ownerName}"的领取</li>
                <li>项目状态将变更为"进行中"</li>
                <li>项目正式开始开发</li>
              </>
            ) : (
              <>
                <li>选中的开发者将成为项目负责人</li>
                <li>项目状态将变更为"进行中"</li>
                <li>实际开始时间将设为指定时间或当前时间</li>
              </>
            )}
          </ul>
        </div>
      </Form>
    </Modal>
  );
};

export default ProjectAssignModal;
