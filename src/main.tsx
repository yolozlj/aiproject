import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 在 React 挂载之前拦截 SSO token
// 解决 SSO 回调到根路径时 React Router 导航丢失 token 的问题
const _ssoParams = new URLSearchParams(window.location.search);
const _ssoToken = _ssoParams.get('token');
const _logoutAt = Number(sessionStorage.getItem('sso_logout_at') || 0);

if (_ssoToken && _logoutAt && Date.now() - _logoutAt < 5000) {
  // 退出后 5 秒内收到 token → SSO 残留 cookie 自动认证，非用户主动登录
  // 丢弃此 token，标记为"已退出"让 Login 页展示退出确认
  sessionStorage.removeItem('sso_logout_at');
  sessionStorage.setItem('sso_logged_out', '1');
  history.replaceState({}, '', window.location.pathname);
} else {
  sessionStorage.removeItem('sso_logout_at');
  if (_ssoToken) {
    // 正常 SSO 回调：存入 token 供 Login 页处理
    sessionStorage.setItem('sso_pending_token', _ssoToken);
    sessionStorage.setItem('sso_pending_token_at', String(Date.now()));
    history.replaceState({}, '', window.location.pathname);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
