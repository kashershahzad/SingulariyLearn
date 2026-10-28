import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Images} from '../../../assets/images';
import ImageFast from '../../../components/ImageFast';
import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';
import ProgressBar from '../../../components/ProgressBar';
import fonts from '../../../assets/fonts';
import SearchInput from '../../../components/SearchInput';
import SpotlightFeatures from './SpotlightFeatures';
import TrendingCard from './TrendingCard';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import {ApiRequest} from '../../../services/ApiRequest';

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

const formatPrice = value => {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '';
  }
  return `$${amount.toFixed(2)}`;
};

const hasCourseAccess = course =>
  course?.user_has_access === true ||
  course?.user_has_access === 1 ||
  course?.user_has_access === '1' ||
  course?.user_purchased === true ||
  course?.user_purchased === 1 ||
  course?.user_purchased === '1';

const ALL_COURSES_CHIP = {
  id: 'all',
  label: 'All Courses',
  icon: null,
};

const getCategoryIcon = item => {
  const raw =
    item?.icon ||
    item?.icon_url ||
    item?.thumb ||
    item?.cat_img ||
    item?.image ||
    item?.logo ||
    '';
  return raw ? String(raw) : null;
};

const WHY_ITEMS = [
  {
    id: 'expert',
    icon: 'book-outline',
    label: 'screens.landing.whyExpert',
    desc: 'screens.landing.whyExpertDesc',
    tint: '#E8F4FF',
    color: '#0298EF',
  },
  {
    id: 'audio',
    icon: 'volume-high-outline',
    label: 'screens.landing.whyAudio',
    desc: 'screens.landing.whyAudioDesc',
    tint: '#E8F8EF',
    color: '#16A34A',
  },
  {
    id: 'languages',
    icon: 'language-outline',
    label: 'screens.landing.whyLanguages',
    desc: 'screens.landing.whyLanguagesDesc',
    tint: '#F3E8FF',
    color: '#7C3AED',
  },
  {
    id: 'progress',
    icon: 'stats-chart-outline',
    label: 'screens.landing.whyProgress',
    desc: 'screens.landing.whyProgressDesc',
    tint: '#FFF4E8',
    color: '#EA580C',
  },
];

