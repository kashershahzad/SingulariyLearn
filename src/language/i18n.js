import {initReactI18next} from 'react-i18next';
import i18n from 'i18next';

import enTranslations from './english.json';
import arTranslations from './arabic.json';
import urTranslation from './urdu.json';
import frTranslation from './french.json';
import screenEn from './screens/en.json';
import screenUr from './screens/ur.json';
import screenAr from './screens/ar.json';
import screenFr from './screens/fr.json';

const mergeTranslations = (base, screens) => ({
  ...base,
  screens,
});

i18n
  .use(initReactI18next) // Initialize react-i18next
  .init({
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    resources: {
      en: {
        translation: mergeTranslations(enTranslations, screenEn),
      },
      ar: {
        translation: mergeTranslations(arTranslations, screenAr),
      },
      ur: {
        translation: mergeTranslations(urTranslation, screenUr),
      },
      fr: {
        translation: mergeTranslations(frTranslation, screenFr),
      },
    },
  });

export default i18n;
