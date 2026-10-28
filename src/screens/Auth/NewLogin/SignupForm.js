import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {Formik} from 'formik';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import CountryPhoneInput from '../../../components/CountryPhoneInput';
import {useTranslation} from 'react-i18next';
import {ToastMessage} from '../../../utils/ToastMessage';
import {ApiRequest} from '../../../services/ApiRequest';
import Loading from '../../../components/Loading';

const SignupForm = ({onSwitchToLogin, onNext, initialValues}) => {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const formInitialValues = {
    firstName: initialValues?.first_name || '',
    lastName: initialValues?.last_name || '',
    phone: initialValues?.phone || '',
    email: initialValues?.email || '',
    password: initialValues?.password || '',
    confirmPassword: initialValues?.password || '',
  };

  const handleSubmit = async values => {
    if (values.password !== values.confirmPassword) {
      ToastMessage(t('passwordsMustMatch') || 'Passwords do not match');
      return;
    }

    const email = values.email.trim();
    if (!email) {
      ToastMessage(t('emailRequired') || 'Email is required');
      return;
    }

    setLoading(true);
    try {
      const body = {
        type: 'check_email',
        email,
      };

      const response = await ApiRequest(body);
      const data = response.data;

      const emailExists =
        data.exists === true ||
        data.email_exists === 1 ||
        data.available === 0;

      if (emailExists) {
        ToastMessage(
          data.message ||
            t('emailAlreadyExists') ||
            'Email is already registered',
        );
        return;
      }

      onNext?.({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email,
        phone: values.phone || '',
        password: values.password,
      });
    } catch (error) {
      console.error('Email check failed:', error);
      ToastMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View>
      <CustomText
        label="Sign Up"
        marginTop={24}
        fontSize={30}
        fontFamily={fonts.semiBold}
        lineHeight={42}
      />
      <CustomText
        label="Enter Your Details Below"
        fontSize={16}
        fontFamily={fonts.regular}
        color={'#929292'}
      />

      <Formik
        enableReinitialize
        initialValues={formInitialValues}
        onSubmit={handleSubmit}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          setFieldValue,
        }) => (
          <View style={{marginTop: 15}}>
            <View style={{flexDirection: 'row', gap: 10}}>
              <CustomInput
                withLabel={t('firstName')}
                labelColor={'#474747'}
                placeholder={t('firstNamePlaceholder')}
                placeholderTextColor={'#777777'}
                borderRadius={10}
                borderColor={'#EFEFEF'}
                width={'48%'}
                value={values.firstName}
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
              />
              <CustomInput
                withLabel={t('lastName')}
                labelColor={'#474747'}
                placeholder={t('lastNamePlaceholder')}
                placeholderTextColor={'#777777'}
                borderRadius={10}
                borderColor={'#EFEFEF'}
                width={'48%'}
                value={values.lastName}
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
              />
            </View>

            <CustomInput
              withLabel={t('email')}
              labelColor={'#474747'}
              placeholder={t('email_placeholder')}
              placeholderTextColor={'#777777'}
              borderRadius={10}
              borderColor={'#EFEFEF'}
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CountryPhoneInput
              withLabel={t('phone')}
              value={values.phone}
              setValue={formattedValue =>
                setFieldValue('phone', formattedValue)
              }
              onEndEditing={handleBlur('phone')}
            />

            <CustomInput
              withLabel={t('password')}
              labelColor={'#474747'}
              placeholder={t('password_placeholder')}
              placeholderTextColor={'#777777'}
              borderRadius={10}
              borderColor={'#EFEFEF'}
              secureTextEntry
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              autoCapitalize="none"
            />

            <CustomInput
              withLabel={t('confirmPassword')}
              labelColor={'#474747'}
              placeholder={t('confirmPasswordPlaceholder')}
              placeholderTextColor={'#777777'}
              borderRadius={10}
              borderColor={'#EFEFEF'}
              secureTextEntry
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              autoCapitalize="none"
            />

            <LinearGradient
              colors={['#0298EF', '#1075B1']}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={styles.loginGradientBtn}>
              <CustomButton
                onPress={handleSubmit}
                title={loading ? t('loading') || 'Loading...' : 'Next'}
                height={51}
                customStyle={styles.loginButtonTransparent}
                disabled={loading}
              />
            </LinearGradient>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
                marginTop: 5,
              }}>
              <CustomText
                label={t('alreadyHaveAccount')}
                fontSize={16}
                fontFamily={fonts.medium}
                color={'#818181'}
              />
              <CustomText
                label="Sign In"
                fontSize={16}
                fontFamily={fonts.medium}
                color={'#0298EF'}
                onPress={onSwitchToLogin}
              />
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default SignupForm;

const styles = StyleSheet.create({
  loginGradientBtn: {
    marginTop: 13,
    borderRadius: 10,
    overflow: 'hidden',
  },
  loginButtonTransparent: {
    backgroundColor: 'transparent',
  },
});
