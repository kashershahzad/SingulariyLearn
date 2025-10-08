import { StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import Header2 from '../Molecules/Header2'
import IndexBanner from '../Molecules/IndexBanner'
import PermitOption from '../Molecules/PermitOption'
import CustomText from '../../../../components/CustomText'
import fonts from '../../../../assets/fonts'
import CustomButton from '../../../../components/CustomButton'
import { COLORS } from '../../../../utils/COLORS'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { ApiRequest } from '../../../../services/ApiRequest'
import { useSelector } from 'react-redux'

const PermitType = () => {
    const { t } = useTranslation()
    const navigation = useNavigation()
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [packages, setpackages] = useState()
    const currentlanguage = useSelector(state => state.language.language);


    const info = [
        {
            title: t('adultPermit'),
            price: '$400',
            border: true
        },
        {
            title: t('provisionalPermit'),
            price: '$250'
        },
        {
            title: t('motorcyclePermit'),
            price: '$100'
        },
        {
            title: t('commercialCLP'),
            price: '$600'
        },
    ]

    useEffect(() => {
      const permitdata = async ()=>{
        const body={
            type:'get_data',
            table_name:'permit'
        }
        const response = await ApiRequest(body)
        const rawdata = response.data.data
        const parseddata = rawdata.map(((item)=>({
            id:item.id,
            image:item.image,
            price:item.price,
            name:JSON.parse(item.name)[currentlanguage]
        })))
        console.log("Fetched Packages:", parseddata);
          setpackages(parseddata);
      }
      permitdata()
    }, [])
    

    return (
        <ScreenWrapper
            headerUnScrollable={() => (
                <Header2 title={t('yourPermitType')} line={true} />
            )}>
            <IndexBanner />
            <CustomText 
                label={t('chooseYourPermitType')} 
                fontFamily={fonts.medium} 
                fontSize={16} 
                marginTop={15} 
                marginLeft={5} 
                marginBottom={15} 
            />

            <View style={styles.container}>
                {packages && packages.map((item, i) => (
    <PermitOption 
        key={i}
        price={item.price}
        title={item.name}
        isSelected={selectedIndex === i}
        onPress={() => setSelectedIndex(i)} 
    />
))}
            </View>

            <CustomButton
                disabled={selectedIndex === null}
                onPress={() => navigation.navigate('SelectPackage', { permit_id: packages[selectedIndex]?.id })}
                title={t('continue')} 
                marginTop={53}
                height={62} 
                borderRadius={10} 
                backgroundColor={COLORS.primaryColor4} 
            />
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5
    }
})

export default PermitType