import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from './header';
import VideoPlayer from '../../../components/VideoPlayer';
import CustomText from '../../../components/CustomText';
import CustomButton from '../../../components/CustomButton';
import fonts from '../../../assets/fonts';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import Icons from '../../../components/Icons';
import {ApiRequest} from '../../../services/ApiRequest';

const COURSE_META_CHIPS = [
  {id: 'duration', source: Images.duration, label: '12.5 Hours'},
  {id: 'level', source: Images.level, label: 'Advanced Level'},
  {id: 'language', source: Images.language, label: 'English'},
];

const MASTER_ITEMS = [
  {
    id: 'master-1',
    label: 'Non-linear narrative sequencing and visual pacing',
  },
  {
    id: 'master-2',
    label: 'Advanced color grading as a psychological tool',
  },
  {
    id: 'master-3',
    label: 'Dynamic blocking and lens selection strategies',
  },
];

const LESSON_ACTIONS = [
  {id: 'study', label: 'screens.courseEnroll.study'},
  {id: 'practice', label: 'screens.courseEnroll.practice'},
  {id: 'mockup', label: 'screens.courseEnroll.mockup'},
];

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

const hasCourseAccess = course =>
  course?.user_has_access === true ||
  course?.user_has_access === 1 ||
  course?.user_has_access === '1' ||
  course?.user_purchased === true ||
  course?.user_purchased === 1 ||
  course?.user_purchased === '1';

