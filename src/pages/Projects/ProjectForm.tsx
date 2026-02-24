import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, Button, Space, message, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createProject, updateProject, getProjectById } from '@/api';
import { uploadAttachmentToProject } from '@/api/attachmentApi';
import type { CreateProjectRequest, UpdateProjectRequest } from '@/types';
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
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    setInitialLoading(true);
    try {
      const data = await getProjectById(projectId);
      form.setFieldsValue({
        ...data,
        estimatedStartDate: data.estimatedStartDate ? dayjs(data.estimatedStartDate) : undefined,
        estimatedEndDate: data.estimatedEndDate ? dayjs(data.estimatedEndDate) : undefined,
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
      const payload = {
        ...values,
        estimatedStartDate: values.estimatedStartDate?.format('YYYY-MM-DD'),
        estimatedEndDate: values.estimatedEndDate?.format('YYYY-MM-DD'),
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
            <Select>
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

          <Form.Item name="estimatedStartDate" label={t('project.estimatedStartDate')}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="estimatedEndDate" label={t('project.estimatedEndDate')}>
            <DatePicker style={{ width: '100%' }} />
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
