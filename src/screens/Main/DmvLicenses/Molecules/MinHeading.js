import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'

const MinHeading = ({title , marginleft=19, marginTop , fontsize=16}) => {
  return (
    <View>
      <CustomText
                marginTop={marginTop}
                fontSize={fontsize}
                marginLeft={marginleft}
                color={'black'}
                fontFamily={fonts.medium}
                label={title}
            />
    </View>
  )
}

export default MinHeading

const styles = StyleSheet.create({})