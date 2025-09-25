import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Images } from '../../../../assets/images'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import { COLORS } from '../../../../utils/COLORS'
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine'
import ImageFast from '../../../../components/ImageFast'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
const Header = () => {
    const navigation = useNavigation()
    const userData = useSelector(state => state.users.userData)
    return (
        <>
            <View style={styles.container}>
                <View style={styles.mincontainer}>
                    <ImageFast source={Images.logo1} style={styles.logo} resizeMode={'contain'} />
                    <CustomText label={'DMV!'} fontFamily={fonts.semiBold} fontSize={16} marginTop={5} />
                </View>
                <View style={styles.mincontainer}>
                    <ImageFast
                        source={Images.lan}
                        style={styles.icon}
                        resizeMode={'contain'}
                        onPress={() => {
                           navigation.navigate('Language', {ProfileScreen: true});
                        }}
                    />
                    <ImageFast
                        source={Images.notification2}
                        style={styles.icon}
                        resizeMode={'contain'}
                        onPress={() => {
                            navigation.navigate('Notification');
                        }}
                    />

                    <ImageFast
                        source={userData.images && userData.images !== "" ? { uri: userData.images } : Images.placeholderUser}
                        style={styles.icon}
                        resizeMode={'contain'}
                        onPress={() => {
                            navigation.navigate('ProfileScreen');
                        }}
                    />
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
        height: 31,
        width: 31,
        borderRadius: 50,
    },
    icon2: {
        height: 18,
        width: 18
    },
    icon3: {
        height: 8,
        width: 8,
        position: 'absolute',
        bottom: 29,
        left: 18,
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