import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import {COLORS} from '../../../utils/COLORS';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import ProgressBar from '../../../components/ProgressBar';
import CustomButton from '../../../components/CustomButton';
import LinearGradient from 'react-native-linear-gradient';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import Video from 'react-native-video';
import CustomModal from '../../../components/CustomModal';
import Icons from '../../../components/Icons';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {
  isBookmarkedFlag,
  toggleQuestionBookmarkApi,
} from '../../../utils/courseBookmark';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const renderTestHeader = (title, hideBack = false) => (
  <Header2 title={title} hideBack={hideBack} />
);

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const WAVE_BARS_COUNT = 48;

/*
 * Dummy practice flow (kept for reference only — live data comes from API like Testfrom.js)
 *
const DUMMY_QUESTIONS = [
  {
    id: 'dq-audio-1',
    mediaType: 'audio',
    audioSource: Audios.mm,
    prompt: 'At a four-way stop, when do you have the right-of-way?',
    subPrompt: 'Choose the most accurate rule.',
    options: [
      {
        id: 'arrive-first',
        title: 'When you arrive first',
        subtitle: 'First vehicle to stop goes first.',
      },
      ...
    ],
  },
];
*/

const GRID_GAP = 10;
const GRID_H_PADDING = 20;
const gridOptionWidth = (SCREEN_WIDTH - GRID_H_PADDING * 2 - GRID_GAP) / 2;

const SINGULARITY_IMAGE_PREFIX = 'singularity_learn/images/';

const ensureHttpsUrl = url => {
  const value = String(url || '').trim();
  if (!value) {
    return null;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return `https://${value}`;
};

const getCompleteImageUrl = imagePath => {
  if (!imagePath || String(imagePath).trim() === '') {
    return null;
  }

  const raw = String(imagePath).trim();
  if (raw.startsWith('http')) {
    return raw;
  }

  if (raw.includes(SINGULARITY_IMAGE_PREFIX)) {
    return ensureHttpsUrl(raw);
  }

  const baseUrl = 'https://7tracking.com/singularity_learn/images/';
  const cleanPath = raw.startsWith('/') ? raw.substring(1) : raw;
  return baseUrl + cleanPath;
};

const parseAnswerField = answerStr => {
  const raw = String(answerStr || '').trim();
  if (!raw) {
    return {text: '', image: null};
  }

  if (raw.includes(SINGULARITY_IMAGE_PREFIX)) {
    const remainder = raw.split(SINGULARITY_IMAGE_PREFIX).pop() || '';
    const fileName = remainder.split('/').pop() || remainder;

    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      return {text: '', image: getCompleteImageUrl(raw)};
    }

    return {text: remainder.trim(), image: null};
  }

  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(raw)) {
    return {text: '', image: getCompleteImageUrl(raw)};
  }

  return {text: raw, image: null};
};

const getAudioUrlFromQuestion = (question, currentLanguage) => {
  if (!question?.audio) {
    return null;
  }
  try {
    const audioData = JSON.parse(question.audio);
    return (
      audioData[currentLanguage] || audioData.en || Object.values(audioData)[0]
    );
  } catch {
    const s = String(question.audio).trim();
    if (s.startsWith('http')) {
      return s;
    }
    return null;
  }
};

const getImageSourceForQuestion = question => {
  const raw = question?.image || question?.thumb || question?.image_url;
  if (!raw || String(raw).trim() === '') {
    return null;
  }
  if (String(raw).endsWith('/images/') || String(raw).includes('/images/""')) {
    return null;
  }
  const uri = getCompleteImageUrl(raw);
  return uri ? {uri} : null;
};

const getVideoSourceForQuestion = question => {
  const raw = question?.video;
  if (!raw || String(raw).trim() === '') {
    return null;
  }
  if (
    raw === 'https://7tracking.com/dmvpermit/images/' ||
    String(raw).includes('/images/""')
  ) {
    return null;
  }
  if (String(raw).startsWith('http')) {
    return {uri: raw};
  }
  return null;
};

const isValidOptionImage = uri => {
  if (!uri || String(uri).trim() === '') {
    return false;
  }
  const value = String(uri);
  if (value.endsWith('/images/') || value.includes('/images/""')) {
    return false;
  }
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(value);
};

const isUrlLikeText = value => {
  const s = String(value || '').trim();
  if (!s) {
    return false;
  }
  return (
    /^https?:\/\//i.test(s) ||
    s.includes(SINGULARITY_IMAGE_PREFIX) ||
    s.includes('/images/') ||
    /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(s)
  );
};

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const extractQuestionByLang = questionField => {
  let questionData;
  try {
    questionData =
      typeof questionField === 'string'
        ? JSON.parse(questionField)
        : questionField;
  } catch {
    questionData = {en: {question: String(questionField || '')}};
  }

  const byLang = {};
  if (!questionData || typeof questionData !== 'object') {
    return byLang;
  }

  Object.keys(questionData).forEach(lang => {
    const val = questionData[lang];
    if (typeof val === 'string' && val.trim()) {
      byLang[lang] = val.trim();
    } else if (val && typeof val === 'object' && val.question) {
      byLang[lang] = String(val.question).trim();
    }
  });

  return byLang;
};

const extractExplanationByLang = explanationField => {
  if (!explanationField) {
    return {};
  }

  let data = explanationField;
  if (typeof explanationField === 'string') {
    try {
      data = JSON.parse(explanationField);
    } catch {
      const text = explanationField.trim();
      return text ? {en: text} : {};
    }
  }

  if (!data || typeof data !== 'object') {
    return {};
  }

  const byLang = {};
  Object.keys(data).forEach(lang => {
    const val = data[lang];
    if (typeof val === 'string' && val.trim()) {
      byLang[lang] = val.trim();
    } else if (val && typeof val === 'object') {
      const text = val.explanation || val.text || val.content || '';
      if (String(text).trim()) {
        byLang[lang] = String(text).trim();
      }
    }
  });

  return byLang;
};

const extractLocalizedLabel = (value, preferredLang = 'en') => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        return (
          parsed[preferredLang] ||
          parsed.en ||
          Object.values(parsed).find(v => typeof v === 'string' && v.trim()) ||
          ''
        );
      }
    } catch {
      return value;
    }
    return value;
  }
  if (typeof value === 'object') {
    return (
      value[preferredLang] ||
      value.en ||
      Object.values(value).find(v => typeof v === 'string' && v.trim()) ||
      ''
    );
  }
  return String(value);
};

const buildOptionsMultiLang = answers => {
  if (!Array.isArray(answers) || !answers.length) {
    return [];
  }

  const byLang = {};
  answers.forEach(answer => {
    const lang = String(answer.lang || 'en').toLowerCase();
    if (!byLang[lang]) {
      byLang[lang] = [];
    }
    byLang[lang].push(answer);
  });

  const langs = Object.keys(byLang);
  const primaryLang = byLang.en ? 'en' : langs[0];
  const primaryAnswers = byLang[primaryLang] || [];

  return primaryAnswers.map((answer, index) => {
    const textsByLang = {};
    const answerIdsByLang = {};
    let image = null;

    langs.forEach(lang => {
      const row = byLang[lang]?.[index];
      if (!row) {
        return;
      }
      const parsedAnswer = parseAnswerField(row.answer);
      const imageFromField = getCompleteImageUrl(row.image);
      const rowImage = parsedAnswer.image || imageFromField || null;
      if (!image && rowImage) {
        image = rowImage;
      }
      const rawText = parsedAnswer.text || '';
      const fallbackText = isUrlLikeText(row.answer)
        ? ''
        : String(row.answer || '').trim();
      const answerText = rawText || (rowImage ? '' : fallbackText);
      textsByLang[lang] =
        !answerText || isUrlLikeText(answerText) ? '' : answerText;
      if (row.id != null && row.id !== '') {
        answerIdsByLang[lang] = String(row.id);
      }
    });

    return {
      textsByLang,
      answerIdsByLang,
      answer: textsByLang[primaryLang] || textsByLang.en || '',
      image,
      correct: Number(answer.is_correct) === 1 ? 1 : 0,
      answerId:
        answerIdsByLang[primaryLang] ||
        answerIdsByLang.en ||
        (answer.id != null && answer.id !== '' ? String(answer.id) : null),
    };
  });
};

