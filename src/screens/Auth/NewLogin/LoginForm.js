import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import {useTranslation} from 'react-i18next';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {useDispatch} from 'react-redux';
import {setToken} from '../../../store/reducer/AuthConfig';
import Loading from '../../../components/Loading';
import { getProfile } from '../../../utils/constants';

const LoginForm = ({navigation, onSwitchToSignup, onLoginSuccess}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const loginSchema = yup.object().shape({
    email: yup.string().email(t('invalidEmail')).required(t('emailRequired')),
    password: yup
      .string()
      .min(6, t('passwordMinLength'))
      .required(t('passwordRequired')),
  });

  const handleSubmit = async values => {
    setLoading(true);
    try {
      const body = {
        type: 'login',
        email: values.email,
        password: values.password,
      };

      const response = await ApiRequest(body);
      console.log( "login response", response);

      if (response.data.result === false) {
        ToastMessage('Invalid email or password. Please try again.');
      } else {
        ToastMessage(response.data.message);
        dispatch(setToken(response.data.user_id));
        dispatch(getProfile());
        onLoginSuccess?.();
      }
    } catch (error) {
      console.error('Login failed:', error);
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
        label="Sign In"
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
        initialValues={{email: '', password: ''}}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={{marginTop: 15}}>
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
              error={touched.email && errors.email}
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
              error={touched.password && errors.password}
            />

            <CustomText
              label={t('forgot_password')}
              color={'#0298EF'}
              fontSize={14}
              fontFamily={fonts.medium}
              onPress={() => navigation.navigate('ForgetPassword')}
              textAlign={'right'}
            />

            <LinearGradient
              colors={['#0298EF', '#1075B1']}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={styles.loginGradientBtn}>
              <CustomButton
                onPress={handleSubmit}
                title={
                  loading ? t('logging_in') || 'Logging in...' : t('login_button')
                }
                height={51}
                customStyle={styles.loginButtonTransparent}
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
                label="Don't have an account?"
                fontSize={16}
                fontFamily={fonts.medium}
                color={'#818181'}
              />
              <CustomText
                label="Sign Up"
                fontSize={16}
                fontFamily={fonts.medium}
                color={'#0298EF'}
                onPress={onSwitchToSignup || (() => navigation.navigate('SignupScreen'))}
              />
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default LoginForm;

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
