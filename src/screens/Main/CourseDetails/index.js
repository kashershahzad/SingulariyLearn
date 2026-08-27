import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  ImageBackground,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from '../courseEnroll/header';
import {Images} from '../../../assets/images';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import ImageFast from '../../../components/ImageFast';
import CircularProgress from '../../../components/CircularProgress';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';

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

const normalizeLang = lang => {
  const code = String(lang || 'en').toLowerCase();
  if (code === 'ur' || code === 'urdu') {
    return 'ur';
  }
  return 'en';
};

const hasTruthyFlag = value =>
  value === true || value === 1 || value === '1';

const mapLessonRow = (lessonItem, lang) => {
  const id = String(lessonItem.lesson_id ?? lessonItem.id ?? '');
  const title =
    lessonItem.lesson_label ||
    lessonItem.title ||
    parseLocalized(lessonItem.name, lang) ||
    '';

  return {
    id,
    title,
    type: lessonItem.content_icon || 'document',
    completed: hasTruthyFlag(lessonItem.is_completed),
  };
};

const CourseDetails = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const routeParams = useRoute().params ?? {};
  const courseId = String(routeParams.courseId || routeParams.course_id || '');
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const userData = useSelector(state => state.users.userData);
  const defaultPermitId = userData?.purchase?.[0]?.permit?.id || '1';
  const lang = normalizeLang(currentLanguage);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLessonId, setExpandedLessonId] = useState('');
  const didSetInitialExpand = useRef(false);

  useEffect(() => {
    if (!token || !courseId) {
      setDetail(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCourseDetail = async () => {
      setLoading(true);
      try {
        const response = await ApiRequest({
          type: 'course_detail',
          user_id: token,
          course_id: courseId,
        });

        if (cancelled) {
          return;
        }

        if (response?.status === 200 && response.data?.result !== false) {
          setDetail(response.data);
        } else {
          setDetail(null);
          ToastMessage(t('screens.courseDetails.loadFailed'), 'error');
        }
      } catch {
        if (!cancelled) {
          setDetail(null);
          ToastMessage(t('screens.courseDetails.loadFailed'), 'error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCourseDetail();

    return () => {
      cancelled = true;
    };
  }, [token, courseId, t]);

  const course = detail?.course;
  const isCompleted = hasTruthyFlag(detail?.is_completed);
  const showCompletedBadge = hasTruthyFlag(detail?.show_completed_badge);

  const courseTitle = useMemo(() => {
    if (!detail && !course) {
      return '';
    }
    return (
      parseLocalized(course?.name, lang) ||
      detail?.course_name ||
      t('screens.courseDetails.fallbackTitle')
    );
  }, [detail, course, lang, t]);

  const courseDescription = useMemo(() => {
    return (
      parseLocalized(course?.description, lang) ||
      detail?.course_description ||
      ''
    );
  }, [course, detail, lang]);

  const heroImage = course?.cover_url || course?.cover || course?.image;
  const finalGradePercent = Number(
    detail?.grading?.final_grade_percent ??
      detail?.final_grade_percent ??
      0,
  );
  const certificateAvailable = hasTruthyFlag(detail?.certificate?.available);
  const certificateUrl = String(detail?.certificate?.download_url || '').trim();

  const statsData = useMemo(
    () => [
      {
        id: 'hours',
        icon: Images.hoursspend,
        value: detail?.stats?.total_hours_label || '0',
        title: 'screens.courseDetails.totalHours',
      },
      {
        id: 'lessons',
        icon: Images.lesson,
        value: detail?.stats?.lessons_label || '0/0',
        title: 'screens.courseDetails.lessonsCompleted',
      },
      {
        id: 'quizzes',
        icon: Images.passedquiz,
        value: detail?.stats?.quizzes_passed_label || '0%',
        title: 'screens.courseDetails.quizzesPassed',
      },
    ],
    [detail],
  );

  const curriculumLessons = useMemo(() => {
    const review = detail?.curriculum_review;
    const fromModules = (review?.modules || []).flatMap(moduleItem =>
      (moduleItem.lessons || []).map(lessonItem => mapLessonRow(lessonItem, lang)),
    );

    if (fromModules.length > 0) {
      const seen = new Set();
      return fromModules.filter(lesson => {
        if (!lesson.id || seen.has(lesson.id)) {
          return false;
        }
        seen.add(lesson.id);
        return true;
      });
    }

    return (review?.lessons || [])
      .map(lessonItem => mapLessonRow(lessonItem, lang))
      .filter(lesson => lesson.id);
  }, [detail, lang]);

  useEffect(() => {
    didSetInitialExpand.current = false;
    setExpandedLessonId('');
  }, [courseId]);

  useEffect(() => {
    if (
      didSetInitialExpand.current ||
      curriculumLessons.length === 0
    ) {
      return;
    }
    didSetInitialExpand.current = true;
    setExpandedLessonId(curriculumLessons[0].id);
  }, [curriculumLessons]);

  const toggleLesson = lessonId => {
    setExpandedLessonId(prev => (prev === lessonId ? '' : lessonId));
  };

  const handleDownloadCertificate = useCallback(async () => {
    if (!certificateUrl) {
      ToastMessage(t('screens.courseDetails.certNotAvailable'), 'error');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(certificateUrl);
      if (canOpen) {
        await Linking.openURL(certificateUrl);
      } else {
        ToastMessage(t('screens.courseDetails.certLinkFailed'), 'error');
      }
    } catch {
      ToastMessage(t('screens.courseDetails.certDownloadFailed'), 'error');
    }
  }, [certificateUrl, t]);

  const navigateToStudy = useCallback(
    lesson => {
      if (!lesson?.id) {
        return;
      }
      navigation.navigate('CourseDetialNew', {
        courseId,
        course_id: courseId,
        lessonId: lesson.id,
        lesson_id: lesson.id,
        coursetitle: courseTitle,
      });
    },
    [navigation, courseId, courseTitle],
  );

  const navigateToPractice = useCallback(
    lesson => {
      if (!lesson?.id) {
        return;
      }
      navigation.navigate('TestformNew', {
        lessonId: lesson.id,
        lessonName: lesson.title,
        course_id: courseId,
        courseId,
        permit_id: defaultPermitId,
      });
    },
    [navigation, courseId, defaultPermitId],
  );

  if (loading) {
    return (
      <ScreenWrapper
        paddingHorizontal={0}
        headerUnScrollable={() => <Header title="screens.courseDetails.header" />}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0298EF" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!detail) {
    return (
      <ScreenWrapper
        paddingHorizontal={0}
        headerUnScrollable={() => <Header title="screens.courseDetails.header" />}>
        <View style={styles.loaderContainer}>
          <CustomText
            label="screens.courseDetails.unavailable"
            fontFamily={fonts.jakartaRegular}
            fontSize={16}
            color="#464555"
          />
        </View>
      </ScreenWrapper>
    );
  }

  const statusLabel =
    detail?.status_label ||
    (isCompleted
      ? t('screens.courseDetails.statusCompleted')
      : String(detail?.course_status || '').toUpperCase());
  const completionDate = detail?.completion?.completion_date || '';
  const curriculumSubtitle =
    detail?.curriculum_review?.subtitle ||
    t('screens.courseDetails.curriculumSubtitleFallback');

  return (
    <ScreenWrapper
      scrollEnabled
      paddingHorizontal={0}
      headerUnScrollable={() => <Header title="screens.courseDetails.header" />}>
      <ImageBackground
        source={heroImage ? {uri: heroImage} : Images.herobg}
        style={styles.backgroundImage}
        imageStyle={heroImage ? styles.heroImageStyle : undefined}>
        <View style={styles.container}>
          {(showCompletedBadge || isCompleted) && (
            <View style={styles.titleContainer}>
              <ImageFast
                source={Images.tick4}
                style={{width: 15, height: 15}}
                resizeMode="contain"
              />
              <CustomText
                label={statusLabel}
                fontFamily={fonts.bold}
                fontSize={14}
                color="white"
                removeTranslation
              />
            </View>
          )}
          <CustomText
            label={courseTitle}
            fontFamily={fonts.jakartaSemiBold}
            fontSize={48}
            color="#1B1B24"
            lineHeight={56}
            width={'80%'}
            marginTop={20}
            removeTranslation
          />
          <CustomText
            label={courseDescription}
            fontFamily={fonts.jakartaRegular}
            fontSize={18}
            color="#464555"
            marginTop={10}
            removeTranslation
          />
        </View>
      </ImageBackground>
      <View style={styles.courseInfoContainer}>
        <View style={styles.infoCard}>
          <ImageFast
            source={Images.badge}
            style={styles.badgeImage}
            resizeMode="contain"
          />
          <View style={styles.progressWrapper}>
            <CircularProgress
              percentage={finalGradePercent}
              size={160}
              strokeWidth={8}
              strokeColor="#006A61"
              desc={t('screens.courseDetails.finalGrades')}
            />
          </View>

          <CustomText
            label={
              detail?.certificate?.message ||
              t('screens.courseDetails.outstandingPerformance')
            }
            fontFamily={fonts.jakartaSemiBold}
            fontSize={30}
            color="#1B1B24"
            marginTop={20}
            lineHeight={36}
            textAlign="center"
            removeTranslation
          />
          <CustomText
            label="screens.courseDetails.certificateBody"
            fontFamily={fonts.jakartaRegular}
            fontSize={18}
            color="#464555"
            marginTop={10}
            textAlign="center"
            marginLeft={20}
            marginRight={20}
          />
          {certificateAvailable && (
            <TouchableOpacity
              style={[
                styles.downloadButton,
                !certificateUrl && styles.downloadButtonDisabled,
              ]}
              disabled={!certificateUrl}
              onPress={handleDownloadCertificate}>
              <ImageFast
                source={Images.download}
                style={{width: 16, height: 16}}
                resizeMode="contain"
              />
              <CustomText
                label="screens.courseDetails.downloadCertificate"
                fontFamily={fonts.jakartaBold}
                fontSize={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}
          {isCompleted && completionDate ? (
            <>
              <CustomText
                label="screens.courseDetails.completedOn"
                fontFamily={fonts.jakartaBold}
                fontSize={12}
                color="#464555"
                marginTop={10}
                textAlign="center"
              />
              <CustomText
                label={completionDate}
                fontFamily={fonts.jakartaSemiBold}
                fontSize={14}
                color="#1B1B24"
                textAlign="center"
                lineHeight={20}
                removeTranslation
              />
            </>
          ) : null}
        </View>

        {statsData.map(item => (
          <View key={item.id} style={styles.statsCard}>
            <ImageFast
              source={item.icon}
              style={styles.statsIcon}
              resizeMode="contain"
            />
            <CustomText
              label={item.value}
              fontFamily={fonts.jakartaExtraBold}
              fontSize={30}
              color="#1B1B24"
              marginTop={10}
              removeTranslation
            />
            <CustomText
              label={item.title}
              fontFamily={fonts.jakartaMedium}
              fontSize={14}
              color="#464555"
            />
          </View>
        ))}
        <CustomText
          label="screens.courseDetails.curriculumReview"
          fontFamily={fonts.jakartaExtraBold}
          fontSize={30}
          color="#1B1B24"
          marginTop={20}
        />
        <CustomText
          label={curriculumSubtitle}
          fontFamily={fonts.regular}
          fontSize={16}
          color="#464555"
          lineHeight={24}
          marginTop={10}
          removeTranslation
        />
        {curriculumLessons.length === 0 ? (
          <CustomText
            label="screens.courseDetails.noLessons"
            fontFamily={fonts.jakartaRegular}
            fontSize={14}
            color="#999999"
            marginTop={20}
          />
        ) : (
          curriculumLessons.map(lessonItem => {
            const isExpanded = expandedLessonId === lessonItem.id;
            return (
              <View key={lessonItem.id} style={styles.moduleCard}>
                <TouchableOpacity
                  style={styles.moduleHeader}
                  activeOpacity={0.8}
                  onPress={() => toggleLesson(lessonItem.id)}>
                  <View style={styles.moduleTitleRow}>
                    <ImageFast
                      source={Images.check2}
                      style={styles.moduleStatusIcon}
                      resizeMode="contain"
                    />
                    <View style={styles.moduleTextWrap}>
                      <CustomText
                        label={lessonItem.title}
                        fontFamily={fonts.jakartaBold}
                        fontSize={18}
                        width={'80%'}
                        color="#1B1B24"
                        removeTranslation
                      />
                    </View>
                    <ImageFast
                      source={Images.downarrow}
                      style={[
                        styles.moduleArrowIcon,
                        isExpanded && styles.moduleArrowIconExpanded,
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.lessonActionMenu}>
                    <TouchableOpacity
                      style={styles.lessonActionButton}
                      activeOpacity={0.8}
                      onPress={() => navigateToStudy(lessonItem)}>
                      <ImageFast
                        source={Images.book}
                        style={styles.lessonActionIcon}
                        resizeMode="contain"
                      />
                      <CustomText
                        label="screens.courseDetails.study"
                        fontFamily={fonts.jakartaSemiBold}
                        fontSize={15}
                        color="#1B1B24"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.lessonActionButton,
                        styles.lessonActionButtonLast,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => navigateToPractice(lessonItem)}>
                      <ImageFast
                        source={Images.pratise}
                        style={styles.lessonActionIcon}
                        resizeMode="contain"
                      />
                      <CustomText
                        label="screens.courseDetails.practice"
                        fontFamily={fonts.jakartaSemiBold}
                        fontSize={15}
                        color="#1B1B24"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScreenWrapper>
  );
};

export default CourseDetails;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  backgroundImage: {
    width: '100%',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  heroImageStyle: {
    resizeMode: 'cover',
    opacity: 0.35,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    backgroundColor: '#006A61',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 50,
  },
  courseInfoContainer: {
    padding: 20,
    backgroundColor: '#EDF9FF',
  },
  infoCard: {
    backgroundColor: '#F5F2FF',
    padding: 20,
    borderRadius: 32,
    position: 'relative',
    minHeight: 240,
    justifyContent: 'center',
  },
  badgeImage: {
    width: 130,
    height: 214,
    position: 'absolute',
    top: 0,
    right: 30,
  },
  progressWrapper: {
    zIndex: 2,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0298EF',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 56,
    marginTop: 20,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  statsCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 24,
  },
  statsIcon: {
    width: 48,
    height: 48,
  },
  moduleCard: {
    backgroundColor: '#F5F2FF',
    borderRadius: 30,
    padding: 18,
    marginTop: 20,
  },
  moduleHeader: {
    borderRadius: 24,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleStatusIcon: {
    width: 40,
    height: 40,
    marginRight: 14,
  },
  moduleTextWrap: {
    flex: 1,
  },
  moduleArrowIcon: {
    width: 18,
    height: 18,
    tintColor: '#4E4D5D',
    transform: [{rotate: '0deg'}],
  },
  moduleArrowIconExpanded: {
    transform: [{rotate: '180deg'}],
  },
  lessonActionMenu: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E4F5',
  },
  lessonActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEF8',
  },
  lessonActionButtonLast: {
    borderBottomWidth: 0,
  },
  lessonActionIcon: {
    width: 20,
    height: 20,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    minHeight: 200,
  },
});