/** Multi-language aware parsing for bilingual Study / Practice UI */
const parseQuestionsFromApi = (questionsArray, currentLanguage) => {
  return questionsArray.map(q => {
    const questionByLang = extractQuestionByLang(q.question);
    const fallbackQuestion =
      questionByLang[currentLanguage] ||
      questionByLang.en ||
      questionByLang.ur ||
      Object.values(questionByLang)[0] ||
      'Question not available';

    const options = buildOptionsMultiLang(q.answers);
    const hasOptionImages = options.some(option =>
      isValidOptionImage(option.image),
    );
    const correctIndex = options.findIndex(
      option => Number(option.correct) === 1,
    );

    const category =
      extractLocalizedLabel(
        q.tag || q.category || q.topic || q.lesson_tag,
        currentLanguage,
      ) || '';

    const explanationByLang = extractExplanationByLang(q.explanation);

    return {
      ...q,
      question: fallbackQuestion,
      questionByLang,
      explanationByLang,
      options,
      hasOptionImages,
      category,
      correctAnswerIndex: correctIndex !== -1 ? correctIndex : 0,
    };
  });
};

const buildUiQuestions = (parsedList, currentLanguage) => {
  return parsedList
    .filter(parsed => parsed.options?.length > 0)
    .map(parsed => {
      const audioUri = getAudioUrlFromQuestion(parsed, currentLanguage);
      const imageSource = getImageSourceForQuestion(parsed);
      const videoSource = getVideoSourceForQuestion(parsed);

      const hasAudio = !!(audioUri && String(audioUri).trim());
      const hasVideo = !!videoSource?.uri;

      let mediaType;
      let audioSource = null;

      if (hasAudio) {
        mediaType = 'audio';
        audioSource = {uri: audioUri};
      } else {
        mediaType = 'image';
      }

      const options = parsed.options.map((opt, i) => {
        const imageUri = isValidOptionImage(opt.image) ? opt.image : null;
        const titleText = String(opt.answer || '').trim();
        return {
          id: `opt-${parsed.id}-${i}`,
          answerId: opt.answerId || null,
          answerIdsByLang: opt.answerIdsByLang || {},
          textsByLang: opt.textsByLang || {},
          title: !titleText || isUrlLikeText(titleText) ? '' : titleText,
          subtitle: '',
          imageUri,
          letter: OPTION_LETTERS[i] || String(i + 1),
        };
      });

      const hasOptionImages = options.some(o => !!o.imageUri);
      const useGridForOptions = mediaType !== 'audio' && hasOptionImages;

      const ci = Math.min(
        Math.max(0, parsed.correctAnswerIndex ?? 0),
        Math.max(0, options.length - 1),
      );

      return {
        id: String(parsed.id),
        mediaType,
        audioSource,
        imageSource,
        videoSource: hasVideo ? videoSource : null,
        prompt: parsed.question,
        promptByLang: parsed.questionByLang || {},
        explanationByLang: parsed.explanationByLang || {},
        category: parsed.category || '',
        subPrompt: 'Select the correct answer.',
        options,
        useGridForOptions,
        correctAnswerIndex: ci,
        isBookmarked: isBookmarkedFlag(parsed.is_bookmarked),
        audioByLang: (() => {
          try {
            return parsed.audio ? JSON.parse(parsed.audio) : null;
          } catch {
            return null;
          }
        })(),
      };
    });
};

const LANG_FALLBACK_NAMES = {
  en: 'English',
  ur: 'Urdu',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
  hi: 'Hindi',
  zh: 'Chinese',
};

const QUESTIONS_PAGE_LIMIT = 10;

const normalizeQuestionsArray = raw => {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && typeof raw === 'object') {
    return [raw];
  }
  return [];
};

