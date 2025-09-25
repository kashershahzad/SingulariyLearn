import { StyleSheet, Text, View } from 'react-native'
import React, {useState} from 'react'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import Header2 from '../../DmvLicenses/Molecules/Header2'
import SearchInput from '../../../../components/SearchInput'
import FaqSection from './FaqSection'
import { useTranslation } from 'react-i18next'

const FAQs = () => {
    const [search, setsearch] = useState('')
    const { t } = useTranslation()
    
    const faqData = [
        {
            question: t("dmvQuestion"),
            answer: t("dmvAnswer")
        },
        {
            question: t("testQuestion"),
            answer: t("testAnswer")
        }
    ];
    
    return (
        <ScreenWrapper
            backgroundColor='white'
            statusBarColor='white' 
            headerUnScrollable={() => (<Header2 title={t("faqTitle")} line={true} />)}>
            <View style={styles.container}>
                <SearchInput placeholder={t("searchPlaceholder")} isDropdown={true} value={search} onChangeText={setsearch}/>
                {
                    faqData.map(((item, i) => (
                        <FaqSection key={i} question={item.question} answere={item.answer}/>
                    )))
                }
            </View>
        </ScreenWrapper>
    )
}

export default FAQs

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
    }
})