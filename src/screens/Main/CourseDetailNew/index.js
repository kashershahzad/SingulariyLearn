import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Video from 'react-native-video';
import RenderHtml from 'react-native-render-html';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';
import fonts from '../../../assets/fonts';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';
import VideoPlayer from '../../../components/VideoPlayer';
import ProgressBar from '../../../components/ProgressBar';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {
  isBookmarkedFlag,
  toggleLessonBookmarkApi,
} from '../../../utils/courseBookmark';

const parseLocalized = (value, lang) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'object') {
    return value[lang] || value.en || '';
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed[lang] || parsed.en || '';
      }
      return value;
    } catch {
      return value;
    }
  }

  return String(value);
};

const toRenderableHtml = value => {
  const content = String(value || '').trim();
  if (!content) {
    return '';
  }
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }
  return `<p>${content}</p>`;
};

const hasTruthyFlag = value =>
  value === true || value === 1 || value === '1';

const hasMediaUrl = value => Boolean(String(value ?? '').trim());

const normalizeLang = lang => {
  const code = String(lang || 'en').toLowerCase();
  if (code === 'ur' || code === 'urdu') {
    return 'ur';
  }
  return 'en';
};

const normalizeApiBody = raw => {
  if (!raw) {
    return {};
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
};

const getLessonRowsFromResponse = response => {
  const body = normalizeApiBody(response?.data);

  if (Array.isArray(body)) {
    return body;
  }

  if (Array.isArray(body?.data)) {
    return body.data;
  }

  if (body?.data && typeof body.data === 'object' && body.data.id) {
    return [body.data];
  }

  return [];
};

const CourseDetialNew = () => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const {width: windowWidth} = useWindowDimensions();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: c.screenBg,
        paddingHorizontal: 20,
        paddingVertical: 20,
      },
      loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.screenBg,
      },
      content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
      },
      courseTitleText: {
        flex: 1,
        flexShrink: 1,
        marginRight: 10,
      },
      headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      },
      bookmarkAction: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
      },
      bookmarkActionDisabled: {
        opacity: 0.5,
      },
      continueCard: {
        backgroundColor: c.card,
        padding: 20,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: c.border,
      },
      lessonRow: {
        flexDirection: 'row',
        gap: 10,
      },
      lessonContent: {
        flex: 1,
      },
      bookContainer: {
        backgroundColor: c.accentBg,
        padding: 5,
        borderRadius: 5,
        borderColor: c.accent,
        height: 27,
        width: 27,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
      },
      audioCard: {
        marginTop: 14,
        backgroundColor: c.lessonItemBg,
        borderColor: c.accent,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      hiddenAudio: {
        width: 0,
        height: 0,
      },
      playIconWrap: {
        width: 88,
        height: 88,
        borderRadius: 16,
        backgroundColor: c.accent,
        alignItems: 'center',
        justifyContent: 'center',
      },
      playIcon: {
        width: 34,
        height: 34,
      },
      audioTextWrap: {
        flex: 1,
      },
      audioHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      audioProgressTrack: {
        marginTop: 8,
        height: 12,
        backgroundColor: c.progressTrack,
        borderRadius: 999,
        overflow: 'hidden',
      },
      audioProgressFill: {
        width: '0%',
        height: '100%',
        backgroundColor: c.accent,
        borderRadius: 999,
      },
      audioProgressFillActive: {
        width: '36%',
      },
      keyPointsCard: {
        backgroundColor: c.card,
        padding: 20,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: c.border,
      },
      examTipCard: {
        backgroundColor: c.lessonItemBg,
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: c.accent,
      },
      footerContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: c.screenBg,
      },
      footerGradientButton: {
        height: 51,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
      },
      footerButtonDisabled: {
        opacity: 0.85,
      },
      videoWrapper: {
        marginTop: 20,
      },
      quizActions: {
        marginTop: 20,
        gap: 12,
      },
      quizSectionTitle: {
        marginBottom: 2,
      },
      quizActionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: c.card,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: c.border,
      },
      quizActionTextWrap: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        paddingRight: 8,
      },
      quizChevronWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: c.lessonItemBg,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  );

  const routeParams = useRoute().params ?? {};
  const {
    courseId,
    course_id,
    lessonId,
    lesson_id,
    lessondata,
    coursetitle,
    lessonName,
  } = routeParams;
  console.log('lessonName', lessonName);
  console.log('coursetitle', coursetitle);
  console.log('lessondata', lessondata);
  console.log('courseId', courseId);
  console.log('routeParams', routeParams);
  const activeCourseId = course_id || courseId;
  const activeLessonId = lesson_id || lessonId || lessondata?.id;
  const courseTitle = coursetitle || '';
  const navigation = useNavigation();
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const userData = useSelector(state => state.users.userData);
  const defaultPermitId = userData?.purchase?.[0]?.permit?.id || '1';

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchLessonDetail = async () => {
      if (!activeCourseId || !activeLessonId) {
        if (!cancelled) {
          setLesson(null);
          setLoading(false);
        }
        return;
      }

      if (!token) {
        return;
      }

      setLoading(true);
      try {
        const response = await ApiRequest({
          type: 'get_data',
          table_name: 'lesson',
          lesson_id: String(activeLessonId),
          course_id: String(activeCourseId),
          user_id: token,
          is_study: '1',
        });
        if (cancelled) {
          return;
        }
        console.log('response', response);
        const rows = getLessonRowsFromResponse(response);
        setLesson(rows[0] ?? null);
      } catch {
        if (!cancelled) {
          setLesson(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLessonDetail();

    return () => {
      cancelled = true;
    };
  }, [token, activeCourseId, activeLessonId]);

  const lang = normalizeLang(currentLanguage);
  const lessonTitle = parseLocalized(lesson?.name, lang);
  const headerTitle =
    lessonTitle ||
    parseLocalized(lessonName, lang) ||
    parseLocalized(lessondata?.name, lang) ||
    '';
  const lessonShortDesc = parseLocalized(lesson?.short_desc, lang);
  const lessonDescription = parseLocalized(lesson?.description, lang);
  const lessonExamTip = parseLocalized(lesson?.exam_tip, lang);
  const isLessonCompleted =
    hasTruthyFlag(lesson?.is_completed) ||
    hasTruthyFlag(lesson?.lesson_completed) ||
    hasTruthyFlag(lesson?.lesson_marked_complete);
  const lessonProgress = isLessonCompleted
    ? 100
    : Number(lesson?.progress_percent ?? lesson?.percentage ?? 0);
  const videoUrl = String(
    lesson?.video_explanation_url,
  ).trim();
  const audioUrl = String(
    lesson?.audio_explanation_url || lesson?.audio_explanation || '',
  ).trim();
  const hasVideo = hasMediaUrl(videoUrl);
  const hasAudio = hasMediaUrl(audioUrl);
  const hasExamTip = Boolean(lessonExamTip.trim());
  const isLessonBookmarked = isBookmarkedFlag(lesson?.is_bookmarked);
  const keyPointsContentWidth = windowWidth - 80;
  const examTipContentWidth = windowWidth - 100;
  const lessonHtmlStyles = useMemo(
    () => ({
      baseStyle: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        fontFamily: fonts.jakartaRegular,
      },
      tagsStyles: {
        p: {marginBottom: 8, color: colors.textSecondary},
        strong: {fontWeight: 'bold', color: colors.textSecondary},
        b: {fontWeight: 'bold', color: colors.textSecondary},
        li: {marginBottom: 4, color: colors.textSecondary},
        ul: {marginBottom: 8, paddingLeft: 16},
        ol: {marginBottom: 8, paddingLeft: 16},
      },
      classesStyles: {
        p1: {marginBottom: 8, color: colors.textSecondary},
      },
    }),
    [colors.textSecondary],
  );

  const handleToggleLessonBookmark = useCallback(async () => {
    if (!token || !activeCourseId || !activeLessonId || bookmarkLoading) {
      return;
    }

    const wasBookmarked = isLessonBookmarked;
    const nextBookmarked = !wasBookmarked;

    setLesson(prev => ({
      ...prev,
      is_bookmarked: nextBookmarked ? 1 : 0,
    }));

    setBookmarkLoading(true);
    try {
      const response = await toggleLessonBookmarkApi({
        token,
        courseId: activeCourseId,
        lessonId: activeLessonId,
        isBookmarked: wasBookmarked,
      });
      const apiData = normalizeApiBody(response?.data);

      if (response?.status === 200 && apiData?.result !== false) {
        ToastMessage(
          wasBookmarked
            ? apiData?.message || t('screens.lessonDetail.bookmarkRemoved')
            : apiData?.message || t('screens.lessonDetail.lessonBookmarked'),
          'success',
        );
        return;
      }

      setLesson(prev => ({
        ...prev,
        is_bookmarked: wasBookmarked ? 1 : 0,
      }));
      ToastMessage(
        apiData?.message || t('screens.lessonDetail.bookmarkFailed'),
        'error',
      );
    } catch {
      setLesson(prev => ({
        ...prev,
        is_bookmarked: wasBookmarked ? 1 : 0,
      }));
      ToastMessage(t('screens.lessonDetail.bookmarkFailed'), 'error');
    } finally {
      setBookmarkLoading(false);
    }
  }, [token, activeCourseId, activeLessonId, isLessonBookmarked, bookmarkLoading, t]);

  const handleMarkComplete = useCallback(async () => {
    if (
      !token ||
      !activeCourseId ||
      !activeLessonId ||
      isLessonCompleted ||
      completing
    ) {
      return;
    }

    setCompleting(true);
    try {
      const body = {
        type: 'complete_lesson',
        user_id: String(token),
        lesson_id: String(activeLessonId),
        course_id: String(activeCourseId),
        is_completed: '1',
      };
      console.log('complete_lesson request:', body);

      const response = await ApiRequest(body);
      const apiData = normalizeApiBody(response?.data);

      console.log('complete_lesson response:', response?.data);

      if (response?.status === 200 && apiData?.result !== false) {
        setLesson(prev => ({
          ...prev,
          ...apiData,
          is_completed: 1,
          lesson_completed: 1,
          lesson_marked_complete: 1,
          progress_percent: 100,
          percentage: 100,
        }));
        ToastMessage(
          apiData?.message || t('screens.lessonDetail.markedComplete'),
          'success',
        );
        return;
      }

      ToastMessage(
        apiData?.message || t('screens.lessonDetail.markCompleteFailed'),
        'error',
      );
    } catch {
      ToastMessage(t('screens.lessonDetail.markCompleteFailed'), 'error');
    } finally {
      setCompleting(false);
    }
  }, [token, activeCourseId, activeLessonId, isLessonCompleted, completing, t]);

  const navigateToQuiz = useCallback(
    mode => {
      const base = {
        lessonId: activeLessonId,
        lesson_id: activeLessonId,
        lessonName: lessonTitle,
        course_id: activeCourseId,
        courseId: activeCourseId,
        permit_id: defaultPermitId,
      };

      if (mode === 'study') {
        navigation.navigate('TestformNew', {
          ...base,
          is_study: '1',
        });
        return;
      }

      if (mode === 'mockup') {
        navigation.navigate('TestformNew', {
          ...base,
          is_mockup: '1',
        });
        return;
      }

      // practice — existing TestformNew practice API
      navigation.navigate('TestformNew', base);
    },
    [
      navigation,
      activeLessonId,
      lessonTitle,
      activeCourseId,
      defaultPermitId,
    ],
  );

  if (loading) {
    return (
      <ScreenWrapper
        paddingHorizontal={0}
        headerUnScrollable={() => (
          <Header2 title={headerTitle} titleRemoveTranslation />
        )}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      scrollEnabled={true}
      footerUnScrollable={() => (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isLessonCompleted || completing}
            onPress={handleMarkComplete}>
            <LinearGradient
              colors={
                isLessonCompleted
                  ? ['#B8C5D0', '#9AA8B5']
                  : ['#0298EF', '#015789']
              }
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={[
                styles.footerGradientButton,
                (isLessonCompleted || completing) && styles.footerButtonDisabled,
              ]}>
              <CustomText
                label={
                  isLessonCompleted
                    ? t('screens.lessonDetail.completed')
                    : completing
                      ? t('screens.lessonDetail.saving')
                      : t('screens.lessonDetail.markComplete')
                }
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
      headerUnScrollable={() => (
        <Header2 title={headerTitle} titleRemoveTranslation />
      )}>
      <View style={styles.container}>
        <View style={styles.content}>
          <CustomText
            fontSize={20}
            fontFamily={fonts.jakartaBold}
            color={colors.textPrimary}
            label={courseTitle}
            lineHeight={32}
            removeTranslation
            containerStyle={styles.courseTitleText}
          />
          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={bookmarkLoading}
              onPress={handleToggleLessonBookmark}
              style={[
                styles.bookmarkAction,
                bookmarkLoading && styles.bookmarkActionDisabled,
              ]}>
              <Icons
                family="Ionicons"
                name={isLessonBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={colors.accent}
              />
            </TouchableOpacity>
            <ImageFast
              source={Images.download2}
              style={{width: 24, height: 24}}
              resizeMode="contain"
            />
          </View>
        </View>

        <CustomText
          fontSize={14}
          fontFamily={fonts.jakartaRegular}
          color={colors.textMuted}
          label={lessonTitle}
          removeTranslation
        />

        {hasVideo && (
          <VideoPlayer
            source={{uri: videoUrl}}
            style={styles.videoWrapper}
            repeat
          />
        )}

        <View style={styles.continueCard}>
          <View style={styles.lessonRow}>
            <View style={styles.bookContainer}>
              <ImageFast
                source={Images.light}
                style={{width: 18, height: 18}}
                resizeMode="contain"
              />
            </View>
            <View style={styles.lessonContent}>
              <CustomText
                fontSize={17}
                fontFamily={fonts.jakartaSemiBold}
                color={colors.textPrimary}
                label={lessonTitle}
                lineHeight={20}
                removeTranslation
              />
              <CustomText
                fontSize={12}
                fontFamily={fonts.jakartaRegular}
                color={colors.textMuted}
                label={lessonShortDesc}
                lineHeight={20}
                marginTop={4}
                removeTranslation
              />
            </View>
          </View>
        </View>

        {hasAudio && (
          <TouchableOpacity
            style={styles.audioCard}
            activeOpacity={0.8}
            onPress={() => setAudioPlaying(prev => !prev)}>
            <Video
              source={{uri: audioUrl}}
              paused={!audioPlaying}
              audioOnly
              repeat
              style={styles.hiddenAudio}
            />
            <View style={styles.playIconWrap}>
              <ImageFast
                source={Images.playaudio}
                style={styles.playIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.audioTextWrap}>
              <View style={styles.audioHeader}>
                <CustomText
                  fontSize={20}
                  fontFamily={fonts.jakartaBold}
                  color={colors.textPrimary}
                  label="screens.lessonDetail.listen"
                  lineHeight={28}
                />
                <CustomText
                  fontSize={12}
                  fontFamily={fonts.jakartaRegular}
                  color={colors.textPrimary}
                  label={
                    audioPlaying
                      ? t('screens.lessonDetail.playing')
                      : t('screens.lessonDetail.tapToPlay')
                  }
                  lineHeight={22}
                  removeTranslation
                />
              </View>
              <CustomText
                fontSize={12}
                fontFamily={fonts.jakartaSemiBold}
                color={colors.textSecondary}
                label="screens.lessonDetail.audioExplanation"
                lineHeight={18}
              />
              <View style={styles.audioProgressTrack}>
                <View
                  style={[
                    styles.audioProgressFill,
                    audioPlaying && styles.audioProgressFillActive,
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.keyPointsCard}>
          <CustomText
            fontSize={16}
            fontFamily={fonts.jakartaSemiBold}
            color={colors.textPrimary}
            label="screens.lessonDetail.keyPoints"
          />
          {!!lessonDescription.trim() && (
            <RenderHtml
              contentWidth={keyPointsContentWidth}
              source={{html: toRenderableHtml(lessonDescription)}}
              baseStyle={lessonHtmlStyles.baseStyle}
              tagsStyles={lessonHtmlStyles.tagsStyles}
              classesStyles={lessonHtmlStyles.classesStyles}
            />
          )}
          {hasExamTip && (
            <View style={styles.examTipCard}>
              <CustomText
                fontSize={16}
                fontFamily={fonts.jakartaBold}
                color={colors.textPrimary}
                label="screens.lessonDetail.examTip"
              />
              <RenderHtml
                contentWidth={examTipContentWidth}
                source={{html: toRenderableHtml(lessonExamTip)}}
                baseStyle={lessonHtmlStyles.baseStyle}
                tagsStyles={lessonHtmlStyles.tagsStyles}
                classesStyles={lessonHtmlStyles.classesStyles}
              />
            </View>
          )}
        </View>

        <View style={styles.quizActions}>
          <CustomText
            label="screens.lessonDetail.quizSectionTitle"
            fontSize={16}
            fontFamily={fonts.jakartaBold}
            color={colors.textPrimary}
            containerStyle={styles.quizSectionTitle}
          />

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.quizActionCard}
            onPress={() => navigateToQuiz('study')}>
            <View style={styles.quizActionTextWrap}>
              <CustomText
                label="screens.lessonDetail.studyQuestion"
                fontSize={15}
                fontFamily={fonts.jakartaSemiBold}
                color={colors.textPrimary}
                lineHeight={20}
              />
              <CustomText
                label="screens.lessonDetail.studyQuestionHint"
                fontSize={12}
                fontFamily={fonts.jakartaRegular}
                color={colors.textMuted}
                lineHeight={17}
                marginTop={2}
              />
            </View>
            <View style={styles.quizChevronWrap}>
              <Icons
                family="Ionicons"
                name="chevron-forward"
                size={16}
                color={colors.accent}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.quizActionCard}
            onPress={() => navigateToQuiz('practice')}>
            <View style={styles.quizActionTextWrap}>
              <CustomText
                label="screens.lessonDetail.practiceQuestion"
                fontSize={15}
                fontFamily={fonts.jakartaSemiBold}
                color={colors.textPrimary}
                lineHeight={20}
              />
              <CustomText
                label="screens.lessonDetail.practiceQuestionHint"
                fontSize={12}
                fontFamily={fonts.jakartaRegular}
                color={colors.textMuted}
                lineHeight={17}
                marginTop={2}
              />
            </View>
            <View style={styles.quizChevronWrap}>
              <Icons
                family="Ionicons"
                name="chevron-forward"
                size={16}
                color={colors.accent}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.quizActionCard}
            onPress={() => navigateToQuiz('mockup')}>
            <View style={styles.quizActionTextWrap}>
              <CustomText
                label="screens.lessonDetail.mockupTest"
                fontSize={15}
                fontFamily={fonts.jakartaSemiBold}
                color={colors.textPrimary}
                lineHeight={20}
              />
              <CustomText
                label="screens.lessonDetail.mockupTestHint"
                fontSize={12}
                fontFamily={fonts.jakartaRegular}
                color={colors.textMuted}
                lineHeight={17}
                marginTop={2}
              />
            </View>
            <View style={styles.quizChevronWrap}>
              <Icons
                family="Ionicons"
                name="chevron-forward"
                size={16}
                color={colors.accent}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default CourseDetialNew;
