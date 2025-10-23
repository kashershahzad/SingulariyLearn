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
                <ImageFast source={Images.logomin} style={styles.logo} resizeMode={'contain'} />
                <ImageFast source={Images.logohead} style={styles.logo3} resizeMode={'contain'} />
            </View>
            <View style={styles.mincontainer}>
                <View style={styles.iconstyle}>
                    <ImageFast source={Images.notification3} style={styles.icon5} resizeMode={'contain'} />
                </View>
                 <View style={styles.iconstyle}> 
                    <ImageFast source={Images.exit} style={styles.icon2} resizeMode={'contain'} />
                </View>
                {/* <ImageFast source={Images.active} style={styles.icon3} resizeMode={'contain'} /> */}
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
        height: 30,
        width: 27,
    },

    logo3: {
        height: 12,
        width: 61,
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
        backgroundColor: COLORS.lightblue,
        borderRadius: 50,
        width: 31, 
        height: 31,
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    icon5:{
        width: 31, 
        height: 31,
    }
})