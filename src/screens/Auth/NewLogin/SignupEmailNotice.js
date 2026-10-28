import {StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../../components/CustomText';
import CustomButton from '../../../components/CustomButton';
import Icons from '../../../components/Icons';
import fonts from '../../../assets/fonts';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import Loading from '../../../components/Loading';

const SignupEmailNotice = ({email, onOtpSent, onChangeEmail}) => {
  const [sending, setSending] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      ToastMessage('Email is required');
      return;
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
        return;
      }

      const code = String(data.code || '').trim();
      if (!code) {
        ToastMessage('OTP code missing from server response');
        return;
      }

      ToastMessage(data.message || 'OTP sent successfully', 'success');
      onOtpSent?.({
        code,
        expiresIn: Number(data.expires_in) || 300,
        email: data.email || email,
      });
    } catch (error) {
      console.error('Signup send OTP error:', error);
      ToastMessage('Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sending) {
    return <Loading />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.iconWrap}>
        <Icons family="Ionicons" name="mail-outline" size={36} color="#0298EF" />
      </View>

      <CustomText
        label="Check your email"
        marginTop={20}
        fontSize={30}
        fontFamily={fonts.semiBold}
        lineHeight={42}
        textAlign="center"
        removeTranslation
      />
      <CustomText
        label="We will send a 4-digit verification code to your email. Please check your inbox (and spam folder)."
        fontSize={16}
        fontFamily={fonts.regular}
        color="#929292"
        lineHeight={24}
        marginTop={8}
        textAlign="center"
        removeTranslation
      />

      <View style={styles.emailCard}>
        <CustomText
          label="Email"
          fontSize={12}
          fontFamily={fonts.medium}
          color="#818181"
          removeTranslation
        />
        <CustomText
          label={email || ''}
          fontSize={16}
          fontFamily={fonts.semiBold}
          color="#0F172A"
          marginTop={4}
          removeTranslation
        />
      </View>

      <LinearGradient
        colors={['#0298EF', '#1075B1']}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.sendBtn}>
        <CustomButton
          onPress={handleSendOtp}
          title="Send OTP"
          height={51}
          customStyle={styles.transparentBtn}
          disabled={sending}
        />
      </LinearGradient>

      <TouchableOpacity onPress={onChangeEmail} style={styles.changeEmailBtn}>
        <CustomText
          label="Change email"
          fontSize={16}
          fontFamily={fonts.medium}
          color="#0298EF"
          textAlign="center"
          removeTranslation
        />
      </TouchableOpacity>
    </View>
  );
};

export default SignupEmailNotice;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  iconWrap: {
    marginTop: 24,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F4FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailCard: {
    marginTop: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sendBtn: {
    marginTop: 24,
    borderRadius: 10,
    overflow: 'hidden',
  },
  transparentBtn: {
    backgroundColor: 'transparent',
  },
  changeEmailBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
});