const CourseEnroll = () => {
  const {t} = useTranslation();
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const userData = useSelector(state => state.users.userData);
  const defaultPermitId = userData?.purchase?.[0]?.permit?.id || '1';

  const {
    courseId,
    course_id,
    title,
    subtitle,
    price,
    tag,
    cover,
    lessonCount,
    apple_product_id,
    appleProductId: routeAppleProductId,
    google_product_id,
    googleProductId: routeGoogleProductId,
  } = route.params ?? {};

  const activeCourseId = course_id || courseId;
  const [appleProductId, setAppleProductId] = useState(
    String(apple_product_id || routeAppleProductId || '').trim(),
  );
  const [googleProductId, setGoogleProductId] = useState(
    String(google_product_id || routeGoogleProductId || '').trim(),
  );
  const formattedPrice =
    price !== undefined && price !== null && price !== ''
      ? `$${Number(price).toFixed(2)}`
      : null;

  const fetchLessons = useCallback(async () => {
    if (!activeCourseId) {
      setLessons([]);
      setHasAccess(false);
      return;
    }

    setLoadingLessons(true);
    try {
      const lessonRequest = {
        type: 'get_data',
        table_name: 'lesson',
        course_id: activeCourseId,
        limit: '100',
      };

      if (token) {
        lessonRequest.user_id = token;
      }

      const requests = [ApiRequest(lessonRequest)];

      if (token) {
        requests.push(
          ApiRequest({
            type: 'get_data',
            table_name: 'courses',
            for_user: '1',
            user_id: token,
            limit: '100',
          }),
        );
      }

      const [lessonsResponse, coursesResponse] = await Promise.all(requests);

      let userHasAccess = false;

      if (coursesResponse) {
        const courseRow = (coursesResponse?.data?.data ?? []).find(
          item => String(item.id) === String(activeCourseId),
        );
        userHasAccess = hasCourseAccess(courseRow);
        setHasAccess(userHasAccess);
        if (courseRow) {
          setAppleProductId(String(courseRow.apple_product_id || '').trim());
          setGoogleProductId(String(courseRow.google_product_id || '').trim());
        }
      } else {
        setHasAccess(false);
      }

      if (lessonsResponse?.status === 200) {
        const rawLessons = lessonsResponse.data?.data ?? [];
        const mappedLessons = rawLessons.map(item => ({
          id: String(item.id),
          title: parseLocalized(item.name, currentLanguage),
          subtitle: parseLocalized(item.short_desc, currentLanguage),
        }));
        setLessons(mappedLessons);
        if (mappedLessons.length > 0 && !userHasAccess) {
          setExpandedLessonId(mappedLessons[0].id);
        } else {
          setExpandedLessonId(null);
        }
      } else {
        setLessons([]);
      }
    } catch {
      setLessons([]);
      setHasAccess(false);
    } finally {
      setLoadingLessons(false);
    }
  }, [token, activeCourseId, currentLanguage]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const displayLessonCount = lessons.length || lessonCount || 0;

  const handleEnrollPress = () => {
    if (!token) {
      navigation.navigate('NewLogin');
      return;
    }

    navigation.navigate('CourseCheckout', {
      courseId: activeCourseId,
      course_id: activeCourseId,
      title,
      subtitle,
      price,
      cover,
      tag,
      lessonCount: displayLessonCount,
      apple_product_id: appleProductId,
      google_product_id: googleProductId,
    });
  };

  const handleToggleLesson = lessonId => {
    setExpandedLessonId(prev => (prev === lessonId ? null : lessonId));
  };

  const openLesson = lesson => {
    navigation.navigate('CourseDetialNew', {
      courseId: activeCourseId,
      course_id: activeCourseId,
      lessonId: lesson.id,
      lesson_id: lesson.id,
      coursetitle: title,
      lessonName: lesson.title,
    });
  };

  const handleLessonPress = lesson => {
    if (hasAccess) {
      openLesson(lesson);
      return;
    }

    handleToggleLesson(lesson.id);
  };

  const handleLessonAction = (lesson, actionId) => {
    if (!hasAccess) {
      handleEnrollPress();
      return;
    }

    if (actionId === 'study') {
      navigation.navigate('CourseDetialNew', {
        courseId: activeCourseId,
        course_id: activeCourseId,
        lessonId: lesson.id,
        lesson_id: lesson.id,
        coursetitle: title,
      });
      return;
    }

    if (actionId === 'practice') {
      navigation.navigate('TestformNew', {
        lessonId: lesson.id,
        lessonName: lesson.title,
        course_id: activeCourseId,
        courseId: activeCourseId,
        permit_id: defaultPermitId,
      });
      return;
    }

    if (actionId === 'mockup') {
      navigation.navigate('TestformNew', {
        course_id: activeCourseId,
        courseId: activeCourseId,
        permit_id: defaultPermitId,
        is_mockup: 1,
        lessonName: lesson.title,
      });
    }
  };

  return (
    <ScreenWrapper
      headerUnScrollable={() => (
        <Header
          title={
            hasAccess
              ? title || 'screens.courseEnroll.courseHeader'
              : 'screens.checkout.header'
          }
          removeTranslation={hasAccess && Boolean(title)}
        />
      )}
      backgroundColor="white"
      footerUnScrollable={
        hasAccess
          ? undefined
          : () => (
        <View
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 16,
            paddingVertical: 20,
          }}>
          <CustomButton
            title={
              formattedPrice
                ? t('screens.courseEnroll.enrollNowWithPrice', {
                    price: formattedPrice,
                  })
                : t('screens.courseEnroll.enrollNow')
            }
            color={'white'}
            backgroundColor={'#0298EF'}
            borderRadius={999}
            height={68}
            fontSize={18}
            onPress={handleEnrollPress}
          />
        </View>
          )
      }
      paddingHorizontal={0}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces>
        <View style={styles.container}>
          {cover ? (
            <ImageFast
              source={{uri: cover}}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <VideoPlayer
              source={require('../../../assets/images/babel.config.mp4')}
              style={styles.videoWrapper}
            />
          )}
          {/* <View style={styles.tagPill}>
            <CustomText
              label={tag || 'MASTERCLASS • CREATIVE DIRECTION'}
              removeTranslation
              fontFamily={fonts.jakartaBold}
              fontSize={12}
              color={'#0298EF'}
            />
          </View> */}
          <CustomText
            label={title || t('screens.courseEnroll.fallbackTitle')}
            removeTranslation
            fontFamily={fonts.jakartaSemiBold}
            fontSize={32}
            color={'#1B1B24'}
            marginTop={20}
          />

          <CustomText
            label={subtitle || t('screens.courseEnroll.fallbackSubtitle')}
            removeTranslation
            fontFamily={fonts.jakartaRegular}
            fontSize={16}
            color={'#464555'}
            marginTop={10}
          />

          <CustomText
            label="screens.courseEnroll.descriptionExtra"
            fontFamily={fonts.jakartaRegular}
            fontSize={16}
            color={'#464555'}
            marginTop={10}
          />

          {/* <View style={styles.metaRow}>
            {COURSE_META_CHIPS.map(item => (
              <View key={item.id} style={styles.durationContainer}>
                <ImageFast
                  source={item.source}
                  style={styles.metaIcon}
                  resizeMode="contain"
                />
                <CustomText
                  label={item.label}
                  fontFamily={fonts.jakartaSemiBold}
                  fontSize={16}
                  color={'#1B1B24'}
                />
              </View>
            ))}
          </View> */}

          {/* <CustomText
            label="What you'll master"
            fontFamily={fonts.jakartaSemiBold}
            fontSize={20}
            color={'#1B1B24'}
            marginTop={20}
          />
          <View style={styles.masterList}>
            {MASTER_ITEMS.map(item => (
              <View key={item.id} style={styles.masterRow}>
                <ImageFast
                  source={Images.check}
                  style={styles.checkIcon}
                  resizeMode="contain"
                />
                <View style={styles.masterTextWrap}>
                  <CustomText
                    label={item.label}
                    fontFamily={fonts.jakartaRegular}
                    fontSize={16}
                    color={'#464555'}
                  />
                </View>
              </View>
            ))}
          </View> */}

          <View style={styles.curriculumHeaderRow}>
            <CustomText
              label="screens.courseEnroll.curriculum"
              fontFamily={fonts.jakartaExtraBold}
              fontSize={24}
              color={'#1B1B24'}
            />
            <CustomText
              label={t('screens.courseEnroll.lessonsCount', {
                count: String(displayLessonCount).padStart(2, '0'),
              })}
              removeTranslation
              fontFamily={fonts.jakartaBold}
              fontSize={14}
              color={'#64748B'}
            />
          </View>

          {loadingLessons ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#0298EF" />
            </View>
          ) : lessons.length === 0 ? (
            <CustomText
              label="screens.courseEnroll.noLessons"
              fontFamily={fonts.jakartaRegular}
              fontSize={14}
              color="#999999"
              marginTop={16}
            />
          ) : (
            <View style={styles.curriculumList}>
              {lessons.map((lesson, index) => {
                const isExpanded = expandedLessonId === lesson.id;
                const indexLabel = String(index + 1).padStart(2, '0');
                const isLocked = !hasAccess;

                return (
                  <Pressable
                    key={lesson.id}
                    onPress={() => handleLessonPress(lesson)}
                    style={[
                      styles.curriculumCard,
                      isExpanded && !hasAccess && styles.curriculumCardActive,
                    ]}>
                    <View style={styles.curriculumHeader}>
                      <View style={styles.curriculumLeft}>
                        <View style={styles.indexBadge}>
                          <CustomText
                            label={indexLabel}
                            fontFamily={fonts.jakartaBold}
                            fontSize={16}
                            color={'#FFFFFF'}
                            removeTranslation
                          />
                        </View>
                        <View style={styles.curriculumTextWrap}>
                          <CustomText
                            label={lesson.title}
                            fontFamily={fonts.jakartaBold}
                            fontSize={18}
                            color={'#1B1B24'}
                            removeTranslation
                          />
                          {!!lesson.subtitle && (
                            <CustomText
                              label={lesson.subtitle}
                              fontFamily={fonts.jakartaRegular}
                              fontSize={14}
                              color={'#464555'}
                              removeTranslation
                            />
                          )}
                        </View>
                      </View>
                      <Icons
                        family="Ionicons"
                        name={
                          hasAccess
                            ? 'chevron-forward'
                            : isExpanded
                              ? 'chevron-up'
                              : 'chevron-down'
                        }
                        size={26}
                        color={hasAccess || isExpanded ? '#08A0F7' : '#464555'}
                      />
                    </View>

                    {isExpanded && !hasAccess && (
                      <View style={styles.lessonList}>
                        {LESSON_ACTIONS.map(action => (
                          <Pressable
                            key={`${lesson.id}-${action.id}`}
                            style={styles.lessonRow}
                            onPress={() =>
                              handleLessonAction(lesson, action.id)
                            }>
                            <CustomText
                              label={action.label}
                              fontFamily={fonts.jakartaRegular}
                              fontSize={16}
                              color={isLocked ? '#9AA4B2' : '#1B1B24'}
                            />
                            {isLocked ? (
                              <Icons
                                family="Ionicons"
                                name="lock-closed-outline"
                                size={22}
                                color="#9AA4B2"
                              />
                            ) : null}
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default CourseEnroll;

const styles = StyleSheet.create({
  pageScroll: {
    flex: 1,
    backgroundColor: '#EDF9FF',
  },
  pageScrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    backgroundColor: '#EDF9FF',
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  videoWrapper: {
    marginTop: 20,
  },
  coverImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 20,
  },
  tagPill: {
    backgroundColor: '#ADE1FF',
    padding: 5,
    borderRadius: 10,
    marginTop: 15,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  metaIcon: {
    height: 12,
    width: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    backgroundColor: '#D4EFFF',
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  checkIcon: {
    width: 16,
    height: 16,
    marginTop: 8,
  },
  masterList: {
    marginTop: 12,
    gap: 14,
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  masterTextWrap: {
    flex: 1,
  },
  curriculumHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  curriculumList: {
    marginTop: 16,
    gap: 14,
    marginBottom: 30,
  },
  curriculumCard: {
    backgroundColor: '#F7F5FF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  curriculumCardActive: {
    backgroundColor: '#DFF4FF',
    borderWidth: 1,
    borderColor: '#C8E8FF',
  },
  curriculumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  curriculumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  indexBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#08A0F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumTextWrap: {
    flex: 1,
    gap: 2,
  },
  lessonList: {
    marginTop: 16,
    gap: 12,
    paddingLeft: 74,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
