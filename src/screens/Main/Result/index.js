import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CircularProgress from '../../../components/CircularProgress';
import CustomText from '../../../components/CustomText';
import CustomButton from '../../../components/CustomButton';
import fonts from '../../../assets/fonts';
import TopicAccuracyCard, {WeakAreasEmpty} from './TopicAccuracyCard';
import ReviewAnswersModal from './ReviewAnswersModal';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';
import {ApiRequest} from '../../../services/ApiRequest';

const RESULT_ACTION_BUTTONS = [
  {id: 'focus-practice', titleKey: 'screens.result.focusPractice'},
  {id: 'review-answer', titleKey: 'screens.result.reviewAnswer'},
  {id: 'retake-test', titleKey: 'screens.result.retakeTest'},
];

const MainResult = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {t} = useTranslation();
  const token = useSelector(state => state.authConfig.token);
  const [weakAreas, setWeakAreas] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: c.screenBg,
        paddingHorizontal: 20,
        paddingBottom: 32,
        alignItems: 'center',
      },
      congratsStatsRow: {
        flexDirection: 'row',
        gap: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: 4,
        width: '100%',
      },
      congratsStatCol: {
        alignItems: 'center',
        minWidth: 120,
      },
      progressWrap: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
      },
      weakAreasList: {
        width: '100%',
        alignItems: 'stretch',
      },
      improveWeakAreasContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: c.lessonItemBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.accent,
        minHeight: 85,
        marginTop: 20,
        width: '100%',
      },
      actionButtonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 16,
      },
      actionBadge: {
        height: 38,
        width: 108,
        backgroundColor: c.accentBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: c.accent,
        justifyContent: 'center',
        alignItems: 'center',
      },
      actionBadgeSpacing: {
        marginRight: 8,
      },
      footerGradientButton: {
        height: 51,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
      },
      footerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: c.screenBg,
      },
    }),
  );

  const {
    score: paramScore = 0,
    totalQuestions: paramTotal = 0,
    averageTime: paramAvgTime = 0,
    permitId,
    isMockupTest: paramIsMockupTest,
    is_mockup,
    course_id,
    courseId,
    reviewAnswers = [],
    lessonName,
    permit_id,
    lessonId,
    lesson_id,
  } = route.params || {};

  const activeCourseId = course_id || courseId || '1';
  const activeLessonId = lessonId || lesson_id;

  const isMockupTest =
    paramIsMockupTest === true ||
    is_mockup === '1' ||
    is_mockup === 1 ||
    is_mockup === true;

  const hasLiveResult =
    typeof paramTotal === 'number' && paramTotal > 0;

  const showExtendedResult = isMockupTest || !hasLiveResult;

  const percentage = hasLiveResult
    ? Math.round((paramScore / paramTotal) * 100)
    : 30;
  const passed = percentage >= 70;
  const progressStroke = hasLiveResult
    ? passed
      ? colors.correct
      : colors.wrong
    : colors.correct;
  const passFailColor = hasLiveResult
    ? passed
      ? colors.correct
      : colors.wrong
    : colors.textPrimary;

  useEffect(() => {
    if (!showExtendedResult || !token) {
      return;
    }

    const fetchMockTestStats = async () => {
      try {
        const response = await ApiRequest({
          type: 'mock_test_stats',
          user_id: String(token),
          course_id: String(activeCourseId),
        });

        if (response?.status === 200 && response.data?.result) {
          setWeakAreas(
            Array.isArray(response.data.weak_areas)
              ? response.data.weak_areas
              : [],
          );
        }
      } catch (error) {
        console.error('mock_test_stats error:', error);
      }
    };

    fetchMockTestStats();
  }, [showExtendedResult, token, activeCourseId]);

  const handleRetakeTest = () => {
    navigation.replace('TestformNew', {
      course_id: activeCourseId,
      courseId: activeCourseId,
      permit_id: permit_id || permitId,
      is_mockup: 1,
      lessonName: lessonName || 'Mockup Test',
    });
  };

  const handleStartNewTest = () => {
    if (isMockupTest) {
      handleRetakeTest();
      return;
    }

    navigation.replace('TestformNew', {
      lessonId: activeLessonId,
      lessonName: lessonName || 'Practice',
      course_id: activeCourseId,
      courseId: activeCourseId,
      permit_id: permit_id || permitId,
    });
  };

  const handleFocusPractice = () => {
    navigation.navigate('TabStack', {
      screen: 'Study',
      params: {selectedOption: 'Practice Sets'},
    });
  };

  const handleReviewAnswer = () => {
    setReviewModalVisible(true);
  };

  const handleActionPress = actionId => {
    if (actionId === 'retake-test') {
      handleRetakeTest();
      return;
    }
    if (actionId === 'focus-practice') {
      handleFocusPractice();
      return;
    }
    if (actionId === 'review-answer') {
      handleReviewAnswer();
    }
  };

  return (
    <ScreenWrapper
      scrollEnabled
      paddingHorizontal={0}
      footerUnScrollable={
        showExtendedResult
          ? () => (
              <View style={styles.footerContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('Performence', {
                      course_id: activeCourseId,
                      courseId: activeCourseId,
                    })
                  }>
                  <LinearGradient
                    colors={['#0298EF', '#015789']}
                    start={{x: 0.5, y: 0}}
                    end={{x: 0.5, y: 1}}
                    style={styles.footerGradientButton}>
                    <CustomText
                      label="screens.result.improveWeakAreas"
                      fontSize={20}
                      fontFamily={fonts.jakartaMedium}
                      color="#FFFFFF"
                      lineHeight={30}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )
          : undefined
      }
      headerUnScrollable={() => (
        <Header2
          title={
            isMockupTest
              ? 'screens.result.mockTestHeader'
              : 'screens.result.practiceHeader'
          }
        />
      )}>
      <View style={styles.container}>
        {hasLiveResult ? (
          <>
            <View style={styles.progressWrap}>
              <CircularProgress
                percentage={percentage}
                size={200}
                strokeWidth={30}
                strokeColor={progressStroke}
                percentageTextColor={colors.textPrimary}
                trackStrokeColor={colors.progressTrack}
              />
            </View>
            <CustomText
              label={passed ? 'drivingTestPassed' : 'drivingTestFailed'}
              fontSize={22}
              fontFamily={fonts.medium}
              textAlign="center"
              marginTop={16}
              color={passFailColor}
            />
            <View style={styles.congratsStatsRow}>
              <View style={styles.congratsStatCol}>
                <CustomText
                  label={`${paramScore}/${paramTotal}`}
                  fontFamily={fonts.semiBold}
                  fontSize={20}
                  textAlign="center"
                  marginTop={24}
                  color={colors.textPrimary}
                  removeTranslation
                />
                <CustomText
                  label="resultsLabel"
                  fontFamily={fonts.regular}
                  fontSize={16}
                  textAlign="center"
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.congratsStatCol}>
                <CustomText
                  label={t('screens.result.averageTimeSec', {
                    value: Number.isFinite(Number(paramAvgTime))
                      ? Number(paramAvgTime).toFixed(1)
                      : '0.0',
                  })}
                  fontFamily={fonts.semiBold}
                  fontSize={20}
                  textAlign="center"
                  marginTop={24}
                  color={colors.textPrimary}
                  removeTranslation
                />
                <CustomText
                  label="averageTimeLabel"
                  fontFamily={fonts.regular}
                  fontSize={16}
                  textAlign="center"
                  color={colors.textSecondary}
                />
              </View>
            </View>
            <CustomButton
              onPress={handleStartNewTest}
              width={318}
              height={52}
              title="startNewTestButton"
              backgroundColor={colors.accent}
              fontSize={16}
              color={colors.textOnAccent}
              borderRadius={25}
              marginTop={28}
              fontFamily={fonts.regular}
            />
          </>
        ) : (
          <>
            <CustomText
              label="screens.result.congratulation"
              fontSize={22}
              fontFamily={fonts.semiBold}
              textAlign="center"
              marginTop={10}
              color={colors.textPrimary}
            />
            <View style={styles.progressWrap}>
              <CircularProgress
                percentage={30}
                size={200}
                strokeWidth={30}
                strokeColor={colors.correct}
                percentageTextColor={colors.textPrimary}
                trackStrokeColor={colors.progressTrack}
              />
            </View>
            <CustomText
              label="screens.result.mockScore"
              fontSize={14}
              fontFamily={fonts.semiBold}
              textAlign="center"
              marginTop={16}
              color={colors.textPrimary}
            />
            <CustomText
              label="screens.result.improvementMessage"
              fontSize={13}
              fontFamily={fonts.regular}
              textAlign="center"
              color={colors.textMuted}
              lineHeight={20}
            />
          </>
        )}
        {showExtendedResult ? (
          <>
            <View style={styles.weakAreasList}>
              {weakAreas.length > 0 ? (
                weakAreas.map((item, index) => (
                  <TopicAccuracyCard
                    key={String(item.lesson_id ?? index)}
                    title={item.title || item.topic || ''}
                    subtitle={item.subtitle || item.category_description || ''}
                    accuracyLabel={
                      item.accuracy_label ||
                      `${item.accuracy_percent ?? 0}% accuracy`
                    }
                    removeTranslation
                    marginTop={index === 0 ? 20 : 0}
                    marginBottom={index < weakAreas.length - 1 ? 12 : 0}
                  />
                ))
              ) : (
                <WeakAreasEmpty />
              )}
            </View>
            <View style={styles.improveWeakAreasContainer}>
              <CustomText
                label="screens.result.improveWeakAreas"
                fontSize={18}
                fontFamily={fonts.jakartaBold}
                color={colors.textPrimary}
              />
              <CustomText
                label="screens.result.improvementMessage"
                fontSize={13}
                fontFamily={fonts.regular}
                color={colors.textSecondary}
                lineHeight={20}
                marginTop={4}
              />
            </View>
            <View style={styles.actionButtonsRow}>
              {RESULT_ACTION_BUTTONS.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  style={[styles.actionBadge, styles.actionBadgeSpacing]}
                  onPress={() => handleActionPress(item.id)}>
                  <CustomText
                    label={item.titleKey}
                    fontSize={10}
                    fontFamily={fonts.jakartaBold}
                    color={colors.textPrimary}
                    textAlign="center"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}
      </View>
      <ReviewAnswersModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        reviewAnswers={reviewAnswers}
      />
    </ScreenWrapper>
  );
};

export default MainResult;
