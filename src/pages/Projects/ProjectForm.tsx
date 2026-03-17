import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, Button, Space, message, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createProject, updateProject, getProjectById } from '@/api';
import { uploadAttachmentToProject } from '@/api/attachmentApi';
import { getUserList } from '@/api/user';
import type { CreateProjectRequest, UpdateProjectRequest } from '@/types';
import type { User } from '@/types/user';
import { Loading } from '@/components/Common';
import ProjectAttachmentUpload, { type AttachmentInfo } from '@/components/Project/ProjectAttachmentUpload';
import dayjs from 'dayjs';
import './ProjectForm.css';

const { Option } = Select;
const { TextArea } = Input;

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // 待上传的文件（新建项目时）
  const [developers, setDevelopers] = useState<User[]>([]);
  const [projectManagers, setProjectManagers] = useState<User[]>([]);
  const [currentType, setCurrentType] = useState<string>('data_development');
  const [ownerDisabled, setOwnerDisabled] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    // 获取全量用户后前端按角色过滤（Teable API role 过滤不稳定，与项目列表策略一致）
    getUserList({ pageSize: 500 }).then((result) => {
      const active = result.data.filter(u => u.status === 'active');
      setDevelopers(active.filter(u => u.role === 'developer'));
      setProjectManagers(active.filter(u => u.role === 'project_manager'));
    }).catch(err => {
      console.error('加载用户列表失败:', err);
    });

    if (id) {
      fetchProject(id);
    }
  }, [id]);

  // 类型变化联动逻辑
  const handleTypeChange = (value: string) => {
    setCurrentType(value);
    if (value === 'system_development') {
      // 自动填入董文胜
      const dongWensheng = projectManagers.find(pm => pm.fullName === '董文胜');
      if (dongWensheng) {
        form.setFieldValue('ownerId', dongWensheng.id);
      } else {
        // 如果列表中没有，清空
        form.setFieldValue('ownerId', undefined);
      }
      setOwnerDisabled(true);
    } else {
      form.setFieldValue('ownerId', undefined);
      setOwnerDisabled(false);
    }
  };

  const fetchProject = async (projectId: string) => {
    setInitialLoading(true);
    try {
      const data = await getProjectById(projectId);
      form.setFieldsValue({
        ...data,
        expectedEndDate: data.expectedEndDate ? dayjs(data.expectedEndDate) : undefined,
        tags: data.tags || [],
      });

      // 设置现有附件
      if (data.attachments && data.attachments.length > 0) {
        const existingAttachments: AttachmentInfo[] = data.attachments.map(att => ({
          id: att.id,
          name: att.fileName,
          size: att.fileSize,
          url: att.fileUrl,
          mimetype: att.fileType,
        }));
        setAttachments(existingAttachments);
      }
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setInitialLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 根据 ownerId 查找对应的 ownerName
      let ownerName: string | undefined;
      if (values.ownerId) {
        const allUsers = [...developers, ...projectManagers];
        const owner = allUsers.find(u => u.id === values.ownerId);
        ownerName = owner?.fullName;
      }

      const payload = {
        ...values,
        ownerName,
        expectedEndDate: values.expectedEndDate?.format('YYYY-MM-DD'),
        tags: values.tags || [],
      };

      if (isEdit && id) {
        // 编辑模式：直接更新
        await updateProject(id, payload as UpdateProjectRequest);
        message.success('更新成功');
        navigate('/projects');
      } else {
        // 创建模式：先创建项目，再上传附件
        const createdProject = await createProject(payload as CreateProjectRequest);
        message.success('项目创建成功');

        // 如果有待上传的文件，逐个上传
        if (pendingFiles.length > 0) {
          message.loading({ content: '正在上传附件...', key: 'uploading' });

          try {
            for (const file of pendingFiles) {
              await uploadAttachmentToProject(createdProject.id, file);
            }
            message.success({ content: '附件上传成功', key: 'uploading' });
          } catch (error: any) {
            message.warning({
              content: `部分附件上传失败: ${error.message}`,
              key: 'uploading'
            });
          }
        }

        navigate('/projects');
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div className="project-form">
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/projects')}
        >
          {t('common.back')}
        </Button>
      </div>

      <Card
        title={isEdit ? t('project.editProject') : t('project.createProject')}
        bordered={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            priority: 'medium',
            type: 'data_development',
          }}
        >
          <Form.Item
            name="name"
            label={t('project.name')}
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label={t('project.type')}
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select onChange={handleTypeChange}>
              <Option value="data_development">{t('project.type_data')}</Option>
              <Option value="system_development">{t('project.type_system')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label={t('project.priority')}
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select>
              <Option value="low">{t('project.priority_low')}</Option>
              <Option value="medium">{t('project.priority_medium')}</Option>
              <Option value="high">{t('project.priority_high')}</Option>
              <Option value="urgent">{t('project.priority_urgent')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={t('project.description')}
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <TextArea rows={4} placeholder="请输入项目描述" />
          </Form.Item>

          {/* 期望完成时间 */}
          <Form.Item
            name="expectedEndDate"
            label="期望完成时间（可选）"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="请选择期望完成时间"
            />
          </Form.Item>

          {/* 指定负责人 */}
          <Form.Item
            name="ownerId"
            label={currentType === 'system_development' ? '指定负责人' : '指定负责人（可选）'}
          >
            {currentType === 'system_development' ? (
              <Select disabled placeholder="自动指定">
                {projectManagers.map(pm => (
                  <Option key={pm.id} value={pm.id}>
                    {pm.fullName}{pm.department ? `（${pm.department}）` : ''}
                  </Option>
                ))}
              </Select>
            ) : (
              <Select
                allowClear
                placeholder="请选择负责人（可选）"
                disabled={ownerDisabled}
              >
                {developers.map(dev => (
                  <Option key={dev.id} value={dev.id}>
                    {dev.fullName}{dev.department ? `（${dev.department}）` : ''}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item name="remarks" label={t('project.remarks')}>
            <TextArea rows={3} placeholder="请输入备注说明" />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="输入标签后按回车添加"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Divider style={{ margin: '24px 0' }} />

          <Form.Item label="附件">
            <ProjectAttachmentUpload
              projectId={isEdit ? id : undefined}
              value={attachments}
              onChange={setAttachments}
              onFilesChange={setPendingFiles}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('common.submit')}
              </Button>
              <Button onClick={() => navigate('/projects')}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProjectForm;
