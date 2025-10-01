import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../../components/ScreenWrapper'
import Header2 from '../DmvLicenses/Molecules/Header2'
import { Images } from '../../../assets/images'
import ImageFast from '../../../components/ImageFast'
import fonts from '../../../assets/fonts'
import CustomText from '../../../components/CustomText'
import ProfileOptions from './ProfileOptions'
import Options from './Options'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../../../utils/COLORS'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux';
import { logout } from '../../../store/reducer/AuthConfig'
import { ApiRequest } from '../../../services/ApiRequest'
import Loading from '../../../components/Loading'
import { getProfile } from '../../../utils/constants'
import { useIsFocused } from '@react-navigation/native'
import { CommonActions } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {

  const isFocus = useIsFocused()
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const token = useSelector(state => state.authConfig.token);
  const [loading, setLoading] = useState(true)
  const [data, setdata] = useState()

  const fetchUserData = async () => {
    try {
      const body = {
        type: "profile",
        user_id: token.toString()
      }
      const response = await ApiRequest(body)
      if (response && response.status === 200) {
        setdata(response.data.profile)
        console.log("User Data in profile: ", response.data.profile)
      }
    } catch (error) {
      console.log("Error fetching user data: ", error)
      setLoading(false)
    }
    setLoading(false)
  }

  useEffect(() => {

    fetchUserData()
  }, [isFocus])


  const practiceMenuItems = [
    {
      title: t("Edit Profile"),
      icon: Images.editprofile,
      fnc: () => navigation.navigate('EditProfile')
    },
    {
      title: t("notification"),
      icon: Images.notificationicon,
      fnc: () => navigation.navigate('Notification')
    },
    {
      title: t("Language"),
      icon: Images.language,
      fnc: () => navigation.navigate('Language', { ProfileScreen: true })
    },
    {
      title: t("helpCenter"),
      icon: Images.helpicon,
      fnc: () => navigation.navigate('HelpCenter')
    },
    {
      title: t("faqs"),
      icon: Images.faqicon,
      fnc: () => navigation.navigate('FAQs')
    },
    {
      title: t("website"),
      icon: Images.websiteicon,
    },
    {
      title: t("logout"),
      icon: Images.logouticon,
      fnc: () => {
        dispatch(logout(token));
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'AuthStack' }],
          })
        );
      }
    },
  ];

  if (loading) {
    return (
      <>
        <Loading />
      </>)
  }
  return (
    <ScreenWrapper
      scrollEnabled
      headerUnScrollable={() => (<Header2 title={t("profileTitle")} line='true' />)}>
      <View style={styles.container}>
        <ImageFast
          source={data.images && data.images !== "" ? { uri: data.images } : Images.placeholderUser}
          resizeMode={'contain'}
          style={styles.icon}
        />
        <CustomText
          marginTop={5}
          fontSize={20}
          color={'black'}
          fontFamily={fonts.bold}
          label={data.name || 'User Name'}
        />
        <CustomText
          fontSize={13}
          marginTop={-7}
          color={'#737373'}
          fontFamily={fonts.light}
          label={data.email}
        />
      </View>

      <View style={styles.status}>
        <CustomText
          fontSize={10}
          color={COLORS.primaryColor4}
          fontFamily={fonts.semiBold}
          textAlign={'center'}
          label={'premium'} />
      </View>

      <View style={styles.mincontainer}>
        <ProfileOptions />
      </View>
      <View style={styles.mincontainer2}>
        {
          practiceMenuItems.map(((item, i) => (
            <Options key={i} title={item.title} icon={item.icon} fnc={item.fnc} bg={item.bgColor} />
          )))
        }
      </View>
    </ScreenWrapper>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    alignItems: 'center'
  },
  icon: {
    width: 125,
    height: 125,
    borderRadius: 100,
  },
  icon2: {
    width: 27,
    height: 27,
    position: 'absolute',
    top: 95,
    right: 105,
  },
  mincontainer: {
    marginTop: 20,
    flexDirection: "row",
    gap: 5,
  },
  mincontainer2: {
    marginTop: 20,
    gap: 20,
    marginBottom: 20,
  },
  status: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    backgroundColor: '#ECC7A9',
    borderRadius: 3,
    position: 'absolute',
    top: 133,
    right: 120,
  }
})