import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';
import fonts from '../../../assets/fonts';

const CoursesCompletedCard = ({count = 0, label}) => {
  const {t} = useTranslation();
  const resolvedLabel = label || t('screens.stats.coursesCompleted');

  return (
    <View style={styles.card}>
      <View style={styles.textCol}>
        <CustomText
          label={resolvedLabel}
          fontSize={12}
          fontFamily={fonts.jakartaSemiBold}
          color="#6A6A6A"
          letterSpacing={0.8}
          removeTranslation
        />
        <CustomText
          label={String(count)}
          fontSize={40}
          fontFamily={fonts.jakartaBold}
          color="#0298EF"
          lineHeight={48}
          marginTop={8}
          removeTranslation
        />
      </View>
      <View style={styles.iconWrap}>
        <Icons family="Ionicons" name="school" size={22} color="#0298EF" />
      </View>
    </View>
  );
};

export default CoursesCompletedCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F2FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  textCol: {
    flex: 1,
    paddingRight: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
});
