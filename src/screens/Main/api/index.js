import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomText from '../../../components/CustomText'
import { get } from '../../../services/ApiRequest'
import SeachInput from '../../../components/SearchInput'
import AudioPlayer from './AudioPlayer'
import { ApiRequest } from '../../../services/ApiRequest'
const API = () => {
  const [todo, setTodo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setsearch] = useState('')



  // useEffect(() => {
  //   const fetchTodos = async () => {
  //     try {
  //       const result = await get(`users/${search}`)

  //       if (result.error) {
  //         setError(result.error)
  //       } else {
  //         setTodo(result.data)
  //       }
  //     } catch (err) {
  //       setError(err)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchTodos()
  // }, [search])

  useEffect(() => {

    const fetchData = async () => {
      const body = {
        type: " get_data",
        table_name: "languages"
      }



      const result = await ApiRequest(body)

      console.log("result", result)
    }
    fetchData()
  }, [])



  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    )
  }
  return (
    <ScrollView>
      <SeachInput placeholder={'Search by id'} value={search} onChangeText={setsearch} />
      <Text>API Data:</Text>
      {
        search === '' ? <View>
          <CustomText label={'Please enter a user id'} />
        </View> :
          <View>
            <CustomText label={`Name: ${todo?.name || 'N/A'}`} />
            <CustomText label={`Email: ${todo?.email || 'N/A'}`} />
            <CustomText
              label={`Address: ${todo?.address?.street}`}
            />
          </View>
      }

      <AudioPlayer />
    </ScrollView>
  )
}

export default API

const styles = StyleSheet.create({})