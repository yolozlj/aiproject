import { Button, Space, message } from 'antd';
import { CheckCircleFilled, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { usePreferenceStore } from '@/store';
import type { Theme, Language } from '@/types';
import './Settings.css';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, language, setTheme, setLanguage } = usePreferenceStore();

  const handleThemeChange = (value: Theme) => {
    setTheme(value);
    message.success(t('settings.themeChanged'));
  };

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    i18n.changeLanguage(value);
    message.success(t('settings.languageChanged'));
  };

  const themes = [
    {
      value: 'minimal' as Theme,
      label: t('settings.theme_minimal'),
      description: '超极简 (Minimal)',
      icon: <SunOutlined />,
      preview: 'minimal-preview',
    },
    {
      value: 'dark' as Theme,
      label: t('settings.theme_dark'),
      description: '暗黑模式 (Dark)',
      icon: <MoonOutlined />,
      preview: 'dark-preview',
    },
  ];

  return (
    <div className="settings-page">
      {/* 主题风格 */}
      <section className="settings-section">
        <h2 className="section-title">主题风格</h2>
        <div className="theme-cards">
          {themes.map((item) => (
            <div
              key={item.value}
              className={`theme-card ${theme === item.value ? 'theme-card-selected' : ''}`}
              onClick={() => handleThemeChange(item.value)}
            >
              {theme === item.value && (
                <div className="theme-card-check">
                  <CheckCircleFilled />
                </div>
              )}

              <div className={`theme-card-preview ${item.preview}`}>
                <div className="preview-header">
                  <div className="preview-avatar"></div>
                  <div className="preview-lines">
                    <div className="preview-line"></div>
                    <div className="preview-line short"></div>
                  </div>
                </div>
                <div className="preview-content">
                  <div className="preview-block"></div>
                </div>
              </div>

              <div className="theme-card-info">
                <span className="theme-icon">{item.icon}</span>
                <span className="theme-name">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 语言设置 */}
      <section className="settings-section">
        <h2 className="section-title">语言设置</h2>
        <Space size="middle">
          <Button
            type={language === 'zh-CN' ? 'primary' : 'default'}
            size="large"
            onClick={() => handleLanguageChange('zh-CN')}
            className="language-button"
          >
            {t('settings.language_zh')}
          </Button>
          <Button
            type={language === 'en-US' ? 'primary' : 'default'}
            size="large"
            onClick={() => handleLanguageChange('en-US')}
            className="language-button"
          >
            {t('settings.language_en')}
          </Button>
        </Space>
      </section>
    </div>
  );
};

export default Settings;
