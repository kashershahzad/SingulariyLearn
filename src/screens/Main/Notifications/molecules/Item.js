import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';

import CustomText from '../../../../components/CustomText';
import ImageFast from '../../../../components/ImageFast';
import fonts from '../../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../../theme/useTheme';

const Item = ({title, time, desc, img, onPress}) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      mainContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
      },
      img: {
        width: 48,
        height: 48,
        borderRadius: 100,
      },
      container: {
        width: '82%',
        borderBottomWidth: 1,
        borderBottomColor: c.divider,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    }),
  );

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.mainContainer}>
      <ImageFast source={img} style={styles.img} />
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={{width: '70%'}}>
            <CustomText
              label={title}
              fontFamily={fonts.semiBold}
              fontSize={16}
              color={colors.textPrimary}
            />
          </View>
          <CustomText
            label={time}
            fontFamily={fonts.medium}
            fontSize={12}
            color={colors.textMuted}
          />
        </View>
        <CustomText
          label={desc}
          fontSize={14}
          numberOfLines={3}
          color={colors.textSecondary}
          marginBottom={15}
          marginTop={10}
        />
      </View>
    </TouchableOpacity>
  );
};

export default Item;
