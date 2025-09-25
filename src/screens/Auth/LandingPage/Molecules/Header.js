import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ImageFast from '../../../../components/ImageFast'
import { Images } from '../../../../assets/images'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { COLORS } from '../../../../utils/COLORS'
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine'

const Header = () => {
    return (
        <>
        <View style={styles.container}>
            <View style={styles.mincontainer}>
                <ImageFast source={Images.logo1} style={styles.logo} resizeMode={'contain'} />
                <CustomText label={'DMV!'} fontFamily={fonts.semiBold} fontSize={16} marginTop={5} />
            </View>
            <View style={styles.mincontainer}>
                <View style={styles.iconstyle}>
                    <ImageFast source={Images.notification} style={styles.icon} resizeMode={'contain'} />
                </View>
                 <View style={styles.iconstyle}>
                    <ImageFast source={Images.exit} style={styles.icon2} resizeMode={'contain'} />
                </View>
                <ImageFast source={Images.active} style={styles.icon3} resizeMode={'contain'} />
            </View>
            
        </View>
        <CustomHorizontalLine />
        </>
    )
}

export default Header

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    mincontainer: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
    },
    logo: {
        height: 38,
        width: 32,
    },
    icon: {
        height: 14,
        width: 10,
    },
    icon2: {
        height: 18,
        width: 18
    },
    icon3: {
        height: 8,
        width: 8,
        position:'absolute',
        bottom:29,
        left:18,
    },
    iconstyle: {
        backgroundColor: COLORS.primaryColor,
        borderRadius: 50,
        width: 31, 
        height: 31,
        justifyContent: 'center', 
        alignItems: 'center', 
    }
})