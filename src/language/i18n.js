import {initReactI18next} from 'react-i18next';
import i18n from 'i18next';

import enTranslations from './english.json';
import arTranslations from './arabic.json';
import urTranslation from './urdu.json';
import frTranslation from './french.json';
import spanishTranslations from './spanish.json';
import hindiTranslations from './hindi.json';
import farsiTranslations from './farsi.json';
import pashtoTranslations from './pashto.json';
import punjabiTranslations from './punjabi.json';
import punjabiGurmukhiTranslations from './punjabi_gurmukhi.json';

import screenEn from './screens/en.json';
import screenUr from './screens/ur.json';
import screenAr from './screens/ar.json';
import screenFr from './screens/fr.json';
import screenSpanish from './screens/spanish.json';
import screenHindi from './screens/hindi.json';
import screenFarsi from './screens/farsi.json';
import screenPashto from './screens/pashto.json';
import screenPunjabi from './screens/punjabi.json';
import screenPunjabiGurmukhi from './screens/punjabi_gurmukhi.json';

const mergeTranslations = (base, screens) => ({
  ...base,
  screens,
});

const pack = (base, screens) => ({
  translation: mergeTranslations(base, screens),
});

const spanishPack = pack(spanishTranslations, screenSpanish);
const hindiPack = pack(hindiTranslations, screenHindi);
const farsiPack = pack(farsiTranslations, screenFarsi);
const pashtoPack = pack(pashtoTranslations, screenPashto);
const punjabiPack = pack(punjabiTranslations, screenPunjabi);
const punjabiGurmukhiPack = pack(
  punjabiGurmukhiTranslations,
  screenPunjabiGurmukhi,
);

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: pack(enTranslations, screenEn),
    ar: pack(arTranslations, screenAr),
    arabic: pack(arTranslations, screenAr),
    ur: pack(urTranslation, screenUr),
    fr: pack(frTranslation, screenFr),

    // Primary API-style codes + ISO aliases
    spanish: spanishPack,
    es: spanishPack,

    hindi: hindiPack,
    hi: hindiPack,

    farsi: farsiPack,
    fa: farsiPack,
    persian: farsiPack,

    pashto: pashtoPack,
    ps: pashtoPack,

    punjabi: punjabiPack,
    pa: punjabiPack,
    'pa-arab': punjabiPack,

    punjabi_gurmukhi: punjabiGurmukhiPack,
    Punjabi_Gu: punjabiGurmukhiPack,
    punjabi_gu: punjabiGurmukhiPack,
    'pa-guru': punjabiGurmukhiPack,
    gurmukhi: punjabiGurmukhiPack,
  },
});

export default i18n;
