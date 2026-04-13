import { useEffect, useState } from 'react';
import { Spin, Alert } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, AccountNotRegisteredError } from '@/store/authStore';
import './Login.css';

const SSO_APP_ID = import.meta.env.VITE_SSO_APP_ID as string;
const SSO_LOGIN_URL = `https://sso.100tal.com/portal/login/${SSO_APP_ID}`;

const Login: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loginWithSSO } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('token');

    // 情况1：已登录，直接进入系统
    if (isAuthenticated && !ssoToken) {
      navigate(from, { replace: true });
      return;
    }

    // 情况2：SSO 回调，处理 token
    if (ssoToken) {
      history.replaceState({}, '', window.location.pathname);

      loginWithSSO(ssoToken)
        .then(() => {
          navigate(from, { replace: true });
        })
        .catch((error: Error) => {
          if (error instanceof AccountNotRegisteredError) {
            navigate('/register', {
              replace: true,
              state: { ssoUser: error.ssoUser },
            });
          } else if (error.message === 'account_pending_approval') {
            setPendingMsg('您的访问申请正在审核中，请联系系统管理员处理。');
          } else {
            setErrorMsg(error.message || 'SSO 验证失败，请刷新页面重试。');
          }
        });
      return;
    }

    // 情况3：未登录且无 token，立即跳转 SSO
    window.location.href = SSO_LOGIN_URL;
  }, []);

  // 正常情况下页面内容一闪而过（直接跳转），
  // 只有审核中/错误时才真正展示给用户看。
  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-bg-circle circle-1"></div>
        <div className="login-bg-circle circle-2"></div>
        <div className="login-bg-circle circle-3"></div>
      </div>

      <div className="login-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40, background: 'var(--color-bg-card, #fff)', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <div className="login-logo">
          <svg viewBox="0 0 48 48" className="logo-icon">
            <rect x="8" y="8" width="32" height="32" rx="4" className="logo-rect" />
            <path d="M 16 24 L 22 30 L 32 18" className="logo-check" />
          </svg>
        </div>
        <h1 className="login-title" style={{ margin: 0 }}>项目管理系统</h1>

        {!errorMsg && !pendingMsg && (
          <>
            <Spin size="large" />
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>正在跳转登录…</p>
          </>
        )}

        {pendingMsg && (
          <Alert
            type="warning"
            message="申请审核中"
            description={pendingMsg}
            showIcon
            style={{ width: '100%' }}
          />
        )}

        {errorMsg && (
          <Alert
            type="error"
            message="登录失败"
            description={errorMsg}
            showIcon
            style={{ width: '100%' }}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
