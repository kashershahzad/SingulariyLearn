import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../components/CustomText'
import { COLORS } from '../../../../utils/COLORS'
import fonts from '../../../../assets/fonts'

const Heading = ({ title ,marginTop=10 }) => {
    return (
        <View>
            <CustomText
                marginTop={marginTop}
                textAlign={'center'}
                fontSize={18}
                color={COLORS.primaryColor4}
                fontFamily={fonts.medium}
                label={title}
            />
        </View>
    )
}

export default Heading

const styles = StyleSheet.create({})