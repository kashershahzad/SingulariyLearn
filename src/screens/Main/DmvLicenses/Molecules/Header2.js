import { StyleSheet, Text, View, Platform } from 'react-native'
import React from 'react'
import { Images } from '../../../../assets/images'
import ImageFast from '../../../../components/ImageFast'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine'
import { useNavigation } from '@react-navigation/native'

const Header2 = ({ title, line }) => {
    const navigation = useNavigation()
    const handleBack = () => {
        navigation.goBack()
    }
    return (
        <>
            <View style={styles.container}>
                <View style={styles.backButton} pointerEvents="box-none" collapsable={false}>
                    <ImageFast
                        onPress={handleBack}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        source={Images.leftarrow}
                        resizeMode={'contain'}
                        style={[styles.icon, styles.backTouchable]}
                    />
                </View>
                <View style={styles.titleContainer} pointerEvents="box-none">
                    <CustomText
                        fontSize={16}
                        fontFamily={fonts.jakartaSemiBold}
                        label={title}
                        style={styles.titleText}
                    />
                </View>
            </View>
            {
                line && <CustomHorizontalLine height={1}/>
            }
        </>
    )
}

export default Header2

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    backButton: {
        padding: Platform.OS === 'ios' ? 10 : 4,
        marginLeft: Platform.OS === 'ios' ? -4 : 0,
        zIndex: 10,
    },
    icon: {
        height: 24,
        width: 24
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -24,
    },
    titleText: {
        textAlign: 'center',
    }
})