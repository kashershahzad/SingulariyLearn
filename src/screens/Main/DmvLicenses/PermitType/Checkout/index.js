import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import React, {useState, useEffect} from 'react';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import Header2 from '../../Molecules/Header2';
import CustomText from '../../../../../components/CustomText';
import fonts from '../../../../../assets/fonts';
import CustomHorizontalLine from '../../../../../components/CustomHorizontalLine';
import CustomButton from '../../../../../components/CustomButton';
import {COLORS} from '../../../../../utils/COLORS';
import {useTranslation} from 'react-i18next';
import {ApiRequest} from '../../../../../services/ApiRequest';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {useDispatch} from 'react-redux';
import {setPackage} from '../../../../../store/reducer/Packages';
import { useSelector } from 'react-redux';

const Checkout = ({route, navigation}) => {
  const {selectedPackage} = route.params;
  const {permit_id} =route.params
  const {title, price, description, vehicle, duration ,id} = selectedPackage;
  const {t} = useTranslation();
  const numericPrice = parseInt(price.replace(/\D/g, ''), 10);
  const [refreshing, setRefreshing] = useState();
  const dispatch = useDispatch();
  const token = useSelector(state => state.authConfig.token);
  const total = parseInt(price.replace(/\D/g, '')) + 20

  const openPaymentSheet = async paymentId => {
    const {error} = await presentPaymentSheet();
    setRefreshing(false);

    if (error) {
    //   Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      console.log('paymentId---->', paymentId);
      completePayment(paymentId);
    //   Alert.alert('Success', 'Your payment is confirmed!');
    }
  };

  const onPayPress = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      const body = {
        type: 'payment_intent',
        amount: total
      };

      const response = await ApiRequest(body);

      console.log('Payment Intent Response:', response.data.result);

      const result = response.data.result;
      console.log('Payment Intent Result:', result);

      const {customer, ephemeralKey, paymentIntent, paymentIntent_id} = result;

      const {error} = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'Dvm Permit Test',
        allowsDelayedPaymentMethods: false,
      });

      if (error) {
        setRefreshing(false);
      } else {
        openPaymentSheet(paymentIntent_id);
      }
    } catch (error) {
      setRefreshing(false);
      console.log('Payment error:', error);
    }
  };
const completePayment = async paymentId => {
  console.log('Payment completed:', paymentId);
  try {
    const body = {
      type: 'add_data',
      table_name: 'purchases',
      pi_id: paymentId,
      package_id: id,
      permit_id: permit_id,
      amount :total,
      user_id:token
    };
    console.log(body)
    const response = await ApiRequest(body);
    console.log('Purchases response:', response);

    if (response?.data?.message === 'Added Successfully') {
      dispatch(setPackage(true));
      navigation.replace('Recipient', {id: response.data.id});
    } else {
    //   Alert.alert('Error', 'Payment Failed');
    }
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Something went wrong');
  }
};

  return (
    <ScreenWrapper
      paddingBottom={20}
      headerUnScrollable={() => <Header2 title={'Checkout'} />}
      footerUnScrollable={() => (
        <View style={{marginHorizontal: 16}}>
          <CustomButton
            onPress={onPayPress}
            title={'Pay'}
            marginTop={53}
            height={62}
            borderRadius={10}
            backgroundColor={COLORS.primaryColor4}
            fontSize={20}
            fontFamily={fonts.jakartaSemiBold}
          />
        </View>
      )}>
      <View style={styles.container}>
        <View style={styles.head}>
          <CustomText
            label={title}
            fontFamily={fonts.medium}
            fontSize={16}
            color={'white'}
          />
          <CustomText
            color={'white'}
            label={price}
            fontFamily={fonts.semiBold}
            fontSize={20}
          />
        </View>
        <CustomText
          label={description}
          fontFamily={fonts.medium}
          fontSize={12}
          color={'white'}
        />

        <View style={styles.head}>
          <CustomText
            marginTop={5}
            label={t('vehiclesText')}
            fontFamily={fonts.regular}
            fontSize={12}
            color={'white'}
          />

          <CustomText
            marginTop={5}
            label={vehicle}
            fontFamily={fonts.regular}
            fontSize={12}
            color={'white'}
          />
        </View>

        <View style={styles.head}>
          <CustomText
            marginTop={5}
            label={t('durationText')}
            fontFamily={fonts.regular}
            fontSize={12}
            color={'white'}
          />
          <CustomText
            marginTop={5}
            label={duration}
            fontFamily={fonts.regular}
            fontSize={12}
            color={'white'}
          />
        </View>
      </View>
      {/* <CustomHorizontalLine /> */}
      {/* <View style={styles.head}>
        <CustomText
          marginTop={5}
          label={t('idText')}
          fontFamily={fonts.regular}
          fontSize={14}
        />
        <CustomText
          marginTop={5}
          label={'#3748934'}
          fontFamily={fonts.regular}
          fontSize={14}
        />
      </View> */}

      <CustomHorizontalLine />
      <View style={styles.head}>
        <CustomText
          marginTop={5}
          label={t('feeText')}
          fontFamily={fonts.regular}
          fontSize={14}
        />
        <CustomText
          marginTop={5}
          label={'$20'}
          fontFamily={fonts.regular}
          fontSize={14}
        />
      </View>

      <CustomHorizontalLine />
      <View style={styles.head}>
        <CustomText
          marginTop={5}
          label={t('totalText')}
          fontFamily={fonts.regular}
          fontSize={14}
        />
        <CustomText
          marginTop={5}
          label={"$"+total}
          fontFamily={fonts.regular}
          fontSize={14}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: {
    height: 185,
    borderColor: '#E3E3E3',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#ED7D20',
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
