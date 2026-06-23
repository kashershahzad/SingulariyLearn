import {ActivityIndicator, StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from '../courseEnroll/header';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import StatusTabs from '../../../components/StatusTabs';
import SearchInput from '../../../components/SearchInput';
import Coursecard from './Coursecard';
import {Images} from '../../../assets/images';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {
  isBookmarkedFlag,
  toggleCourseBookmarkApi,
} from '../../../utils/courseBookmark';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const parseLocalized = (jsonStr, lang) => {
  try {
    const obj = JSON.parse(jsonStr || '{}');
    return obj[lang] || obj.en || '';
  } catch {
    return '';
  }
};

const hasTruthyFlag = value => value === true || value === 1 || value === '1';

const hasCourseAccess = course =>
  hasTruthyFlag(course?.user_has_access) ||
  hasTruthyFlag(course?.user_purchased);

const CourseEnrolled = ({navigation}) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        backgroundColor: c.screenBg,
        paddingHorizontal: 20,
        paddingBottom: 24,
      },
      loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        minHeight: 120,
      },
    }),
  );
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const tabs = useMemo(
    () => [
      t('screens.enrolledCourses.tabAll'),
      t('screens.enrolledCourses.tabCompleted'),
      t('screens.enrolledCourses.tabInProgress'),
    ],
    [t],
  );
  const [activeTab, setActiveTab] = useState(t('screens.enrolledCourses.tabAll'));
  const [search, setSearch] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [bookmarkLoadingId, setBookmarkLoadingId] = useState(null);

  useEffect(() => {
    if (!token) {
      setPurchases([]);
      setLoadingPurchases(false);
      return;
    }

    let cancelled = false;

    const fetchEnrolledCourses = async () => {
      setLoadingPurchases(true);
      try {
        const response = await ApiRequest({
          type: 'get_data',
          table_name: 'courses',
          for_user: '1',
          user_id: token,
          limit: '100',
        });
        if (cancelled) {
          return;
        }

        if (response?.status === 200) {
          setPurchases(response.data?.data ?? []);
        } else {
          setPurchases([]);
        }
      } catch {
        if (!cancelled) {
          setPurchases([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPurchases(false);
        }
      }
    };

    fetchEnrolledCourses();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const enrolledCourses = useMemo(() => {
    return purchases.filter(hasCourseAccess).map(course => {
      const title =
        parseLocalized(course.name, currentLanguage) ||
        t('screens.enrolledCourses.untitledCourse');
      const subtitle =
        parseLocalized(course.description, currentLanguage) ||
        t('screens.enrolledCourses.noDescription');
      const tag = parseLocalized(course.tag, currentLanguage);
      ('Unavailable');
      const progressPercent = Number(course.percentage) || 0;
      const totalLessons = Number(course.lessons) || 0;
      const completedLessons =
        totalLessons > 0
          ? Math.round((progressPercent / 100) * totalLessons)
          : 0;
      const isCompleted = progressPercent >= 100;

      return {
        id: String(course.id),
        image: course.cover
          ? {uri: String(course.cover)}
          : Images.enrolledcoursepic,
        tag,
        date: course.enrolled_at || t('screens.enrolledCourses.recentlyEnrolled'),
        title,
        instructor: course.instructor,
        completedLessons,
        totalLessons: course.total_lesson,
        isCompleted,
        isBookmarked: isBookmarkedFlag(course.is_bookmarked),
      };
    });
  }, [purchases, currentLanguage, t]);

  const handleToggleBookmark = async (courseId, isBookmarked) => {
    if (!token || bookmarkLoadingId) {
      return;
    }

    setBookmarkLoadingId(courseId);
    try {
      const response = await toggleCourseBookmarkApi({
        token,
        courseId,
        isBookmarked,
      });
      const apiData = response?.data;

      if (response?.status === 200 && apiData?.result !== false) {
        setPurchases(prev =>
          prev.map(course =>
            String(course.id) === String(courseId)
              ? {...course, is_bookmarked: isBookmarked ? 0 : 1}
              : course,
          ),
        );
        ToastMessage(
          isBookmarked
            ? apiData?.message || t('screens.enrolledCourses.bookmarkRemoved')
            : apiData?.message || t('screens.enrolledCourses.bookmarked'),
          'success',
        );
        return;
      }

      ToastMessage(
        apiData?.message || t('screens.enrolledCourses.bookmarkFailed'),
        'error',
      );
    } catch {
      ToastMessage(t('screens.enrolledCourses.bookmarkFailed'), 'error');
    } finally {
      setBookmarkLoadingId(null);
    }
  };

  // const courses = [
  //   {
  //     id: '1',
  //     image: Images.enrolledcoursepic,
  //     tag: 'SCIENCE & TECH',
  //     date: '2 days ago',
  //     title: 'Driving Permit',
  //     instructor: 'Dr. Aris Thorne',
  //     completedLessons: 12,
  //     totalLessons: 18,
  //     isCompleted: false,
  //   },
  //   {
  //     id: '2',
  //     image: Images.enrolledcoursepic,
  //     tag: 'CREATIVE ARTS',
  //     date: 'Oct 12, 2023',
  //     title: 'Adult Permit',
  //     instructor: 'Elena Rossi',
  //     completedLessons: 18,
  //     totalLessons: 18,
  //     isCompleted: true,
  //   },
  //   {
  //     id: '3',
  //     image: Images.enrolledcoursepic,
  //     tag: 'BUSINESS',
  //     date: 'Yesterday',
  //     title: 'Driving License',
  //     instructor: 'Marcus Vane',
  //     completedLessons: 1,
  //     totalLessons: 12,
  //     isCompleted: false,
  //   },
  // ];

  const filteredCourses = enrolledCourses.filter(course => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    if (activeTab === t('screens.enrolledCourses.tabCompleted')) {
      return matchesSearch && course.isCompleted;
    }

    if (activeTab === t('screens.enrolledCourses.tabInProgress')) {
      return matchesSearch && !course.isCompleted;
    }

    return matchesSearch;
  });

  return (
    <ScreenWrapper
      scrollEnabled
      headerUnScrollable={() => <Header title="screens.enrolledCourses.title" />}
      paddingHorizontal={0}>
      <View style={styles.container}>
        <CustomText
          label="screens.enrolledCourses.title"
          fontFamily={fonts.jakartaSemiBold}
          fontSize={32}
          color={colors.textPrimary}
          marginTop={20}
        />

        <CustomText
          label="screens.enrolledCourses.subtitle"
          fontFamily={fonts.jakartaRegular}
          fontSize={16}
          color={colors.textSecondary}
          marginTop={10}
        />

        <StatusTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />

        <SearchInput
          placeholder={t('screens.enrolledCourses.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          marginTop={20}
        />

        {loadingPurchases ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : filteredCourses.length === 0 ? (
          <CustomText
            label="screens.enrolledCourses.empty"
            fontFamily={fonts.jakartaRegular}
            fontSize={14}
            color={colors.textMuted}
            marginTop={24}
          />
        ) : (
          filteredCourses.map(course => (
            <Coursecard
              key={course.id}
              image={course.image}
              tag={course.tag}
              date={course.date}
              title={course.title}
              instructor={course.instructor}
              completedLessons={course.completedLessons}
              totalLessons={course.totalLessons}
              isCompleted={course.isCompleted}
              showBookmark
              isBookmarked={course.isBookmarked}
              bookmarkLoading={bookmarkLoadingId === course.id}
              onBookmarkPress={() =>
                handleToggleBookmark(course.id, course.isBookmarked)
              }
              onPress={() =>
                navigation.navigate('CourseDetails', {courseId: course.id})
              }
            />
          ))
        )}
      </View>
    </ScreenWrapper>
  );
};

export default CourseEnrolled;
