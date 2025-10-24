import {StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import React, {useState, useRef} from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import ScreenWrapper from '../../../components/ScreenWrapper';
import {Images} from '../../../assets/images';
import ImageFast from '../../../components/ImageFast';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {COLORS} from '../../../utils/COLORS';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import {useTranslation} from 'react-i18next';
import {ApiRequest} from '../../../services/ApiRequest';
import {useDispatch} from 'react-redux';
import {ToastMessage} from '../../../utils/ToastMessage';
import {setToken} from '../../../store/reducer/AuthConfig';
import CountryPhoneInput from '../../../components/CountryPhoneInput';

const signupSchema = yup.object().shape({
  firstName: yup.string().required('firstNameRequired'),
  lastName: yup.string().required('lastNameRequired'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'invalidPhone')
    .min(10, 'phoneMinLength')
    .max(15, 'phoneMaxLength')
    .required('phoneRequired'),
  email: yup.string().email('invalidEmail').required('emailRequired'),
  password: yup
    .string()
    .min(6, 'passwordMinLength')
    .required('passwordRequired'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'passwordsMustMatch')
    .required('confirmPasswordRequired'),
});

const SignupScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const {t} = useTranslation();
  const dispatch = useDispatch();
  
  // Create refs for input fields
  const lastNameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  
  // Ref for scroll view
  const scrollViewRef = useRef();

  const handleSubmit = async values => {
    try {
      setLoading(true);
      const body = {
        name: `${values.firstName} ${values.lastName}`,
        phone: values.phone,
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
    } catch (error) {
      console.error('Registration failed:', error);
      ToastMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to focus on next field and scroll to it
  const focusNextField = (nextRef, fieldName) => {
    if (nextRef && nextRef.current) {
      nextRef.current.focus();
      
      // Scroll to the field when keyboard opens
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: 200, // Adjust this value based on your layout
            animated: true
          });
        }
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenWrapper 
        backgroundColor="white" 
        scrollEnabled 
        paddingHorizontal={20} 
        paddingBottom={30}
        innerRef={scrollViewRef} // Pass ref to ScreenWrapper
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
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={signupSchema}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={false}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <>
              <View style={{flexDirection: 'row', gap: 10, marginTop: 15}}>
                <CustomInput
                  placeholder={t('firstNamePlaceholder')}
                  placeholderTextColor={COLORS.graytext}
                  borderRadius={10}
                  borderColor={'#EFEFEF'}
                  withLabel={t('firstName')}
                  value={values.firstName}
                  width={'48%'}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  error={touched.firstName && t(errors.firstName)}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(lastNameRef, 'lastName')}
                  autoFocus={true} // Auto focus on first field
                />
                <CustomInput
                  ref={lastNameRef}
                  placeholder={t('lastNamePlaceholder')}
                  placeholderTextColor={COLORS.graytext}
                  borderRadius={10}
                  borderColor={'#EFEFEF'}
                  withLabel={t('lastName')}
                  width={'48%'}
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  error={touched.lastName && t(errors.lastName)}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(emailRef, 'email')}
                />
              </View>

              <CustomInput
                ref={emailRef}
                withLabel={t('email')}
                placeholder={t('emailPlaceholder')}
                placeholderTextColor={COLORS.graytext}
                borderRadius={10}
                borderColor={'#EFEFEF'}
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && t(errors.email)}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => focusNextField(phoneRef, 'phone')}
              />

              <CountryPhoneInput
                ref={phoneRef}
                withLabel={t('phone')}
                value={values.phone}
                setValue={(formattedValue) => setFieldValue('phone', formattedValue)}
                onEndEditing={handleBlur('phone')}
                error={touched.phone && t(errors.phone)}
                onSubmitEditing={() => focusNextField(passwordRef, 'password')}
              />

              <CustomInput
                ref={passwordRef}
                withLabel={t('password')}
                placeholder={t('passwordPlaceholder')}
                placeholderTextColor={COLORS.graytext}
                borderRadius={10}
                borderColor={'#EFEFEF'}
                secureTextEntry
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && t(errors.password)}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => {
                  focusNextField(confirmPasswordRef, 'confirmPassword');
                  // Auto scroll to password field when focused
                  setTimeout(() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({
                        y: 300, // Adjust this value to scroll to password section
                        animated: true
                      });
                    }
                  }, 100);
                }}
                onFocus={() => {
                  // Scroll to password field when focused
                  setTimeout(() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({
                        y: 300, // Adjust this value based on your layout
                        animated: true
                      });
                    }
                  }, 100);
                }}
              />

              <CustomInput
                ref={confirmPasswordRef}
                withLabel={t('confirmPassword')}
                placeholder={t('confirmPasswordPlaceholder')}
                placeholderTextColor={COLORS.graytext}
                borderRadius={10}
                borderColor={'#EFEFEF'}
                secureTextEntry
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && t(errors.confirmPassword)}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                onFocus={() => {
                  // Scroll to confirm password field when focused
                  setTimeout(() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({
                        y: 350, // Adjust this value based on your layout
                        animated: true
                      });
                    }
                  }, 100);
                }}
              />

              <CustomButton
                onPress={handleSubmit}
                title={loading ? t('loading') : t('signUpButton')}
                marginTop={13}
                height={52}
                backgroundColor={COLORS.primaryColor4}
                disabled={loading}
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
            color={COLORS.btn}
            textAlign={'center'}
          />
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
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
    marginTop: 10,
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
    flex: 1,
    alignItems: 'flex-end',
    paddingBottom:5
  },
});