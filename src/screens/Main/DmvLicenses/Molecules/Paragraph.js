import { StyleSheet, View } from 'react-native';
import React from 'react';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';

const Paragraph = ({ width=301, title, marginLeft = 19, marginTop = 10, dot = false }) => {
  return (
    <View>
      <CustomText
        marginLeft={marginLeft}
        marginTop={marginTop}
        label={dot ? `• ${title}` : title}
        color={'#AFAFAF'}
        fontSize={14}
        fontFamily={fonts.medium}
        width={width}
      />
    </View>
  );
};

export default Paragraph;

const styles = StyleSheet.create({});
