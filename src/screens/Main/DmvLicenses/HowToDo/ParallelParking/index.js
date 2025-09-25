import { StyleSheet, View } from 'react-native'
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

const ParallelParking = () => {
    const { t } = useTranslation()

    return (
        <ScreenWrapper
            scrollEnabled
            paddingHorizontal={0}
            headerUnScrollable={() => (<Header2 title={t('parallelParkingTitle')} />)}>
            <ImageFast
                source={Images.parallelparkingbanner}
                resizeMode={'contain'}
                style={styles.icon}
            />
            <CustomText
                marginTop={10}
                fontSize={18}
                marginLeft={20}
                color={COLORS.primaryColor4}
                fontFamily={fonts.medium}
                label={'🅿️ ' + t('parallelParkingTitle')}
            />

            <Paragraph width={330} title={t('parallelParkingDescription')} />

            <MinHeading fontsize={14} marginTop={20} title={t('stepByStepGuide')} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t('findSuitableSpace')}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t('chooseSpot')} />
            <Paragraph marginTop={0} dot={true} width={330} title={t('indicatorSlow')} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t('alignVehicle')}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t('pullUpParallel')} />
            <Paragraph marginTop={0} dot={true} width={330} title={t('leaveTwoFeet')} />
            <Paragraph marginTop={0} dot={true} width={330} title={t('rearBumpersAligned')} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t('startReversing')}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t('reverseGear')} />
            <Paragraph marginTop={0} dot={true} width={330} title={t('steeringWheelCurb')} />
            <Paragraph marginTop={0} dot={true} width={330} title={t('reverseSlowly')} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t('counterSteer')}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t('frontBumperClears')} />
            <Paragraph marginTop={0} dot={true} width={330} title={t('continueStraightening')} />

            <CustomText
                marginTop={10}
                fontSize={14}
                marginLeft={19}
                color={'#5C5C5C'}
                fontFamily={fonts.medium}
                label={t('adjustCenter')}
            />

            <Paragraph marginTop={0} dot={true} width={330} title={t('moveForwardBackward')} />
            <Paragraph marginTop={0} dot={true} width={330} title={t('inchesFromCurb')} />

            <MinHeading fontsize={14} marginTop={20} title={t('commonMistakesTitle')} />

            <Paragraph marginTop={0} dot={true} title={t('tooFarAlignment')} />
            <Paragraph marginTop={0} dot={true} title={t('wrongSteeringTime')} />
            <Paragraph marginTop={0} dot={true} title={t('hittingCurb')} />
            <Paragraph marginTop={0} dot={true} title={t('forgettingMirrors')} />

        </ScreenWrapper>
    )
}

export default ParallelParking

const styles = StyleSheet.create({
    icon: {
        width: 360,
        height: 234,
    }
})