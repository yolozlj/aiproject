import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 在 React 挂载之前拦截 SSO token
// 解决 SSO 回调到根路径时 React Router 导航丢失 token 的问题
const _ssoParams = new URLSearchParams(window.location.search);
const _ssoToken = _ssoParams.get('token');
if (_ssoToken) {
  sessionStorage.setItem('sso_pending_token', _ssoToken);
  history.replaceState({}, '', window.location.pathname);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
