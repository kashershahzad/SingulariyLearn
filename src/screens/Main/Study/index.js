import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {Images} from '../../../assets/images';
import StudyModuleCard from './StudyModuleCard';
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

const hasTruthyFlag = value =>
  value === true || value === 1 || value === '1';

const hasCourseAccess = course =>
  hasTruthyFlag(course?.user_has_access) ||
  hasTruthyFlag(course?.user_purchased);

const STUDY_OPTIONS = [
  {value: 'Study', labelKey: 'screens.study.optionStudy'},
  {value: 'Practice Sets', labelKey: 'screens.study.optionPractice'},
  {value: 'Mock Test', labelKey: 'screens.study.optionMockTest'},
];

const Study = () => {
  const route = useRoute();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        padding: 20,
        backgroundColor: c.screenBg,
        flex: 1,
      },
      optionsContainer: {
        flexDirection: 'row',
        marginTop: 10,
      },
      optionItem: {
        backgroundColor: c.chipInactiveBg,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: c.chipInactiveBorder,
        marginRight: 5,
      },
      selectedOptionItem: {
        backgroundColor: c.accent,
        borderColor: c.accent,
      },
      loaderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        minHeight: 120,
      },
    }),
  );
  const [selectedOption, setSelectedOption] = useState('Study');
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const scrollViewRef = useRef(null);
  const scrollYRef = useRef(0);
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const optionValues = useMemo(
    () => STUDY_OPTIONS.map(option => option.value),
    [],
  );

  useEffect(() => {
    const nextOption = route.params?.selectedOption;
    if (nextOption && optionValues.includes(nextOption)) {
      setSelectedOption(nextOption);
    }
  }, [route.params?.selectedOption, optionValues]);

  useEffect(() => {
    if (!token) {
      setCourses([]);
      setLoadingCourses(false);
      return;
    }

    let cancelled = false;

    const fetchStudyModules = async () => {
      setLoadingCourses(true);
      try {
        const response = await ApiRequest({
          type: 'get_data',
          table_name: 'courses',
          for_user: '1',
          user_id: token,
          limit: '100',
        });
        console.log('response', response);

        if (cancelled) {
          return;
        }

        if (response?.status === 200) {
          setCourses(response.data?.data ?? []);
        } else {
          setCourses([]);
        }
      } catch {
        if (!cancelled) {
          setCourses([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCourses(false);
        }
      }
    };

    fetchStudyModules();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const studyModulesData = useMemo(() => {
    return courses
      .filter(hasCourseAccess)
      .map(course => {
        const title = parseLocalized(course.name, currentLanguage);
        const subtitle = parseLocalized(course.description, currentLanguage);
        const progressPercent = Number(course.percentage);
        const lessonCount = Number(course.total_lesson);
        return {
          id: String(course.id),
          icon: course.icon ? {uri: String(course.icon)} : Images.light,
          title,
          coursetitle: title,
          subtitle,
          progressPercent,
          user_has_access: course.user_has_access,
          user_purchased: course.user_purchased,
          price: course.price,
          cover: course.cover ? String(course.cover) : '',
          tag: parseLocalized(course.tag, currentLanguage),
          lessonCount: lessonCount,
          appleProductId: String(course.apple_product_id || '').trim(),
          googleProductId: String(course.google_product_id || '').trim(),
        };
      });
  }, [courses, currentLanguage]);
  // console.log('studyModulesData', studyModulesData);

  const handleScroll = useCallback(event => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const handleScrollCardIntoView = useCallback(cardRef => {
    const card = cardRef?.current;
    const scrollView = scrollViewRef?.current;
    if (!card || !scrollView) {
      return;
    }

    setTimeout(() => {
      card.measureInWindow((_x, cardY, _w, cardH) => {
        const windowHeight = Dimensions.get('window').height;
        const bottomPadding = 130;
        const cardBottom = cardY + cardH;
        const visibleBottom = windowHeight - bottomPadding;

        if (cardBottom > visibleBottom) {
          const delta = cardBottom - visibleBottom + 20;
          scrollView.scrollToPosition(0, scrollYRef.current + delta, true);
        }
      });
    }, 200);
  }, []);

  return (
    <ScreenWrapper
      scrollEnabled
      paddingHorizontal={0}
      scrollViewRef={scrollViewRef}
      onScroll={handleScroll}
      headerUnScrollable={() => <Header2 title="screens.study.header" />}>
      <View style={styles.container}>
        <CustomText
          fontSize={20}
          fontFamily={fonts.jakartaBold}
          color={colors.textPrimary}
          label="screens.study.title"
        />
        <CustomText
          fontSize={14}
          fontFamily={fonts.jakartaRegular}
          color={colors.textMuted}
          label="screens.study.subtitle"
        />
        <View style={styles.optionsContainer}>
          {STUDY_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionItem,
                selectedOption === option.value && styles.selectedOptionItem,
              ]}
              onPress={() => setSelectedOption(option.value)}>
              <CustomText
                fontSize={12}
                fontFamily={fonts.jakartaMedium}
                color={
                  selectedOption === option.value
                    ? colors.textOnAccent
                    : colors.chipInactiveText
                }
                label={option.labelKey}
              />
            </TouchableOpacity>
          ))}
        </View>
        {loadingCourses ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : studyModulesData.length === 0 ? (
          <CustomText
            fontSize={14}
            fontFamily={fonts.jakartaRegular}
            color={colors.textMuted}
            label="screens.study.noCourses"
            marginTop={24}
          />
        ) : (
          studyModulesData.map(module => (
            <StudyModuleCard
              key={module.id}
              data={module}
              courseTitle={module.coursetitle}
              token={token}
              currentLanguage={currentLanguage}
              selectedOption={selectedOption}
              onRequestScrollIntoView={handleScrollCardIntoView}
            />
          ))
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Study;
