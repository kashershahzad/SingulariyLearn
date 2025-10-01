import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../../components/ScreenWrapper'
import Header from './Molecules/Header'
import Banner from '../../Auth/LandingPage/Molecules/Banner'
import Services from '../../Auth/LandingPage/Molecules/Services'

import { useIsFocused } from '@react-navigation/native'
import { CommonActions } from '@react-navigation/native';
import { ApiRequest } from '../../../services/ApiRequest'
import Loading from '../../../components/Loading'
import { getProfile } from '../../../utils/constants'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux';



const HomeScreen = ({ navigation }) => {

  const isFocus = useIsFocused()
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
            console.log("User Data in home ", response.data.profile)
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

    return (
      <ScreenWrapper
        scrollEnabled
        headerUnScrollable={() => (<Header />)}
      >
        <Banner />
        <Services />
      </ScreenWrapper>
    )
  }

  export default HomeScreen

  const styles = StyleSheet.create({})