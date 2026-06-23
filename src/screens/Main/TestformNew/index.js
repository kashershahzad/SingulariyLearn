import {
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
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
const gridOptionWidth =
  (SCREEN_WIDTH - GRID_H_PADDING * 2 - GRID_GAP) / 2;

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
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(value);
};

/** Same parsing rules as `Testfrom.js` `parseQuestions` */
const parseQuestionsFromApi = (questionsArray, currentLanguage) => {
  return questionsArray.map(q => {
    let questionData;
    try {
      questionData =
        typeof q.question === 'string' ? JSON.parse(q.question) : q.question;
    } catch {
      questionData = {en: {question: q.question}, ur: {question: q.question}};
    }

    const questionText =
      questionData[currentLanguage]?.question ||
      questionData.en?.question ||
      questionData.ur?.question ||
      (typeof questionData[currentLanguage] === 'string'
        ? questionData[currentLanguage]
        : null) ||
      (typeof questionData.en === 'string' ? questionData.en : null) ||
      (typeof questionData.ur === 'string' ? questionData.ur : null) ||
      'Question not available';

    const languageAnswers =
      q.answers && Array.isArray(q.answers)
        ? q.answers.filter(answer => answer.lang === currentLanguage)
        : [];

    const fallbackAnswers =
      languageAnswers.length > 0
        ? languageAnswers
        : q.answers && Array.isArray(q.answers)
        ? q.answers.filter(answer => answer.lang === 'en')
        : [];

    const options = fallbackAnswers.map(answer => {
      const parsedAnswer = parseAnswerField(answer.answer);
      const imageFromField = getCompleteImageUrl(answer.image);

      return {
        answer: parsedAnswer.text || parsedAnswer.image || answer.answer,
        image: parsedAnswer.image || imageFromField,
        correct: Number(answer.is_correct) === 1 ? 1 : 0,
        answerId:
          answer.id != null && answer.id !== ''
            ? String(answer.id)
            : null,
      };
    });

    const hasOptionImages = options.some(option => isValidOptionImage(option.image));

    const correctIndex = options.findIndex(
      option => Number(option.correct) === 1,
    );

    return {
      ...q,
      question: questionText,
      options,
      hasOptionImages,
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
    const hasVideo = !!(videoSource?.uri);
    const hasImage = !!(imageSource?.uri);

    let mediaType;
    let audioSource = null;

    if (hasAudio) {
      mediaType = 'audio';
      audioSource = {uri: audioUri};
    } else if (hasVideo) {
      mediaType = 'image';
    } else if (hasImage) {
      mediaType = 'image';
    } else {
      mediaType = 'image';
    }

    const options = parsed.options.map((opt, i) => ({
      id: `opt-${parsed.id}-${i}`,
      answerId: opt.answerId || null,
      title: opt.answer,
      subtitle: '',
      imageUri: isValidOptionImage(opt.image) ? opt.image : null,
    }));

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
      subPrompt: 'Select the correct answer.',
      options,
      useGridForOptions,
      correctAnswerIndex: ci,
      isBookmarked: isBookmarkedFlag(parsed.is_bookmarked),
    };
  });
};

