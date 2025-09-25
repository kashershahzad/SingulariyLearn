import { StyleSheet, View } from 'react-native';
import React from 'react';
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
import { ApiRequest } from '../../../services/ApiRequest'
import {ToastMessage} from '../../../utils/ToastMessage'


const ForgetPassword = ({ navigation }) => {
    const { t } = useTranslation();
    const loginSchema = yup.object().shape({
        email: yup
            .string()
            .email(t('invalidEmail'))
            .required(t('emailRequired')),
    });

    const handleSubmit = async (values) => {
        const body = {
            type: 'send_otp',
            email: values.email
        }
        const response = await ApiRequest(body)
        console.log(response)
        if(response.data.user_id === false){
         ToastMessage("Email not found")
        }else{
            navigation.navigate('OTPScreen',{code:response.data.code, user:response.data.user_id});
        }
        console.log('Login values:', values);
        
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
                label={t('Forget Password?')}
                fontFamily={fonts.semiBold}
                fontSize={28}
                marginTop={40}
            />

            <CustomText
                label={t('Enter your email to reset password')}
                fontFamily={fonts.medium}
                fontSize={16}
                color={COLORS.graytext}
            />

            <Formik
                initialValues={{ email: '' }}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
            >
                {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                }) => (
                    <>
                        <CustomInput
                            marginTop={15}
                            placeholder={t('email_placeholder')}
                            placeholderTextColor={COLORS.graytext}
                            borderRadius={10}
                            borderColor={'#EFEFEF'}
                            iconImage={Images.mail}
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            error={touched.email && errors.email}
                        />

                        <CustomButton
                            onPress={handleSubmit}
                            title={t('Submit')}
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

export default ForgetPassword;

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