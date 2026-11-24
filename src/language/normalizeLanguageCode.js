/**
 * Map API / stored language codes to i18n resource keys.
 */
const LANGUAGE_ALIASES = {
  en: 'en',
  english: 'en',
  ur: 'ur',
  urdu: 'ur',
  ar: 'ar',
  arabic: 'ar',
  fr: 'fr',
  french: 'fr',
  es: 'spanish',
  spanish: 'spanish',
  hi: 'hindi',
  hindi: 'hindi',
  fa: 'farsi',
  farsi: 'farsi',
  persian: 'farsi',
  ps: 'pashto',
  pashto: 'pashto',
  pa: 'punjabi',
  punjabi: 'punjabi',
  'pa-arab': 'punjabi',
  panjabi: 'punjabi',
  pn: 'punjabi',
  // API returns truncated code for Gurmukhi
  punjabi_gu: 'punjabi_gurmukhi',
  punjabi_gurmukhi: 'punjabi_gurmukhi',
  'pa-guru': 'punjabi_gurmukhi',
  gurmukhi: 'punjabi_gurmukhi',
  punjabi_gur: 'punjabi_gurmukhi',
};

export const normalizeLanguageCode = code => {
  const raw = String(code || 'en').trim();
  if (!raw) {
    return 'en';
  }
  const lower = raw.toLowerCase();
  if (LANGUAGE_ALIASES[lower]) {
    return LANGUAGE_ALIASES[lower];
  }
  // Handle truncated API codes like "Punjabi_Gu"
  if (lower.startsWith('punjabi_gu')) {
    return 'punjabi_gurmukhi';
  }
  return lower;
};

/** Map app/i18n language → languages table / questions API `lang_code` */
const API_LANGUAGE_CODES = {
  en: 'en',
  ur: 'ur',
  ar: 'arabic',
  fr: 'fr',
  spanish: 'spanish',
  hindi: 'hindi',
  farsi: 'farsi',
  pashto: 'pashto',
  punjabi: 'punjabi',
  punjabi_gurmukhi: 'Punjabi_Gu',
};

export const toApiLanguageCode = code => {
  const normalized = normalizeLanguageCode(code);
  return API_LANGUAGE_CODES[normalized] || normalized || 'en';
};

export default normalizeLanguageCode;
