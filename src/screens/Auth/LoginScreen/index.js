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
import { ToastMessage } from '../../../utils/ToastMessage'
import { useDispatch } from 'react-redux';
import { setToken } from '../../../store/reducer/AuthConfig';
import Loading from '../../../components/Loading'

const LoginScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const loginSchema = yup.object().shape({
        email: yup
            .string()
            .email(t('invalidEmail'))
            .required(t('emailRequired')),
        password: yup
            .string()
            .min(6, t('passwordMinLength'))
            .required(t('passwordRequired')),
    });

    const handleSubmit = async (values) => {
        setLoading(true); 
        
        try {
            const body = {
                type: 'login',
                email: values.email,
                password: values.password,
            };

            const response = await ApiRequest(body);
            console.log('Login values:', values);
            console.log('Response:', response);
            console.log('result:', response.data.result);

            if (response.data.result === false) {
                ToastMessage("Invalid email or password. Please try again.");
            } else {
                ToastMessage(response.data.message);
                dispatch(setToken(response.data.user_id))
                navigation.navigate('MainStack');
            }
        } catch (error) {
            console.error('Login failed:', error);
            ToastMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false); // Stop loading in all cases
        }
    };

    // Return loading component if loading is true
    if (loading) {
        return <Loading />;
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
                label={t('welcome_back')}
                fontFamily={fonts.semiBold}
                fontSize={28}
                marginTop={40}
            />

            <CustomText
                label={t('enter_details')}
                fontFamily={fonts.medium}
                fontSize={16}
                color={COLORS.graytext}
            />

            <Formik
                initialValues={{ email: '', password: '' }}
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
                    isValid,
                    dirty,
                    isSubmitting
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

                        <CustomInput
                            placeholder={t('password_placeholder')}
                            placeholderTextColor={COLORS.graytext}
                            borderRadius={10}
                            borderColor={'#EFEFEF'}
                            iconImage={Images.password}
                            secureTextEntry
                            value={values.password}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            error={touched.password && errors.password}
                        />

                        <CustomText
                            label={t('forgot_password')}
                            color={'#828282'}
                            fontSize={14}
                            onPress={() => navigation.navigate('ForgetPassword')}
                            textAlign={'right'}
                        />

                        <CustomButton
                            onPress={handleSubmit}
                            title={loading ? t('logging_in') || 'Logging in...' : t('login_button')}
                            marginTop={13}
                            height={52}
                            backgroundColor={COLORS.btn}
                        />
                    </>
                )}
            </Formik>

            <View style={styles.row}>
                <CustomText
                    label={t('no_account')}
                    fontFamily={fonts.medium}
                    fontSize={16}
                    color={COLORS.graytext}
                    textAlign={'center'}
                />

                <CustomText
                    onPress={() => !loading && navigation.navigate('SignupScreen')}
                    label={t('sign_up')}
                    fontFamily={fonts.medium}
                    fontSize={16}
                    color={COLORS.btn}
                    textAlign={'center'}
                />
            </View>
        </ScreenWrapper>
    );
};

export default LoginScreen;

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