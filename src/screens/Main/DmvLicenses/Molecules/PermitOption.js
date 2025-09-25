import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Images } from '../../../../assets/images'
import ImageFast from '../../../../components/ImageFast'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import { COLORS } from '../../../../utils/COLORS'

const PermitOption = ({ price, title, isSelected, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                isSelected && styles.selectedContainer
            ]}
        >
            <ImageFast
                source={Images.permit}
                resizeMode={'contain'}
                style={styles.icon}
            />
            <View styles={styles.mincontainer}>
                <CustomText
                    textAlign={"center"}
                    marginTop={10}
                    fontSize={14}
                    fontFamily={fonts.jakartaSemiBold}
                    label={price}
                />
                <CustomText
                    fontSize={14}
                    fontFamily={fonts.jakartaSemiBold}
                    label={title}
                />
            </View>
        </TouchableOpacity>
    )
}

export default PermitOption

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F6F6F6',
        borderColor: '#ECECEC',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: '49%',
        borderWidth: 1,
        paddingVertical:20,
    },
    selectedContainer: {
        borderColor: COLORS.primaryColor4,
        borderWidth: 2,
    },
    icon: {
        height: 37,
        width: 37
    },
})