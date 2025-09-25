import { StyleSheet } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import Header2 from '../../Molecules/Header2'
import { Images } from '../../../../../assets/images'
import Banner2 from '../../Molecules/Banner2'
import Heading from '../../Molecules/Heading'
import MinHeading from '../../Molecules/MinHeading'
import Paragraph from '../../Molecules/Paragraph'
import { useTranslation } from 'react-i18next'

const CarPadel = () => {
    const { t } = useTranslation()

    return (
        <ScreenWrapper
            scrollEnabled
            paddingHorizontal={0}
            headerUnScrollable={() => (<Header2 title={t("carPadelTitle")} />)}>
            <Banner2 image={Images.carpaddelbanner} />

            <Heading title={t("headingTitle")} />

            <MinHeading title={t("automaticCars")} />

            <MinHeading title={t("correctWay")} marginTop={5} />

            <Paragraph title={t("correctWayParagraph")} />

            <Paragraph dot={true} marginLeft={50} marginTop={0} title={t("accelerator")} />

            <Paragraph dot={true} marginLeft={50} marginTop={0} title={t("brake")} />

            <MinHeading title={t("wrongWay")} marginTop={5} />

            <Paragraph title={t("wrongWayParagraph")} />

            <Paragraph dot={true} marginLeft={50} marginTop={0} title={t("causeConfusion")} />

            <Paragraph dot={true} marginLeft={50} marginTop={0} title={t("accidentalAcceleration")} />

            <Paragraph dot={true} marginLeft={50} marginTop={0} title={t("increaseRisk")} />

            <MinHeading title={t("commonMistakes")} marginTop={5} />

            <Paragraph dot={true} marginTop={0} title={t("clutchDamage")} />

            <Paragraph dot={true} marginTop={0} title={t("lossOfControl")} />

            <Paragraph dot={true} marginTop={0} title={t("seriousAccidents")} />

        </ScreenWrapper>
    )
}

export default CarPadel

const styles = StyleSheet.create({})