import { StyleSheet, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import Header2 from '../../DmvLicenses/Molecules/Header2'
import { Images } from '../../../../assets/images'
import CustomInput from '../../../../components/CustomInput'
import { COLORS } from '../../../../utils/COLORS'
import CustomDropdown from '../../../../components/CustomDropDown'
import fonts from '../../../../assets/fonts'
import CustomButton from '../../../../components/CustomButton'
import ProfileImagePicker from './ProfileImagePicker'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import * as yup from 'yup';
import { useSelector } from 'react-redux'
import { ApiRequest } from '../../../../services/ApiRequest'
import { useDispatch } from 'react-redux'
import { ToastMessage } from '../../../../utils/ToastMessage'
import { getProfile } from '../../../../utils/constants'

const EditProfile = () => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.users.userData)
  const token = useSelector(state => state.authConfig.token);
  const { t } = useTranslation();
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadimage, setuploadimage] = useState('')

  useEffect(() => {
  console.log('dlkj', userData);
  console.log('user', userData?.name);
}, [userData]);
  useEffect(() => {
    if (userData?.images !== "") {
      setProfileImage(userData.images);
    } else {
      setProfileImage(Images.placeholderUser);
    }
  }, [userData]);

  const options = [
    { _id: "1", title: t('maleOption') },
    { _id: "2", title: t('femaleOption') },
    { _id: "3", title: t('others') },
  ];

  const handleImageSelected = (imageUri) => {
    setProfileImage(imageUri);
  };

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .required(t('nameRequired')),
    gender: yup
      .mixed()
      .nullable()
      .required(t('genderRequired')),
  });

  const initialValues = {
    name: userData?.name || '',
    gender: userData?.gender 
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const body = {
        type: "update_data",
        id: token,
        table_name: "users",
        gender: values.gender?.title || values.gender, 
        name: values.name,
        images: uploadimage || userData?.images,
      }

      console.log('Submitting data:', body);

      const response = await ApiRequest(body);
      console.log('API Response:', response);

      if (response.data.result === 'false') {
        ToastMessage(response.data.message, 'error');
      } else {
        ToastMessage(response.data.message, 'success');
        dispatch(getProfile())
      }
    } catch (error) {
      console.log('API Error:', error);
      ToastMessage('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenWrapper
      scrollEnabled
      backgroundColor='white'
      statusBarColor='white'
      headerUnScrollable={() => <Header2 title={t('editProfileTitle')} line={true} />}>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <>
            <ProfileImagePicker
              imageUri={typeof profileImage === 'string' ? profileImage : null}
              onImageSelected={handleImageSelected}
              uploadimage={setuploadimage}
            />

            <View style={styles.container}>
              <CustomInput
                placeholder={t('nameLabel')}
                withLabel={t('nameLabel')}
                placeholderTextColor={COLORS.graytext}
                borderRadius={10}
                borderColor={'#EFEFEF'}
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                bgcolor='#FBFBFB'
                error={touched.name && errors.name}
              />
              <CustomDropdown
                data={options}
                value={values.gender}
                setValue={(value) => setFieldValue('gender', value)}
                placeholder={t('genderPlaceholder')}
                withLabel={t('genderLabel')}
                error={touched.gender && errors.gender}
              />
            </View>

            <CustomButton
              title={loading ? t('updating') : t('updateButton')}
              marginBottom={20}
              height={62}
              borderRadius={10}
              backgroundColor={loading ? COLORS.gray : COLORS.primaryColor4}
              fontSize={16}
              fontFamily={fonts.jakartaSemiBold}
              onPress={handleSubmit}
              disabled={loading}
            />
          </>
        )}
      </Formik>
    </ScreenWrapper>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
})