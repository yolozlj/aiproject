import { useState } from 'react';
import { Upload, Button, message, Space, Typography, Card } from 'antd';
import { UploadOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { uploadAttachmentToProject, type AttachmentResponse } from '@/api/attachmentApi';
import './ProjectAttachmentUpload.css';

const { Text } = Typography;

interface ProjectAttachmentUploadProps {
  projectId?: string;  // 项目 ID（编辑模式时需要）
  value?: AttachmentInfo[];  // 现有附件列表
  onChange?: (attachments: AttachmentInfo[]) => void;  // 附件变化回调
  onFilesChange?: (files: File[]) => void;  // 文件对象变化回调（新建模式）
  disabled?: boolean;  // 是否禁用
}

export interface AttachmentInfo {
  id: string;
  name: string;
  size: number;
  url: string;
  mimetype: string;
  file?: File;  // 原始文件对象（新建模式下使用）
}

const ProjectAttachmentUpload: React.FC<ProjectAttachmentUploadProps> = ({
  projectId,
  value = [],
  onChange,
  onFilesChange,
  disabled = false,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(
    value.map(att => ({
      uid: att.id,
      name: att.name,
      status: 'done',
      url: att.url,
      size: att.size,
      originFileObj: att.file,
    }))
  );
  const [uploading, setUploading] = useState(false);

  // 自定义上传逻辑
  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    // 如果没有项目 ID，暂存文件到本地，等保存时一起上传
    if (!projectId) {
      const uploadFile: UploadFile = {
        uid: `temp-${Date.now()}`,
        name: (file as File).name,
        status: 'done',
        size: (file as File).size,
        originFileObj: file as File,
      };

      const newFileList = [...fileList, uploadFile];
      setFileList(newFileList);

      // 通知父组件（仅通知文件列表，实际上传在保存时进行）
      if (onChange) {
        onChange(
          newFileList.map(f => ({
            id: f.uid,
            name: f.name,
            size: f.size || 0,
            url: f.url || '',
            mimetype: f.type || '',
            file: f.originFileObj as File,
          }))
        );
      }

      // 通知父组件文件对象列表
      if (onFilesChange) {
        const files = newFileList
          .filter(f => f.originFileObj)
          .map(f => f.originFileObj as File);
        onFilesChange(files);
      }

      onSuccess?.(uploadFile);
      message.success(`${(file as File).name} 已添加到待上传列表`);
      return;
    }

    // 有项目 ID，立即上传
    setUploading(true);
    try {
      const response: AttachmentResponse = await uploadAttachmentToProject(
        projectId,
        file as File
      );

      const uploadFile: UploadFile = {
        uid: response.id,
        name: response.name,
        status: 'done',
        url: response.presignedUrl,
        size: response.size,
      };

      const newFileList = [...fileList, uploadFile];
      setFileList(newFileList);

      // 通知父组件
      if (onChange) {
        onChange(
          newFileList.map(f => ({
            id: f.uid,
            name: f.name,
            size: f.size || 0,
            url: f.url || '',
            mimetype: f.type || '',
          }))
        );
      }

      onSuccess?.(response);
      message.success(`${response.name} 上传成功`);
    } catch (error: any) {
      console.error('上传失败:', error);
      onError?.(error);
      message.error(`上传失败: ${error.message || '未知错误'}`);
    } finally {
      setUploading(false);
    }
  };

  // 删除附件
  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter(f => f.uid !== file.uid);
    setFileList(newFileList);

    if (onChange) {
      onChange(
        newFileList.map(f => ({
          id: f.uid,
          name: f.name,
          size: f.size || 0,
          url: f.url || '',
          mimetype: f.type || '',
          file: f.originFileObj as File,
        }))
      );
    }

    // 通知父组件文件对象列表
    if (onFilesChange) {
      const files = newFileList
        .filter(f => f.originFileObj)
        .map(f => f.originFileObj as File);
      onFilesChange(files);
    }

    message.success(`${file.name} 已删除`);
  };

  // 文件大小格式化
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const uploadProps: UploadProps = {
    customRequest: handleUpload,
    onRemove: handleRemove,
    fileList,
    multiple: true,
    showUploadList: false,
    disabled: disabled || uploading,
    beforeUpload: (file) => {
      // 文件大小限制 100MB
      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isLt100M) {
        message.error('文件大小不能超过 100MB');
        return false;
      }
      return true;
    },
  };

  return (
    <div className="project-attachment-upload">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 上传按钮 */}
        <Upload {...uploadProps}>
          <Button
            icon={<UploadOutlined />}
            loading={uploading}
            disabled={disabled}
          >
            {uploading ? '上传中...' : projectId ? '上传附件' : '添加附件'}
          </Button>
        </Upload>

        {/* 附件列表 */}
        {fileList.length > 0 && (
          <Card
            size="small"
            className="attachment-list-card"
            title={
              <Space>
                <PaperClipOutlined />
                <Text strong>附件列表 ({fileList.length})</Text>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {fileList.map(file => (
                <div key={file.uid} className="attachment-item">
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <PaperClipOutlined style={{ color: '#1890ff' }} />
                      <div>
                        {file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-name"
                          >
                            {file.name}
                          </a>
                        ) : (
                          <Text className="attachment-name">{file.name}</Text>
                        )}
                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                          {formatFileSize(file.size || 0)}
                        </Text>
                      </div>
                    </Space>
                    {!disabled && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(file)}
                      >
                        删除
                      </Button>
                    )}
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        )}

        {!projectId && fileList.length > 0 && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 附件将在保存项目后上传到服务器
          </Text>
        )}
      </Space>
    </div>
  );
};

export default ProjectAttachmentUpload;
