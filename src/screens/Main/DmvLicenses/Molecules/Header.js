import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import ImageFast from '../../../../components/ImageFast'
import { Images } from '../../../../assets/images'
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine'

const Header = () => {
    return (
        <>
            <View style={styles.container}>
                <CustomText
                    fontSize={20}
                    fontFamily={fonts.semiBold}
                    label={'DMV !'}
                />
                <ImageFast
                    source={Images.toggle}
                    resizeMode={'contain'}
                    style={styles.icon}
                />
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
        marginTop: 20,
        marginLeft: 25,
        marginRight: 15,
        marginBottom:10,
    },
    icon: {
        height: 25,
        width: 25
    }
})