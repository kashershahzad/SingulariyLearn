import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from '../courseEnroll/header';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import SearchInput from '../../../components/SearchInput';
import StatusTabs from '../../../components/StatusTabs';
import Icons from '../../../components/Icons';
import Coursecard from '../courseEnrolled/Coursecard';
import {Images} from '../../../assets/images';
import {ToastMessage} from '../../../utils/ToastMessage';
import {
  fetchBookmarksApi,
  getBookmarkItemType,
  getBookmarksRowsFromResponse,
  toggleCourseBookmarkApi,
  toggleLessonBookmarkApi,
  toggleQuestionBookmarkApi,
} from '../../../utils/courseBookmark';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const BOOKMARK_TABS = [
  {key: 'all', labelKey: 'screens.bookmarks.tabAll'},
  {key: 'courses', labelKey: 'screens.bookmarks.tabCourses'},
  {key: 'lessons', labelKey: 'screens.bookmarks.tabLessons'},
  {key: 'questions', labelKey: 'screens.bookmarks.tabQuestions'},
];

const useBookmarkStyles = () =>
  useThemedStyles(c =>
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
      itemCard: {
        backgroundColor: c.card,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: c.border,
      },
      itemTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
      },
      lessonIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: c.accentBg,
        borderWidth: 1,
        borderColor: c.accent,
        alignItems: 'center',
        justifyContent: 'center',
      },
      questionIconWrap: {
        backgroundColor: c.cardMuted,
        borderColor: c.border,
      },
      itemTextCol: {
        flex: 1,
      },
      bookmarkIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: c.border,
        alignItems: 'center',
        justifyContent: 'center',
      },
      bookmarkIconBtnDisabled: {
        opacity: 0.5,
      },
    }),
  );

