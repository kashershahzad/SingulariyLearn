import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, Keyboard, StyleSheet, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import ScreenWrapper from '../../../components/ScreenWrapper';
import SuccessModal from '../../../components/SuccessModal';
import CustomButton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import OTPComponent from '../../../components/OTP';
import { Images } from '../../../assets/images';
import ImageFast from '../../../components/ImageFast';
import { setUserData } from '../../../store/reducer/usersSlice';
import { setToken } from '../../../store/reducer/AuthConfig';
import { ToastMessage } from '../../../utils/ToastMessage';
import { post } from '../../../services/ApiRequest';
import { COLORS } from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import { useTranslation } from 'react-i18next';
import { ApiRequest } from '../../../services/ApiRequest';

const OTPScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = route.params?.user;
  const code = route.params?.code;

  const [isResetModal, setResetModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [otp, setOtp] = useState('');

  const handleSubmit = async () => {
    if (otp.length !== 4) {
      ToastMessage("Please enter a valid 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const body = {
        type: 'verify_otp',
        code: otp, 
        user_id: user
      }
      
      console.log("values:", code, user, otp);
      const response = await ApiRequest(body);
      console.log("API Response:", response);
      if (response.data.result===true) {
        ToastMessage("OTP verified successfully!");
        navigation.navigate("Newpassword",{user: user});
      } else {
        ToastMessage( "Incorrect OTP code");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      ToastMessage("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenWrapper
      scrollEnabled
      footerUnScrollable={() => (
        <View style={{ paddingHorizontal: 20 }}>
          <CustomButton
            title="Verify"
            marginTop={40}
            marginBottom={20}
            loading={loading}
            disabled={otp.length !== 4}
            onPress={handleSubmit}
            testID="verify-button" // Add for testing
          />
        </View>
      )}>
      <ImageFast
        source={Images.leftarrow}
        resizeMode={'contain'}
        style={styles.icon}
        onPress={() => navigation.goBack()}
      />
      <CustomText
        label={t('Verify Email')}
        fontFamily={fonts.semiBold}
        fontSize={28}
        marginTop={40}
      />
      <CustomText
        label={t('Enter the verification code we just sent on your email address.')}
        fontFamily={fonts.medium}
        fontSize={16}
        color={COLORS.graytext}
        marginBottom={20}
      />
      <OTPComponent value={otp} setValue={setOtp} />
    </ScreenWrapper>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
  },
  backIcon: {
    width: 35,
    height: 35,
    backgroundColor: COLORS.back,
    elevation: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 25,
    marginTop: 25,
  },
  icon: {
    height: 24,
    width: 24,
    marginTop: 70,
  },
});