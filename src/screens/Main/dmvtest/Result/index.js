import React from 'react';
import { StyleSheet, View } from 'react-native';
import MockupHeader from '../Molecules/MockupHeader';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import { COLORS } from '../../../../utils/COLORS';
import ImageFast from '../../../../components/ImageFast';
import { Images } from '../../../../assets/images';
import fonts from '../../../../assets/fonts';
import CustomText from '../../../../components/CustomText';
import Resultbtn from './Resultbtn';
import ResultsStats from './ResultsStats';
import QuestionsCheck from './QuestionsCheck';
import { useTranslation } from 'react-i18next';

const Result = () => {
  const { t } = useTranslation();
  
  return (
    <ScreenWrapper
      scrollEnabled
      statusBarColor={COLORS.primaryColor4}
      backgroundColor={COLORS.primaryColor4}
      paddingHorizontal={0}
    >
      <MockupHeader title={t('checkResultTitle')} />
      <View style={styles.container}>
        <ImageFast
          source={Images.resultbanner}
          resizeMode={'contain'}
          style={styles.icon}
        />
        <CustomText
          label={t('totalAttempts')}
          fontFamily={fonts.medium}
          fontSize={14}
          textAlign={'start'}
          marginTop={10}
        />
        <Resultbtn/>
        <ResultsStats/>
        <QuestionsCheck/>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    padding: 20,
    marginTop: -30,
    paddingBottom: 40
  },
  icon: {
    height: 231,
    width: '100%',
    alignSelf: 'center'
  },
});

export default Result;