// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';

import tranEn from './resource/en.json';
import tranKo from './resource/ko.json';
import tranJa from './resource/ja.json';

const resources = {
  en: { translation: tranEn },
  ja: { translation: tranJa },
  ko: { translation: tranKo },
}

// // const userLanguage = window.navigator.language || window.navigator.userLanguage;
const userLanguage = window.navigator.language;

// i18n.use(initReactI18next).init({
//   resources,
//   lng: localStorage.getItem('language') || userLanguage || 'en',
//   fallbackLng: 'en',
//   keySeparator: false,
//   interpolation: {
//     escapeValue: false
//   }
// })

// export default i18n;
// export const languages = ['en', 'ko', 'ja'] as const;
// export type Languages = typeof languages[number]; // 'en' | 'ko' | 'ja'


console.log(`[i18n] LANG=${userLanguage}`);

export function t(msgId: string) {
  const langId = userLanguage.substring(0, 2);
  const resource = resources[langId];

  if (!resource) return msgId;
  const translation = resource.translation;
  const msg = translation[msgId];
  if (!msg) return msgId;
  return msg;
}