const i18n = require('i18next');
const ri18n = require('react-i18next');
try {
  i18n.use(ri18n.initReactI18next).init({
    resources: { zh: { translation: {} }, en: { translation: {} } },
    lng: 'zh', fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  console.log('✅ i18n init OK');
} catch(e) {
  console.error('❌ i18n init FAILED:', e.message);
}