const normalizeQuestionsArray = raw => {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && typeof raw === 'object') {
    return [raw];
  }
  return [];
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
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 280,
      },
      container: {
        flex: 1,
        backgroundColor: c.screenBg,
        paddingHorizontal: 20,
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
        width: 48,
        height: 48,
        marginBottom: 6,
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
        width: 118,
        height: 118,
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
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
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
    bookmarkReview,
    questionId: bookmarkQuestionIdParam,
    bookmarkQuestion: bookmarkQuestionRaw,
  } = route.params || {};
  const activeCourseId = course_id || courseId || '0';
  const activePermitId = permit_id || '1';
  const isMockupTest =
    is_mockup === '1' || is_mockup === 1 || is_mockup === true;
  const isBookmarkReview =
    bookmarkReview === true ||
    bookmarkReview === 1 ||
    bookmarkReview === '1';

  const [questionsUi, setQuestionsUi] = useState([]);
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
  const audioRef = useRef(null);
  const allAnswersRef = useRef([]);
  const [accumulatedTimeSec, setAccumulatedTimeSec] = useState(0);
  const questionStartedAtRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (isBookmarkReview && bookmarkQuestionIdParam) {
        if (!token) {
          setQuestionsUi([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          let apiData = [];

          if (bookmarkQuestionRaw) {
            const nested = bookmarkQuestionRaw.question || bookmarkQuestionRaw;
            const rowId = String(
              nested.id ?? bookmarkQuestionRaw.question_id ?? bookmarkQuestionIdParam,
            );
            apiData = [
              {
                ...nested,
                id: rowId,
                course_id:
                  nested.course_id ?? bookmarkQuestionRaw.course_id ?? activeCourseId,
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
          setQuestionIndex(0);
          setSelectedOption(null);
          setShowOptionFeedback(false);
          allAnswersRef.current = [];
        } catch {
          if (!cancelled) {
            setQuestionsUi([]);
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
              user_id: String(token),
              permit_id: String(activePermitId),
              limit: '10',
            };
        // console.log('body', body);
        const response = await ApiRequest(body);
        console.log('response', response);
        if (cancelled) {
          return;
        }
        if (response?.status !== 200) {
          setQuestionsUi([]);
          return;
        }
        let apiData = normalizeQuestionsArray(response?.data?.data);

        if (apiData.length < 2) {
          const retryResponse = await ApiRequest(
            isMockupTest
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
                  user_id: String(token),
                  limit: '100',
                },
          );
          if (!cancelled && retryResponse?.status === 200) {
            const retryData = normalizeQuestionsArray(retryResponse?.data?.data);
            if (retryData.length > apiData.length) {
              apiData = retryData;
            }
          }
        }

        const parsed = parseQuestionsFromApi(apiData, currentLanguage);
        const ui = buildUiQuestions(parsed, currentLanguage);
        setQuestionsUi(ui);
        setQuestionIndex(0);
        setAccumulatedTimeSec(0);
        setSelectedOption(null);
        setShowOptionFeedback(false);
        allAnswersRef.current = [];
        questionStartedAtRef.current = Date.now();
      } catch (e) {
        if (!cancelled) {
          setQuestionsUi([]);
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

  const currentQuestion = useMemo(
    () => questionsUi[questionIndex],
    [questionsUi, questionIndex],
  );

  const isAudioQuestion =
    currentQuestion?.mediaType === 'audio' && currentQuestion?.audioSource;
  const isImageQuestion = currentQuestion && !isAudioQuestion;

  const progressPercent = useMemo(() => {
    if (!questionsUi.length) {
      return 0;
    }
    return ((questionIndex + 1) / questionsUi.length) * 100;
  }, [questionIndex, questionsUi.length]);

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
    setSelectedOption(null);
    setShowOptionFeedback(false);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setImageZoomVisible(false);
    audioRef.current?.seek?.(0);
    questionStartedAtRef.current = Date.now();
  }, [questionIndex, currentQuestion?.id]);

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
        ...(isMockupTest
          ? {is_mockup: '1'}
          : {lesson_id: String(lessonId)}),
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
          lessonName,
          reviewAnswers: answersPayload,
        });
        return;
      }


      Alert.alert(
        'Error',
        response?.data?.message || 'Failed to submit answers. Please try again.',
      );
    } catch (error) {
      console.error('Submit questionnaire error:', error);
      Alert.alert(
        'Error',
        'Failed to submit answers. Please try again.',
      );
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

  const handleSkip = () => {
    if (submitLoading || continueHoldActive || !currentQuestion?.id) {
      return;
    }

    const cq = currentQuestion;
    const elapsedSec = (Date.now() - questionStartedAtRef.current) / 1000;
    const nextAccumulated = accumulatedTimeSec + elapsedSec;
    const total = questionsUi.length;
    const isLast = questionIndex >= total - 1;

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

    if (isLast) {
      const correctCount = merged.filter(a => a.is_correct).length;
      const averageTime = total > 0 ? nextAccumulated / total : 0;
      submitLessonQuestionnaire(merged, correctCount, averageTime);
      return;
    }

    setAccumulatedTimeSec(nextAccumulated);
    setQuestionIndex(i => i + 1);
  };

  const handleContinue = async () => {
    if (submitLoading || continueHoldActive) {
      return;
    }
    if (selectedOption == null) {
      Alert.alert('Select an answer', 'Please choose an option before continuing.');
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
    const total = questionsUi.length;
    const isLast = questionIndex >= total - 1;

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
      if (isLast) {
        const correctCount = merged.filter(a => a.is_correct).length;
        const averageTime = total > 0 ? nextAccumulated / total : 0;
        await submitLessonQuestionnaire(merged, correctCount, averageTime);
        return;
      }

      setAccumulatedTimeSec(nextAccumulated);
      setQuestionIndex(i => i + 1);
      return;
    }

    setShowOptionFeedback(true);

    if (isLast) {
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
      setQuestionIndex(i => i + 1);
    }, 2000);
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
    if (continueHoldActive || submitLoading) {
      return;
    }
    setSelectedOption(optionId);
  };

  const getOptionContainerStyles = (option, optIndex, isGrid) => {
    const cq = currentQuestion;
    if (!cq) {
      return null;
    }
    if (isBookmarkReview) {
      if (optIndex === cq.correctAnswerIndex) {
        return isGrid ? styles.optionGridCellCorrect : styles.optionCardCorrect;
      }
      if (selectedOption === option.id) {
        return isGrid ? styles.optionGridCellSelected : styles.selectedOptionCard;
      }
      return null;
    }
    if (!showOptionFeedback || isMockupTest) {
      if (isGrid) {
        return selectedOption === option.id
          ? styles.optionGridCellSelected
          : null;
      }
      return selectedOption === option.id ? styles.selectedOptionCard : null;
    }
    const correctIdx = cq.correctAnswerIndex;
    if (optIndex === correctIdx) {
      return isGrid ? styles.optionGridCellCorrect : styles.optionCardCorrect;
    }
    if (selectedOption === option.id) {
      return isGrid ? styles.optionGridCellWrong : styles.optionCardWrong;
    }
    return null;
  };

  const getOptionPrimaryTextColor = (option, optIndex, isGrid) => {
    const cq = currentQuestion;
    if (!cq) {
      return isGrid ? colors.textMuted : colors.textPrimary;
    }
    if (isBookmarkReview) {
      if (optIndex === cq.correctAnswerIndex) {
        return colors.textOnAccent;
      }
      return selectedOption === option.id
        ? isGrid
          ? colors.textOnAccent
          : colors.textPrimary
        : isGrid
          ? colors.textMuted
          : colors.textPrimary;
    }
    if (!showOptionFeedback || isMockupTest) {
      const sel = selectedOption === option.id;
      if (isGrid) {
        return sel ? colors.textOnAccent : colors.textMuted;
      }
      return sel ? colors.textOnAccent : colors.textPrimary;
    }
    const correctIdx = cq.correctAnswerIndex;
    if (optIndex === correctIdx || selectedOption === option.id) {
      return colors.textOnAccent;
    }
    return isGrid ? colors.textMuted : colors.textPrimary;
  };

  const getOptionSubtitleColor = (option, optIndex) => {
    const cq = currentQuestion;
    if (!cq || !showOptionFeedback || isMockupTest) {
      return selectedOption === option.id
        ? colors.textOnAccent
        : colors.textMuted;
    }
    const correctIdx = cq.correctAnswerIndex;
    if (optIndex === correctIdx || selectedOption === option.id) {
      return colors.textOnAccent;
    }
    return colors.textMuted;
  };

  const showImageCard =
    isImageQuestion && !!(currentQuestion.imageSource || currentQuestion.videoSource);

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      footerUnScrollable={() => (
        <View style={{backgroundColor: colors.screenBg}}>
          <View
            style={[
              styles.footerActionsRow,
              isBookmarkReview && styles.footerActionsRowBottom,
            ]}>
            <CustomButton
              title={isQuestionBookmarked ? 'Unsave' : 'Save'}
              color={isQuestionBookmarked ? colors.accent : colors.textPrimary}
              backgroundColor={'transparent'}
              borderRadius={8}
              height={51}
              borderWidth={1}
              borderColor={isQuestionBookmarked ? colors.accent : colors.border}
              width="48%"
              loading={bookmarkLoading}
              disabled={
                bookmarkLoading || submitLoading || continueHoldActive
              }
              onPress={handleToggleQuestionBookmark}
            />
            <CustomButton
              title={isBookmarkReview ? 'Back' : 'Skip'}
              color={colors.textPrimary}
              backgroundColor={'transparent'}
              borderRadius={8}
              height={51}
              borderWidth={1}
              borderColor={colors.border}
              width="48%"
              disabled={!isBookmarkReview && (submitLoading || continueHoldActive)}
              onPress={isBookmarkReview ? () => navigation.goBack() : handleSkip}
            />
          </View>
          {!isBookmarkReview && (
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
                  colors={['#0298EF', '#015789']}
                  start={{x: 0.5, y: 0}}
                  end={{x: 0.5, y: 1}}
                  style={styles.footerGradientButton}>
                  <CustomText
                    label="Continue"
                    fontSize={20}
                    fontFamily={fonts.jakartaMedium}
                    color="#FFFFFF"
                    lineHeight={30}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      headerUnScrollable={() =>
        renderTestHeader(
          isBookmarkReview ? 'Bookmarked Question' : lessonName || 'Practice',
          isBookmarkReview,
        )
      }>
      <View style={styles.container}>
        <CustomText
          label={`Question ${questionIndex + 1} of ${questionsUi.length}`}
          fontSize={20}
          fontFamily={fonts.jakartaBold}
          color={colors.textPrimary}
        />
        <CustomText
          label={
            isBookmarkReview
              ? 'Correct answer is highlighted in green'
              : isMockupTest
                ? 'Select your answer and continue'
                : 'Answer and get instant feedback'
          }
          fontSize={14}
          fontFamily={fonts.jakartaRegular}
          color={colors.textMuted}
          lineHeight={20}
          {...(isBookmarkReview || isMockupTest ? {removeTranslation: true} : {})}
        />
        <View style={{marginTop: 5}} />
        <ProgressBar progress={progressPercent} />

        {isAudioQuestion ? (
          <View style={styles.audioCard}>
            <Video
              key={currentQuestion.id}
              ref={audioRef}
              source={currentQuestion.audioSource}
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
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleToggleAudio}
              style={styles.playButton}>
              <ImageFast
                source={Images.play2}
                style={styles.playIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.waveformContainer}>
              {Array.from({length: WAVE_BARS_COUNT}).map((_, index) => (
                <View
                  key={`wave-${index}`}
                  style={[
                    styles.waveLine,
                    {
                      height:
                        index % 5 === 0
                          ? 26
                          : index % 3 === 0
                          ? 19
                          : index % 2 === 0
                          ? 14
                          : 9,
                      backgroundColor:
                        index < playedBars ? '#111111' : '#B0B0B0',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : showImageCard ? (
          <View style={styles.imagePreviewCard}>
            <View style={styles.imagePreviewFabRow}>
              {currentQuestion.imageSource ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Zoom image"
                  activeOpacity={0.85}
                  onPress={() => setImageZoomVisible(true)}
                  style={styles.imageZoomFab}>
                  <View pointerEvents="none">
                    <Image
                      source={Images.zoomicon}
                      style={styles.imageZoomFabIcon}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.imageZoomFab} />
              )}
            </View>
            <View style={styles.imagePreviewThumbRow}>
              {currentQuestion.videoSource ? (
                <Video
                  key={`vid-${currentQuestion.id}`}
                  source={currentQuestion.videoSource}
                  style={styles.imagePreviewThumbWrap}
                  resizeMode="contain"
                  controls
                  paused={false}
                />
              ) : (
                <ImageFast
                  source={currentQuestion.imageSource}
                  style={styles.imagePreviewThumbWrap}
                  resizeMode="cover"
                  onPress={() => setImageZoomVisible(true)}
                />
              )}
            </View>
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

        <CustomText
          label={currentQuestion.prompt}
          fontSize={17}
          fontFamily={fonts.jakartaSemiBold}
          color={colors.textPrimary}
          lineHeight={28}
          marginTop={20}
          removeTranslation
        />
        <CustomText
          label={currentQuestion.subPrompt}
          fontSize={14}
          marginTop={5}
          fontFamily={fonts.jakartaRegular}
          color={colors.textMuted}
          lineHeight={20}
          removeTranslation
        />
        <View style={{marginTop: 10}} />
        {currentQuestion.useGridForOptions ? (
          <View style={styles.optionGrid}>
            {currentQuestion.options.map((option, optIndex) => (
              <TouchableOpacity
                key={option.id}
                activeOpacity={continueHoldActive || submitLoading ? 1 : 0.9}
                disabled={continueHoldActive || submitLoading}
                onPress={() => handleOptionPress(option.id)}
                style={[
                  styles.optionGridCell,
                  {width: gridOptionWidth},
                  getOptionContainerStyles(option, optIndex, true),
                ]}>
                {option.imageUri ? (
                  <ImageFast
                    source={{uri: option.imageUri}}
                    style={styles.optionGridThumb}
                    resizeMode="contain"
                  />
                ) : null}
                <CustomText
                  label={option.title}
                  fontSize={15}
                  fontFamily={fonts.jakartaSemiBold}
                  color={getOptionPrimaryTextColor(option, optIndex, true)}
                  textAlign="center"
                  lineHeight={22}
                  removeTranslation
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          currentQuestion.options.map((option, optIndex) => (
            <TouchableOpacity
              key={option.id}
              activeOpacity={continueHoldActive || submitLoading ? 1 : 0.9}
              disabled={continueHoldActive || submitLoading}
              onPress={() => handleOptionPress(option.id)}
              style={[
                styles.optionCard,
                styles.optionCardFullWidth,
                getOptionContainerStyles(option, optIndex, false),
              ]}>
              <CustomText
                label={option.title}
                fontSize={14}
                fontFamily={fonts.jakartaSemiBold}
                color={getOptionPrimaryTextColor(option, optIndex, false)}
                lineHeight={20}
                removeTranslation
              />
              {option.subtitle ? (
                <CustomText
                  label={option.subtitle}
                  fontSize={12}
                  fontFamily={fonts.jakartaRegular}
                  color={getOptionSubtitleColor(option, optIndex)}
                  lineHeight={20}
                  removeTranslation
                />
              ) : null}
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScreenWrapper>
  );
};

export default TestformNew;