const FadeInView = ({children, delay = 0, style}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 450,
      delay,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

const index = ({navigation}) => {
  const {t} = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [categoryChips, setCategoryChips] = useState([ALL_COURSES_CHIP]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [homeData, setHomeData] = useState(null);
  const currentLanguage = useSelector(state => state.language.language);
  const token = useSelector(state => state.authConfig.token);
  const isLoggedIn = Boolean(token);

  const fetchHomeData = useCallback(async () => {
    if (!token) {
      setHomeData(null);
      return;
    }
    try {
      const response = await ApiRequest({
        type: 'app_home',
        user_id: token,
      });
      if (response?.data?.result) {
        setHomeData(response.data);
      } else {
        setHomeData(null);
      }
    } catch (error) {
      console.log('Landing app_home error:', error);
      setHomeData(null);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData]),
  );

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await ApiRequest({
          type: 'get_data',
          table_name: 'categories_useful',
          limit: '10',
        });
          
        if (cancelled) {
          return;
        }

        if (response?.status === 200) {
          const raw = Array.isArray(response.data?.data)
            ? response.data.data
            : [];
          const mapped = raw.map(item => ({
            id: String(item.id),
            label:
              parseLocalized(item.title, currentLanguage) ||
              item.name ||
              '',
            icon: getCategoryIcon(item),
          }));
          setCategoryChips([ALL_COURSES_CHIP, ...mapped]);
          console.log('mapped', mapped);
        } else {
          setCategoryChips([ALL_COURSES_CHIP]);
        }
      } catch {
        if (!cancelled) {
          setCategoryChips([ALL_COURSES_CHIP]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  useEffect(() => {
    let cancelled = false;

    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const body = {
          type: 'get_data',
          table_name: 'courses',
          limit: '100',
        };

        if (isLoggedIn) {
          body.for_user = '1';
          body.user_id = token;
        }

        if (selectedCategoryId !== 'all') {
          body.category_id = String(selectedCategoryId);
        }

        const response = await ApiRequest(body);

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

    fetchCourses();

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId, isLoggedIn, token]);

  const mappedCourses = useMemo(() => {
    return courses.map(course => {
      const title = parseLocalized(course.name, currentLanguage);
      const subtitle = parseLocalized(course.description, currentLanguage);
      const tag = parseLocalized(course.tag, currentLanguage);
      const category =
        parseLocalized(course.category, currentLanguage) || tag || '';
      const rating = course.rating ?? course.avg_rating;
      const reviewCount = course.reviews_count ?? course.review_count;

      return {
        id: String(course.id),
        courseId: String(course.id),
        title,
        subtitle,
        tag,
        category,
        cover: course.cover ? String(course.cover) : '',
        price: course.price,
        priceLabel: formatPrice(course.price),
        lessonCount: Number(course.total_lesson) || 0,
        questionCount:
          Number(course.total_questions) ||
          Number(course.questions_count) ||
          Number(course.total_question) ||
          0,
        appleProductId: String(course.apple_product_id || '').trim(),
        googleProductId: String(course.google_product_id || '').trim(),
        isPurchased: hasCourseAccess(course),
      };
    });
  }, [courses, currentLanguage]);

  const searchQuery = search.trim().toLowerCase();
  const isFilteredView =
    selectedCategoryId !== 'all' || searchQuery.length > 0;

  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return [];
    }

    return mappedCourses.filter(
      course =>
        course.title.toLowerCase().includes(searchQuery) ||
        course.subtitle.toLowerCase().includes(searchQuery) ||
        course.category.toLowerCase().includes(searchQuery) ||
        course.tag.toLowerCase().includes(searchQuery),
    );
  }, [mappedCourses, searchQuery]);

  const displayCourses = searchQuery ? searchResults : mappedCourses;

  const continueLearning = homeData?.continue_learning;
  const continueTitle =
    continueLearning?.lesson_title ||
    parseLocalized(continueLearning?.lesson?.name, currentLanguage) ||
    t('screens.home.continueLearningFallback');
  const continueCourseTitle =
    continueLearning?.course_name || continueTitle;
  const continueSubtitle = continueLearning
    ? t('screens.home.continueLessonSubtitle', {
        number: continueLearning.lesson_number || '',
        subtitle: continueLearning.lesson_subtitle || continueTitle,
        duration: continueLearning.duration_label || '',
      })
    : '';
  const continueProgress = Number(continueLearning?.progress_percent ?? 0);
  const continueProgressLabel = continueLearning?.progress_label
    ? continueLearning.progress_label
    : t('screens.home.progressComplete', {percent: continueProgress});
  const continueThumb =
    continueLearning?.cover ||
    continueLearning?.course_cover ||
    continueLearning?.image ||
    continueLearning?.icon_url ||
    '';

  const handleContinueLearning = () => {
    if (!continueLearning) {
      return;
    }
    navigation.navigate('CourseDetialNew', {
      courseId: String(continueLearning.course_id),
      course_id: String(continueLearning.course_id),
      lessonId: String(continueLearning.lesson_id),
      lesson_id: String(continueLearning.lesson_id),
      coursetitle: continueCourseTitle,
    });
  };

  const handleTakeQuickQuiz = () => {
    if (!isLoggedIn) {
      navigation.navigate('NewLogin');
      return;
    }
    navigation.navigate('TestformNew', {
      is_quickquiz: '1',
      lessonName: 'Quick Quiz',
    });
  };

  const handleReviewMistakes = () => {
    if (!isLoggedIn) {
      navigation.navigate('NewLogin');
      return;
    }
    navigation.navigate('ReviewMistakes');
  };

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      headerUnScrollable={() => (
        <View style={styles.headerContainer}>
          <View style={styles.headerSide}>
            {/* {isLoggedIn ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.goBack()}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                <ImageFast
                  source={Images.leftarrow}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : null} */}
          </View>
          <View style={styles.logoCenterWrap}>
            <FadeInView>
              <ImageFast
                source={Images.landinglogo}
                style={styles.logo}
                resizeMode={'contain'}
              />
            </FadeInView>
          </View>
          <View style={styles.headerSideRight}>
            {!isLoggedIn ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('NewLogin')}
                style={styles.loginBtn}>
                <CustomText
                  label="screens.landing.login"
                  fontSize={14}
                  fontFamily={fonts.jakartaSemiBold}
                  color="#0298EF"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces>
        <View style={styles.container}>
          <FadeInView delay={80}>
            <View style={styles.heroBannerWrap}>
              <ImageBackground
                source={Images.learnPrepareBanner}
                style={styles.heroBanner}
                imageStyle={styles.heroBannerImage}
                resizeMode="cover">
                <View style={styles.heroContent}>
                  <Text
                    style={styles.heroTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    allowFontScaling={false}>
                    Learn. Prepare.{' '}
                    <Text style={styles.heroTitleAccent}>Succeed.</Text>
                  </Text>
                  <CustomText
                    label="screens.landing.heroBody"
                    fontSize={9}
                    fontFamily={fonts.jakartaRegular}
                    color="#555555"
                    lineHeight={13}
                    marginTop={4}
                  />
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.exploreBtn}
                    onPress={() => {
                      setSelectedCategoryId('all');
                      setSearch('');
                    }}>
                    <CustomText
                      label="screens.landing.exploreCourses"
                      fontSize={9}
                      fontFamily={fonts.jakartaSemiBold}
                      color="#FFFFFF"
                    />
                    <Icons
                      family="Ionicons"
                      name="chevron-forward"
                      size={10}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          </FadeInView>

          <FadeInView delay={160}>
            <View style={styles.searchWrap}>
              <SearchInput
                placeholder="Search courses exam or topics..."
                marginTop={20}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsScrollContent}>
              {loadingCategories ? (
                <View style={styles.chipsLoader}>
                  <ActivityIndicator size="small" color="#0298EF" />
                </View>
              ) : (
                categoryChips.map(item => {
                  const selected = item.id === selectedCategoryId;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedCategoryId(item.id)}
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : styles.chipIdle,
                      ]}>
                      {!!item.icon && (
                        <ImageFast
                          source={{uri: item.icon}}
                          style={[
                            styles.chipIcon,
                            selected && styles.chipIconSelected,
                          ]}
                          resizeMode="contain"
                        />
                      )}
                      <Text
                        style={[
                          styles.chipLabel,
                          selected
                            ? styles.chipLabelSelected
                            : styles.chipLabelIdle,
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </FadeInView>

          {!isFilteredView && isLoggedIn && continueLearning ? (
            <FadeInView delay={220}>
              <View style={styles.continueSection}>
                <View style={styles.continueHeader}>
                  <CustomText
                    label="screens.landing.continueLearning"
                    fontFamily={fonts.jakartaBold}
                    fontSize={18}
                    color="#1B1B24"
                  />
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Study')}>
                    <CustomText
                      label="screens.landing.viewAll"
                      fontFamily={fonts.jakartaSemiBold}
                      fontSize={13}
                      color="#0298EF"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.92}
                  style={styles.continueCard}
                  onPress={handleContinueLearning}>
                  <ImageFast
                    source={
                      continueThumb
                        ? {uri: String(continueThumb)}
                        : Images.trendingpicture
                    }
                    style={styles.continueThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.continueContent}>
                    <CustomText
                      label={continueCourseTitle}
                      fontSize={12}
                      fontFamily={fonts.jakartaBold}
                      color="#2D2E32"
                      lineHeight={15}
                      numberOfLines={1}
                      removeTranslation
                    />
                    {!!continueSubtitle && (
                      <CustomText
                        label={continueSubtitle}

                        fontSize={10}
                        fontFamily={fonts.jakartaRegular}
                        color="#8E94A3"
                        marginTop={1}
                        lineHeight={12}
                        numberOfLines={1}
                        removeTranslation
                      />
                    )}
                    <View style={styles.continueProgressRow}>
                      <ProgressBar
                        progress={continueProgress}
                        trackStyle={styles.continueTrack}
                        fillStyle={styles.continueFill}
                      />
                      <CustomText
                        label={continueProgressLabel}
                        fontSize={9}
                        fontFamily={fonts.jakartaMedium}
                        color="#8E94A3"
                        removeTranslation
                      />
                    </View>
                  </View>
                  <View style={styles.resumeBtn}>
                    <Icons
                      family="Ionicons"
                      name="play"
                      size={11}
                      color="#FFFFFF"
                    />
                    <CustomText
                      label="screens.landing.resume"
                      fontSize={11}
                      fontFamily={fonts.jakartaSemiBold}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </FadeInView>
          ) : null}

          {!isFilteredView ? (
            <FadeInView delay={230}>
              <View style={styles.quickSection}>
                <CustomText
                  label="screens.landing.quickPractice"
                  fontFamily={fonts.jakartaBold}
                  fontSize={18}
                  color="#1B1B24"
                  marginBottom={12}
                />
                <View style={styles.quickRow}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.quickCard}
                    onPress={handleTakeQuickQuiz}>
                    <View style={[styles.quickIconWrap, styles.quickIconBlue]}>
                      <ImageFast
                        source={Images.docs}
                        style={styles.quickIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.quickTextWrap}>
                      <CustomText
                        label="screens.landing.takeQuickQuiz"
                        fontSize={11}
                        fontFamily={fonts.jakartaBold}
                        color="#1B3A5F"
                        lineHeight={14}
                        numberOfLines={2}
                      />
                      <CustomText
                        label="screens.landing.takeQuickQuizHint"
                        fontSize={9}
                        fontFamily={fonts.jakartaRegular}
                        color="#8E94A3"
                        marginTop={2}
                        lineHeight={11}
                        numberOfLines={1}
                      />
                    </View>
                    <Icons
                      family="Ionicons"
                      name="chevron-forward"
                      size={14}
                      color="#0298EF"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.quickCard}
                    onPress={handleReviewMistakes}>
                    <View style={[styles.quickIconWrap, styles.quickIconOrange]}>
                      <Icons
                        family="MaterialCommunityIcons"
                        name="target"
                        size={16}
                        color="#E11D48"
                      />
                    </View>
                    <View style={styles.quickTextWrap}>
                      <CustomText
                        label="screens.landing.reviewMistakes"
                        fontSize={11}
                        fontFamily={fonts.jakartaBold}
                        color="#1B3A5F"
                        lineHeight={14}
                        numberOfLines={2}
                      />
                      <CustomText
                        label="screens.landing.reviewMistakesHint"
                        fontSize={9}
                        fontFamily={fonts.jakartaRegular}
                        color="#8E94A3"
                        marginTop={2}
                        lineHeight={11}
                        numberOfLines={1}
                      />
                    </View>
                    <Icons
                      family="Ionicons"
                      name="chevron-forward"
                      size={14}
                      color="#F59E0B"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </FadeInView>
          ) : null}

          {/* <FadeInView delay={240}>
            {!isFilteredView && <SpotlightFeatures />}
          </FadeInView> */}

          <FadeInView
            key={`courses-${selectedCategoryId}-${searchQuery}-${loadingCourses}`}
            delay={300}>
            {!isFilteredView && (
              <View style={styles.trendingContainer}>
                <CustomText
                  label="Trending Courses"
                  fontFamily={fonts.semiBold}
                  fontSize={20}
                  color="#1B1B24"
                  marginTop={10}
                />
              </View>
            )}
            {loadingCourses ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#0298EF" />
              </View>
            ) : displayCourses.length === 0 ? (
              <CustomText
                label={
                  searchQuery ? 'No courses found' : 'No courses available'
                }
                fontFamily={fonts.jakartaRegular}
                fontSize={14}
                color="#999999"
                marginTop={16}
                marginRight={20}
              />
            ) : (
              <View style={styles.coursesGrid}>
                {displayCourses.map(item => (
                  <TrendingCard
                    key={item.id}
                    courseId={item.courseId}
                    cover={item.cover}
                    title={item.title}
                    subtitle={item.subtitle}
                    tag={item.tag}
                    lessonCount={item.lessonCount}
                    questionCount={item.questionCount}
                    price={item.priceLabel}
                    priceRaw={item.price}
                    appleProductId={item.appleProductId}
                    googleProductId={item.googleProductId}
                    isPurchased={item.isPurchased}
                    isLoggedIn={isLoggedIn}
                    compact
                  />
                ))}
              </View>
            )}
          </FadeInView>

          {!isFilteredView ? (
            <FadeInView delay={340}>
              <View style={styles.whySection}>
                <CustomText
                  label="screens.landing.whyLearn"
                  fontFamily={fonts.jakartaBold}
                  fontSize={18}
                  color="#1B1B24"
                  marginBottom={12}
                />
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.whyRow}>
                  {WHY_ITEMS.map(item => (
                    <View key={item.id} style={styles.whyCard}>
                      <View
                        style={[
                          styles.whyIconWrap,
                          {backgroundColor: item.tint},
                        ]}>
                        <Icons
                          family="Ionicons"
                          name={item.icon}
                          size={18}
                          color={item.color}
                        />
                      </View>
                      <CustomText
                        label={item.label}
                        fontSize={12}
                        fontFamily={fonts.jakartaBold}
                        color="#1B3A5F"
                        marginTop={10}
                        lineHeight={15}
                        numberOfLines={1}
                      />
                      <CustomText
                        label={item.desc}
                        fontSize={10}
                        fontFamily={fonts.jakartaRegular}
                        color="#8E94A3"
                        marginTop={4}
                        lineHeight={13}
                        numberOfLines={2}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            </FadeInView>
          ) : null}
        </View>
        {!isLoggedIn ? (
        <FadeInView delay={360} style={styles.subscribeContainer}>
          <CustomText
            label="Ready to redefine our creative potential?"
            fontFamily={fonts.semiBold}
            fontSize={30}
            color="white"
            marginTop={10}
            lineHeight={36}
            textAlign="center"
          />
          <CustomText
            label="Join 50,000+ creative professionals and get the latest workshops, assets, and insights delivered weekly."
            fontFamily={fonts.regular}
            fontSize={18}
            color="#E2DFFF"
            marginTop={10}
            lineHeight={28}
            textAlign="center"
          />
          <CustomInput
            placeholder="Enter your email"
            placeholderTextColor="#FFFFFF99"
            marginTop={10}
            marginBottom={10}
            borderRadius={999}
            borderColor="#FFFFFF33"
            borderWidth={1}
            paddingHorizontal={10}
            backgroundColor="#239BDE"
          />
          <CustomButton
            title="Subscribe"
            onPress={() => {}}
            marginTop={10}
            color={"#0298EF"}
            marginBottom={10}
            borderRadius={10}
            paddingHorizontal={10}
            backgroundColor="white"
          />
        </FadeInView>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default index;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingLeft: 20,
    paddingVertical: 10,
    width: '100%',
    backgroundColor: 'white',
  },
  headerSide: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerSideRight: {
    width: 62,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  loginBtn: {
    borderWidth: 1,
    borderColor: '#0298EF',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#EAF8FF',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  logoCenterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 102,
    height: 22,
  },

  pageScroll: {
    flex: 1,
    backgroundColor: '#EDF9FF',
  },
  pageScrollContent: {
    paddingBottom: 40,
  },

  container: {
    backgroundColor: '#EDF9FF',
    padding: 20,
    paddingRight: 0,
    paddingBottom: 32,
  },
  heroBannerWrap: {
    marginRight: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  heroBanner: {
    width: '100%',
    minHeight: 150,
    justifyContent: 'center',
  },
  heroBannerImage: {
    borderRadius: 16,
  },
  heroContent: {
    width: '70%',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 12,
    paddingRight: 6,
  },
  heroTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.jakartaExtraBold,
    color: '#1A1A1A',
  },
  heroTitleAccent: {
    color: '#0298EF',
  },
  exploreBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    backgroundColor: '#0298EF',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  chipsScroll: {
    marginTop: 16,
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  chipsScrollContent: {
    paddingRight: 24,
    alignItems: 'center',
    flexGrow: 0,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 10,
    gap: 8,
  },
  chipSelected: {
    backgroundColor: '#0298EF',
    borderWidth: 1,
    borderColor: '#0298EF',
  },
  chipIdle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },
  chipIcon: {
    width: 18,
    height: 18,
  },
  chipIconSelected: {
    tintColor: '#FFFFFF',
  },
  chipLabel: {
    fontSize: 10,
    fontFamily: fonts.jakartaSemiBold,
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  chipLabelIdle: {
    color: '#1B3A5F',
  },
  chipsLoader: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  searchWrap: {
    position: 'relative',
    zIndex: 20,
    paddingRight: 20,
  },
  searchDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    marginTop: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  searchDropdownScroll: {
    maxHeight: 280,
  },
  searchDropdownLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    gap: 12,
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
  },
  searchResultImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  searchResultText: {
    flex: 1,
  },
  continueSection: {
    marginTop: 22,
    marginRight: 20,
  },
  continueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8EEF5',
  },
  continueThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E8EEF5',
  },
  continueContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  continueProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueTrack: {
    flex: 1,
    marginTop: 0,
    height: 5,
    backgroundColor: '#E8EEF5',
  },
  continueFill: {
    backgroundColor: '#0298EF',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0298EF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  quickSection: {
    marginTop: 22,
    marginRight: 20,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8EEF5',
  },
  quickIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconBlue: {
    backgroundColor: '#EAF8FF',
  },
  quickIconOrange: {
    backgroundColor: '#FFF1E8',
  },
  quickIcon: {
    width: 18,
    height: 18,
  },
  quickTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  trendingContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 20,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: 10,
    rowGap: 12,
    marginRight: 20,
    marginTop: 8,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginRight: 20,
  },
  whySection: {
    marginTop: 24,
    marginRight: 0,
    marginBottom: 8,
  },
  whyRow: {
    paddingRight: 20,
    gap: 10,
  },
  whyCard: {
    width: 148,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  whyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeContainer: {
    marginTop: 10,
    padding: 30,
    backgroundColor: '#0298EF',
    marginHorizontal: 20,
    borderRadius: 32,
  },
});
