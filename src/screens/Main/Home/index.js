import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useMemo, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import ScreenWrapper from '../../../components/ScreenWrapper';
import {Images} from '../../../assets/images';
import ImageFast from '../../../components/ImageFast';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';
import CircularProgress from '../../../components/CircularProgress';
import CustomButton from '../../../components/CustomButton';
import {ApiRequest} from '../../../services/ApiRequest';

const QUICK_ACTIONS = [
  {key: 'study', titleKey: 'screens.home.quickStudy', icon: Images.book},
  {key: 'practice', titleKey: 'screens.home.quickPractice', icon: Images.book},
  {key: 'mockup', titleKey: 'screens.home.quickMockup', icon: Images.book},
];

const STUDY_NAV_MAP = {
  study: 'Study',
  practice: 'Practice Sets',
  mockup: 'Mock Test',
};

const hasTruthyFlag = value =>
  value === true || value === 1 || value === '1';

const EMPTY_FOCUS_TOPICS = new Set([
  'no focus area yet',
  'no focus area',
  'n/a',
  'none',
]);

const hasValidFocusAreaItem = focusItem => {
  if (!focusItem || typeof focusItem !== 'object') {
    return false;
  }

  const topic = String(
    focusItem.topic || focusItem.title || focusItem.category_name || '',
  ).trim();

  if (!topic || EMPTY_FOCUS_TOPICS.has(topic.toLowerCase())) {
    return false;
  }

  const lessonId = String(focusItem.lesson_id || '').trim();
  const courseId = String(focusItem.course_id || '').trim();

  return Boolean(
    lessonId && lessonId !== '0' && courseId && courseId !== '0',
  );
};

const normalizeFocusAreas = focusAreaRaw => {
  if (!focusAreaRaw || typeof focusAreaRaw !== 'object') {
    return [];
  }

  if (
    focusAreaRaw.has_data !== undefined &&
    focusAreaRaw.has_data !== null &&
    !hasTruthyFlag(focusAreaRaw.has_data)
  ) {
    return [];
  }

  const list =
    Array.isArray(focusAreaRaw.items) && focusAreaRaw.items.length
      ? focusAreaRaw.items
      : Array.isArray(focusAreaRaw.focus_areas) &&
          focusAreaRaw.focus_areas.length
        ? focusAreaRaw.focus_areas
        : null;

  if (list) {
    return list.filter(hasValidFocusAreaItem);
  }

  return hasValidFocusAreaItem(focusAreaRaw) ? [focusAreaRaw] : [];
};

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

const getFocusAreaTopic = (focusItem, lang) => {
  const localized = parseLocalized(
    focusItem?.topic || focusItem?.title || focusItem?.category_name,
    lang,
  );
  return localized || focusItem?.topic || focusItem?.title || '';
};

