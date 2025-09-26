import { StyleSheet, View } from 'react-native'
import React from 'react'
import Heading from '../Molecules/Heading'
import { Images } from '../../../../../assets/images'
import Header2 from '../Molecules/Header2'
import { useTranslation } from 'react-i18next'
import Banner2 from '../Molecules/Banner2'
import CustomText from '../../../../components/CustomText'
import ScreenWrapper from '../../../../components/ScreenWrapper'
import RenderHtml from 'react-native-render-html';

const Details = ({ route }) => {
    const { t } = useTranslation()
    const { item } = route.params;
    console.log('Detail Item:', item);

    return (
        <ScreenWrapper
            scrollEnabled
            paddingHorizontal={0}
            headerUnScrollable={() => (<Header2 title={item.headline} />)}>
            <Banner2 image={item.cover_image} />

            <Heading title={item.title} marginTop={10} />


            <View style={{ paddingHorizontal: 20, }}>
                <RenderHtml
                    source={{ html: item.content }}
                    tagsStyles={{
                        p: { marginBottom: 10 },
                        strong: { fontWeight: 'bold' },
                        li: { marginLeft: 20 }
                    }}
                />
            </View>
        </ScreenWrapper>
    )
}

export default Details

const styles = StyleSheet.create({})