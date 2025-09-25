import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import CustomText from '../../../../../components/CustomText'
import fonts from '../../../../../assets/fonts'
import CustomHorizontalLine from '../../../../../components/CustomHorizontalLine'
import { useTranslation } from 'react-i18next'

const PackageContainer = ({ plan, price, description, vehicle, duration, onpress, selectedindex }) => {
    const { t } = useTranslation();
    return (
        <TouchableOpacity onPress={onpress}
        activeOpacity={1}
         style={[
            styles.container,
            selectedindex && styles.activecontainer
        ]}>
            <View style={styles.head}>
                <CustomText label={plan} fontFamily={fonts.medium} fontSize={16} color={selectedindex ? 'white' : 'black'} />
                <CustomText color={selectedindex ? 'white' : 'black'} label={price} fontFamily={fonts.semiBold} fontSize={20} />
            </View>
            <CustomText label={description} fontFamily={fonts.medium} fontSize={12} color={selectedindex ? 'white' : '#00000080'} />

            {
                selectedindex === true ? null : 
                <CustomHorizontalLine />
            }
            <View style={styles.head}>
                <CustomText marginTop={5} label={t('vehiclesText')} fontFamily={fonts.regular} fontSize={12} color={selectedindex ? 'white' : '#130F26'} />

                <CustomText marginTop={5} label={vehicle} fontFamily={fonts.regular} fontSize={12} color={selectedindex ? 'white' : '#707070'}  />
            </View>
            {
                selectedindex === true ? null : 
                <CustomHorizontalLine />
            }

            <View style={styles.head}>
                <CustomText marginTop={5} label={t('durationText')} fontFamily={fonts.regular} fontSize={12} color={selectedindex ? 'white' : '#130F26'} />

                <CustomText marginTop={5} label={duration} fontFamily={fonts.regular} fontSize={12} 
                color={selectedindex ? 'white' : '#707070'} />
            </View>
        </TouchableOpacity>
    )
}

export default PackageContainer

const styles = StyleSheet.create({
    container: {
        borderColor: '#E3E3E3',
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        marginBottom:10,
    },
    activecontainer: {
        backgroundColor: '#ED7D20'
    },
    head: {
        flexDirection: 'row',
        justifyContent: "space-between"
    }
})