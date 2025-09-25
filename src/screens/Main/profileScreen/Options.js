import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import ImageFast from '../../../components/ImageFast'
import CustomText from '../../../components/CustomText'
import { Images } from '../../../assets/images'
import fonts from '../../../assets/fonts'
// import CustomText from '../../../../components/CustomText'
// import ImageFast from '../../../../components/ImageFast'
// import { Images } from '../../../../assets/images'
// import fonts from '../../../../assets/fonts'

const Options = ({ title, icon, bg , fnc }) => {
    return (
        <TouchableOpacity onPress={fnc} style={styles.container}>
            <View style={styles.mincontainer}>
                
                    <ImageFast
                        source={icon}
                        resizeMode={'contain'}
                        style={styles.icon}
                    />
               
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

export default Options

const styles = StyleSheet.create({
    container: {
        height: 45,
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
        height: 45,
        width: 45,
    },
    icon2: {
        height: 10,
        width: 5,
    },
})