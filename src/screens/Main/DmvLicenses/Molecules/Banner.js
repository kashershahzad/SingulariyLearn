import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { COLORS } from '../../../../utils/COLORS'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import CustomButton from '../../../../components/CustomButton'
import ImageFast from '../../../../components/ImageFast'
import { Images } from '../../../../assets/images'

const Banner = () => {
    return (
        <View style={styles.container}>
            
            <CustomText label={'DMV Test Prep Starts Here!'} fontFamily={fonts.jakartaSemiBold} fontSize={22} width={200} />

            <CustomButton title={'Start'} backgroundColor={COLORS.primaryColor4} height={32} width={102} alignSelf='start' fontSize={16} fontFamily={fonts.jakartaMedium} borderRadius={4} marginTop={12} />

            <ImageFast source={Images.banner} resizeMode={'contain'} style={styles.icon} />
        </View>
    )
}

export default Banner

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        backgroundColor: COLORS.primaryColor5,
        borderRadius: 10,
        paddingTop: 15,
        paddingLeft: 20,
        height: 149,
        width: 334
    },
    icon: {
        height: 132,
        width: 123,
        position:'absolute',
        left:200,
        top:20
    }
})