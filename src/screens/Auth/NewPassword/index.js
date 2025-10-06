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
import { setToken } from '../../../store/reducer/AuthConfig';
import { ToastMessage } from '../../../utils/ToastMessage';

const signupSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, 'passwordMinLength')
    .required('passwordRequired'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'passwordsMustMatch')
    .required('confirmPasswordRequired'),
});

const Newpassword = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = route.params?.user

  const handlesubmit = async (values) => {
    try {
      const body = {
        type: 'update_password',
        user_id: user,
        password: values.password
      }
      console.log(user, values.password)
      const response = await ApiRequest(body)
      console.log(response)
      if(response.data.result === true){
        ToastMessage(t('passwordChanged'), 'success')
        navigation.replace("LoginScreen")
      } else {
        ToastMessage(t('credentialsMissing'), 'error')
      }
    } catch {
      ToastMessage(t('somethingWentWrong'), 'error')
    }
  }

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
        label={t('New Password')}
        fontFamily={fonts.semiBold}
        fontSize={28}
        marginTop={40}
      />

      <CustomText
        label={t('Enter your new Password')}
        fontFamily={fonts.medium}
        fontSize={16}
        color={COLORS.graytext}
      />

      <Formik
        initialValues={{
          password: '',
          confirmPassword: ''
        }}
        validationSchema={signupSchema}
        onSubmit={handlesubmit}
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
              placeholder={t('passwordPlaceholder')}
              placeholderTextColor={COLORS.graytext}
              borderRadius={10}
              borderColor={'#EFEFEF'}
              iconImage={Images.password}
              secureTextEntry
              value={values.password}
              marginTop={15}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={touched.password && t(errors.password)}
            />

            <CustomInput
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
              title={t('Change password')}
              marginTop={13}
              height={52}
              backgroundColor={COLORS.primaryColor4}
            />
          </>
        )}
      </Formik>
    </ScreenWrapper>
  );
};

export default Newpassword;

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