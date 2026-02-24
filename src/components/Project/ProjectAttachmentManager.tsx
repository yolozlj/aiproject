import React, { useState } from 'react';
import { Upload, Button, List, message, Popconfirm, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { Project, Attachment } from '@/types/project';
import { uploadAttachment, deleteAttachment, updateProject } from '@/api/project';
import { useAuthStore } from '@/store/authStore';
import { canEditProject } from '@/utils/projectPermission';
import './ProjectAttachmentManager.css';

interface ProjectAttachmentManagerProps {
  project: Project;
  onUpdate?: () => void;
}

const ProjectAttachmentManager: React.FC<ProjectAttachmentManagerProps> = ({
  project,
  onUpdate,
}) => {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!user) return null;

  const canEdit = canEditProject(project, user);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    if (!(file instanceof File)) {
      message.error('无效的文件');
      return;
    }

    try {
      setUploading(true);

      // 这里应该先上传文件到对象存储（OSS/S3），获取文件 URL
      // 为了演示，这里模拟生成一个文件 URL
      // 在实际项目中，需要配置真实的文件上传服务
      const fileUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;

      // 创建附件信息
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        uploadedAt: new Date(),
        uploadedBy: user.fullName,
      };

      // 更新项目的附件列表
      const updatedAttachments = [...project.attachments, newAttachment];
      await updateProject(project.id, {
        attachments: updatedAttachments as any,
      });

      message.success('附件上传成功');
      onSuccess?.(fileUrl);
      onUpdate?.();
    } catch (error) {
      message.error('附件上传失败');
      console.error('Upload attachment error:', error);
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      setDeletingId(attachmentId);

      // 从附件列表中移除
      const updatedAttachments = project.attachments.filter((att) => att.id !== attachmentId);
      await updateProject(project.id, {
        attachments: updatedAttachments as any,
      });

      message.success('附件删除成功');
      onUpdate?.();
    } catch (error) {
      message.error('附件删除失败');
      console.error('Delete attachment error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return { icon: '🖼️', className: 'file-icon-image' };
    if (fileType.includes('pdf')) return { icon: '📄', className: 'file-icon-pdf' };
    if (fileType.includes('word') || fileType.includes('document')) return { icon: '📝', className: 'file-icon-doc' };
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return { icon: '📊', className: 'file-icon-excel' };
    if (fileType.includes('zip') || fileType.includes('rar')) return { icon: '📦', className: 'file-icon-archive' };
    return { icon: '📎', className: '' };
  };

  return (
    <div className="attachment-manager">
      {canEdit && (
        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          multiple
          maxCount={10}
        >
          <Button
            className="upload-button"
            icon={<UploadOutlined />}
            loading={uploading}
            disabled={uploading}
          >
            {uploading ? '上传中...' : '上传附件'}
          </Button>
        </Upload>
      )}

      {project.attachments.length > 0 && (
        <List
          className="attachment-list"
          dataSource={project.attachments}
          renderItem={(attachment) => {
            const fileIconData = getFileIcon(attachment.fileType);

            return (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    下载
                  </Button>,
                  canEdit && (
                    <Popconfirm
                      title="确认删除"
                      description="确定要删除这个附件吗？"
                      onConfirm={() => handleDelete(attachment.id)}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deletingId === attachment.id}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <div className={`attachment-icon ${fileIconData.className}`}>
                      <span style={{ fontSize: 24 }}>{fileIconData.icon}</span>
                    </div>
                  }
                  title={
                    <span className="attachment-filename">
                      {attachment.fileName}
                    </span>
                  }
                  description={
                    <div className="attachment-meta">
                      <Space separator="|">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <span>上传于 {new Date(attachment.uploadedAt).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                        <span>上传人：{attachment.uploadedBy}</span>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}

      {project.attachments.length === 0 && !canEdit && (
        <div className="no-attachments">暂无附件</div>
      )}
    </div>
  );
};

export default ProjectAttachmentManager;
