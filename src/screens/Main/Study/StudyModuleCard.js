import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {COLORS} from '../../../utils/COLORS';
import {Images} from '../../../assets/images';
import {ApiRequest} from '../../../services/ApiRequest';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

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

const hasCourseAccess = data => {
  const hasAccess =
    data?.user_has_access === true
  const isPurchased =
    data?.user_purchased === true 

  return hasAccess || isPurchased;
};

const hasTruthyFlag = value =>
  value === true || value === 1 || value === '1';

const isLessonItemCompleted = item =>
  hasTruthyFlag(item?.is_completed) ||
  hasTruthyFlag(item?.lesson_completed) ||
  hasTruthyFlag(item?.lesson_marked_complete) ||
  Number(item?.percentage ?? item?.progress_percent) >= 100;

const PRACTICE_SETS_OPTION = 'Practice Sets';
const MOCK_TEST_OPTION = 'Mock Test';

const StudyModuleCard = ({
  data,
  token,
  currentLanguage,
  courseTitle,
  selectedOption = 'Study',
}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      moduleCard: {
        marginTop: 14,
        backgroundColor: c.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        padding: 12,
      },
      lockedModuleCard: {
        backgroundColor: c.cardMuted,
      },
      moduleHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
      },
      moduleHeaderContent: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
      },
      moduleTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 3,
      },
      moduleTitleText: {
        flex: 1,
        flexShrink: 1,
        marginRight: 6,
      },
      moduleHeaderIcon: {
        width: 24,
        marginTop: 1,
        height: 24,
      },
      lockIcon: {
        width: 18,
        height: 18,
        flexShrink: 0,
        marginTop: 2,
      },
      arrowIcon: {
        width: 24,
        height: 24,
        marginTop: 6,
      },
      arrowIconExpanded: {
        transform: [{rotate: '180deg'}],
      },
      lessonProgressTrack: {
        marginTop: 10,
        height: 10,
        borderRadius: 999,
        backgroundColor: c.progressTrack,
        overflow: 'hidden',
      },
      lessonProgressFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: c.progressFill,
      },
      lessonMetaRow: {
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
      },
      lessonMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
      },
      lessonMetaIcon: {
        width: 10,
        height: 10,
        marginRight: 4,
      },
      divider: {
        height: 1,
        backgroundColor: c.divider,
        marginVertical: 12,
      },
      expandedSection: {
        overflow: 'hidden',
      },
      expandedHidden: {
        height: 0,
        opacity: 0,
        marginTop: 0,
      },
      lessonListContainer: {
        marginTop: 5,
      },
      lessonItem: {
        backgroundColor: c.lessonItemBg,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
      },
      lessonLeftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      statusIcon: {
        width: 18,
        height: 18,
        marginLeft: 8,
      },
      loader: {
        marginTop: 12,
      },
      bookContainer: {
        backgroundColor: c.accentBg,
        padding: 5,
        borderRadius: 8,
        height: 27,
        width: 27,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: c.accent,
      },
    }),
  );
  const userData = useSelector(state => state.users.userData);
  const defaultPermitId = userData?.purchase?.[0]?.permit?.id || '1';
  const [isExpanded, setIsExpanded] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const isCourseUnlocked = hasCourseAccess(data);
  // console.log('data', data);
  useEffect(() => {
    setIsExpanded(false);
    setLessons([]);
    setLoadingLessons(false);
  }, [data.id, selectedOption]);

  const isMockTestMode = selectedOption === MOCK_TEST_OPTION;

  const lessonCount = lessons.length > 0 ? lessons.length : data.lessonCount;
  const lessonsCountLabel = t('screens.study.lessonsCount', {
    count: String(lessonCount || 0).padStart(2, '0'),
  });

  const fetchLessons = useCallback(async () => {
    if (!token || !data.id) {
      return;
    }

    setLoadingLessons(true);
    try {
      const response = await ApiRequest({
        type: 'get_data',
        table_name: 'lesson',
        course_id: data.id,
        user_id: token,
        limit: '100',
      });
      console.log('course_id', data.id);
      console.log('response', response);

      if (response?.status !== 200) {
        setLessons([]);
        return;
      }
      console.log('response', response);

      const rawData = response.data?.data ?? [];
      console.log('rawData', rawData);
      setLessons(
        rawData.map(item => ({
          id: String(item.id),
          title: parseLocalized(item.name, currentLanguage),
          short_desc: parseLocalized(item.short_desc, currentLanguage),
          description: parseLocalized(item.description, currentLanguage),
          completed: isLessonItemCompleted(item),
        })),
      );
    } catch {
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  }, [token, data.id, currentLanguage]);

  const navigateToMockTest = () => {
    navigation.navigate('TestformNew', {
      course_id: data.id,
      courseId: data.id,
      permit_id: defaultPermitId,
      is_mockup: 1,
      lessonName: data.title,
    });
  };

  const handleHeaderPress = () => {
    if (!isCourseUnlocked) {
      navigation.navigate('CourseEnroll', {
        courseId: data.id,
        course_id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        price: data.price,
        cover: data.cover,
        tag: data.tag,
        lessonCount: data.lessonCount,
        apple_product_id: data.appleProductId,
        google_product_id: data.googleProductId,
      });
      return;
    }

    if (isMockTestMode) {
      navigateToMockTest();
      return;
    }

    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);

    if (nextExpanded && lessons.length === 0 && !loadingLessons) {
      fetchLessons();
    }
  };

  const handleLessonPress = lesson => {
    if (selectedOption === PRACTICE_SETS_OPTION) {
      navigation.navigate('TestformNew', {
        lessonId: lesson.id,
        lessonName: lesson.title,
        course_id: data.id,
        courseId: data.id,
        permit_id: defaultPermitId,
      });
      return;
    }

    navigation.navigate('CourseDetialNew', {
      courseId: data.id,
      course_id: data.id,
      lessonId: lesson.id,
      lesson_id: lesson.id,
      coursetitle: courseTitle,
      lessonName: lesson.title,
      studyMode: selectedOption,
    });
  };

  return (
    <View
      style={[
        styles.moduleCard,
        !isCourseUnlocked && styles.lockedModuleCard,
      ]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleHeaderPress}
        style={styles.moduleHeader}>
        <View style={styles.bookContainer}>
          <Image
            source={data.icon}
            style={styles.moduleHeaderIcon}
            resizeMode="contain"
          />
        </View>
        <View style={styles.moduleHeaderContent}>
          <View style={styles.moduleTitleRow}>
            <CustomText
              fontSize={17}
              fontFamily={fonts.jakartaBold}
              color={colors.textPrimary}
              label={data.title}
              marginTop={-3}
              numberOfLines={2}
              containerStyle={styles.moduleTitleText}
            />
            <Image
              source={isCourseUnlocked ? Images.unlock : Images.lock}
              style={styles.lockIcon}
              resizeMode="contain"
            />
          </View>
          <CustomText
            fontSize={11}
            fontFamily={fonts.jakartaRegular}
            color={colors.textMuted}
            label={data.subtitle}
            lineHeight={13}
          />
          <View style={styles.lessonProgressTrack}>
            <View
              style={[
                styles.lessonProgressFill,
                {width: `${data.progressPercent}%`},
              ]}
            />
          </View>
          <View style={styles.lessonMetaRow}>
            <View style={styles.lessonMetaItem}>
              <Image
                source={Images.lesson2}
                style={styles.lessonMetaIcon}
                resizeMode="contain"
              />
              <CustomText
                label={lessonsCountLabel}
                removeTranslation
                fontSize={8}
                fontFamily={fonts.jakartaMedium}
                color={colors.textPrimary}
              />
            </View>
            {/* <View style={styles.lessonMetaItem}>
              <Image
                source={Images.time2}
                style={styles.lessonMetaIcon}
                resizeMode="contain"
              />
              <CustomText
                label={data.duration}
                removeTranslation
                fontSize={8}
                fontFamily={fonts.jakartaMedium}
                color={colors.textPrimary}
              />
            </View> */}
          </View>
        </View>
        {/* {!isMockTestMode ? (
          <Image
            source={Images.arrowdown}
            style={[
              styles.arrowIcon,
              isExpanded && styles.arrowIconExpanded,
            ]}
            resizeMode="contain"
          />
        ) : null} */}
      </TouchableOpacity>

      {!isMockTestMode ? (
      <View
        style={[styles.expandedSection, !isExpanded && styles.expandedHidden]}
        pointerEvents={isExpanded ? 'auto' : 'none'}>
        <View style={styles.divider} />

        <CustomText
          fontSize={10}
          fontFamily={fonts.jakartaMedium}
          color={colors.textPrimary}
          label={lessonsCountLabel}
          removeTranslation
        />

        {loadingLessons ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : lessons.length === 0 ? (
          <CustomText
            fontSize={12}
            fontFamily={fonts.jakartaRegular}
            color={colors.textMuted}
            label="screens.study.noLessons"
            marginTop={8}
          />
        ) : (
          <View style={styles.lessonListContainer}>
            {lessons.map(lesson => (
              <TouchableOpacity
                key={`${data.id}-lesson-${lesson.id}`}
                style={styles.lessonItem}
                onPress={() => handleLessonPress(lesson)}>
                <View style={styles.lessonLeftContent}>
                  <View style={styles.bookContainer}>
                    <Image
                      source={data.icon}
                      style={styles.moduleHeaderIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <CustomText
                    fontSize={12}
                    fontFamily={fonts.jakartaSemiBold}
                    color={colors.textPrimary}
                    label={lesson.title}
                    marginLeft={8}
                    removeTranslation
                  />
                </View>
                {lesson.completed ? (
                  <Image
                    source={Images.marked}
                    style={styles.statusIcon}
                    resizeMode="contain"
                  />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      ) : null}
    </View>
  );
};

export default StudyModuleCard;
