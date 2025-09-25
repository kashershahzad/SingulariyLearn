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

const ReverseParking = () => {
    const { t } = useTranslation()

    return (
        <ScreenWrapper
            scrollEnabled
            paddingHorizontal={0}
            headerUnScrollable={() => (<Header2 title={t("reverseParkingTitle")} />)}>
            <ImageFast
                source={Images.reverseparkingbanner}
                resizeMode={'contain'}
                style={styles.icon}
            />
            <CustomText
                marginTop={10}
                fontSize={18}
                marginLeft={20}
                color={COLORS.primaryColor4}
                fontFamily={fonts.medium}
                label={`🔁 ${t("reverseParkingTitle")}`}
            />

            <Paragraph width={330} title={t("reverseParkingDescription")} />

            <MinHeading fontsize={14} marginTop={20} title={t("stepByStepReverseParking")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("locateParkingSpot")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("makeSureSpotWide")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("indicatorParkingSpot")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("positionVehicle")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("driveForwardSlightlyAhead")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("leaveThreeFourFeet")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("alignRearBumper")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("checkMirrorsBlindSpots")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("lookSideMirrors")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("ensureAreaClear")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("reverseSlowlySpace")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("turnSteeringWheelDirection")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("moveSlowlyAdjust")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("useReferencePoints")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("straightenVehicle")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("straightenWheels")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("reverseUntilFully")} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t("finalCheck")}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t("ensureVehicleCentered")} />
            <Paragraph marginTop={0} dot={true} width={330} title={t("applyHandbrakeGear")} />
        </ScreenWrapper>
    )
}

export default ReverseParking

const styles = StyleSheet.create({
    icon: {
        width: 360,
        height: 234,
    }
})