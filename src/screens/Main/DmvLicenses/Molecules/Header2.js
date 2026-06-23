import {StyleSheet, View, Platform} from 'react-native';
import React from 'react';
import {Images} from '../../../../assets/images';
import ImageFast from '../../../../components/ImageFast';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import CustomHorizontalLine from '../../../../components/CustomHorizontalLine';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../../../theme/useTheme';

const SIDE_WIDTH = 44;

const Header2 = ({
  title,
  line,
  hideBack = false,
  titleRemoveTranslation = false,
}) => {
  const navigation = useNavigation();
  const {colors} = useTheme();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <View style={styles.container}>
        {!hideBack ? (
          <View style={styles.headerSide}>
            <ImageFast
              onPress={handleBack}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
              source={Images.leftarrow}
              resizeMode="contain"
              style={styles.icon}
            />
          </View>
        ) : null}
        <View style={styles.titleContainer}>
          <CustomText
            fontSize={16}
            fontFamily={fonts.jakartaSemiBold}
            color={colors.headerTitle}
            label={title}
            removeTranslation={titleRemoveTranslation}
            style={styles.titleText}
            textAlign={'center'}
            numberOfLines={2}
          />
        </View>
        {!hideBack ? <View style={styles.headerSide} /> : null}
      </View>
      {line ? <CustomHorizontalLine height={1} /> : null}
    </>
  );
};

export default Header2;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 8 : 0,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
  },
  headerSide: {
    width: SIDE_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  icon: {
    height: 24,
    width: 24,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    textAlign: 'center',
  },
});
