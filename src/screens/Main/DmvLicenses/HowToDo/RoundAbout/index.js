import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Header2 from '../../Molecules/Header2'
import { Images } from '../../../../../assets/images'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import ImageFast from '../../../../../components/ImageFast'
import CustomText from '../../../../../components/CustomText'
import { COLORS } from '../../../../../utils/COLORS'
import fonts from '../../../../../assets/fonts'
import Paragraph from '../../Molecules/Paragraph'
import MinHeading from '../../Molecules/MinHeading'
import { useTranslation } from 'react-i18next'

const RoundAbout = () => {
    const { t } = useTranslation()

    return (
        <ScreenWrapper
            scrollEnabled
            paddingHorizontal={0}
            headerUnScrollable={() => (<Header2 title={t("roundaboutDrivingTitle")} />)}>
            <ImageFast
                source={Images.reversedriving}
                resizeMode={'contain'}
                style={styles.icon}
            />
            <CustomText
                marginTop={10}
                fontSize={18}
                marginLeft={20}
                color={COLORS.primaryColor4}
                fontFamily={fonts.medium}
                label={`🔁 ${t("roundaboutDrivingTitle")}`}
            />

            <Paragraph width={330} title={t("roundaboutDrivingDescription")} />

            <MinHeading fontsize={14} marginTop={20} title={t("howToDriveRoundabout")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("approachRoundabout")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("slowDownNear")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("lookSignsLane")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("useIndicatorsTurning")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("giveWayYield")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("giveWayTraffic")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("stopIfNeeded")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("enterRoundabout")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("stayChosenLane")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("doNotChangeLanes")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("maintainSteadySpeed")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("navigateExit")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("signalLeftPassing")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("exitCarefullyChecking")} />

            <MinHeading fontsize={14} marginTop={20} title={t("commonMistakesAvoid")} />
            <Paragraph marginTop={10} dot={true} width={330} title={t("enteringWithoutYielding")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("forgettingSignal")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("stoppingInside")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("changingLanesMid")} />
        </ScreenWrapper>
    )
}

export default RoundAbout

const styles = StyleSheet.create({
    icon: {
        width: 360,
        height: 234,
    }
})