import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import Header2 from '../../DmvLicenses/Molecules/Header2'
import CustomInput from '../../../../components/CustomInput'
import { COLORS } from '../../../../utils/COLORS'
import CustomButton from '../../../../components/CustomButton'
import fonts from '../../../../assets/fonts'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useSelector } from 'react-redux'
import { ApiRequest } from '../../../../services/ApiRequest'
import CustomText from '../../../../components/CustomText'

const HelpCenter = () => {
    const token = useSelector(state => state.authConfig.token)
    const { t } = useTranslation();
    const [error, seterror] = useState('')
    const [success, setsuccess] = useState('')
    const [loading, setloading] = useState('')

    const validationSchema = Yup.object().shape({
        subject: Yup.string()
            .required(t('subjectRequired')),
        message: Yup.string()
            .required(t('messageRequired'))
    })

    const handleSubmit = async (values) => {
        setloading(true)
        const body = {
            type: 'add_data',
            user_id: token,
            table_name: 'contact_us',
            subject: values.subject,
            message: values.message,
        }
        const response = await ApiRequest(body);
        console.log('API Response:', response);
        if (response.data.result === 'false') {
            seterror(response.data.message)
        }
        else {
            setsuccess(response.data.message)
            values.subject = '';
            values.message = '';
        }
        console.log(response.data.message)
        console.log('Form values:', values);
        setloading(false)
    }

    return (
        <ScreenWrapper
            backgroundColor='white'
            statusBarColor='white'
            headerUnScrollable={() => (<Header2 line={true} title={t('helpCenter')} />)}>
            <View style={styles.container}>
                <Formik
                    validationSchema={validationSchema}
                    initialValues={{ subject: '', message: '' }}
                    onSubmit={handleSubmit}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <>
                            <CustomInput
                                placeholder={t('Subject')}
                                placeholderTextColor={COLORS.graytext}
                                borderRadius={10}
                                borderColor={'#EFEFEF'}
                                value={values.subject}
                                bgcolor='#FBFBFB'
                                error={touched.subject && errors.subject ? errors.subject : ''}
                                onChangeText={handleChange('subject')}
                                onBlur={handleBlur('subject')}
                            />
                            <CustomInput
                                placeholder={t('message')}
                                placeholderTextColor={COLORS.graytext}
                                borderRadius={10}
                                borderColor={'#EFEFEF'}
                                value={values.message}
                                bgcolor='#FBFBFB'
                                onChangeText={handleChange('message')}
                                onBlur={handleBlur('message')}
                                multiline={true}
                                error={touched.message && errors.message ? errors.message : ''}
                                height={142}
                            />

                            <CustomButton
                                title={t('send')}
                                marginTop={30}
                                marginBottom={20}
                                height={62}
                                borderRadius={10}
                                backgroundColor={COLORS.btn}
                                fontSize={16}
                                fontFamily={fonts.jakartaSemiBold}
                                onPress={handleSubmit}
                            />
                        </>
                    )}
                </Formik>
                {
                    loading ? <CustomText
                        label={'loading...'}
                        fontFamily={fonts.medium}
                        fontSize={16}
                        color={COLORS.graytext}
                        textAlign={'center'}
                    /> : <CustomText
                        label={error || success}
                        fontFamily={fonts.medium}
                        fontSize={16}
                        color={COLORS.graytext}
                        textAlign={'center'}
                    />
                }
            </View>
        </ScreenWrapper>
    )
}

export default HelpCenter

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    }
})