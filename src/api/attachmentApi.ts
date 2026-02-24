/**
 * 附件上传 API
 * 使用 Teable 原生附件上传 API
 */
import projectsTableClient from './projectsTableClient';

const PROJECTS_TABLE_ID = import.meta.env.VITE_PROJECTS_TABLE_ID;
const ATTACHMENTS_FIELD_ID = 'fldphqYiSDfVyNSZOn2'; // Teable 附件字段 ID

/**
 * 上传附件到项目
 * @param recordId 项目记录 ID (rec_xxx)
 * @param file 要上传的文件
 * @returns 上传后的附件信息
 */
export async function uploadAttachmentToProject(
  recordId: string,
  file: File
): Promise<AttachmentResponse> {
  const formData = new FormData();
  formData.append('file', file);

  console.log(`📤 上传附件到项目 ${recordId}:`, {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  try {
    const response = await projectsTableClient.post<AttachmentUploadResponse>(
      `/table/${PROJECTS_TABLE_ID}/record/${recordId}/${ATTACHMENTS_FIELD_ID}/uploadAttachment`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('✅ 附件上传成功:', response.data);

    // Teable API 返回格式
    const uploadedFile = response.data.fields[ATTACHMENTS_FIELD_ID][0];

    return {
      id: uploadedFile.id,
      name: uploadedFile.name,
      path: uploadedFile.path,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      presignedUrl: uploadedFile.presignedUrl,
      token: uploadedFile.token,
      width: uploadedFile.width,
      height: uploadedFile.height,
    };
  } catch (error) {
    console.error('❌ 附件上传失败:', error);
    throw error;
  }
}

/**
 * 通过 URL 上传附件
 * @param recordId 项目记录 ID
 * @param fileUrl 文件 URL
 * @returns 上传后的附件信息
 */
export async function uploadAttachmentByUrl(
  recordId: string,
  fileUrl: string
): Promise<AttachmentResponse> {
  const formData = new FormData();
  formData.append('fileUrl', fileUrl);

  console.log(`📤 通过 URL 上传附件到项目 ${recordId}:`, fileUrl);

  try {
    const response = await projectsTableClient.post<AttachmentUploadResponse>(
      `/table/${PROJECTS_TABLE_ID}/record/${recordId}/${ATTACHMENTS_FIELD_ID}/uploadAttachment`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('✅ 附件上传成功:', response.data);

    const uploadedFile = response.data.fields[ATTACHMENTS_FIELD_ID][0];

    return {
      id: uploadedFile.id,
      name: uploadedFile.name,
      path: uploadedFile.path,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      presignedUrl: uploadedFile.presignedUrl,
      token: uploadedFile.token,
      width: uploadedFile.width,
      height: uploadedFile.height,
    };
  } catch (error) {
    console.error('❌ 附件上传失败:', error);
    throw error;
  }
}

// Teable API 响应类型
interface AttachmentUploadResponse {
  id: string;
  fields: {
    [key: string]: TeableAttachment[];
  };
}

interface TeableAttachment {
  id: string;
  name: string;
  path: string;
  size: number;
  token: string;
  width?: number;
  height?: number;
  mimetype: string;
  presignedUrl: string;
}

// 返回给前端的附件信息
export interface AttachmentResponse {
  id: string;
  name: string;
  path: string;
  size: number;
  mimetype: string;
  presignedUrl: string;
  token: string;
  width?: number;
  height?: number;
}
