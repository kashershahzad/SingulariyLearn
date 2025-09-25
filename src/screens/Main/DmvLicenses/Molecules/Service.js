import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import { Images } from '../../../../assets/images'
import { useNavigation } from '@react-navigation/native'
import ImageFast from '../../../../components/ImageFast'
import { useTranslation } from 'react-i18next'

const Service = () => {
    const navigation = useNavigation()
    const { t } = useTranslation()
    
    const servicedata = [
        {
            logo: Images.car,
            title: t('serviceTitles.howToDo'),
            function: ()=>navigation.navigate('HowToDo')
        },
        {
            logo: Images.car,
            title: t('serviceTitles.headUpDisplay')
        },
        {
            logo: Images.trafficsignal,
            title: t('serviceTitles.trafficSign')
        },
        {
            logo: Images.policesign,
            title: t('serviceTitles.policeSign')
        },
        {
            logo: Images.driving,
            title: t('serviceTitles.drivingLicenses')
        },
        {
            logo: Images.carcontrol,
            title: t('serviceTitles.carControl')
        }
    ]

    return (
        <View>
            <View style={styles.container}>
                {servicedata.map((item, i) => (
                    <TouchableOpacity 
                        onPress={item.function} 
                        key={i} 
                        style={styles.box}
                    >
                        <ImageFast 
                            source={item.logo} 
                            resizeMode={'contain'} 
                            style={styles.icon2} 
                        />
                        <CustomText 
                            label={item.title} 
                            fontFamily={fonts.medium} 
                            fontSize={11} 
                            color={'black'} 
                        />
                        <ImageFast 
                            source={Images.servicelogo} 
                            resizeMode={'contain'} 
                            style={styles.icon} 
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

export default Service

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 5,
        flexWrap: 'wrap',
        marginTop: 20,
    },
    box: {
        height: 103,
        width: "32%",
        backgroundColor: '#E9D1BC',
        borderRadius: 10,
        opacity: 0.8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        width: 63,
        height: 72,
        position: 'absolute',
        top: 25,
        left: 35,
    },
    icon2: {
        width: 40,
        height: 40,
    }
})