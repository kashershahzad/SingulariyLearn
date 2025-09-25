import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import CustomText from '../../../../components/CustomText'
import ImageFast from '../../../../components/ImageFast'
import { Images } from '../../../../assets/images'
import fonts from '../../../../assets/fonts'

const TestOptions = ({ title, icon, bg , fnc }) => {
    return (
        <TouchableOpacity onPress={fnc} style={styles.container}>
            <View style={styles.mincontainer}>
                <View style={[styles.iconbg, { backgroundColor: bg }]}>
                    <ImageFast
                        source={icon}
                        resizeMode={'contain'}
                        style={styles.icon}
                    />
                </View>
                <CustomText label={title} fontFamily={fonts.medium} fontSize={16} marginTop={10} marginLeft={5} />
            </View>
            <ImageFast
                source={Images.arrowright}
                resizeMode={'contain'}
                style={styles.icon2}
            />
        </TouchableOpacity>
    )
}

export default TestOptions

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F9F9F9',
        borderColor: '#ECEFF3',
        borderWidth: 1,
        height: 73,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'space-between'

    },
    mincontainer: {
        flexDirection: 'row',
        gap: 10,
    },
    iconbg: {
        height: 41,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    icon: {
        height: 20,
        width: 20,
    },
    icon2: {
        height: 10,
        width: 5,
    },
})