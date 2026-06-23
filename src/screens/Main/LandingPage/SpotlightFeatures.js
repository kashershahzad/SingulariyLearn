import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
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

const formatReviewCount = count => {
  const num = Number(count);
  if (!Number.isFinite(num) || num <= 0) {
    return '';
  }
  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(num >= 10000 ? 0 : 1);
    return `(${formatted.replace(/\.0$/, '')}k+)`;
  }
  return `(${num}+)`;
};

const SpotlightFeatures = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.authConfig.token);
  const currentLanguage = useSelector(state => state.language.language);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchFeaturedCourses = async () => {
      setLoading(true);
      try {
        const request = {
          type: 'get_data',
          table_name: 'courses',
          for_user: '1',
          limit: '100',
          featured: '1',
        };

        if (token) {
          request.user_id = token;
        }

        const response = await ApiRequest(request);

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
          setLoading(false);
        }
      }
    };

    fetchFeaturedCourses();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const featuredCourses = useMemo(() => {
    return courses.map(course => {
      const title = parseLocalized(course.name, currentLanguage);
      const subtitle = parseLocalized(course.description, currentLanguage);
      const cover =
        course.cover_url || course.cover || course.image || course.thumb || '';
      const rating = course.rating ?? course.avg_rating;
      const reviewCount = course.reviews_count ?? course.review_count;
      const reviewsLabel = formatReviewCount(reviewCount);

      return {
        id: String(course.id),
        courseId: String(course.id),
        title,
        subtitle,
        cover: cover ? String(cover) : '',
        price: course.price,
        tag: parseLocalized(course.tag, currentLanguage),
        lessonCount: Number(course.total_lesson || course.total_lessons) || 0,
        appleProductId: String(course.apple_product_id || '').trim(),
        googleProductId: String(course.google_product_id || '').trim(),
        ratingValue: rating ? String(rating) : null,
        reviewsLabel,
      };
    });
  }, [courses, currentLanguage]);

  const handleCoursePress = course => {
    navigation.navigate('CourseEnroll', {
      courseId: course.courseId,
      course_id: course.courseId,
      title: course.title,
      subtitle: course.subtitle,
      price: course.price,
      cover: course.cover,
      tag: course.tag,
      lessonCount: course.lessonCount,
      apple_product_id: course.appleProductId,
      google_product_id: course.googleProductId,
    });
  };

  return (
    <>
      <View style={styles.container}>
        <CustomText
          label="Featured Spotlight"
          fontFamily={fonts.semiBold}
          fontSize={20}
          color={'#1B1B24'}
        />
        {/* <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <CustomText
            label={'View All'}
            fontFamily={fonts.bold}
            fontSize={14}
            color={'#3525CD'}
          />
          <ImageFast
            source={Images.rightarrow}
            style={{height: 12, width: 12}}
            resizeMode={'contain'}
          />
        </View> */}
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color="#0298EF" />
        </View>
      ) : featuredCourses.length === 0 ? null : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.cardsScroll}
          contentContainerStyle={styles.featuresContainer}>
          {featuredCourses.map(course => (
            <TouchableOpacity
              key={course.id}
              activeOpacity={0.9}
              onPress={() => handleCoursePress(course)}
              style={styles.featureCard}>
              <ImageFast
                source={
                  course.cover
                    ? {uri: course.cover}
                    : Images.featurecard
                }
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardOverlay}>
                <CustomText
                  label={course.title}
                  fontFamily={fonts.jakartaBold}
                  fontSize={20}
                  color="#FFFFFF"
                  lineHeight={26}
                  removeTranslation
                />
                {!!course.ratingValue && (
                  <View style={styles.ratingRow}>
                    <ImageFast
                      source={Images.ratingstar}
                      style={styles.ratingIcon}
                      resizeMode="contain"
                    />
                    <CustomText
                      label={`${course.ratingValue} ${course.reviewsLabel || ''}`.trim()}
                      fontFamily={fonts.jakartaSemiBold}
                      fontSize={14}
                      color="#FFFFFF"
                      removeTranslation
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );
};

export default SpotlightFeatures;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  featureCard: {
    width: 332,
    height: 186,
    marginTop: 15,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0A6B58',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  ratingIcon: {
    width: 14,
    height: 13,
  },
  cardsScroll: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  featuresContainer: {
    paddingRight: 20,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginRight: 20,
  },
});
