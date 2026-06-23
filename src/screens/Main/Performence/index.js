import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import ProgressOverTimeChart from './ProgressOverTimeChart';
import TopicAccuracyCard, {WeakAreasEmpty} from '../Result/TopicAccuracyCard';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';
import {ApiRequest} from '../../../services/ApiRequest';

const READINESS_TAGS = [
  {id: 'accuracy', titleKey: 'screens.performance.accuracy'},
  {id: 'consistency', titleKey: 'screens.performance.consistency'},
  {id: 'speed', titleKey: 'screens.performance.speed'},
];

const Performence = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const token = useSelector(state => state.authConfig.token);
  const [weakAreas, setWeakAreas] = useState([]);
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      outer: {
        flex: 1,
        backgroundColor: c.screenBg,
        paddingHorizontal: 20,
      },
      improveWeakAreasContainer: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: c.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.border,
        marginTop: 20,
      },
      actionButtonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        marginTop: 16,
      },
      actionBadge: {
        height: 38,
        width: 74,
        backgroundColor: c.accentBg,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: c.accent,
        justifyContent: 'center',
        alignItems: 'center',
      },
      actionBadgeSpacing: {
        marginRight: 8,
      },
      progressSection: {
        width: '100%',
        marginTop: 24,
        alignSelf: 'stretch',
      },
      weakAreasList: {
        paddingBottom: 24,
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

  const {course_id, courseId} = route.params || {};
  const activeCourseId = course_id || courseId || '1';

  useEffect(() => {
    if (!token) {
      setWeakAreas([]);
      return;
    }

    const fetchWeakAreas = async () => {
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

    fetchWeakAreas();
  }, [token, activeCourseId]);

  return (
    <ScreenWrapper
      scrollEnabled
      paddingHorizontal={0}
      // footerUnScrollable={() => (
      //   <View style={styles.footerContainer}>
      //     <TouchableOpacity
      //       activeOpacity={0.8}
      //       onPress={() => navigation.navigate('Study')}>
      //       <LinearGradient
      //         colors={['#0298EF', '#015789']}
      //         start={{x: 0.5, y: 0}}
      //         end={{x: 0.5, y: 1}}
      //         style={styles.footerGradientButton}>
      //         <CustomText
      //           label="screens.performance.improveWeakAreas"
      //           fontSize={20}
      //           fontFamily={fonts.jakartaMedium}
      //           color="#FFFFFF"
      //           lineHeight={30}
      //         />
      //       </LinearGradient>
      //     </TouchableOpacity>
      //   </View>
      // )}
      headerUnScrollable={() => <Header2 title="screens.performance.header" />}>
      <View style={styles.outer}>
        <View style={styles.improveWeakAreasContainer}>
          <CustomText
            label="screens.performance.examReadinessScore"
            fontSize={20}
            fontFamily={fonts.jakartaBold}
            color={colors.textPrimary}
          />
          <CustomText
            label="screens.performance.readinessDescription"
            fontSize={13}
            fontFamily={fonts.regular}
            color={colors.textMuted}
            lineHeight={20}
            marginTop={8}
          />
          <View style={styles.actionButtonsRow}>
            {READINESS_TAGS.map(item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={[styles.actionBadge, styles.actionBadgeSpacing]}>
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
        </View>

        <View style={styles.progressSection}>
          <CustomText
            label="screens.performance.progressOverTime"
            fontSize={20}
            fontFamily={fonts.jakartaBold}
            color={colors.textPrimary}
            marginBottom={10}
          />
          {/* <ProgressOverTimeChart /> */}
        </View>

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
      </View>
    </ScreenWrapper>
  );
};

export default Performence;
