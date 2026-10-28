import {StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import CustomText from '../../../components/CustomText';
import OTPComponent from '../../../components/OTP';
import fonts from '../../../assets/fonts';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';

const SignupOTP = ({
  email,
  initialCode = '',
  initialExpiresIn = 300,
  onVerified,
  onChangeEmail,
}) => {
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [timer, setTimer] = useState(Math.min(59, Number(initialExpiresIn) || 59));
  const sentCodeRef = useRef(String(initialCode || '').trim());
  const expiresAtRef = useRef(
    Date.now() + (Number(initialExpiresIn) || 300) * 1000,
  );
  const verifyingRef = useRef(false);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (initialCode) {
      sentCodeRef.current = String(initialCode).trim();
      const expiresIn = Number(initialExpiresIn) || 300;
      expiresAtRef.current = Date.now() + expiresIn * 1000;
      setTimer(Math.min(59, expiresIn));
    }
  }, [initialCode, initialExpiresIn]);

  useEffect(() => {
    if (timer <= 0) {
      return;
    }
    const id = setTimeout(() => setTimer(prev => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const verifyOtpValue = useCallback(
    value => {
      if (verifyingRef.current || verifiedRef.current) {
        return;
      }
      if (String(value || '').length !== 4) {
        return;
      }

      if (!sentCodeRef.current) {
        ToastMessage('Please request OTP again');
        return;
      }

      if (expiresAtRef.current && Date.now() > expiresAtRef.current) {
        ToastMessage('OTP expired. Please resend code.');
        return;
      }

      verifyingRef.current = true;
      if (String(value) !== String(sentCodeRef.current)) {
        ToastMessage('Incorrect OTP code');
        verifyingRef.current = false;
        return;
      }

      verifiedRef.current = true;
      ToastMessage('OTP verified successfully!', 'success');
      onVerified?.();
      verifyingRef.current = false;
    },
    [onVerified],
  );

  const handleOtpChange = value => {
    const next = String(value || '').replace(/[^0-9]/g, '').slice(0, 4);
    setOtp(next);
    if (next.length === 4) {
      verifyOtpValue(next);
    }
  };

  const sendOtp = useCallback(async () => {
    if (!email) {
      ToastMessage('Email is required');
      return false;
    }

    setSending(true);
    try {
      const response = await ApiRequest({
        type: 'send_otp',
        email,
      });
      const data = response?.data || {};

      if (data.result !== true && data.result !== 'true') {
        ToastMessage(data.message || 'Failed to send OTP');
        return false;
      }

      const code = String(data.code || '').trim();
      if (!code) {
        ToastMessage('OTP code missing from server response');
        return false;
      }

      sentCodeRef.current = code;
      const expiresIn = Number(data.expires_in) || 300;
      expiresAtRef.current = Date.now() + expiresIn * 1000;
      setTimer(Math.min(59, expiresIn));
      setOtp('');
      verifiedRef.current = false;

      ToastMessage(data.message || 'OTP sent successfully', 'success');
      return true;
    } catch (error) {
      console.error('Signup resend OTP error:', error);
      ToastMessage('Failed to send OTP. Please try again.');
      return false;
    } finally {
      setSending(false);
    }
  }, [email]);

  const handleResend = async () => {
    if (timer > 0 || sending) {
      return;
    }
    await sendOtp();
  };

  return (
    <View style={styles.screen}>
      <CustomText
        label="Verify Email"
        marginTop={24}
        fontSize={30}
        fontFamily={fonts.semiBold}
        lineHeight={42}
      />
      <CustomText
        label={`Enter the verification code we just sent to ${email || 'your email'}.`}
        fontSize={16}
        fontFamily={fonts.regular}
        color="#929292"
        lineHeight={24}
        marginBottom={20}
        removeTranslation
      />

      <OTPComponent value={otp} setValue={handleOtpChange} />

      <View style={styles.resendRow}>
        <CustomText
          label={timer > 0 ? `Resend OTP in ${timer}s` : "Didn't receive code?"}
          fontSize={14}
          fontFamily={fonts.medium}
          color="#818181"
          removeTranslation
        />
        {timer <= 0 ? (
          <TouchableOpacity onPress={handleResend} disabled={sending}>
            <CustomText
              label=" Resend OTP"
              fontSize={14}
              fontFamily={fonts.medium}
              color="#0298EF"
              removeTranslation
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {onChangeEmail ? (
        <TouchableOpacity onPress={onChangeEmail} style={styles.backLink}>
          <CustomText
            label="Change email"
            fontSize={16}
            fontFamily={fonts.medium}
            color="#0298EF"
            textAlign="center"
            removeTranslation
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SignupOTP;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
});
