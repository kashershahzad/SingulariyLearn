import {Alert, Platform, StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from './header';
import fonts from '../../../assets/fonts';
import CustomText from '../../../components/CustomText';
import {Images} from '../../../assets/images';
import ImageFast from '../../../components/ImageFast';
import CustomHorizontalLine from '../../../components/CustomHorizontalLine';
import CustomButton from '../../../components/CustomButton';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ApiRequest} from '../../../services/ApiRequest';
import {payWithApple, payWithStripe} from '../../../utils/coursePayment';

const formatMoney = value => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '$0.00';
  }
  return `$${amount.toFixed(2)}`;
};

const CourseCheckout = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const token = useSelector(state => state.authConfig.token);
  const userData = useSelector(state => state.users.userData);
  const [currentStep, setCurrentStep] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const {
    courseId,
    course_id,
    title,
    subtitle,
    price,
    cover,
    tag,
    lessonCount,
    apple_product_id,
    appleProductId,
    google_product_id,
    googleProductId,
  } = route.params ?? {};

  const [activeAppleProductId, setActiveAppleProductId] = useState(
    String(apple_product_id || appleProductId || '').trim(),
  );
  const activeGoogleProductId = String(
    google_product_id || googleProductId || '',
  ).trim();

  const activeCourseId = course_id || courseId;

  useEffect(() => {
    if (Platform.OS !== 'ios' || activeAppleProductId || !activeCourseId) {
      return;
    }

    let cancelled = false;

    const fetchAppleProductId = async () => {
      try {
        const response = await ApiRequest({
          type: 'get_data',
          table_name: 'courses',
          for_user: '1',
          user_id: token,
          limit: '100',
        });
        const courseRow = (response?.data?.data ?? []).find(
          item => String(item.id) === String(activeCourseId),
        );

        if (!cancelled && courseRow?.apple_product_id) {
          setActiveAppleProductId(String(courseRow.apple_product_id).trim());
        }
      } catch (error) {
        console.log('Apple product id fetch error:', error);
      }
    };

    fetchAppleProductId();

    return () => {
      cancelled = true;
    };
  }, [activeAppleProductId, activeCourseId, token]);

  const courseInfo = useMemo(() => {
    const coursePrice = Number(price) || 0;
    const discount = 0;
    const fee = 0;

    return {
      title: title || t('screens.checkout.fallbackCourseTitle'),
      subtitle: subtitle || '',
      cover,
      tag: tag || '',
      lessonCount: lessonCount || 0,
      coursePrice,
      discount,
      fee,
      total: coursePrice - discount + fee,
      formattedCoursePrice: formatMoney(coursePrice),
      formattedDiscount: formatMoney(discount),
      formattedFee: formatMoney(fee),
      formattedTotal: formatMoney(coursePrice - discount + fee),
    };
  }, [title, subtitle, price, cover, tag, lessonCount]);

  const getIapErrorMessage = error => {
    if (error?.code === 'MISSING_APPLE_PRODUCT_ID') {
      return t('screens.checkout.missingAppleProduct');
    }
    return error?.message || t('screens.checkout.unableToComplete');
  };

  const completePayment = async ({
    paymentId,
    paymentMethod,
    receipt,
    productId,
  }) => {
    const body = {
      type: 'add_data',
      table_name: 'purchases',
      pi_id: paymentId,
      course_id: activeCourseId,
      amount: courseInfo.total,
      user_id: token,
      payment_method: paymentMethod,
    };

    if (receipt) {
      body.receipt = receipt;
    }
    if (productId) {
      body.product_id = productId;
    }

    const response = await ApiRequest(body);

    if (
      response?.data?.message === 'Added Successfully' ||
      response?.status === 200
    ) {
      setReceiptData({
        paymentId,
        purchaseId: response.data?.id,
        amount: courseInfo.formattedTotal,
        paymentMethod:
          paymentMethod === 'apple_iap'
            ? t('screens.checkout.paymentMethodApple')
            : t('screens.checkout.paymentMethodStripe'),
        message: response.data?.message || t('screens.checkout.paymentConfirmed'),
        time: new Date().toISOString().split('T')[0],
        userName: userData?.name || '',
        raw: response.data,
      });
      setCurrentStep(1);
      return;
    }

    Alert.alert(t('screens.checkout.errorTitle'), t('screens.checkout.paymentFailed'));
  };

  const onCheckoutPress = async () => {
    if (currentStep === 1) {
      navigation.goBack();
      return;
    }

    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      let result;

      if (Platform.OS === 'ios') {
        if (!activeAppleProductId) {
          Alert.alert(
            t('screens.checkout.errorTitle'),
            t('screens.checkout.missingAppleProduct'),
          );
          return;
        }

        result = await payWithApple({
          appleProductId: activeAppleProductId,
        });
      } else {
        void activeGoogleProductId;
        result = await payWithStripe(courseInfo.total);
      }

      await completePayment(result);
    } catch (error) {
      console.log('Payment error:', error);
      if (error?.code !== 'E_USER_CANCELLED') {
        Alert.alert(t('screens.checkout.errorTitle'), getIapErrorMessage(error));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const stepConfig = useMemo(
    () => [
      {
        headerTitle: 'screens.checkout.header',
        footerTitle: refreshing
          ? 'screens.checkout.processing'
          : Platform.OS === 'ios'
            ? 'screens.checkout.payWithApple'
            : 'screens.checkout.payWithStripe',
        content: <CourseSummary course={courseInfo} />,
      },
      {
        headerTitle: 'screens.checkout.recipient',
        footerTitle: 'screens.checkout.close',
        content: <ReceiptDetails course={courseInfo} receipt={receiptData} />,
      },
    ],
    [courseInfo, receiptData, refreshing],
  );

  const activeStep = stepConfig[currentStep];

  return (
    <ScreenWrapper
      headerUnScrollable={() => <Header title={activeStep.headerTitle} />}
      paddingHorizontal={0}
      footerUnScrollable={() => (
        <View style={styles.footerWrapper}>
          <CustomButton
            title={activeStep.footerTitle}
            onPress={onCheckoutPress}
            disabled={refreshing}
            backgroundColor={'#0298EF'}
            fontSize={20}
          />
        </View>
      )}>
      <View style={styles.container}>{activeStep.content}</View>
    </ScreenWrapper>
  );
};

const PriceRow = ({label, value, large = false}) => (
  <View style={styles.priceRow}>
    <CustomText
      label={label}
      fontFamily={fonts.jakartaMedium}
      fontSize={large ? 20 : 16}
      color={large ? '#1B1B24' : '#4F4F4F'}
    />
    <CustomText
      label={value}
      fontFamily={fonts.jakartaMedium}
      fontSize={large ? 20 : 16}
      color={'#1B1B24'}
      removeTranslation
    />
  </View>
);

const CourseInfoHeader = ({course}) => {
  const {t} = useTranslation();
  return (
    <>
    <View style={styles.courseInfoRow}>
      <ImageFast
        source={
          course.cover ? {uri: String(course.cover)} : Images.trendingpicture
        }
        style={styles.courseSummaryImage}
        resizeMode="cover"
      />
      <View style={styles.courseInfoText}>
        {!!course.tag && (
          <CustomText
            label={course.tag}
            fontFamily={fonts.jakartaBold}
            fontSize={11}
            color={'#0298EF'}
            removeTranslation
          />
        )}
        <CustomText
          label={course.title}
          numberOfLines={3}
          fontFamily={fonts.jakartaMedium}
          fontSize={20}
          color={'#1B1B24'}
          removeTranslation
        />
        {!!course.subtitle && (
          <CustomText
            label={course.subtitle}
            numberOfLines={3}
            fontFamily={fonts.jakartaRegular}
            fontSize={13}
            color={'#464555'}
            marginTop={4}
            removeTranslation
          />
        )}
        {course.lessonCount > 0 && (
          <CustomText
            label={t('screens.checkout.lessonsCount', {
              count: String(course.lessonCount).padStart(2, '0'),
            })}
            fontFamily={fonts.jakartaSemiBold}
            fontSize={12}
            color={'#64748B'}
            marginTop={6}
            removeTranslation
          />
        )}
      </View>
    </View>
    <CustomHorizontalLine color={'#EBEBEB'} />
    </>
  );
};

const CourseSummary = ({course}) => {
  return (
    <View style={styles.courseSummaryContainer}>
      <CustomText
        label="screens.checkout.courseSummary"
        fontFamily={fonts.jakartaMedium}
        fontSize={20}
        color={'#1B1B24'}
      />
      <CourseInfoHeader course={course} />
      <CustomText
        label="screens.checkout.priceBreakdown"
        fontFamily={fonts.jakartaMedium}
        fontSize={20}
        color={'#1B1B24'}
        marginTop={10}
      />
      <PriceRow
        label="screens.checkout.coursePrice"
        value={course.formattedCoursePrice}
      />
      <PriceRow label="screens.checkout.discount" value={course.formattedDiscount} />
      <PriceRow label="screens.checkout.fee" value={course.formattedFee} />
      <CustomHorizontalLine color={'#EBEBEB'} />
      <PriceRow label="screens.checkout.total" value={course.formattedTotal} large />
    </View>
  );
};

// const CoursePaymentMethod = () => {
//   const [paymentMethod, setPaymentMethod] = useState();
//   const toggleStripeSelection = () => {
//     setPaymentMethod(prevMethod =>
//       prevMethod === 'stripe' ? undefined : 'stripe',
//     );
//   };
//   return (
//     <View style={styles.courseSummaryContainer}>
//       <CustomText
//         label="Payment Method"
//         fontFamily={fonts.jakartaMedium}
//         fontSize={20}
//         color={'#1B1B24'}
//       />
//       <View
//         style={{
//           flexDirection: 'row',
//           gap: 10,
//           marginTop: 10,
//           justifyContent: 'space-between',
//           borderWidth: 1,
//           borderColor: '#EBEBEB',
//           padding: 10,
//           borderRadius: 10,
//         }}>
//         <View style={{flexDirection: 'row', gap: 10}}>
//           <ImageFast
//             source={Images.stripe}
//             style={{
//               width: 30,
//               height: 12,
//               resizeMode: 'cover',
//               marginTop: 10,
//             }}
//           />
//           <CustomText
//             label="Stripe"
//             fontFamily={fonts.regular}
//             fontSize={16}
//             color={'#060606'}
//           />
//         </View>
//         <CustomCheckBox
//           value={paymentMethod === 'stripe'}
//           onValueChange={toggleStripeSelection}
//           style={{marginTop: 8}}
//         />
//       </View>
//     </View>
//   );
// };

const ReceiptDetails = ({course, receipt}) => {
  const receiptRows = receipt
    ? [
        receipt.purchaseId && {
          label: 'screens.checkout.purchaseId',
          value: String(receipt.purchaseId),
        },
        receipt.paymentId && {
          label: 'screens.checkout.paymentId',
          value: String(receipt.paymentId),
        },
        receipt.paymentMethod && {
          label: 'screens.checkout.paymentMethod',
          value: receipt.paymentMethod,
        },
        receipt.userName && {label: 'screens.checkout.name', value: receipt.userName},
        receipt.amount && {label: 'screens.checkout.amountPaid', value: receipt.amount},
        receipt.time && {label: 'screens.checkout.date', value: receipt.time},
        receipt.message && {label: 'screens.checkout.status', value: receipt.message},
      ].filter(Boolean)
    : [];

  return (
    <View style={styles.courseSummaryContainer}>
      <CustomText
        label="screens.checkout.recipient"
        fontFamily={fonts.jakartaMedium}
        fontSize={20}
        color={'#1B1B24'}
      />
      <View style={{marginTop: 15}}>
        <CourseInfoHeader course={course} />
      </View>

      {receiptRows.length > 0 && (
        <>
          <CustomText
            label="screens.checkout.paymentDetails"
            fontFamily={fonts.jakartaMedium}
            fontSize={20}
            color={'#1B1B24'}
            marginTop={10}
          />
          {receiptRows.map(row => (
            <PriceRow key={row.label} label={row.label} value={row.value} />
          ))}
          <CustomHorizontalLine color={'#EBEBEB'} />
        </>
      )}

      <CustomText
        label="screens.checkout.priceBreakdown"
        fontFamily={fonts.jakartaMedium}
        fontSize={20}
        color={'#1B1B24'}
        marginTop={10}
      />
      <PriceRow
        label="screens.checkout.coursePrice"
        value={course.formattedCoursePrice}
      />
      <PriceRow label="screens.checkout.discount" value={course.formattedDiscount} />
      <PriceRow label="screens.checkout.fee" value={course.formattedFee} />
      <CustomHorizontalLine color={'#EBEBEB'} />
      <PriceRow label="screens.checkout.total" value={course.formattedTotal} large />
    </View>
  );
};

export default CourseCheckout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF8FF',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  footerWrapper: {
    margin: 20,
  },
  courseSummaryContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  courseSummaryImage: {
    width: 117,
    height: 117,
    borderRadius: 10,
  },
  courseInfoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  courseInfoText: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    justifyContent: 'space-between',
  },
});
