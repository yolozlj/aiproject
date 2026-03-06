import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';
import { changePassword } from '@/api/user';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!user) return;

      setLoading(true);
      await changePassword(user.username, values.currentPassword, values.newPassword, user.password);

      // 更新本地用户信息中的密码
      setUser({ ...user, password: values.newPassword });

      message.success(t('changePassword.success'));
      form.resetFields();
      onClose();
    } catch (error: any) {
      if (error?.errorFields) {
        // form validation errors, do nothing
        return;
      }
      if (error?.message === 'current_password_wrong') {
        form.setFields([{ name: 'currentPassword', errors: [t('changePassword.currentPasswordWrong')] }]);
      } else {
        message.error(t('changePassword.failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={t('changePassword.title')}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="currentPassword"
          label={t('changePassword.currentPassword')}
          rules={[{ required: true, message: t('changePassword.currentPasswordRequired') }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label={t('changePassword.newPassword')}
          rules={[
            { required: true, message: t('changePassword.newPasswordRequired') },
            { min: 6, message: t('changePassword.passwordTooShort') },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={t('changePassword.confirmPassword')}
          dependencies={['newPassword']}
          rules={[
            { required: true, message: t('changePassword.confirmPasswordRequired') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('changePassword.passwordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
