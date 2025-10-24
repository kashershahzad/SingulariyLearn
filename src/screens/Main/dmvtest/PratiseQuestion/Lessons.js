import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import ImageFast from '../../../../components/ImageFast';
import {Images} from '../../../../assets/images';
import { COLORS } from '../../../../utils/COLORS';

const Lessons = ({ id, name, status, onPress , percentage}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.mincontainer}>
        <CustomText
          label={`Lessons ${id}`}
          fontFamily={fonts.regular}
          fontSize={14}
          color={COLORS.btn}
        />

        <CustomText
          label={`${percentage}% Completed`}
          fontFamily={fonts.medium}
          fontSize={8}
          color={COLORS.btn}
        />
      </View>

      <View style={styles.mincontainer}>
        <CustomText
          label={name}
          fontFamily={fonts.regular}
          fontSize={14}
        />

        <ImageFast
          source={Images.downarrow}
          resizeMode={'contain'}
          style={styles.icon}
        />
      </View>
      <View style={styles.lineBackground}>
        <View style={[styles.lineProgress, {width: percentage}]}></View>
      </View>
    </TouchableOpacity>
  );
};

export default Lessons;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    borderRadius: 8,
    padding: 10,
  },
  mincontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    height: 10,
    width: 10,
    marginTop: 8,
    transform: [{rotate: '270deg'}]
  },
  lineBackground: {
    height: 4,
    borderRadius: 10,
    backgroundColor: '#b9bad3ff',
    marginTop: 10,
  },
  lineProgress: {
    height: '100%',
    borderRadius: 10,
    backgroundColor:COLORS.btn
  },
});