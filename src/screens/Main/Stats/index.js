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
import LinearGradient from 'react-native-linear-gradient';

import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';
import fonts from '../../../assets/fonts';
import CoursesCompletedCard from './CoursesCompletedCard';
import WeeklyActivityChart from './WeeklyActivityChart';
import {ApiRequest} from '../../../services/ApiRequest';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const StatsScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const token = useSelector(state => state.authConfig.token);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const styles = useThemedStyles(c =>
    StyleSheet.create({
      outer: {
        flex: 1,
        backgroundColor: c.screenBgAlt,
        paddingHorizontal: 20,
      },
      learningTimeCard: {
        borderRadius: 32,
        padding: 32,
        marginBottom: 24,
      },
      timeRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 12,
        marginBottom: 16,
      },
      trendPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: c.accent,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 100,
      },
      quizCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: c.accent,
        borderRadius: 12,
        padding: 32,
        marginTop: 16,
      },
      quizTextCol: {
        flex: 1,
        paddingRight: 12,
      },
      quizButton: {
        backgroundColor: c.card,
        borderRadius: 100,
        paddingVertical: 14,
        paddingHorizontal: 22,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 88,
      },
      bottomSpacer: {
        height: 24,
      },
      loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        minHeight: 200,
      },
    }),
  );

  const fetchStats = useCallback(async () => {
    if (!token) {
      setStatsData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await ApiRequest({
        type: 'overall_stats',
        user_id: token,
      });

      if (response?.data?.result) {
        setStatsData(response.data);
      } else {
        setStatsData(null);
      }
    } catch (error) {
      console.log('overall_stats error:', error);
      setStatsData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats]),
  );

  const learningTime = statsData?.total_learning_time;
  const learningHoursLabel = useMemo(
    () => `${learningTime?.hours ?? 0}h`,
    [learningTime?.hours],
  );
  const learningMinutesLabel = useMemo(
    () => `${learningTime?.minutes ?? 0}m`,
    [learningTime?.minutes],
  );
  const trendLabel = useMemo(
    () => learningTime?.change_label || t('screens.stats.trendFallback'),
    [learningTime?.change_label, t],
  );

  const coursesCompletedCount = statsData?.courses_completed?.count ?? 0;

  const weeklyActivity = useMemo(() => {
    const days = statsData?.weekly_activity?.days ?? [];
    return days.map(day => ({
      label: day.day,
      value: day.activity_score ?? day.minutes ?? 0,
    }));
  }, [statsData?.weekly_activity?.days]);

  const peakDay = statsData?.weekly_activity?.peak_day;

  const trendIcon =
    learningTime?.trend === 'down' ? 'trending-down' : 'trending-up';

  const handleStartQuiz = () => {
    navigation.navigate('Study', {selectedOption: 'Mock Test'});
  };

  return (
    <ScreenWrapper
      scrollEnabled
      paddingHorizontal={0}
      headerUnScrollable={() => <Header2 title="screens.stats.header" />}>
      <View style={styles.outer}>
        <CustomText
          label="screens.stats.title"
          fontSize={32}
          fontFamily={fonts.jakartaSemiBold}
          color={colors.textPrimary}
          lineHeight={45}
          marginTop={8}
          marginBottom={16}
        />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            <LinearGradient
              colors={['#0298EF', '#0178C4']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.learningTimeCard}>
              <CustomText
                label="screens.stats.totalLearningTime"
                fontSize={14}
                fontFamily={fonts.jakartaBold}
                color="#FFFFFF"
              />
              <View style={styles.timeRow}>
                <CustomText
                  label={learningHoursLabel}
                  fontSize={48}
                  fontFamily={fonts.jakartaExtraBold}
                  color="#FFFFFF"
                  lineHeight={56}
                  removeTranslation
                />
                <CustomText
                  label={learningMinutesLabel}
                  fontSize={22}
                  fontFamily={fonts.jakartaRegular}
                  color="#DAD7FFCC"
                  lineHeight={28}
                  marginLeft={8}
                  marginBottom={6}
                  removeTranslation
                />
              </View>
              <View style={styles.trendPill}>
                <Icons
                  family="Ionicons"
                  name={trendIcon}
                  size={14}
                  color="#FFFFFF"
                />
                <CustomText
                  label={trendLabel}
                  fontSize={12}
                  fontFamily={fonts.jakartaSemiBold}
                  color="#FFFFFF"
                  marginLeft={6}
                  removeTranslation={Boolean(learningTime?.change_label)}
                />
              </View>
            </LinearGradient>

            <CoursesCompletedCard count={coursesCompletedCount} />

            <WeeklyActivityChart
              data={weeklyActivity}
              highlightLabel={peakDay}
            />

            <View style={styles.quizCard}>
              <View style={styles.quizTextCol}>
                <CustomText
                  label="screens.stats.quizTitle"
                  fontSize={24}
                  fontFamily={fonts.jakartaBold}
                  color="#FFFFFF"
                  lineHeight={32}
                  width={150}
                />
                <CustomText
                  label="screens.stats.quizSubtitle"
                  fontSize={14}
                  fontFamily={fonts.jakartaRegular}
                  color="#FFFFFF"
                  lineHeight={20}
                  marginTop={6}
                  width={170}
                />
              </View>
              <TouchableOpacity
                style={styles.quizButton}
                activeOpacity={0.85}
                onPress={handleStartQuiz}>
                <CustomText
                  label="screens.stats.startNow"
                  fontSize={16}
                  fontFamily={fonts.jakartaBold}
                  color="#0298EF"
                  lineHeight={18}
                  textAlign="center"
                />
                <CustomText
                  label="screens.stats.now"
                  fontSize={14}
                  fontFamily={fonts.jakartaBold}
                  color="#0298EF"
                  lineHeight={16}
                  textAlign="center"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacer} />
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default StatsScreen;
