import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import fonts from '../../../../../assets/fonts'
import CustomText from '../../../../../components/CustomText'

const InfoContainer = ({title, desc}) => {
    return (
        <View style={styles.container}>
            <CustomText label={title} fontFamily={fonts.medium} fontSize={14} />
            <CustomText label={desc} fontFamily={fonts.regular} fontSize={12} color={'#00000080'} />
        </View>
    )
}

export default InfoContainer

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        borderColor: '#E3E3E3',
        borderWidth: 1,
        paddingBottom:20,
        paddingTop:10,
        paddingRight:15,
        paddingLeft:15,
        marginTop:15,
    }
})