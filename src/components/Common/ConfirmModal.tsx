import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmModalProps {
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const showConfirmModal = ({ title, content, onConfirm, onCancel }: ConfirmModalProps) => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText: '确认',
    cancelText: '取消',
    onOk: onConfirm,
    onCancel,
  });
};
