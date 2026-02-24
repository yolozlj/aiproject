import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 直接导入翻译文件（Vite会内联）
import zhCN from '../../public/locales/zh-CN/translation.json';
import enUS from '../../public/locales/en-US/translation.json';

i18n
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('language') || 'zh-CN',
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      'en-US': {
        translation: enUS,
      },
    },
  });

export default i18n;
