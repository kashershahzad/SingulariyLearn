import {StyleSheet, View} from 'react-native';
import React from 'react';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const Header = ({title = 'screens.checkout.header', removeTranslation = false}) => {
  const navigation = useNavigation();
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingLeft: 20,
        paddingVertical: 10,
        width: '100%',
        backgroundColor: c.screenBg,
      },
      headerSide: {
        width: 44,
        alignItems: 'flex-start',
        justifyContent: 'center',
      },
      logoCenterWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      logo: {
        width: 20,
        height: 20,
      },
    }),
  );

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerSide}>
        <ImageFast
          source={Images.leftarrow}
          style={styles.logo}
          resizeMode={'contain'}
          onPress={() => {
            navigation.goBack();
          }}
        />
      </View>
      <View style={styles.logoCenterWrap}>
        <CustomText
          label={title}
          fontFamily={fonts.jakartaBold}
          fontSize={18}
          color={colors.textPrimary}
          removeTranslation={removeTranslation}
        />
      </View>
      <View style={styles.headerSide} />
    </View>
  );
};

export default Header;
