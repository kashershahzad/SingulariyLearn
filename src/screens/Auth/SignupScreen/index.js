import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { Images } from '../../../assets/images';
import ImageFast from '../../../components/ImageFast';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import { COLORS } from '../../../utils/COLORS';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import { useTranslation } from 'react-i18next';
import { ApiRequest } from '../../../services/ApiRequest';
import { useDispatch } from 'react-redux';
import { ToastMessage } from '../../../utils/ToastMessage'
import { setToken } from '../../../store/reducer/AuthConfig';

const signupSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is Required"),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'invalidPhone') // Allows numbers, +, -, spaces, parentheses
    .min(10, 'phoneMinLength')
    .max(15, 'phoneMaxLength')
    .required('phoneRequired'),
  email: yup
    .string()
    .email('invalidEmail')
    .required('emailRequired'),
  password: yup
    .string()
    .min(6, 'passwordMinLength')
    .required('passwordRequired'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'passwordsMustMatch')
    .required('confirmPasswordRequired'),
});

const SignupScreen = ({ navigation }) => {
  const [error, seterror] = useState('')
  const [success, setsuccess] = useState('')
  const [loading, setloading] = useState('')
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    try {
      setloading(true);
      const body = {
        name: values.name,
        phone: values.phone, // Add phone to API call
        type: 'register',
        email: values.email,
        reg_type: 'email',
        password: values.password,
      };

      const response = await ApiRequest(body);
      console.log('API Response:', response);

      if (response.data.result === 'false') {
        ToastMessage(response.data.message);
      } else {
        ToastMessage(response.data.message);
        const token = response.data?.user_id;
        dispatch(setToken(token));
        navigation.navigate('MainStack');
      }

      console.log(response.data.message);
      console.log('Form values:', values);
    } catch (error) {
      console.error('Registration failed:', error);
      ToastMessage('Something went wrong. Please try again.');
    } finally {
      setloading(false);
    }
  };

  return (
    <ScreenWrapper
      backgroundColor='white'
      scrollEnabled
      paddingHorizontal={20}
    >
      <ImageFast
        source={Images.leftarrow}
        resizeMode={'contain'}
        style={styles.icon}
        onPress={() => navigation.goBack()}
      />

      <CustomText
        label={t('welcomeBack')}
        fontFamily={fonts.semiBold}
        fontSize={28}
        marginTop={40}
      />

      <CustomText
        label={t('enterDetails')}
        fontFamily={fonts.medium}
        fontSize={16}
        color={COLORS.graytext}
      />

      <Formik
        initialValues={{
          name: '',
          phone: '', // Add phone to initial values
          email: '',
          password: '',
          confirmPassword: ''
        }}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched
        }) => (
          <>
            <CustomInput
              marginTop={15}
              placeholder={t('enterYourName')}
              placeholderTextColor={COLORS.graytext}
              borderRadius={10}
              borderColor={'#EFEFEF'}
              iconImage={Images.name}
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              error={touched.name && t(errors.name)}
            />

            <CustomInput
              marginTop={15}
              placeholder={t('phonePlaceholder')}
              placeholderTextColor={COLORS.graytext}
              borderRadius={10}
              borderColor={'#EFEFEF'}
              iconImage={Images.phone} // Make sure you have a phone icon
              value={values.phone}
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              error={touched.phone && t(errors.phone)}
              keyboardType="phone-pad" // Add keyboard type for better UX
            />

            <CustomInput
              marginTop={15}
              placeholder={t('emailPlaceholder')}
              placeholderTextColor={COLORS.graytext}
              borderRadius={10}
              borderColor={'#EFEFEF'}
              iconImage={Images.mail}
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email && t(errors.email)}
            />

            <CustomInput
              marginTop={15}
              placeholder={t('passwordPlaceholder')}
              placeholderTextColor={COLORS.graytext}
              borderRadius={10}
              borderColor={'#EFEFEF'}
              iconImage={Images.password}
              secureTextEntry
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={touched.password && t(errors.password)}
            />

            <CustomInput
              marginTop={15}
              placeholder={t('confirmPasswordPlaceholder')}
              placeholderTextColor={COLORS.graytext}
              borderRadius={10}
              borderColor={'#EFEFEF'}
              iconImage={Images.password}
              secureTextEntry
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              error={touched.confirmPassword && t(errors.confirmPassword)}
            />

            <CustomButton
              onPress={handleSubmit}
              title={t('signUpButton')}
              marginTop={13}
              height={52}
              backgroundColor={COLORS.primaryColor4}
            />
          </>
        )}
      </Formik>

      <View style={styles.row}>
        <CustomText
          label={t('alreadyHaveAccount')}
          fontFamily={fonts.medium}
          fontSize={16}
          color={COLORS.graytext}
          textAlign={'center'}
        />

        <CustomText
          onPress={() => navigation.navigate('LoginScreen')}
          label={t('signIn')}
          fontFamily={fonts.medium}
          fontSize={16}
          color={COLORS.primaryColor4}
          textAlign={'center'}
        />
      </View>
    </ScreenWrapper>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  icon: {
    height: 24,
    width: 24,
    marginTop: 70,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
    flex: 1,
    alignItems: 'flex-end'
  }
});