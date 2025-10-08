import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Images } from '../../../../../assets/images'
import ImageFast from '../../../../../components/ImageFast'
import fonts from '../../../../../assets/fonts'
import CustomText from '../../../../../components/CustomText'
import CustomHorizontalLine from '../../../../../components/CustomHorizontalLine'
import { COLORS } from '../../../../../utils/COLORS'

const RecipientCard = ({ info , title}) => {

    return (
        <View style={styles.container}>
            <CustomText label={'Recipient'} fontFamily={fonts.medium} fontSize={16} />
            <ImageFast
                source={Images.logo1}
                resizeMode={'contain'}
                style={styles.icon}
            />

            <CustomText label={title} fontFamily={fonts.medium} fontSize={16} marginTop={20} />

            {
                info.map(((item, i) => (
                    <View key={i}>
                        <CustomHorizontalLine height={1} />
                        <View style={styles.mincontainer}>
                            <CustomText label={item.title} fontFamily={fonts.medium} fontSize={12} marginTop={20} />
                            <CustomText label={item.info} fontFamily={fonts.medium} fontSize={12} marginTop={20} />
                        </View>
                    </View>
                )))
            }
        </View>
    )
}

export default RecipientCard

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderColor: '#EEEEEE',
        borderRadius: 8,
        marginTop: 40,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    icon: {
        height: 77,
        width: 67
    },
    mincontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    }
})