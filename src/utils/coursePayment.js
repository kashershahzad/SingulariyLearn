import {Platform} from 'react-native';
import {ApiRequest} from '../services/ApiRequest';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {
  initConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from 'react-native-iap';

export const getAppleProductId = ({courseId, appleProductId} = {}) => {
  const fromCourse = String(appleProductId || '').trim();
  if (fromCourse) {
    return fromCourse;
  }

  if (courseId) {
    return `course_${courseId}`;
  }

  return '';
};

export const getGoogleProductId = ({courseId, googleProductId} = {}) => {
  const fromCourse = String(googleProductId || '').trim();
  if (fromCourse) {
    return fromCourse;
  }

  if (courseId) {
    return `course_${courseId}`;
  }

  return '';
};

export const payWithStripe = async amount => {
  const response = await ApiRequest({
    type: 'payment_intent',
    amount,
  });

  const result = response.data.result;
  const {customer, ephemeralKey, paymentIntent, paymentIntent_id} = result;

  const {error: initError} = await initPaymentSheet({
    customerId: customer,
    customerEphemeralKeySecret: ephemeralKey,
    paymentIntentClientSecret: paymentIntent,
    merchantDisplayName: 'Dvm Permit Test',
    allowsDelayedPaymentMethods: false,
  });

  if (initError) {
    throw initError;
  }

  const {error: payError} = await presentPaymentSheet();
  if (payError) {
    throw payError;
  }

  return {
    paymentId: paymentIntent_id,
    paymentMethod: 'stripe',
  };
};

export const payWithApple = ({courseId, appleProductId} = {}) =>
  new Promise(async (resolve, reject) => {
    const productId = getAppleProductId({courseId, appleProductId});
   console.log('productId', productId);
   console.log('appleProductId', appleProductId);
   console.log('courseId', courseId);
    if (!productId) {
      reject(new Error('Apple product ID is not configured for this course'));
      return;
    }

    const purchaseSub = purchaseUpdatedListener(async purchase => {
      purchaseSub.remove();
      errorSub.remove();

      try {
        await finishTransaction({purchase, isConsumable: false});
        resolve({
          paymentId: purchase.transactionId,
          paymentMethod: 'apple_iap',
        });
      } catch (error) {
        reject(error);
      }
    });

    const errorSub = purchaseErrorListener(error => {
      purchaseSub.remove();
      errorSub.remove();
      reject(error);
    });

    try {
      await initConnection();
      const products = await getProducts({skus: [productId]});

      if (!products?.length) {
        purchaseSub.remove();
        errorSub.remove();
        reject(new Error('Course not found on App Store'));
        return;
      }

      await requestPurchase({sku: productId});
    } catch (error) {
      purchaseSub.remove();
      errorSub.remove();
      reject(error);
    }
  });

export const payForCourse = async ({
  amount,
  courseId,
  appleProductId,
  googleProductId,
}) => {
  if (Platform.OS === 'ios') {
    return payWithApple({courseId, appleProductId});
  }

  // Android Play Billing can use googleProductId when enabled.
  void googleProductId;

  return payWithStripe(amount);
};
