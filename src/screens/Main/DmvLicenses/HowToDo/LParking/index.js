import { StyleSheet } from 'react-native'
import React from 'react'
import Header2 from '../../Molecules/Header2'
import Banner2 from '../../Molecules/Banner2'
import { Images } from '../../../../../assets/images'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import ImageFast from '../../../../../components/ImageFast'
import Heading from '../../Molecules/Heading'
import CustomText from '../../../../../components/CustomText'
import { COLORS } from '../../../../../utils/COLORS'
import fonts from '../../../../../assets/fonts'
import Paragraph from '../../Molecules/Paragraph'
import MinHeading from '../../Molecules/MinHeading'
import { useTranslation } from 'react-i18next'

const Lparking = () => {
    const { t } = useTranslation()

    return (
        <ScreenWrapper
            scrollEnabled
            paddingHorizontal={0}
            headerUnScrollable={() => (<Header2 title={t("reverseLParking.headerTitle")} />)}>
            <ImageFast
                source={Images.Lparking}
                resizeMode={'contain'}
                style={styles.icon}
            />
            <CustomText
                marginTop={10}
                fontSize={18}
                marginLeft={20}
                color={COLORS.primaryColor4}
                fontFamily={fonts.medium}
                label={t("reverseLParking.subTitle")}
            />

            <Paragraph width={330} title={t("reverseLParking.description")} />

            <MinHeading fontsize={14} marginTop={20} title={t("reverseLParking.stepGuideTitle")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("reverseLParking.step1.title")}
            />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step1.point1")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step1.point2")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("reverseLParking.step2.title")}
            />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step2.point1")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step2.point2")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("reverseLParking.step3.title")}
            />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step3.point1")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step3.point2")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("reverseLParking.step4.title")}
            />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step4.point1")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step4.point2")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("reverseLParking.step5.title")}
            />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step5.point1")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step5.point2")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("reverseLParking.step6.title")}
            />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step6.point1")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.step6.point2")} />

            <MinHeading fontsize={14} marginTop={20} title={t("reverseLParking.tips.title")} />
            <Paragraph marginTop={10} dot={true} width={330} title={t("reverseLParking.tips.point1")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.tips.point2")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseLParking.tips.point3")} />
        </ScreenWrapper>
    )
}

export default Lparking

const styles = StyleSheet.create({
    icon: {
        width: 360,
        height: 234,
    }
})