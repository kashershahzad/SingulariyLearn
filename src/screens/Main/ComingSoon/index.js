import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../components/CustomText'
import CustomButton from '../../../components/CustomButton'
import { COLORS } from '../../../utils/COLORS'
import fonts from '../../../assets/fonts'

const ComingSoon = ({navigation}) => {
    return (
        <View style={styles.container}>
            <CustomText
                label={'Comming Soon !'}
                fontFamily={fonts.jakartaSemiBold}
                fontSize={26}
                marginTop={6}
                textAlign={'center'}
            />
            <CustomButton
                onPress={() => { navigation.goBack()}}
                title={'Back'}
                marginTop={20}
                height={48}
                borderRadius={10}
                color={COLORS.primaryColor4}
                borderColor={'#ED7D20'}
                borderWidth={1}
                fontFamily={fonts.jakartaMedium}
                fontSize={16}
            />
        </View>
    )
}

export default ComingSoon

const styles = StyleSheet.create({
    container:{
        justifyContent:'center',
        alignItems:'center',
        flex:1,
        paddingHorizontal:30,
    }
})