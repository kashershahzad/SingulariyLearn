import {Platform} from 'react-native';
import {ApiRequest} from '../services/ApiRequest';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';

export const getAppleProductId = ({appleProductId} = {}) =>
  String(appleProductId || '').trim();

export const getGoogleProductId = ({googleProductId} = {}) =>
  String(googleProductId || '').trim();

const toPurchaseResult = (purchase, paymentMethod) => ({
  paymentId: purchase?.transactionId || purchase?.transactionReceipt || '',
  paymentMethod,
  receipt: purchase?.transactionReceipt || purchase?.purchaseToken || '',
  productId: purchase?.productId || '',
});

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

/**
 * iOS IAP:
 * - productId comes from backend/admin (apple_product_id)
 * - getProducts is NOT a backend call — react-native-iap StoreKit requires it
 *   to cache the SKProduct before requestPurchase, otherwise "Invalid product ID"
 * - IAP is required only when buying, so Android startup does not load it
 */
export const payWithApple = ({appleProductId} = {}) =>
  new Promise(async (resolve, reject) => {
    const {
      initConnection,
      getProducts,
      requestPurchase,
      finishTransaction,
      purchaseUpdatedListener,
      purchaseErrorListener,
    } = require('react-native-iap');

    const productId = getAppleProductId({appleProductId});
    console.log('IAP productId from backend:', productId);

    if (!productId) {
      const error = new Error('MISSING_APPLE_PRODUCT_ID');
      error.code = 'MISSING_APPLE_PRODUCT_ID';
      reject(error);
      return;
    }

    let purchaseSub;
    let errorSub;
    let settled = false;

    const cleanup = () => {
      purchaseSub?.remove?.();
      errorSub?.remove?.();
    };

    const settle = (handler, value) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      handler(value);
    };

    const finishAndResolve = async purchase => {
      try {
        await finishTransaction({purchase, isConsumable: false});
      } catch (error) {
        console.log('finishTransaction error:', error);
      }

      return toPurchaseResult(purchase, 'apple_iap');
    };

    try {
      await initConnection();

      purchaseSub = purchaseUpdatedListener(async purchase => {
        if (purchase?.productId && purchase.productId !== productId) {
          return;
        }

        try {
          const result = await finishAndResolve(purchase);
          settle(resolve, result);
        } catch (error) {
          settle(reject, error);
        }
      });

      errorSub = purchaseErrorListener(error => {
        settle(reject, error);
      });

      // Required by StoreKit / react-native-iap native cache (not backend)
      await getProducts({skus: [productId]});

      await requestPurchase({
        sku: productId,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });
    } catch (error) {
      settle(reject, error);
    }
  });

export const payForCourse = async ({
  amount,
  appleProductId,
  googleProductId,
}) => {
  if (Platform.OS === 'ios') {
    return payWithApple({appleProductId});
  }

  void googleProductId;
  return payWithStripe(amount);
};
