import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme as antTheme, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { router } from './router';
import { usePreferenceStore } from './store';
import { ErrorBoundary } from './components/Common';
import './utils/i18n';
import './styles/global.css';

function App() {
  const { theme, language } = usePreferenceStore();

  // 初始化主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Ant Design 主题配置
  const getAntTheme = () => {
    const themeConfig = {
      minimal: {
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
        algorithm: antTheme.defaultAlgorithm,
      },
      dark: {
        token: {
          colorPrimary: '#177ddc',
          borderRadius: 6,
        },
        algorithm: antTheme.darkAlgorithm,
      },
    };

    return themeConfig[theme];
  };

  // 国际化配置
  const locale = language === 'zh-CN' ? zhCN : enUS;

  return (
    <ErrorBoundary>
      <ConfigProvider theme={getAntTheme()} locale={locale}>
        <AntApp>
          <RouterProvider router={router} />
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
