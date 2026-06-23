import {StyleSheet, View, Alert, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {useTranslation} from 'react-i18next';

const HelpAndSupport = () => {
  const {t} = useTranslation();
  const token = useSelector(state => state.authConfig.token);
  console.log("token", token);
  const userData = useSelector(state => state.users.userData);
  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert(
        t('screens.helpSupport.missingFieldsTitle'),
        t('screens.helpSupport.missingFieldsBody'),
      );
      return;
    }

    if (!token) {
      ToastMessage(t('screens.helpSupport.loginRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      const body = {
        type: 'add_data',
        table_name: 'contact_us',
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        user_id: String(token),
      };

      const response = await ApiRequest(body);

      if (response?.data?.result === false || response?.data?.result === 'false') {
        ToastMessage(
          response?.data?.message || t('screens.helpSupport.sendFailed'),
          'error',
        );
        return;
      }

      ToastMessage(
        response?.data?.message || t('screens.helpSupport.thankYou'),
        'success',
      );
      setMessage('');
    } catch (error) {
      console.error('Contact us error:', error);
      ToastMessage(t('screens.helpSupport.genericError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      headerUnScrollable={() => <Header2 title="screens.helpSupport.header" />}
      footerUnScrollable={() => (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSend}
            disabled={loading}>
            <LinearGradient
              colors={['#0298EF', '#015789']}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={[
                styles.footerGradientButton,
                loading && styles.footerDisabled,
              ]}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <CustomText
                  label="screens.helpSupport.send"
                  fontSize={20}
                  fontFamily={fonts.jakartaMedium}
                  color="#FFFFFF"
                  lineHeight={30}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}>
      <View style={styles.container}>
        <CustomText
          label="screens.helpSupport.name"
          fontSize={14}
          fontFamily={fonts.jakartaMedium}
          color="#464555"
          marginBottom={6}
        />
        <CustomInput
          placeholder={t('screens.helpSupport.name')}
          value={name}
          onChangeText={setName}
          placeholderTextColor={COLORS.graytext}
          bgcolor="#FFFFFF"
          borderColor="#EBEBEB"
          borderRadius={10}
          height={52}
          marginBottom={18}
        />
        <CustomText
          label="screens.helpSupport.email"
          fontSize={14}
          fontFamily={fonts.jakartaMedium}
          color="#464555"
          marginBottom={6}
        />
        <CustomInput
          placeholder={t('screens.helpSupport.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.graytext}
          bgcolor="#FFFFFF"
          borderColor="#EBEBEB"
          borderRadius={10}
          height={52}
          marginBottom={18}
        />
        <CustomText
          label="screens.helpSupport.message"
          fontSize={14}
          fontFamily={fonts.jakartaMedium}
          color="#464555"
          marginBottom={6}
        />
        <CustomInput
          placeholder={t('screens.helpSupport.message')}
          value={message}
          onChangeText={setMessage}
          multiline
          height={160}
          textAlignVertical="top"
          placeholderTextColor={COLORS.graytext}
          bgcolor="#FFFFFF"
          borderColor="#EBEBEB"
          borderRadius={10}
          marginBottom={18}
        />
      </View>
    </ScreenWrapper>
  );
};

export default HelpAndSupport;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 24,
    backgroundColor: '#FCF8FF',
    flex: 1,
  },
  footerGradientButton: {
    height: 51,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  footerDisabled: {
    opacity: 0.7,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: '#FCF8FF',
  },
});