const Home = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const userData = useSelector(state => state.users.userData);
  const defaultPermitId = userData?.purchase?.[0]?.permit?.id || '1';

  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: c.screenBgAlt,
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 20,
      },
      logo: {
        width: 102,
        height: 22,
        alignSelf: 'center',
        marginTop: 20,
      },
      headerContainer: {
        backgroundColor: c.accent,
        padding: 10,
        height: 80,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      },
      bookContainer: {
        backgroundColor: c.accentBg,
        padding: 5,
        borderRadius: 5,
        height: 27,
        width: 27,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: c.accent,
      },
      bookContainerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: c.border,
        padding: 5,
        borderRadius: 6,
        height: 86,
        width: 66,
      },
      lessonProgressTrack: {
        marginTop: 5,
        height: 9,
        borderRadius: 999,
        backgroundColor: c.progressTrack,
        overflow: 'hidden',
      },
      lessonProgressFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: c.progressFill,
      },
      card: {
        backgroundColor: c.card,
        padding: 20,
        borderRadius: 10,
        marginTop: 10,
      },
      innerBorder: {
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
      },
      chip: {
        flexDirection: 'row',
        gap: 5,
        backgroundColor: '#99DAFF',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#0298EF',
        width: '30%',
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
      },
      loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
      },
    }),
  );

  const fetchHomeData = useCallback(async () => {
    if (!token) {
      setHomeData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await ApiRequest({
        type: 'app_home',
        user_id: token,
      });
      console.log('response', response);

      if (response?.data?.result) {
        setHomeData(response.data);
      } else {
        setHomeData(null);
      }
    } catch (error) {
      console.log('app_home error:', error);
      setHomeData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData]),
  );

  const streak = homeData?.streak;
  const examReadiness = homeData?.exam_readiness;
  const continueLearning = homeData?.continue_learning;
  const focusAreas = useMemo(
    () => normalizeFocusAreas(homeData?.focus_area),
    [homeData?.focus_area],
  );

  const streakCount = streak?.learning_days_total ?? 0;
  const streakLabel =
    streak?.streak_label || t('screens.home.learningDaysFallback');
  const examPercent =
    examReadiness?.percentage ?? homeData?.overall_percentage ?? 0;
  const todayStudyLabel = examReadiness?.today_study_time_label
    ? t('screens.home.todayStudy', {
        time: examReadiness.today_study_time_label,
      })
    : t('screens.home.todayStudyFallback');
  const dailyGoalLabel = examReadiness?.daily_question_label
    ? t('screens.home.dailyGoal', {goal: examReadiness.daily_question_label})
    : t('screens.home.dailyGoalFallback');

  const continueTitle =
    continueLearning?.lesson_title ||
    parseLocalized(continueLearning?.lesson?.name, currentLanguage) ||
    t('screens.home.continueLearningFallback');
  const continueSubtitle = continueLearning
    ? t('screens.home.continueLessonSubtitle', {
        number: continueLearning.lesson_number || '',
        subtitle:
          continueLearning.lesson_subtitle || continueTitle,
        duration: continueLearning.duration_label || '',
      })
    : '';
  const continueProgress = continueLearning?.progress_percent ?? 0;
  const continueProgressLabel = continueLearning?.progress_label
    ? continueLearning.progress_label
    : t('screens.home.progressComplete', {percent: continueProgress});

  const getFocusAreaDetail = focusItem =>
    t('screens.home.focusAreaDetail', {
      accuracy:
        focusItem.accuracy_label ||
        `${focusItem.accuracy_percent ?? 0}%`,
      count: focusItem.recommended_questions || 0,
    });

  const hasFocusAreaData = focusAreas.length > 0;

  const visibleQuickActions = QUICK_ACTIONS;
  const activeCourseId =
    homeData?.active_course_id ||
    homeData?.course_id ||
    continueLearning?.course_id;
  const activeLessonId = continueLearning?.lesson_id;

  const handleQuickAction = actionKey => {
    const selectedOption = STUDY_NAV_MAP[actionKey];
    if (!selectedOption) {
      return;
    }

    navigation.navigate('Study', {selectedOption});
  };

  const handleContinueLearning = () => {
    if (!continueLearning) {
      return;
    }

    navigation.navigate('CourseDetialNew', {
      courseId: String(continueLearning.course_id),
      course_id: String(continueLearning.course_id),
      lessonId: String(continueLearning.lesson_id),
      lesson_id: String(continueLearning.lesson_id),
      coursetitle: continueLearning.course_name || continueTitle,
    });
  };

  const handleFocusPractice = focusItem => {
    if (!focusItem) {
      return;
    }

    navigation.navigate('TestformNew', {
      lessonId: String(focusItem.lesson_id),
      lessonName: getFocusAreaTopic(focusItem, currentLanguage),
      course_id: String(focusItem.course_id),
      courseId: String(focusItem.course_id),
      permit_id: defaultPermitId,
    });
  };

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      scrollEnabled={true}
      headerUnScrollable={() => (
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '60%', paddingHorizontal: 10}}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}>
            <ImageFast
              source={Images.leftarrow}
              style={{width: 24, height: 24, marginTop: 8}}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <ImageFast
            source={Images.newlogo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <ImageFast
                source={Images.streak}
                style={{width: 48, height: 48}}
                resizeMode="contain"
              />
              <View>
                <CustomText
                  fontSize={12}
                  fontFamily={fonts.bold}
                  color={'#FFFFFF99'}
                  lineHeight={16}
                  label="screens.home.currentStreak"
                />
                <CustomText
                  fontSize={20}
                  fontFamily={fonts.bold}
                  color={colors.textOnAccent}
                  lineHeight={28}
                  label={`${streakCount} ${streakLabel}`}
                  removeTranslation
                />
              </View>
            </View>

            <View style={styles.card}>
              <CustomText
                fontSize={16}
                fontFamily={fonts.jakartaSemiBold}
                color={colors.textPrimary}
                label="screens.home.examReadiness"
              />
              <CustomText
                fontSize={11}
                fontFamily={fonts.jakartaRegular}
                color={colors.textMuted}
                label="screens.home.examReadinessDesc"
                lineHeight={16}
                marginTop={5}
              />
              <View style={{flexDirection: 'row', gap: 5, marginTop: 10}}>
                <View style={styles.chip}>
                  <ImageFast
                    source={Images.time}
                    style={{width: 18, height: 18, marginTop: 2}}
                    resizeMode="contain"
                  />
                  <CustomText
                    fontSize={9}
                    fontFamily={fonts.jakartaSemiBold}
                    color={colors.textPrimary}
                    label={todayStudyLabel}
                    removeTranslation
                  />
                </View>
                <View style={styles.chip}>
                  <ImageFast
                    source={Images.goal}
                    style={{width: 18, height: 18, marginTop: 2}}
                    resizeMode="contain"
                  />
                  <CustomText
                    fontSize={9}
                    fontFamily={fonts.jakartaSemiBold}
                    color={colors.textPrimary}
                    label={dailyGoalLabel}
                    removeTranslation
                  />
                </View>
              </View>
              <View
                style={{
                  alignItems: 'flex-start',
                  marginTop: 20,
                  flexDirection: 'row',
                  gap: 10,
                }}>
                <CircularProgress
                  percentage={examPercent}
                  size={90}
                  strokeWidth={6}
                  strokeColor="#FEC635"
                  desc={t('screens.home.examReady')}
                  percentageTextSize={25}
                  percentageTextColor="#0298EF"
                  descTextSize={8}
                  descTextColor="#0298EF"
                />
                {visibleQuickActions.map(action => (
                  <TouchableOpacity
                    key={action.key}
                    activeOpacity={0.85}
                    style={styles.bookContainerWrapper}
                    onPress={() => handleQuickAction(action.key)}>
                    <View style={styles.bookContainer}>
                      <ImageFast
                        source={action.icon}
                        style={{width: 18, height: 18}}
                        resizeMode="contain"
                      />
                    </View>
                    <CustomText
                      fontSize={9}
                      fontFamily={fonts.jakartaSemiBold}
                      color={colors.textPrimary}
                      label={t(action.titleKey)}
                      removeTranslation
                    />
                    {/* <CustomText
                      fontSize={7}
                      fontFamily={fonts.jakartaSemiBold}
                      color={colors.textMuted}
                      label={action.subtitle}
                      lineHeight={12}
                      removeTranslation
                    /> */}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {continueLearning && (
              <View style={styles.card}>
                <CustomText
                  fontSize={16}
                  fontFamily={fonts.jakartaSemiBold}
                  color={colors.textPrimary}
                  label="screens.home.continueSection"
                />
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.innerBorder}
                  onPress={handleContinueLearning}>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <View style={styles.bookContainer}>
                      <ImageFast
                        source={
                          continueLearning.icon_url
                            ? {uri: String(continueLearning.icon_url)}
                            : Images.light
                        }
                        style={{width: 18, height: 18}}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <CustomText
                        fontSize={13}
                        fontFamily={fonts.jakartaBold}
                        color={colors.textPrimary}
                        label={continueTitle}
                        lineHeight={16}
                        removeTranslation
                      />
                      <CustomText
                        fontSize={10}
                        fontFamily={fonts.jakartaRegular}
                        color={colors.textMuted}
                        label={continueSubtitle}
                        lineHeight={20}
                        removeTranslation
                      />
                      <View style={styles.lessonProgressTrack}>
                        <View
                          style={[
                            styles.lessonProgressFill,
                            {width: `${continueProgress}%`},
                          ]}
                        />
                      </View>
                      <CustomText
                        label={continueProgressLabel}
                        removeTranslation
                        fontSize={10}
                        fontFamily={fonts.jakartaRegular}
                        color={colors.textPrimary}
                        lineHeight={26}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.card}>
              <CustomText
                fontSize={16}
                fontFamily={fonts.jakartaSemiBold}
                color={colors.textPrimary}
                label="screens.home.focusArea"
              />
              {hasFocusAreaData ? (
                focusAreas.map((focusItem, index) => (
                  <View
                    key={`${focusItem.lesson_id}-${focusItem.course_id}-${index}`}
                    style={[
                      styles.innerBorder,
                      index > 0 && {marginTop: 10},
                    ]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{flex: 1}}>
                        <CustomText
                          fontSize={13}
                          fontFamily={fonts.jakartaBold}
                          color={colors.textPrimary}
                          label={getFocusAreaTopic(focusItem, currentLanguage)}
                          lineHeight={16}
                          removeTranslation
                        />
                        <CustomText
                          fontSize={10}
                          fontFamily={fonts.jakartaRegular}
                          color={colors.textMuted}
                          label={getFocusAreaDetail(focusItem)}
                          lineHeight={20}
                          removeTranslation
                        />
                      </View>
                      <CustomButton
                        title="screens.home.practice"
                        backgroundColor={'#65C7FF'}
                        height={37}
                        width={57}
                        fontSize={10}
                        fontFamily={fonts.jakartaRegular}
                        color={colors.textPrimary}
                        onPress={() => handleFocusPractice(focusItem)}
                      />
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.innerBorder}>
                  <CustomText
                    fontSize={13}
                    fontFamily={fonts.jakartaBold}
                    color={colors.textPrimary}
                    label="screens.home.noFocusAreaTitle"
                    lineHeight={16}
                  />
                  <CustomText
                    fontSize={10}
                    fontFamily={fonts.jakartaRegular}
                    color={colors.textMuted}
                    label="screens.home.noFocusAreaSubtitle"
                    lineHeight={20}
                  />
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Home;
