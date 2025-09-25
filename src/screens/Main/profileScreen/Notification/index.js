import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import Header2 from '../../DmvLicenses/Molecules/Header2'
import NotificationBar from './NotificationBar'
import { useSelector } from 'react-redux'
import { ApiRequest } from '../../../../services/ApiRequest'
import { COLORS } from '../../../../utils/COLORS'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'

const Notification = () => {
  const token = useSelector(state => state.authConfig.token)
  const [empty, setempty] = useState(false)
  const [loading, setloading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    fetchUnseenNotifications()
  }, [])

  const fetchNotifications = async () => {
    setloading(true)
    const body = {
      type: 'notifications',
      user_id: token
    }
    const response = await ApiRequest(body)
    console.log('Notification response:', response)
    if (response.data.result === false) {
      setempty(true)
    }
    setloading(false)
  }


  const fetchUnseenNotifications = async () => {
    setloading(true)
    const body = {
      type: 'unseen_noti',
      user_id: token
    }
    const response = await ApiRequest(body)
    console.log('Notification response:', response)
    if (response.data.result === false) {
      setempty(true)
    }
    setloading(false)
  }


  return (
    <ScreenWrapper
      headerUnScrollable={() => (<Header2 line={true} title={'Notifications'} />)}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primaryColor4} />
        </View>
      ) : empty ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <CustomText label={'No Notications Yet'} fontSize={20} fontFamily={fonts.light} />
        </View>

      ) : (
        <>
          <NotificationBar />
          <NotificationBar />
        </>
      )}
    </ScreenWrapper>
  )
}

export default Notification

const styles = StyleSheet.create({})