const extractTotalQuestions = response => {
  const body = response?.data;
  const nested =
    body?.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? body.data
      : null;
  const raw =
    body?.total_questions ??
    body?.totalQuestions ??
    nested?.total_questions ??
    nested?.totalQuestions;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const TestformNew = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 280,
      },
      container: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingBottom: 24,
      },
      optionCard: {
        borderRadius: 10,
        padding: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: c.optionBorder,
        backgroundColor: c.optionBg,
      },
      optionCardFullWidth: {
        width: '100%',
        alignSelf: 'stretch',
      },
      selectedOptionCard: {
        backgroundColor: c.accent,
        borderColor: c.accent,
      },
      optionCardCorrect: {
        backgroundColor: c.correct,
        borderColor: c.correct,
      },
      optionCardWrong: {
        backgroundColor: c.wrong,
        borderColor: c.wrong,
      },
      optionGrid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      },
      optionGridCell: {
        minHeight: 61,
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 8,
        marginBottom: GRID_GAP,
        borderWidth: 1,
        borderColor: c.optionBorder,
        backgroundColor: c.optionBg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      optionGridCellSelected: {
        backgroundColor: c.accent,
        borderColor: c.accent,
      },
      optionGridCellCorrect: {
        backgroundColor: c.correct,
        borderColor: c.correct,
      },
      optionGridCellWrong: {
        backgroundColor: c.wrong,
        borderColor: c.wrong,
      },
      optionGridThumb: {
        width: '100%',
        height: 96,
        marginBottom: 4,
      },
      imageZoomFab: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
      },
      audioCard: {
        marginTop: 20,
        borderWidth: 1.2,
        borderColor: c.border,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: c.card,
      },
      playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
      },
      playIcon: {
        width: 24,
        height: 24,
      },
      waveformContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      waveLine: {
        width: 2,
        borderRadius: 99,
        backgroundColor: c.textMuted,
      },
      hiddenAudio: {
        width: 1,
        height: 1,
        opacity: 0,
        position: 'absolute',
      },
      imagePreviewCard: {
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        paddingVertical: 12,
        paddingHorizontal: 12,
        minHeight: 179,
        backgroundColor: c.card,
      },
      imagePreviewFabRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 8,
      },
      imagePreviewThumbRow: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      imagePreviewThumbWrap: {
        width: '100%',
        height: 180,
        alignSelf: 'center',
      },
      imageZoomFabIcon: {
        width: 22,
        height: 22,
      },
      zoomModalClose: {
        alignSelf: 'flex-end',
        marginBottom: 8,
        marginRight: 4,
        top: Platform.OS === 'ios' ? 8 : 0,
        zIndex: 999,
      },
      zoomModalImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.72,
        alignSelf: 'center',
      },
      footerActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
      },
      footerActionsRowBottom: {
        marginBottom: 24,
        paddingBottom: 24,
      },
      footerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
      },
      footerGradientButton: {
        height: 51,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      },
      studyBanner: {
        marginHorizontal: -20,
        marginBottom: 18,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#EFF6FFB2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      studyBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
        minWidth: 0,
      },
      studyBannerIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
      },
      studyBannerIcon: {
        width: 20,
        height: 20,
      },
      studyBannerTextWrap: {
        flex: 1,
        minWidth: 0,
      },
      langChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#D6E8F5',
        paddingHorizontal: 10,
        paddingVertical: 7,
        maxWidth: 150,
      },
      metaRow: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      categoryPill: {
        backgroundColor: '#E8F4FC',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        maxWidth: '58%',
      },
      listenBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 7,
      },
      bilingualOptionCard: {
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 12,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
      },
      bilingualOptionCardCorrect: {
        backgroundColor: '#28A1644D',
        borderColor: '#28A1644D',
        borderWidth: 2,
      },
      bilingualOptionCardSelected: {
        backgroundColor: '#28A1644D',
        borderColor: '#28A1644D',
        borderWidth: 2,
      },
      bilingualOptionCardWrong: {
        backgroundColor: '#FDECEC',
        borderColor: '#E5484D',
      },
      optionLetterBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      },
      optionLetterBadgeActive: {
        borderColor: '#28A164',
        backgroundColor: '#28A164',
      },
      optionLetterBadgeSelected: {
        borderColor: '#28A164',
        backgroundColor: '#28A164',
      },
      optionLetterText: {
        fontSize: 13,
        fontFamily: fonts.jakartaBold,
        color: '#111827',
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
        lineHeight: 16,
        marginTop: Platform.OS === 'android' ? 1 : 0,
      },
      optionLetterTextActive: {
        color: '#FFFFFF',
      },
      optionTextCol: {
        flex: 1,
        minWidth: 0,
        marginRight: 8,
      },
      optionRadio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
      },
      optionRadioCorrect: {
        borderColor: '#28A164',
        backgroundColor: '#FFFFFF',
      },
      optionRadioSelected: {
        borderColor: '#28A164',
        backgroundColor: '#FFFFFF',
      },
      optionRadioWrong: {
        borderColor: '#E5484D',
        backgroundColor: '#FFFFFF',
      },
      optionRadioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#28A164',
      },
      optionRadioDotWrong: {
        backgroundColor: '#E5484D',
      },
      questionImageCard: {
        marginTop: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
      },
      questionImage: {
        width: '100%',
        height: 180,
      },
      questionImageZoom: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
      },
      langModalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        maxHeight: SCREEN_HEIGHT * 0.55,
      },
      langModalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
      },
      langCheck: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      },
      langCheckActive: {
        backgroundColor: '#0298EF',
        borderColor: '#0298EF',
      },
      studyFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
        gap: 10,
      },
      studyPrevBtn: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
      },
      studyNextBtnWrap: {
        flex: 1.2,
      },
      explanationCard: {
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: '#EFF6FFB2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        paddingHorizontal: 14,
        paddingVertical: 12,
      },
    }),
  );

  const {
    lessonId,
    permit_id,
    lessonName,
    course_id,
    courseId,
    is_mockup,
    is_study,
    bookmarkReview,
    questionId: bookmarkQuestionIdParam,
    bookmarkQuestion: bookmarkQuestionRaw,
  } = route.params || {};
  const activeCourseId = course_id || courseId || '0';
  const activePermitId = permit_id || '1';
  const isMockupTest =
    is_mockup === '1' || is_mockup === 1 || is_mockup === true;
  const isStudyMode =
    is_study === '1' || is_study === 1 || is_study === true;
  const isBookmarkReview =
    bookmarkReview === true || bookmarkReview === 1 || bookmarkReview === '1';

  const [questionsUi, setQuestionsUi] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showOptionFeedback, setShowOptionFeedback] = useState(false);
  const [continueHoldActive, setContinueHoldActive] = useState(false);
  const continueHoldTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [imageZoomVisible, setImageZoomVisible] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedLangCodes, setSelectedLangCodes] = useState(() => {
    const code = String(currentLanguage || 'en').toLowerCase();
    return code === 'en' ? ['en'] : ['en', code];
  });
  const [langModalVisible, setLangModalVisible] = useState(false);
  const audioRef = useRef(null);
  const allAnswersRef = useRef([]);
  const questionsUiRef = useRef([]);
  const totalQuestionsRef = useRef(0);
  const hasMoreQuestionsRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const lastIdRef = useRef(0);
  const [accumulatedTimeSec, setAccumulatedTimeSec] = useState(0);
  const questionStartedAtRef = useRef(Date.now());

  useEffect(() => {
    questionsUiRef.current = questionsUi;
  }, [questionsUi]);

  useEffect(() => {
    totalQuestionsRef.current = totalQuestions;
  }, [totalQuestions]);

  useEffect(() => {
    let cancelled = false;
    const fetchLanguages = async () => {
      try {
        const result = await ApiRequest({
          type: 'get_data',
          table_name: 'languages',
        });
        if (cancelled) {
          return;
        }
        const list = (result?.data?.data || []).map(item => {
          const code = String(
            item.lang_code ?? item.code ?? item.id ?? 'en',
          ).toLowerCase();
          return {
            code,
            title:
              item.language ||
              item.name ||
              item.title ||
              LANG_FALLBACK_NAMES[code] ||
              code.toUpperCase(),
          };
        });
        const unique = [];
        const seen = new Set();
        list.forEach(item => {
          if (!item.code || seen.has(item.code)) {
            return;
          }
          seen.add(item.code);
          unique.push(item);
        });
        if (!unique.some(l => l.code === 'en')) {
          unique.unshift({code: 'en', title: 'English'});
        }
        setAvailableLanguages(unique);
        setSelectedLangCodes(prev => {
          const valid = prev.filter(code =>
            unique.some(l => l.code === code),
          );
          if (valid.length > 1) {
            return valid;
          }
          const hasEn = unique.some(l => l.code === 'en');
          const hasUr = unique.some(l => l.code === 'ur');
          if (hasEn && hasUr) {
            return ['en', 'ur'];
          }
          const appLang = String(currentLanguage || 'en').toLowerCase();
          if (unique.some(l => l.code === appLang) && appLang !== 'en' && hasEn) {
            return ['en', appLang];
          }
          if (valid.length) {
            return valid;
          }
          return hasEn ? ['en'] : unique[0] ? [unique[0].code] : ['en'];
        });
      } catch (error) {
        console.error('languages fetch error:', error);
        if (!cancelled) {
          setAvailableLanguages([
            {code: 'en', title: 'English'},
            {code: 'ur', title: 'Urdu'},
          ]);
        }
      }
    };
    fetchLanguages();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const selectedLanguageLabel = useMemo(() => {
    if (!selectedLangCodes.length) {
      return 'Language';
    }
    const names = selectedLangCodes.map(code => {
      const match = availableLanguages.find(l => l.code === code);
      return match?.title || LANG_FALLBACK_NAMES[code] || code.toUpperCase();
    });
    return names.join(' + ');
  }, [selectedLangCodes, availableLanguages]);

  const primaryLangCode = selectedLangCodes[0] || 'en';
  const secondaryLangCodes = selectedLangCodes.slice(1);

  const toggleDisplayLanguage = useCallback(code => {
    setSelectedLangCodes(prev => {
      if (prev.includes(code)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter(c => c !== code);
      }
      return [...prev, code];
    });
  }, []);

  const getPromptForLang = useCallback(
    (question, lang) => {
      if (!question) {
        return '';
      }
      const byLang = question.promptByLang || {};
      return (
        byLang[lang] ||
        byLang.en ||
        question.prompt ||
        ''
      );
    },
    [],
  );

  const getOptionTextForLang = useCallback((option, lang) => {
    if (!option) {
      return '';
    }
    const byLang = option.textsByLang || {};
    const text = byLang[lang] || (lang === primaryLangCode ? option.title : '');
    return text && !isUrlLikeText(text) ? text : '';
  }, [primaryLangCode]);

  const getExplanationForLang = useCallback((question, lang) => {
    if (!question) {
      return '';
    }
    const byLang = question.explanationByLang || {};
    return (
      byLang[lang] ||
      byLang.en ||
      Object.values(byLang).find(v => typeof v === 'string' && v.trim()) ||
      ''
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (isBookmarkReview && bookmarkQuestionIdParam) {
        if (!token) {
          setQuestionsUi([]);
          setTotalQuestions(0);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          let apiData = [];

          if (bookmarkQuestionRaw) {
            const nested = bookmarkQuestionRaw.question || bookmarkQuestionRaw;
            const rowId = String(
              nested.id ??
                bookmarkQuestionRaw.question_id ??
                bookmarkQuestionIdParam,
            );
            apiData = [
              {
                ...nested,
                id: rowId,
                course_id:
                  nested.course_id ??
                  bookmarkQuestionRaw.course_id ??
                  activeCourseId,
                lesson_id:
                  nested.lesson_id ?? bookmarkQuestionRaw.lesson_id ?? lessonId,
              },
            ];
          }

          if (!apiData.length) {
            const tryFetch = async body => {
              const response = await ApiRequest(body);
              if (response?.status !== 200) {
                return [];
              }
              return normalizeQuestionsArray(response?.data?.data);
            };

            let rows =
              (await tryFetch({
                type: 'get_data',
                table_name: 'questions',
                id: String(bookmarkQuestionIdParam),
                user_id: String(token),
              })) ||
              (await tryFetch({
                type: 'get_data',
                table_name: 'questions',
                question_id: String(bookmarkQuestionIdParam),
                user_id: String(token),
              }));

            const match = rows.find(
              row => String(row.id) === String(bookmarkQuestionIdParam),
            );
            apiData = match ? [match] : rows.slice(0, 1);
          }

          if (cancelled) {
            return;
          }

          const parsed = parseQuestionsFromApi(apiData, currentLanguage);
          const ui = buildUiQuestions(parsed, currentLanguage).map(q => ({
            ...q,
            isBookmarked: true,
          }));
          setQuestionsUi(ui);
          setTotalQuestions(ui.length);
          setQuestionIndex(0);
          setSelectedOption(null);
          setShowOptionFeedback(false);
          allAnswersRef.current = [];
        } catch {
          if (!cancelled) {
            setQuestionsUi([]);
            setTotalQuestions(0);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
        return;
      }

      const canLoad = isMockupTest
        ? Boolean(activeCourseId && activeCourseId !== '0' && token)
        : Boolean(lessonId && token);

      if (!canLoad) {
        setQuestionsUi([]);
        setTotalQuestions(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      if (continueHoldTimerRef.current) {
        clearTimeout(continueHoldTimerRef.current);
        continueHoldTimerRef.current = null;
      }
      setContinueHoldActive(false);
      try {
        const body = isMockupTest
          ? {
              type: 'get_data',
              table_name: 'questions',
              course_id: String(activeCourseId),
              user_id: String(token),
              is_mockup: '1',
            }
          : {
              type: 'get_data',
              table_name: 'questions',
              lesson_id: String(lessonId),
              course_id: String(activeCourseId),
              user_id: String(token),
              limit: 10,
              last_id: 0,
            };
        console.log('body', body);
        const response = await ApiRequest(body);
        console.log('response', response);
        if (cancelled) {
          return;
        }
        if (response?.status !== 200) {
          setQuestionsUi([]);
          setTotalQuestions(0);
          hasMoreQuestionsRef.current = false;
          return;
        }
        let apiData = normalizeQuestionsArray(response?.data?.data);
        let apiTotalQuestions = extractTotalQuestions(response);

        if (isMockupTest && apiData.length < 2) {
          const retryResponse = await ApiRequest({
            type: 'get_data',
            table_name: 'questions',
            course_id: String(activeCourseId),
            user_id: String(token),
            is_mockup: '1',
          });
          if (!cancelled && retryResponse?.status === 200) {
            const retryData = normalizeQuestionsArray(
              retryResponse?.data?.data,
            );
            if (retryData.length > apiData.length) {
              apiData = retryData;
              apiTotalQuestions = extractTotalQuestions(retryResponse);
            }
          }
        }

        const parsed = parseQuestionsFromApi(apiData, currentLanguage);
        const ui = buildUiQuestions(parsed, currentLanguage);
        const total = apiTotalQuestions || ui.length;
        setQuestionsUi(ui);
        questionsUiRef.current = ui;
        setTotalQuestions(total);
        totalQuestionsRef.current = total;
        // First page used last_id: 0 — next pages use 1, 2, 3, ...
        lastIdRef.current = 0;
        hasMoreQuestionsRef.current = isMockupTest
          ? false
          : apiTotalQuestions > 0
          ? ui.length < apiTotalQuestions
          : apiData.length >= 10;
        setQuestionIndex(0);
        setAccumulatedTimeSec(0);
        setSelectedOption(null);
        setShowOptionFeedback(false);
        allAnswersRef.current = [];
        questionStartedAtRef.current = Date.now();
      } catch (e) {
        if (!cancelled) {
          setQuestionsUi([]);
          setTotalQuestions(0);
          hasMoreQuestionsRef.current = false;
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [
    lessonId,
    activeCourseId,
    activePermitId,
    token,
    currentLanguage,
    isMockupTest,
    isBookmarkReview,
    bookmarkQuestionIdParam,
    bookmarkQuestionRaw,
  ]);

  useEffect(() => {
    return () => {
      if (continueHoldTimerRef.current) {
        clearTimeout(continueHoldTimerRef.current);
        continueHoldTimerRef.current = null;
      }
    };
  }, []);

  const fetchMoreLessonQuestions = async () => {
    if (
      isMockupTest ||
      isBookmarkReview ||
      loadingMoreRef.current ||
      !hasMoreQuestionsRef.current ||
      !lessonId ||
      !token
    ) {
      return false;
    }

    const currentList = questionsUiRef.current;
    const total = totalQuestionsRef.current || 0;
    if (total > 0 && currentList.length >= total) {
      hasMoreQuestionsRef.current = false;
      return false;
    }

    const nextLastId = Number(lastIdRef.current || 0) + 1;
    loadingMoreRef.current = true;
    try {
      const body = {
        type: 'get_data',
        table_name: 'questions',
        lesson_id: String(lessonId),
        course_id: String(activeCourseId),
        user_id: String(token),
        limit: 10,
        last_id: nextLastId,
      };
      console.log('body', body);
      const response = await ApiRequest(body);
      console.log('response', response);

      if (response?.status !== 200) {
        hasMoreQuestionsRef.current = false;
        return false;
      }

      const apiData = normalizeQuestionsArray(response?.data?.data);
      if (!apiData.length) {
        hasMoreQuestionsRef.current = false;
        return false;
      }

      const parsed = parseQuestionsFromApi(apiData, currentLanguage);
      const nextUi = buildUiQuestions(parsed, currentLanguage);
      const existingIds = new Set(currentList.map(q => String(q.id)));
      const uniqueNext = nextUi.filter(q => !existingIds.has(String(q.id)));
      if (!uniqueNext.length) {
        hasMoreQuestionsRef.current = false;
        return false;
      }

      const merged = [...currentList, ...uniqueNext];
      const apiTotal = extractTotalQuestions(response);
      const nextTotal = Math.max(apiTotal, total, merged.length);

      lastIdRef.current = nextLastId;
      questionsUiRef.current = merged;
      setQuestionsUi(merged);
      totalQuestionsRef.current = nextTotal;
      setTotalQuestions(nextTotal);
      hasMoreQuestionsRef.current =
        apiTotal > 0
          ? merged.length < nextTotal
          : uniqueNext.length >= 10;
      return true;
    } catch (e) {
      console.log('fetchMoreLessonQuestions error', e);
      return false;
    } finally {
      loadingMoreRef.current = false;
    }
  };

  const ensureQuestionAvailable = async nextIndex => {
    if (nextIndex < questionsUiRef.current.length) {
      return true;
    }

    while (nextIndex >= questionsUiRef.current.length) {
      if (!hasMoreQuestionsRef.current) {
        return false;
      }
      const gotMore = await fetchMoreLessonQuestions();
      if (!gotMore) {
        return false;
      }
    }
    return true;
  };

  const currentQuestion = useMemo(
    () => questionsUi[questionIndex],
    [questionsUi, questionIndex],
  );

  const isImageQuestion = !!currentQuestion?.imageSource;

  const progressPercent = useMemo(() => {
    const total = totalQuestions || questionsUi.length;
    if (!total) {
      return 0;
    }
    return ((questionIndex + 1) / total) * 100;
  }, [questionIndex, questionsUi.length, totalQuestions]);

  useEffect(() => {
    if (continueHoldTimerRef.current) {
      clearTimeout(continueHoldTimerRef.current);
      continueHoldTimerRef.current = null;
    }
    setContinueHoldActive(false);

    if (!currentQuestion?.options?.length) {
      setSelectedOption(null);
      setShowOptionFeedback(false);
      return;
    }

    // Study mode: always reveal the correct answer; user cannot select
    if (isStudyMode) {
      const correctOpt =
        currentQuestion.options[currentQuestion.correctAnswerIndex];
      setSelectedOption(correctOpt?.id ?? null);
      setShowOptionFeedback(true);
      setIsPlaying(false);
      setAudioCurrentTime(0);
      setImageZoomVisible(false);
      audioRef.current?.seek?.(0);
      questionStartedAtRef.current = Date.now();
      return;
    }

    setSelectedOption(null);
    setShowOptionFeedback(false);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setImageZoomVisible(false);
    audioRef.current?.seek?.(0);
    questionStartedAtRef.current = Date.now();
  }, [questionIndex, currentQuestion?.id, isStudyMode]);

  const saveQuestionAnswer = async ({
    questionId,
    answerId = '',
    answerText = '',
    isCorrect = false,
    isSkipped = false,
    timeSpentSec = 0,
  }) => {
    if (!token || !questionId) {
      return;
    }

    const body = {
      type: 'save_question_answer',
      user_id: String(token),
      question_id: String(questionId),
      answer_id: answerId ? String(answerId) : '',
      answer_text: answerText || '',
      is_correct: isCorrect ? '1' : '0',
      is_skipped: isSkipped ? '1' : '0',
      course_id: String(activeCourseId),
      test_type: isMockupTest ? 'mockup' : 'practice',
      time_spent: String(Math.max(0, Math.round(timeSpentSec))),
    };
    // console.log('body', body);

    if (!isMockupTest && lessonId) {
      body.lesson_id = String(lessonId);
    }

    try {
      const response = await ApiRequest(body);
      // console.log('response', response);
      if (response?.status === 200 && response.data?.result) {
        return;
      }
      Alert.alert(
        'Error',
        response?.data?.message || 'Failed to save answer. Please try again.',
      );
    } catch (error) {
      console.error('save_question_answer error:', error);
    }
  };

  const submitLessonQuestionnaire = async (
    answersPayload,
    correctCount,
    averageTime,
  ) => {
    setSubmitLoading(true);
    try {
      const total = answersPayload.length;
      const scorePercent =
        total > 0 ? Math.round((correctCount / total) * 100) : 0;

      const questionsForApi = answersPayload.map(item => ({
        question_id: Number(item.question_id),
        is_correct: Boolean(item.is_correct),
        skiped: Number(item.skiped) || 0,
      }));

      const body = {
        type: 'add_data',
        table_name: 'user_questionnaire',
        user_id: String(token),
        course_id: String(activeCourseId),
        score: String(scorePercent),
        average_time: String(Math.round(averageTime)),
        questions: JSON.stringify(questionsForApi),
        ...(isMockupTest ? {is_mockup: '1'} : {lesson_id: String(lessonId)}),
      };
      // console.log('body', body);

      const response = await ApiRequest(body);
      // console.log('response', response);

      if (response?.status === 200 && response.data?.result) {
        navigation.replace('MainResult', {
          score: correctCount,
          totalQuestions: total,
          averageTime,
          permitId: activePermitId,
          permit_id: activePermitId,
          isMockupTest,
          course_id: activeCourseId,
          courseId: activeCourseId,
          lessonId,
          lesson_id: lessonId,
          lessonName,
          reviewAnswers: answersPayload,
        });
        return;
      }

      Alert.alert(
        'Error',
        response?.data?.message ||
          'Failed to submit answers. Please try again.',
      );
    } catch (error) {
      console.error('Submit questionnaire error:', error);
      Alert.alert('Error', 'Failed to submit answers. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const isQuestionBookmarked = isBookmarkedFlag(currentQuestion?.isBookmarked);

  const handleToggleQuestionBookmark = async () => {
    if (
      !token ||
      !currentQuestion?.id ||
      bookmarkLoading ||
      submitLoading ||
      continueHoldActive
    ) {
      return;
    }

    setBookmarkLoading(true);
    try {
      const response = await toggleQuestionBookmarkApi({
        token,
        courseId: activeCourseId,
        questionId: currentQuestion.id,
        isBookmarked: isQuestionBookmarked,
      });

      if (response?.status === 200 && response?.data?.result !== false) {
        setQuestionsUi(prev =>
          prev.map(q =>
            q.id === currentQuestion.id
              ? {...q, isBookmarked: !isQuestionBookmarked}
              : q,
          ),
        );
        ToastMessage(
          isQuestionBookmarked
            ? response?.data?.message || 'Bookmark removed'
            : response?.data?.message || 'Question saved',
          'success',
        );
        return;
      }

      ToastMessage(
        response?.data?.message || 'Failed to update bookmark',
        'error',
      );
    } catch {
      ToastMessage('Failed to update bookmark', 'error');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleSkip = async () => {
    if (
      submitLoading ||
      continueHoldActive ||
      loadingMoreRef.current ||
      !currentQuestion?.id
    ) {
      return;
    }

    const cq = currentQuestion;
    const elapsedSec = (Date.now() - questionStartedAtRef.current) / 1000;
    const nextAccumulated = accumulatedTimeSec + elapsedSec;
    const nextIndex = questionIndex + 1;

    const correctOpt = cq.options[cq.correctAnswerIndex];
    const answerData = {
      question_id: cq.id,
      is_correct: false,
      skiped: 1,
      question_text: cq.prompt,
      selected_answer_text: '',
      correct_answer_text: correctOpt?.title || '',
    };

    const merged = [
      ...allAnswersRef.current.filter(a => a.question_id !== cq.id),
      answerData,
    ];
    allAnswersRef.current = merged;

    saveQuestionAnswer({
      questionId: cq.id,
      isCorrect: false,
      isSkipped: true,
      timeSpentSec: elapsedSec,
    });

    const ready = await ensureQuestionAvailable(nextIndex);
    if (!ready) {
      const total = merged.length;
      const correctCount = merged.filter(a => a.is_correct).length;
      const averageTime = total > 0 ? nextAccumulated / total : 0;
      submitLessonQuestionnaire(merged, correctCount, averageTime);
      return;
    }

    setAccumulatedTimeSec(nextAccumulated);
    setQuestionIndex(nextIndex);
  };

  const handleContinue = async () => {
    if (submitLoading || continueHoldActive || loadingMoreRef.current) {
      return;
    }

    // Study mode: learn-only — no answer submission, just move next / exit
    if (isStudyMode) {
      const nextIndex = questionIndex + 1;
      const ready = await ensureQuestionAvailable(nextIndex);
      if (!ready) {
        navigation.goBack();
        return;
      }
      setQuestionIndex(nextIndex);
      return;
    }

    if (selectedOption == null) {
      Alert.alert(
        'Select an answer',
        'Please choose an option before continuing.',
      );
      return;
    }

    const cq = currentQuestion;
    if (!cq?.options?.length) {
      return;
    }

    const selectedIdx = cq.options.findIndex(o => o.id === selectedOption);
    if (selectedIdx < 0) {
      return;
    }

    const isCorrect = selectedIdx === cq.correctAnswerIndex;
    const selectedOpt = cq.options[selectedIdx];
    const correctOpt = cq.options[cq.correctAnswerIndex];
    const answerData = {
      question_id: cq.id,
      is_correct: isCorrect,
      skiped: 0,
      question_text: cq.prompt,
      selected_answer_text: selectedOpt?.title || '',
      correct_answer_text: correctOpt?.title || '',
    };

    const elapsedSec = (Date.now() - questionStartedAtRef.current) / 1000;
    const nextAccumulated = accumulatedTimeSec + elapsedSec;
    const nextIndex = questionIndex + 1;

    const merged = [
      ...allAnswersRef.current.filter(a => a.question_id !== cq.id),
      answerData,
    ];
    allAnswersRef.current = merged;

    saveQuestionAnswer({
      questionId: cq.id,
      answerId: selectedOpt?.answerId || '',
      answerText: selectedOpt?.title || '',
      isCorrect,
      isSkipped: false,
      timeSpentSec: elapsedSec,
    });

    if (isMockupTest) {
      const ready = await ensureQuestionAvailable(nextIndex);
      if (!ready) {
        const total = merged.length;
        const correctCount = merged.filter(a => a.is_correct).length;
        const averageTime = total > 0 ? nextAccumulated / total : 0;
        await submitLessonQuestionnaire(merged, correctCount, averageTime);
        return;
      }

      setAccumulatedTimeSec(nextAccumulated);
      setQuestionIndex(nextIndex);
      return;
    }

    setShowOptionFeedback(true);

    const ready = await ensureQuestionAvailable(nextIndex);
    if (!ready) {
      const total = merged.length;
      const correctCount = merged.filter(a => a.is_correct).length;
      const averageTime = total > 0 ? nextAccumulated / total : 0;
      setContinueHoldActive(true);
      continueHoldTimerRef.current = setTimeout(async () => {
        continueHoldTimerRef.current = null;
        setContinueHoldActive(false);
        await submitLessonQuestionnaire(merged, correctCount, averageTime);
      }, 2000);
      return;
    }

    setAccumulatedTimeSec(nextAccumulated);
    setContinueHoldActive(true);
    continueHoldTimerRef.current = setTimeout(() => {
      continueHoldTimerRef.current = null;
      setContinueHoldActive(false);
      setQuestionIndex(nextIndex);
    }, 2000);
  };

  const handlePrevious = () => {
    if (!isStudyMode || submitLoading || questionIndex <= 0) {
      return;
    }
    setQuestionIndex(questionIndex - 1);
  };

  const handleAudioError = error => {
    console.log('Audio playback error:', error);
    setIsPlaying(false);
    Alert.alert('Audio Error', 'Audio play nahi ho saka. Dobara try karein.');
  };

  const handleToggleAudio = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    audioRef.current?.seek?.(0);
    setAudioCurrentTime(0);
    setIsPlaying(true);
  };

  const playedProgress =
    audioDuration > 0 ? audioCurrentTime / audioDuration : 0;
  const playedBars = Math.round(playedProgress * WAVE_BARS_COUNT);

  if (loading) {
    return (
      <ScreenWrapper
        paddingHorizontal={0}
        headerUnScrollable={() =>
          renderTestHeader(
            isBookmarkReview ? 'Bookmarked Question' : lessonName || 'Practice',
            isBookmarkReview,
          )
        }>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={COLORS.primaryColor4} />
          <CustomText
            label="Loading questions..."
            fontSize={14}
            fontFamily={fonts.jakartaRegular}
            color={colors.textMuted}
            marginTop={12}
          />
        </View>
      </ScreenWrapper>
    );
  }

  if (!questionsUi.length) {
    return (
      <ScreenWrapper
        paddingHorizontal={0}
        headerUnScrollable={() =>
          renderTestHeader(
            isBookmarkReview ? 'Bookmarked Question' : lessonName || 'Practice',
            isBookmarkReview,
          )
        }>
        <View style={[styles.container, styles.centered]}>
          <CustomText
            label="No questions for this lesson."
            fontSize={16}
            fontFamily={fonts.jakartaSemiBold}
            color={colors.textPrimary}
            textAlign="center"
          />
          <TouchableOpacity
            style={{marginTop: 20}}
            onPress={() => navigation.goBack()}>
            <CustomText
              label="Go back"
              fontSize={14}
              fontFamily={fonts.jakartaMedium}
              color={colors.accent}
            />
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  if (submitLoading) {
    return (
      <ScreenWrapper
        paddingHorizontal={0}
        headerUnScrollable={() =>
          renderTestHeader(lessonName || 'Practice', isBookmarkReview)
        }>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={COLORS.primaryColor4} />
          <CustomText
            label="Submitting answers..."
            fontSize={14}
            fontFamily={fonts.jakartaRegular}
            color={colors.textMuted}
            marginTop={12}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const handleOptionPress = optionId => {
    if (isStudyMode || continueHoldActive || submitLoading) {
      return;
    }
    setSelectedOption(optionId);
  };

  const getBilingualOptionState = (option, optIndex) => {
    const cq = currentQuestion;
    if (!cq) {
      return 'default';
    }
    const isCorrect = optIndex === cq.correctAnswerIndex;
    const isSelected = selectedOption === option.id;

    if (isBookmarkReview || isStudyMode) {
      return isCorrect ? 'correct' : 'default';
    }
    if (showOptionFeedback && !isMockupTest) {
      if (isCorrect) {
        return 'correct';
      }
      if (isSelected) {
        return 'wrong';
      }
      return 'default';
    }
    return isSelected ? 'selected' : 'default';
  };

  const showImageCard = !!(
    currentQuestion?.imageSource || currentQuestion?.videoSource
  );

  return (
    <ScreenWrapper
      scrollEnabled
      paddingHorizontal={0}
      backgroundColor="#FFFFFF"
      statusBarColor="#FFFFFF"
      footerUnScrollable={() => (
        <View style={{backgroundColor: '#FFFFFF'}}>
          {/* Save / Skip buttons temporarily hidden
          {!isStudyMode ? (
            <View
              style={[
                styles.footerActionsRow,
                isBookmarkReview && styles.footerActionsRowBottom,
              ]}>
              {isMockupTest ? null : (
                <CustomButton
                  title={isQuestionBookmarked ? 'Unsave' : 'Save'}
                  color={
                    isQuestionBookmarked ? colors.accent : colors.textPrimary
                  }
                  backgroundColor={'transparent'}
                  borderRadius={8}
                  height={51}
                  borderWidth={1}
                  borderColor={
                    isQuestionBookmarked ? colors.accent : colors.border
                  }
                  width="48%"
                  loading={bookmarkLoading}
                  disabled={
                    bookmarkLoading || submitLoading || continueHoldActive
                  }
                  onPress={handleToggleQuestionBookmark}
                />
              )}

              <CustomButton
                title={isBookmarkReview ? 'Back' : 'Skip'}
                color={colors.textPrimary}
                backgroundColor={'transparent'}
                borderRadius={8}
                height={51}
                borderWidth={1}
                borderColor={colors.border}
                width={isMockupTest ? '100%' : '48%'}
                disabled={
                  !isBookmarkReview && (submitLoading || continueHoldActive)
                }
                onPress={
                  isBookmarkReview ? () => navigation.goBack() : handleSkip
                }
              />
            </View>
          ) : null}
          */}
          {isStudyMode ? (
            <View style={styles.studyFooterRow}>
              <TouchableOpacity
                activeOpacity={questionIndex <= 0 ? 1 : 0.85}
                disabled={submitLoading || questionIndex <= 0}
                onPress={handlePrevious}
                style={[
                  styles.studyPrevBtn,
                  {opacity: questionIndex <= 0 ? 0.45 : 1},
                ]}>
                <CustomText
                  label="Previous"
                  fontSize={16}
                  fontFamily={fonts.jakartaSemiBold}
                  color={colors.textPrimary}
                  removeTranslation
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={submitLoading ? 1 : 0.85}
                disabled={submitLoading}
                onPress={handleContinue}
                style={[
                  styles.studyNextBtnWrap,
                  {opacity: submitLoading ? 0.45 : 1},
                ]}>
                <LinearGradient
                  colors={['#008FE6', '#006BB8']}
                  start={{x: 0.5, y: 0}}
                  end={{x: 0.5, y: 1}}
                  style={styles.footerGradientButton}>
                  <CustomText
                    label="Next"
                    fontSize={18}
                    fontFamily={fonts.jakartaSemiBold}
                    color="#FFFFFF"
                    removeTranslation
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}
          {!isBookmarkReview && !isStudyMode && (
            <View style={styles.footerContainer}>
              <TouchableOpacity
                activeOpacity={
                  selectedOption == null ||
                  submitLoading ||
                  continueHoldActive
                    ? 1
                    : 0.8
                }
                disabled={submitLoading || continueHoldActive}
                onPress={handleContinue}
                style={{
                  opacity:
                    selectedOption == null ||
                    submitLoading ||
                    continueHoldActive
                      ? 0.45
                      : 1,
                }}>
                <LinearGradient
                  colors={['#008FE6', '#006BB8']}
                  start={{x: 0.5, y: 0}}
                  end={{x: 0.5, y: 1}}
                  style={styles.footerGradientButton}>
                  <CustomText
                    label="Next"
                    fontSize={20}
                    fontFamily={fonts.jakartaMedium}
                    color="#FFFFFF"
                    lineHeight={30}
                    removeTranslation
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      headerUnScrollable={() =>
        renderTestHeader(
          isBookmarkReview
            ? 'Bookmarked Question'
            : lessonName || (isStudyMode ? 'Study Question' : 'Practice'),
          isBookmarkReview,
        )
      }>
      <View style={styles.container}>
        <View style={styles.studyBanner}>
          <View style={styles.studyBannerLeft}>
            <View style={styles.studyBannerIconWrap}>
              <Image
                source={Images.book}
                style={styles.studyBannerIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.studyBannerTextWrap}>
              <CustomText
                label={
                  isStudyMode
                    ? 'Study Mode'
                    : isMockupTest
                    ? 'Mock Test'
                    : 'Practice Mode'
                }
                fontSize={14}
                fontFamily={fonts.jakartaBold}
                color={colors.textPrimary}
                removeTranslation
              />
              <CustomText
                label={
                  isStudyMode
                    ? 'Learn at your own pace with instant feedback.'
                    : isMockupTest
                    ? 'Select your answer and continue'
                    : 'Answer and get instant feedback'
                }
                fontSize={11}
                fontFamily={fonts.jakartaRegular}
                color={colors.textMuted}
                lineHeight={15}
                removeTranslation
              />
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setLangModalVisible(true)}
            style={styles.langChip}>
            <Icons
              family="Ionicons"
              name="globe-outline"
              size={14}
              color="#0298EF"
            />
            <CustomText
              label={selectedLanguageLabel}
              fontSize={11}
              fontFamily={fonts.jakartaSemiBold}
              color={colors.textPrimary}
              marginLeft={5}
              numberOfLines={1}
              removeTranslation
            />
            <Icons
              family="Ionicons"
              name="chevron-down"
              size={14}
              color="#64748B"
              style={{marginLeft: 2}}
            />
          </TouchableOpacity>
        </View>

        <CustomText
          label={`Question ${questionIndex + 1} of ${
            totalQuestions || questionsUi.length
          }`}
          fontSize={24}
          fontFamily={fonts.jakartaBold}
          color="#0F172A"
          lineHeight={32}
          removeTranslation
        />
        <CustomText
          label="Correct answer is highlighted. Tap Next to continue."
          fontSize={14}
          fontFamily={fonts.jakartaMedium}
          color="#94A3B8"
          lineHeight={20}
          marginTop={4}
          removeTranslation
        />
        <View style={{marginTop: 10}} />
        <ProgressBar progress={progressPercent} />

        <View style={styles.metaRow}>
          {!!currentQuestion.category ? (
            <View style={styles.categoryPill}>
              <CustomText
                label={currentQuestion.category}
                fontSize={12}
                fontFamily={fonts.jakartaMedium}
                color="#0298EF"
                numberOfLines={1}
                removeTranslation
              />
            </View>
          ) : (
            <View />
          )}
          {currentQuestion.audioSource || currentQuestion.audioByLang ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleToggleAudio}
              style={styles.listenBtn}>
              <Icons
                family="Ionicons"
                name={isPlaying ? 'pause' : 'volume-high'}
                size={15}
                color="#0298EF"
              />
              <CustomText
                label={`Listen (${String(primaryLangCode).toUpperCase()})`}
                fontSize={12}
                fontFamily={fonts.jakartaSemiBold}
                color="#0298EF"
                marginLeft={6}
                removeTranslation
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {(currentQuestion.audioSource || currentQuestion.audioByLang) && (
          <Video
            key={`${currentQuestion.id}-${primaryLangCode}`}
            ref={audioRef}
            source={
              currentQuestion.audioByLang?.[primaryLangCode]
                ? {uri: String(currentQuestion.audioByLang[primaryLangCode])}
                : currentQuestion.audioByLang?.en
                ? {uri: String(currentQuestion.audioByLang.en)}
                : currentQuestion.audioSource
            }
            paused={!isPlaying}
            audioOnly
            muted={false}
            volume={1.0}
            playInBackground={false}
            playWhenInactive={true}
            ignoreSilentSwitch="ignore"
            onLoad={({duration}) => {
              setAudioDuration(duration || 0);
            }}
            onProgress={({currentTime}) => {
              setAudioCurrentTime(currentTime || 0);
            }}
            onEnd={() => {
              audioRef.current?.seek?.(0);
              setAudioCurrentTime(0);
              setIsPlaying(false);
            }}
            onError={handleAudioError}
            style={styles.hiddenAudio}
          />
        )}

        <CustomText
          label={getPromptForLang(currentQuestion, primaryLangCode)}
          fontSize={16}
          fontFamily={fonts.jakartaBold}
          color="#0F172A"
          lineHeight={24}
          marginTop={14}
          removeTranslation
        />
        {secondaryLangCodes.map(lang => {
          const text = getPromptForLang(currentQuestion, lang);
          if (!text || text === getPromptForLang(currentQuestion, primaryLangCode)) {
            return null;
          }
          return (
            <CustomText
              key={`prompt-${lang}`}
              label={text}
              fontSize={14}
              fontFamily={fonts.jakartaRegular}
              color={colors.textMuted}
              lineHeight={22}
              marginTop={4}
              textAlign={lang === 'ur' || lang === 'ar' ? 'right' : 'left'}
              removeTranslation
            />
          );
        })}

        {showImageCard ? (
          <View style={styles.questionImageCard}>
            {currentQuestion.videoSource ? (
              <Video
                key={`vid-${currentQuestion.id}`}
                source={currentQuestion.videoSource}
                style={styles.questionImage}
                resizeMode="contain"
                controls
                paused={false}
              />
            ) : (
              <ImageFast
                source={currentQuestion.imageSource}
                style={styles.questionImage}
                resizeMode="contain"
                onPress={() => setImageZoomVisible(true)}
              />
            )}
            {currentQuestion.imageSource ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Zoom image"
                activeOpacity={0.85}
                onPress={() => setImageZoomVisible(true)}
                style={styles.questionImageZoom}>
                <Image
                  source={Images.zoomicon}
                  style={styles.imageZoomFabIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {isImageQuestion && currentQuestion.imageSource ? (
          <CustomModal
            isVisible={imageZoomVisible}
            onDisable={() => setImageZoomVisible(false)}
            backdropOpacity={0.75}>
            <Icons
              family="Entypo"
              name="circle-with-cross"
              color="#FFFFFF"
              size={30}
              onPress={() => setImageZoomVisible(false)}
              style={styles.zoomModalClose}
            />
            <ImageFast
              source={currentQuestion.imageSource}
              resizeMode="contain"
              style={styles.zoomModalImage}
            />
          </CustomModal>
        ) : null}

        <View style={{marginTop: 8}} />
        {currentQuestion.useGridForOptions ? (
          <View style={styles.optionGrid}>
            {currentQuestion.options.map((option, optIndex) => {
              const state = getBilingualOptionState(option, optIndex);
              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={
                    isStudyMode || continueHoldActive || submitLoading
                      ? 1
                      : 0.9
                  }
                  disabled={
                    isStudyMode || continueHoldActive || submitLoading
                  }
                  onPress={() => handleOptionPress(option.id)}
                  style={[
                    styles.optionGridCell,
                    {width: gridOptionWidth},
                    state === 'correct' && styles.optionGridCellCorrect,
                    state === 'selected' && styles.optionGridCellSelected,
                    state === 'wrong' && styles.optionGridCellWrong,
                  ]}>
                  {option.imageUri ? (
                    <ImageFast
                      source={{uri: option.imageUri}}
                      style={styles.optionGridThumb}
                      resizeMode="contain"
                    />
                  ) : null}
                  {!!getOptionTextForLang(option, primaryLangCode) ? (
                    <CustomText
                      label={getOptionTextForLang(option, primaryLangCode)}
                      fontSize={12}
                      fontFamily={fonts.jakartaSemiBold}
                      color={
                        state === 'correct' || state === 'selected'
                          ? '#FFFFFF'
                          : '#0F172A'
                      }
                      textAlign="center"
                      lineHeight={18}
                      removeTranslation
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          currentQuestion.options.map((option, optIndex) => {
            const state = getBilingualOptionState(option, optIndex);
            const primaryText = getOptionTextForLang(option, primaryLangCode);
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={
                  isStudyMode || continueHoldActive || submitLoading ? 1 : 0.9
                }
                disabled={isStudyMode || continueHoldActive || submitLoading}
                onPress={() => handleOptionPress(option.id)}
                style={[
                  styles.bilingualOptionCard,
                  state === 'correct' && styles.bilingualOptionCardCorrect,
                  state === 'selected' && styles.bilingualOptionCardSelected,
                  state === 'wrong' && styles.bilingualOptionCardWrong,
                ]}>
                <View
                  style={[
                    styles.optionLetterBadge,
                    (state === 'correct' || state === 'selected') &&
                      styles.optionLetterBadgeActive,
                  ]}>
                  <Text
                    style={[
                      styles.optionLetterText,
                      (state === 'correct' || state === 'selected') &&
                        styles.optionLetterTextActive,
                    ]}>
                    {option.letter || OPTION_LETTERS[optIndex]}
                  </Text>
                </View>
                <View style={styles.optionTextCol}>
                  {!!primaryText ? (
                    <CustomText
                      label={primaryText}
                      fontSize={12}
                      fontFamily={fonts.jakartaSemiBold}
                      color="#0F172A"
                      lineHeight={18}
                      removeTranslation
                    />
                  ) : null}
                  {secondaryLangCodes.map(lang => {
                    const text = getOptionTextForLang(option, lang);
                    if (!text || text === primaryText) {
                      return null;
                    }
                    return (
                      <CustomText
                        key={`${option.id}-${lang}`}
                        label={text}
                        fontSize={12}
                        fontFamily={fonts.jakartaRegular}
                        color={colors.textMuted}
                        lineHeight={18}
                        marginTop={2}
                        textAlign={
                          lang === 'ur' || lang === 'ar' ? 'right' : 'left'
                        }
                        removeTranslation
                      />
                    );
                  })}
                  {option.imageUri ? (
                    <ImageFast
                      source={{uri: option.imageUri}}
                      style={[styles.optionGridThumb, {marginTop: 8}]}
                      resizeMode="contain"
                    />
                  ) : null}
                </View>
                <View
                  style={[
                    styles.optionRadio,
                    (state === 'correct' || state === 'selected') &&
                      styles.optionRadioSelected,
                    state === 'wrong' && styles.optionRadioWrong,
                  ]}>
                  {(state === 'correct' || state === 'selected') && (
                    <View style={styles.optionRadioDot} />
                  )}
                  {state === 'wrong' && (
                    <View
                      style={[styles.optionRadioDot, styles.optionRadioDotWrong]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {isStudyMode &&
        !!getExplanationForLang(currentQuestion, primaryLangCode) ? (
          <View style={styles.explanationCard}>
            <CustomText
              label="Explanation"
              fontSize={12}
              fontFamily={fonts.jakartaSemiBold}
              color="#0298EF"
              marginBottom={4}
              removeTranslation
            />
            <CustomText
              label={getExplanationForLang(currentQuestion, primaryLangCode)}
              fontSize={13}
              fontFamily={fonts.jakartaRegular}
              color="#0F172A"
              lineHeight={20}
              removeTranslation
            />
            {secondaryLangCodes.map(lang => {
              const text = getExplanationForLang(currentQuestion, lang);
              const primaryExplanation = getExplanationForLang(
                currentQuestion,
                primaryLangCode,
              );
              if (!text || text === primaryExplanation) {
                return null;
              }
              return (
                <CustomText
                  key={`explanation-${lang}`}
                  label={text}
                  fontSize={12}
                  fontFamily={fonts.jakartaRegular}
                  color="#64748B"
                  lineHeight={18}
                  marginTop={6}
                  textAlign={lang === 'ur' || lang === 'ar' ? 'right' : 'left'}
                  removeTranslation
                />
              );
            })}
          </View>
        ) : null}
      </View>

      <CustomModal
        isVisible={langModalVisible}
        onDisable={() => setLangModalVisible(false)}
        mainMargin={24}>
        <View style={styles.langModalCard}>
          <CustomText
            label="Display languages"
            fontSize={18}
            fontFamily={fonts.jakartaBold}
            color={colors.textPrimary}
            marginBottom={4}
            removeTranslation
          />
          <CustomText
            label="Select one or more languages to show questions and answers."
            fontSize={13}
            fontFamily={fonts.jakartaRegular}
            color={colors.textMuted}
            marginBottom={8}
            removeTranslation
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            {availableLanguages.map(lang => {
              const active = selectedLangCodes.includes(lang.code);
              return (
                <TouchableOpacity
                  key={lang.code}
                  activeOpacity={0.85}
                  onPress={() => toggleDisplayLanguage(lang.code)}
                  style={styles.langModalRow}>
                  <View
                    style={[
                      styles.langCheck,
                      active && styles.langCheckActive,
                    ]}>
                    {active ? (
                      <Icons
                        family="Ionicons"
                        name="checkmark"
                        size={14}
                        color="#FFFFFF"
                      />
                    ) : null}
                  </View>
                  <CustomText
                    label={lang.title}
                    fontSize={15}
                    fontFamily={fonts.jakartaMedium}
                    color={colors.textPrimary}
                    removeTranslation
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <CustomButton
            title="Done"
            marginTop={12}
            height={48}
            borderRadius={10}
            backgroundColor="#0298EF"
            onPress={() => setLangModalVisible(false)}
          />
        </View>
      </CustomModal>
    </ScreenWrapper>
  );
};

export default TestformNew;
