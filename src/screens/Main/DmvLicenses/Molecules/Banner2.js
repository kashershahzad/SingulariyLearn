import { StyleSheet, View, Dimensions } from 'react-native'
import React from 'react'
import ImageFast from '../../../../components/ImageFast'

const { width } = Dimensions.get('window')

const Banner2 = ({ image }) => {
  return (
    <View style={styles.container}>
      <ImageFast
        source={{ uri: image }}
        resizeMode="cover"
        style={styles.icon}
      />
    </View>
  )
}

export default Banner2

const styles = StyleSheet.create({
  container: {
    width: width,
    height: "100%",
    backgroundColor: '#D9D9D9',
    marginTop: 5,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
})