const TAB_TO_API_TYPE = {
  courses: 'course',
  lessons: 'lesson',
  questions: 'question',
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

const formatBookmarkDate = (dateStr, recentlyBookmarkedLabel) => {
  if (!dateStr) {
    return recentlyBookmarkedLabel;
  }

  const date = new Date(String(dateStr).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const parseQuestionText = (questionField, lang, questionLabel) => {
  if (!questionField) {
    return questionLabel;
  }

  if (typeof questionField === 'string') {
    try {
      const parsed = JSON.parse(questionField);
      return (
        parseLocalized(parsed[lang]?.question, lang) ||
        parseLocalized(parsed.en?.question, lang) ||
        parseLocalized(parsed.ur?.question, lang) ||
        parseLocalized(parsed, lang) ||
        questionField
      );
    } catch {
      return questionField;
    }
  }

  return (
    parseLocalized(questionField[lang]?.question, lang) ||
    parseLocalized(questionField.en?.question, lang) ||
    parseLocalized(questionField, lang) ||
    questionLabel
  );
};

const BookmarkIconButton = ({loading, onPress}) => {
  const styles = useBookmarkStyles();
  const {colors} = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={loading}
      onPress={onPress}
      style={[styles.bookmarkIconBtn, loading && styles.bookmarkIconBtnDisabled]}>
      <Icons family="Ionicons" name="bookmark" size={22} color={colors.accent} />
    </TouchableOpacity>
  );
};

const LessonBookmarkCard = ({
  item,
  loading,
  onPress,
  onRemoveBookmark,
}) => {
  const styles = useBookmarkStyles();
  const {colors} = useTheme();
  return (
  <TouchableOpacity
    activeOpacity={0.9}
    style={styles.itemCard}
    onPress={onPress}>
    <View style={styles.itemTopRow}>
      <View style={styles.lessonIconWrap}>
        <Icons family="Ionicons" name="book-outline" size={20} color={colors.accent} />
      </View>
      <View style={styles.itemTextCol}>
        <CustomText
          label={item.title}
          fontSize={17}
          fontFamily={fonts.jakartaSemiBold}
          color={colors.textPrimary}
          lineHeight={22}
          removeTranslation
        />
        <CustomText
          label={item.courseTitle}
          fontSize={13}
          fontFamily={fonts.jakartaRegular}
          color={colors.textSecondary}
          marginTop={4}
          removeTranslation
        />
        {!!item.shortDesc && (
          <CustomText
            label={item.shortDesc}
            fontSize={12}
            fontFamily={fonts.jakartaRegular}
            color={colors.textMuted}
            marginTop={4}
            numberOfLines={2}
            removeTranslation
          />
        )}
      </View>
      <BookmarkIconButton loading={loading} onPress={onRemoveBookmark} />
    </View>
    <CustomText
      label={item.date}
      fontSize={12}
      fontFamily={fonts.jakartaRegular}
      color={colors.textMuted}
      alignSelf="flex-end"
      marginTop={8}
      removeTranslation
    />
  </TouchableOpacity>
  );
};

const QuestionBookmarkCard = ({
  item,
  loading,
  onPress,
  onRemoveBookmark,
}) => {
  const styles = useBookmarkStyles();
  const {colors} = useTheme();
  return (
  <TouchableOpacity
    activeOpacity={0.9}
    style={styles.itemCard}
    onPress={onPress}>
    <View style={styles.itemTopRow}>
      <View style={[styles.lessonIconWrap, styles.questionIconWrap]}>
        <Icons
          family="Ionicons"
          name="help-circle-outline"
          size={22}
          color={colors.accent}
        />
      </View>
      <View style={styles.itemTextCol}>
        <CustomText
          label={item.title}
          fontSize={15}
          fontFamily={fonts.jakartaSemiBold}
          color={colors.textPrimary}
          lineHeight={22}
          numberOfLines={3}
          removeTranslation
        />
        <CustomText
          label={item.meta}
          fontSize={12}
          fontFamily={fonts.jakartaRegular}
          color={colors.textSecondary}
          marginTop={6}
          removeTranslation
        />
      </View>
      <BookmarkIconButton loading={loading} onPress={onRemoveBookmark} />
    </View>
    <CustomText
      label={item.date}
      fontSize={12}
      fontFamily={fonts.jakartaRegular}
      color={colors.textMuted}
      alignSelf="flex-end"
      marginTop={8}
      removeTranslation
    />
  </TouchableOpacity>
  );
};

const Bookmarks = ({navigation}) => {
  const styles = useBookmarkStyles();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const isFocused = useIsFocused();
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [rawBookmarks, setRawBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingKey, setActionLoadingKey] = useState(null);

  const tabs = useMemo(
    () =>
      BOOKMARK_TABS.map(tab => ({
        key: tab.key,
        label: t(tab.labelKey),
      })),
    [t],
  );

  const activeTabLabel = useMemo(
    () => tabs.find(tab => tab.key === activeTab)?.label || tabs[0]?.label || '',
    [activeTab, tabs],
  );

  useEffect(() => {
    if (!token) {
      setRawBookmarks([]);
      setLoading(false);
      return;
    }

    if (!isFocused) {
      return;
    }

    let cancelled = false;

    const loadBookmarks = async () => {
      setLoading(true);
      try {
        const response = await fetchBookmarksApi({
          token,
          bookmarkType: TAB_TO_API_TYPE[activeTab] || undefined,
        });

        console.log('response', response);

        if (cancelled) {
          return;
        }

        if (response?.status === 200) {
          setRawBookmarks(getBookmarksRowsFromResponse(response));
        } else {
          setRawBookmarks([]);
        }
      } catch {
        if (!cancelled) {
          setRawBookmarks([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBookmarks();

    return () => {
      cancelled = true;
    };
  }, [token, isFocused, activeTab]);

  const mappedBookmarks = useMemo(() => {
    return rawBookmarks.map(item => {
      const type = getBookmarkItemType(item);
      const course = item.course || {};
      const lesson = item.lesson || {};
      const question = item.question || item;

      if (type === 'lesson') {
        return {
          type,
          bookmarkId: String(item.id ?? `${item.lesson_id}-${item.course_id}`),
          lessonId: String(item.lesson_id ?? lesson.id ?? ''),
          courseId: String(item.course_id ?? course.id ?? ''),
          title:
            parseLocalized(lesson.name ?? item.name, currentLanguage) ||
            t('screens.bookmarks.untitledLesson'),
          courseTitle:
            parseLocalized(course.name ?? item.course_name, currentLanguage) ||
            t('screens.bookmarks.course'),
          shortDesc: parseLocalized(
            lesson.short_desc ?? item.short_desc,
            currentLanguage,
          ),
          date: formatBookmarkDate(
            item.created_at,
            t('screens.bookmarks.recentlyBookmarked'),
          ),
        };
      }

      if (type === 'question') {
        const courseTitle =
          parseLocalized(course.name ?? item.course_name, currentLanguage) ||
          t('screens.bookmarks.course');
        const lessonTitle =
          parseLocalized(lesson.name ?? item.lesson_name, currentLanguage) ||
          '';
        const meta = lessonTitle
          ? `${courseTitle} · ${lessonTitle}`
          : courseTitle;

        return {
          type,
          bookmarkId: String(item.id ?? item.question_id ?? ''),
          questionId: String(item.question_id ?? question.id ?? ''),
          courseId: String(item.course_id ?? course.id ?? '0'),
          lessonId: String(item.lesson_id ?? lesson.id ?? ''),
          title: parseQuestionText(
            question.question ?? item.question,
            currentLanguage,
            t('screens.bookmarks.question'),
          ),
          meta,
          date: formatBookmarkDate(
            item.created_at,
            t('screens.bookmarks.recentlyBookmarked'),
          ),
          rawItem: item,
        };
      }

      const progressPercent = Number(course.percentage ?? item.percentage) || 0;
      const totalLessons =
        Number(course.lessons ?? course.total_lesson ?? item.total_lesson) || 0;
      const completedLessons =
        totalLessons > 0
          ? Math.round((progressPercent / 100) * totalLessons)
          : 0;

      return {
        type: 'course',
        bookmarkId: String(item.id ?? item.course_id ?? ''),
        courseId: String(item.course_id ?? course.id ?? ''),
        image: course.cover
          ? {uri: String(course.cover)}
          : Images.enrolledcoursepic,
        tag: parseLocalized(course.tag ?? item.tag, currentLanguage),
        date:
          formatBookmarkDate(
            item.created_at,
            t('screens.bookmarks.recentlyBookmarked'),
          ) ||
          course.enrolled_at ||
          t('screens.bookmarks.recentlyBookmarked'),
        title:
          parseLocalized(course.name ?? item.course_name, currentLanguage) ||
          t('screens.bookmarks.untitledCourse'),
        instructor: course.instructor || item.instructor || '—',
        completedLessons,
        totalLessons: course.total_lesson || totalLessons,
        isCompleted: progressPercent >= 100,
      };
    });
  }, [rawBookmarks, currentLanguage, t]);

  const filteredByTab = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matchesSearch = item => {
      if (!query) {
        return true;
      }

      const haystack = [
        item.title,
        item.courseTitle,
        item.meta,
        item.tag,
        item.instructor,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    };

    if (activeTab === 'all') {
      return {
        courses: mappedBookmarks.filter(
          item => item.type === 'course' && matchesSearch(item),
        ),
        lessons: mappedBookmarks.filter(
          item => item.type === 'lesson' && matchesSearch(item),
        ),
        questions: mappedBookmarks.filter(
          item => item.type === 'question' && matchesSearch(item),
        ),
      };
    }

    if (activeTab === 'courses') {
      return {
        courses: mappedBookmarks.filter(matchesSearch),
        lessons: [],
        questions: [],
      };
    }

    if (activeTab === 'lessons') {
      return {
        courses: [],
        lessons: mappedBookmarks.filter(matchesSearch),
        questions: [],
      };
    }

    return {
      courses: [],
      lessons: [],
      questions: mappedBookmarks.filter(matchesSearch),
    };
  }, [mappedBookmarks, activeTab, search]);

  const isEmpty =
    !loading &&
    filteredByTab.courses.length === 0 &&
    filteredByTab.lessons.length === 0 &&
    filteredByTab.questions.length === 0;

  const emptyLabel =
    activeTab === 'all'
      ? t('screens.bookmarks.emptyAll')
      : t('screens.bookmarks.emptyTab', {
          tab: activeTabLabel.toLowerCase(),
        });

  const handleRemoveBookmark = useCallback(
    async item => {
      if (!token || actionLoadingKey) {
        return;
      }

      const loadingKey = `${item.type}-${item.bookmarkId}`;
      setActionLoadingKey(loadingKey);

      try {
        let response;

        if (item.type === 'course') {
          response = await toggleCourseBookmarkApi({
            token,
            courseId: item.courseId,
            isBookmarked: true,
          });
        } else if (item.type === 'lesson') {
          response = await toggleLessonBookmarkApi({
            token,
            courseId: item.courseId,
            lessonId: item.lessonId,
            isBookmarked: true,
          });
        } else {
          response = await toggleQuestionBookmarkApi({
            token,
            courseId: item.courseId,
            questionId: item.questionId,
            isBookmarked: true,
          });
        }

        const apiData = response?.data;

        if (response?.status === 200 && apiData?.result !== false) {
          setRawBookmarks(prev =>
            prev.filter(row => {
              const rowType = getBookmarkItemType(row);

              if (rowType !== item.type) {
                return true;
              }

              if (item.type === 'course') {
                return (
                  String(row.course_id ?? row.course?.id) !==
                  String(item.courseId)
                );
              }

              if (item.type === 'lesson') {
                return String(row.lesson_id ?? row.lesson?.id) !== item.lessonId;
              }

              return (
                String(row.question_id ?? row.question?.id) !== item.questionId
              );
            }),
          );
          ToastMessage(apiData?.message || t('screens.bookmarks.removed'), 'success');
          return;
        }

        ToastMessage(
          apiData?.message || t('screens.bookmarks.removeFailed'),
          'error',
        );
      } catch {
        ToastMessage(t('screens.bookmarks.removeFailed'), 'error');
      } finally {
        setActionLoadingKey(null);
      }
    },
    [token, actionLoadingKey, t],
  );

  const renderSectionTitle = label => (
    <CustomText
      label={label}
      fontFamily={fonts.jakartaSemiBold}
      fontSize={18}
      color={colors.textPrimary}
      marginTop={20}
      marginBottom={4}
      removeTranslation
    />
  );

  const renderCourse = course => (
    <Coursecard
      key={`course-${course.bookmarkId}`}
      image={course.image}
      tag={course.tag}
      date={course.date}
      title={course.title}
      instructor={course.instructor}
      completedLessons={course.completedLessons}
      totalLessons={course.totalLessons}
      isCompleted={course.isCompleted}
      showBookmark
      isBookmarked
      bookmarkLoading={actionLoadingKey === `course-${course.bookmarkId}`}
      onBookmarkPress={() => handleRemoveBookmark(course)}
      onPress={() =>
        navigation.navigate('CourseDetails', {courseId: course.courseId})
      }
    />
  );

  const renderLesson = lesson => (
    <LessonBookmarkCard
      key={`lesson-${lesson.bookmarkId}`}
      item={lesson}
      loading={actionLoadingKey === `lesson-${lesson.bookmarkId}`}
      onRemoveBookmark={() => handleRemoveBookmark(lesson)}
      onPress={() =>
        navigation.navigate('CourseDetialNew', {
          courseId: lesson.courseId,
          course_id: lesson.courseId,
          lessonId: lesson.lessonId,
          lesson_id: lesson.lessonId,
          coursetitle: lesson.courseTitle,
        })
      }
    />
  );

  const renderQuestion = question => (
    <QuestionBookmarkCard
      key={`question-${question.bookmarkId}`}
      item={question}
      loading={actionLoadingKey === `question-${question.bookmarkId}`}
      onRemoveBookmark={() => handleRemoveBookmark(question)}
      onPress={() =>
        navigation.navigate('TestformNew', {
          bookmarkReview: true,
          questionId: question.questionId,
          course_id: question.courseId,
          courseId: question.courseId,
          lessonId: question.lessonId || undefined,
          lessonName: t('screens.bookmarks.bookmarkedQuestion'),
          bookmarkQuestion: question.rawItem,
        })
      }
    />
  );

  return (
    <ScreenWrapper
      scrollEnabled
      headerUnScrollable={() => <Header title="screens.bookmarks.header" />}
      paddingHorizontal={0}>
      <View style={styles.container}>
        {/* <CustomText
          label="Bookmarks"
          fontFamily={fonts.jakartaSemiBold}
          fontSize={32}
          color={colors.textPrimary}
          marginTop={20}
          removeTranslation
        />

        <CustomText
          label="Your saved courses, lessons, and questions in one place."
          fontFamily={fonts.jakartaRegular}
          fontSize={16}
          color="#464555"
          marginTop={10}
        /> */}

        <StatusTabs
          tabs={tabs.map(tab => tab.label)}
          activeTab={activeTabLabel}
          onTabPress={label => {
            const next = tabs.find(tab => tab.label === label)?.key || 'all';
            setActiveTab(next);
          }}
        />

        {/* <SearchInput
          placeholder="Find a bookmark..."
          value={search}
          onChangeText={setSearch}
          marginTop={20}
        /> */}

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : isEmpty ? (
          <CustomText
            label={emptyLabel}
            fontFamily={fonts.jakartaRegular}
            fontSize={14}
            color={colors.textMuted}
            marginTop={24}
          />
        ) : (
          <>
            {filteredByTab.courses.length > 0 && (
              <>
                {activeTab === 'all' &&
                  renderSectionTitle(t('screens.bookmarks.tabCourses'))}
                {filteredByTab.courses.map(renderCourse)}
              </>
            )}

            {filteredByTab.lessons.length > 0 && (
              <>
                {activeTab === 'all' &&
                  renderSectionTitle(t('screens.bookmarks.tabLessons'))}
                {filteredByTab.lessons.map(renderLesson)}
              </>
            )}

            {filteredByTab.questions.length > 0 && (
              <>
                {activeTab === 'all' &&
                  renderSectionTitle(t('screens.bookmarks.tabQuestions'))}
                {filteredByTab.questions.map(renderQuestion)}
              </>
            )}
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Bookmarks;
