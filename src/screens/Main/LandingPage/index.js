import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Images} from '../../../assets/images';
import ImageFast from '../../../components/ImageFast';
import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
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
  backgroundColor: '#E8E5F2',
  color: '#5A5668',
};

const CHIP_PALETTE = [
  {backgroundColor: '#D4F5EC', color: '#0A6B58'},
  {backgroundColor: '#EBE8F5', color: '#5A5668'},
  {backgroundColor: '#FFE8D4', color: '#8A4B0A'},
  {backgroundColor: '#E8F4FF', color: '#0A5A8A'},
  {backgroundColor: '#F5E8F2', color: '#6A0A58'},
  {backgroundColor: '#E8F5E8', color: '#0A6B20'},
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
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [categoryChips, setCategoryChips] = useState([ALL_COURSES_CHIP]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const currentLanguage = useSelector(state => state.language.language);
  const token = useSelector(state => state.authConfig.token);
  const isLoggedIn = Boolean(token);

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
          const mapped = raw.map((item, index) => {
            const palette = CHIP_PALETTE[index % CHIP_PALETTE.length];
            return {
              id: String(item.id),
              label:
                parseLocalized(item.title, currentLanguage) ||
                item.name ||
                '',
              ...palette,
            };
          });
          setCategoryChips([ALL_COURSES_CHIP, ...mapped]);
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
        appleProductId: String(course.apple_product_id || '').trim(),
        googleProductId: String(course.google_product_id || '').trim(),
        isPurchased: hasCourseAccess(course),
        ratingValue: rating ? String(rating) : null,
        reviewsLabel: reviewCount
          ? `(${Number(reviewCount).toLocaleString()} reviews)`
          : null,
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
            <CustomText
              removeTranslation
              label=""
              fontSize={36}
              fontFamily={fonts.jakartaExtraBold}
              color="#1B1B24"
              lineHeight={42}
              width="80%">
              Master your craft with{' '}
              <Text style={{color: '#0298EF'}}>Expert</Text> precision.
            </CustomText>

            <CustomText
              label={
                'Curated courses from industry leaders in design, technology, and creative arts.'
              }
              fontSize={18}
              color={'#464555'}
              marginTop={10}
            />
          </FadeInView>

          <FadeInView delay={160}>
            <View style={styles.searchWrap}>
              <SearchInput
                placeholder="Search for your next skill..."
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
                        {
                          backgroundColor: selected
                            ? '#0298EF'
                            : item.backgroundColor,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.chipLabel,
                          {color: selected ? '#FFFFFF' : item.color},
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </FadeInView>

          <FadeInView delay={240}>
            {!isFilteredView && <SpotlightFeatures />}
          </FadeInView>

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
              displayCourses.map(item => (
                <TrendingCard
                  key={item.id}
                  courseId={item.courseId}
                  cover={item.cover}
                  category={item.category}
                  title={item.title}
                  subtitle={item.subtitle}
                  tag={item.tag}
                  lessonCount={item.lessonCount}
                  ratingValue={item.ratingValue}
                  reviewsLabel={item.reviewsLabel}
                  price={item.priceLabel}
                  priceRaw={item.price}
                  appleProductId={item.appleProductId}
                  googleProductId={item.googleProductId}
                  isPurchased={item.isPurchased}
                  isLoggedIn={isLoggedIn}
                />
              ))
            )}
          </FadeInView>
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
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    marginRight: 10,
  },
  chipLabel: {
    fontSize: 15,
    fontFamily: fonts.jakartaSemiBold,
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
  trendingContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 20,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginRight: 20,
  },
  subscribeContainer: {
    marginTop: 10,
    padding: 30,
    backgroundColor: '#0298EF',
    marginHorizontal: 20,
    borderRadius: 32,
  },
});
