import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import ImageFast from '../../../../../components/ImageFast'
import Header2 from '../../Molecules/Header2'
import RecipientCard from './RecipientCard'
import CustomButton from '../../../../../components/CustomButton'
import { COLORS } from '../../../../../utils/COLORS'
import fonts from '../../../../../assets/fonts'
import { Images } from '../../../../../assets/images'
import CustomText from '../../../../../components/CustomText'

const Recipient = ({ navigation }) => {
    const [successmsg, setsuccessmsg] = useState(true)
    useEffect(() => {
        setTimeout(() => {
            setsuccessmsg(false)
        }, 4000);
    }, [])

    const info = [
        {
            title: 'ID',
            info: '#3748934'
        },
        {
            title: 'Name',
            info: ' Hussain Ali'
        },
        {
            title: 'Age',
            info: '25'
        },
        {
            title: 'Vehicles',
            info: 'Car'
        },
        {
            title: 'Duration',
            info: '4 Weeks'
        },
        {
            title: 'Issue',
            info: '08-23-2023'
        },
        {
            title: 'Expre',
            info: '08-23-2025'
        }
    ];

    return (
        <>
            {
                successmsg === true ?
                    <ScreenWrapper
                        backgroundColor='white'
                        statusBarColor='white'
                        paddingBottom={20}
                        scrollEnabled={!successmsg}>
                        <View style={styles.container}>
                            <ImageFast
                                source={Images.sucess}
                                resizeMode={'contain'}
                                style={styles.icon}
                            />
                        </View>
                    </ScreenWrapper> :
                    <ScreenWrapper
                        backgroundColor='white'
                        statusBarColor='white'
                        paddingBottom={20}
                        scrollEnabled={!successmsg}
                        headerUnScrollable={() => (<Header2 line={true} title={'Recipient'} />)}>
                        <RecipientCard info={info} />
                        <CustomButton
                            onPress={() => { navigation.navigate('TabStack') }}
                            title={'Close'}
                            marginTop={53}
                            height={62}
                            borderRadius={10}
                            backgroundColor={COLORS.primaryColor4}
                            fontSize={20}
                            fontFamily={fonts.jakartaSemiBold}
                        />
                    </ScreenWrapper>


            }
        </>
    )
}

export default Recipient

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        height: 160,
        width: 160
    },
})