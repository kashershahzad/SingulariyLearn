import { StyleSheet } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../../../../components/ScreenWrapper'
import Banner2 from '../../Molecules/Banner2'
import { Images } from '../../../../../assets/images'
import Header2 from '../../Molecules/Header2'
import Heading from '../../Molecules/Heading'
import MinHeading from '../../Molecules/MinHeading'
import Paragraph from '../../Molecules/Paragraph'
import { useTranslation } from 'react-i18next'

const AdjustingMirror = () => {
  const { t } = useTranslation()

  return (
    <ScreenWrapper
      scrollEnabled
      paddingHorizontal={0}
      headerUnScrollable={() => (<Header2 title={t("adjustingMirrorTitle")} />)}>
      <Banner2 image={Images.AdjestingMirrorBanner} />
      
      <Heading title={t("mainHeading")} />
      
      <MinHeading fontsize={14} title={t("step1")} marginTop={20} />
      <Paragraph marginTop={10} dot={true} title={t("step1Point1")} />
      <Paragraph marginTop={0} dot={true} title={t("step1Point2")} />

      <MinHeading fontsize={14} title={t("step2")} marginTop={20} />
      <Paragraph marginTop={10} dot={true} title={t("step2Point1")} />
      <Paragraph marginTop={0} dot={true} title={t("step2Point2")} />

      <MinHeading fontsize={14} title={t("step3")} marginTop={20} />
      <Paragraph marginTop={10} dot={true} title={t("step3Point1")} />
      <Paragraph marginTop={0} dot={true} title={t("step3Point2")} />
      <Paragraph marginTop={0} dot={true} title={t("step3Point3")} />

      <MinHeading fontsize={14} title={t("step4")} marginTop={20} />
      <Paragraph marginTop={10} dot={true} title={t("step4Point1")} />
      <Paragraph marginTop={0} dot={true} title={t("step4Point2")} />
      <Paragraph marginTop={0} dot={true} title={t("step4Point3")} />

      <MinHeading fontsize={14} title={t("benefitsHeading")} marginTop={20} />
      <Paragraph marginTop={10} dot={true} title={t("benefit1")} />
      <Paragraph marginTop={0} dot={true} title={t("benefit2")} />
      <Paragraph marginTop={0} dot={true} title={t("benefit3")} />
    </ScreenWrapper>
  )
}

export default AdjustingMirror

const styles = StyleSheet.create({})