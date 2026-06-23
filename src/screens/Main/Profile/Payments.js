import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import {ApiRequest} from '../../../services/ApiRequest';
import {getProfile} from '../../../utils/constants';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';
import {useTranslation} from 'react-i18next';

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

const formatAmount = amount => {
  const num = Number(amount);
  if (Number.isNaN(num)) {
    return `$${amount || '0.00'}`;
  }
  return `$${num.toFixed(2)}`;
};

const formatPaymentDate = (datetime, noValueLabel) => {
  if (!datetime) {
    return noValueLabel;
  }

  const date = new Date(String(datetime).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) {
    return datetime;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Payments = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector(state => state.authConfig.token);
  const userData = useSelector(state => state.users.userData);
  const currentLanguage = useSelector(state => state.language.language);
  const {colors} = useTheme();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: c.screenBg,
        padding: 20,
        paddingBottom: 28,
      },
      summaryCard: {
        backgroundColor: c.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.border,
        padding: 20,
        marginBottom: 20,
      },
      summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      summaryDivider: {
        height: 1,
        backgroundColor: c.divider,
        marginVertical: 14,
      },
      paymentCard: {
        backgroundColor: c.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.border,
        padding: 16,
        marginBottom: 14,
      },
      paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      courseIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: c.iconBg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
      courseIcon: {
        width: 52,
        height: 52,
        borderRadius: 12,
      },
      courseIconFallback: {
        width: 24,
        height: 24,
      },
      paymentMeta: {
        flex: 1,
      },
      statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: c.accentBg,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 10,
      },
      detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: c.divider,
      },
      loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        minHeight: 160,
      },
      emptyCard: {
        backgroundColor: c.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.border,
        padding: 28,
        alignItems: 'center',
      },
    }),
  );

  useFocusEffect(
    useCallback(() => {
      if (token) {
        dispatch(getProfile());
      }
    }, [dispatch, token]),
  );

  useEffect(() => {
    if (!token) {
      setCourses([]);
      setLoadingCourses(false);
      return;
    }

    let cancelled = false;

    const fetchCourses = async () => {
      setLoadingCourses(true);
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
  }, [token]);

  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach(course => {
      map[String(course.id)] = course;
    });
    return map;
  }, [courses]);

  const paymentHistory = useMemo(() => {
    const purchases = Array.isArray(userData?.purchase) ? userData.purchase : [];

    return [...purchases]
      .filter(item => String(item?.course_id || '0') !== '0')
      .sort((a, b) => {
        const dateA = new Date(String(a?.datetime || a?.created_at || '').replace(' ', 'T'));
        const dateB = new Date(String(b?.datetime || b?.created_at || '').replace(' ', 'T'));
        return dateB - dateA;
      })
      .map(item => {
        const courseId = String(item.course_id || '');
        const course = courseMap[courseId];
        const courseTitle =
          parseLocalized(course?.name, currentLanguage) ||
          t('screens.payments.courseNumber', {id: courseId});

        return {
          id: String(item.id),
          courseId,
          courseTitle,
          instructor: course?.instructor || t('screens.payments.instructor'),
          amount: formatAmount(item.amount),
          date: formatPaymentDate(
            item.datetime || item.created_at,
            t('screens.payments.noValue'),
          ),
          transactionId: item.pi_id || t('screens.payments.noValue'),
          cover: course?.cover || course?.icon || '',
        };
      });
  }, [userData?.purchase, courseMap, currentLanguage, t]);

  const totalSpent = useMemo(() => {
    const purchases = Array.isArray(userData?.purchase) ? userData.purchase : [];
    const total = purchases
      .filter(item => String(item?.course_id || '0') !== '0')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return formatAmount(total);
  }, [userData?.purchase]);

  const handleOpenCourse = courseId => {
    if (!courseId) {
      return;
    }
    navigation.navigate('CourseDetails', {courseId});
  };

  return (
    <ScreenWrapper
      scrollEnabled
      paddingHorizontal={0}
      headerUnScrollable={() => <Header2 title="screens.payments.header" />}>
      <View style={styles.container}>
        <CustomText
          label="screens.payments.historyTitle"
          fontSize={20}
          fontFamily={fonts.jakartaBold}
          color={colors.textPrimary}
        />
        <CustomText
          label="screens.payments.historySubtitle"
          fontSize={14}
          fontFamily={fonts.jakartaRegular}
          color={colors.textMuted}
          marginTop={4}
          marginBottom={16}
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <CustomText
              label="screens.payments.totalPurchases"
              fontSize={14}
              fontFamily={fonts.jakartaMedium}
              color={colors.textSecondary}
            />
            <CustomText
              label={String(paymentHistory.length)}
              fontSize={22}
              fontFamily={fonts.jakartaExtraBold}
              color={colors.textPrimary}
              removeTranslation
            />
          </View>
          {/* <View style={styles.summaryDivider} /> */}
          {/* <View style={styles.summaryRow}>
            <CustomText
              label="Total Spent"
              fontSize={14}
              fontFamily={fonts.jakartaMedium}
              color={colors.textSecondary}
            />
            <CustomText
              label={totalSpent}
              fontSize={22}
              fontFamily={fonts.jakartaExtraBold}
              color={colors.accent}
              removeTranslation
            />
          </View> */}
        </View>

        {loadingCourses ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : paymentHistory.length === 0 ? (
          <View style={styles.emptyCard}>
            <ImageFast
              source={Images.cart}
              style={{width: 48, height: 48, marginBottom: 12}}
              resizeMode="contain"
            />
            <CustomText
              label="screens.payments.emptyTitle"
              fontSize={16}
              fontFamily={fonts.jakartaSemiBold}
              color={colors.textPrimary}
              textAlign="center"
            />
            <CustomText
              label="screens.payments.emptySubtitle"
              fontSize={13}
              fontFamily={fonts.jakartaRegular}
              color={colors.textMuted}
              textAlign="center"
              marginTop={6}
            />
          </View>
        ) : (
          paymentHistory.map(payment => (
            <TouchableOpacity
              key={payment.id}
              activeOpacity={0.85}
              style={styles.paymentCard}
              onPress={() => handleOpenCourse(payment.courseId)}>
              <View style={styles.paymentHeader}>
                <View style={styles.courseIconWrap}>
                  {payment.cover ? (
                    <ImageFast
                      source={{uri: String(payment.cover)}}
                      style={styles.courseIcon}
                      resizeMode="cover"
                    />
                  ) : (
                    <ImageFast
                      source={Images.book}
                      style={styles.courseIconFallback}
                      resizeMode="contain"
                    />
                  )}
                </View>
                <View style={styles.paymentMeta}>
                  <CustomText
                    label={payment.courseTitle}
                    fontSize={16}
                    fontFamily={fonts.jakartaBold}
                    color={colors.textPrimary}
                    removeTranslation
                  />
                  <CustomText
                    label={payment.instructor}
                    fontSize={12}
                    fontFamily={fonts.jakartaRegular}
                    color={colors.textMuted}
                    marginTop={2}
                    removeTranslation
                  />
                  {/* <View style={styles.statusBadge}>
                    <CustomText
                      label="Paid"
                      fontSize={11}
                      fontFamily={fonts.jakartaSemiBold}
                      color={colors.accent}
                    />
                  </View> */}
                </View>
                <CustomText
                  label={payment.amount}
                  fontSize={18}
                  fontFamily={fonts.jakartaExtraBold}
                  color={colors.textPrimary}
                  removeTranslation
                />
              </View>

              <View style={styles.detailRow}>
                <View>
                  <CustomText
                    label="screens.payments.purchaseDate"
                    fontSize={11}
                    fontFamily={fonts.jakartaMedium}
                    color={colors.textMuted}
                  />
                  <CustomText
                    label={payment.date}
                    fontSize={13}
                    fontFamily={fonts.jakartaSemiBold}
                    color={colors.textPrimary}
                    marginTop={2}
                    removeTranslation
                  />
                </View>
                <View style={{alignItems: 'flex-end', flex: 1, marginLeft: 12}}>
                  <CustomText
                    label="screens.payments.transactionId"
                    fontSize={11}
                    fontFamily={fonts.jakartaMedium}
                    color={colors.textMuted}
                  />
                  <CustomText
                    label={payment.transactionId}
                    fontSize={12}
                    fontFamily={fonts.jakartaSemiBold}
                    color={colors.textSecondary}
                    marginTop={2}
                    numberOfLines={1}
                    removeTranslation
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Payments;
