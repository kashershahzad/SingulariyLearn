import {StyleSheet, Text, View, Dimensions} from 'react-native';
import React from 'react';
import {COLORS} from '../../../../utils/COLORS';
import CustomText from '../../../../components/CustomText';
import fonts from '../../../../assets/fonts';
import CustomButton from '../../../../components/CustomButton';
import ImageFast from '../../../../components/ImageFast';
import {Images} from '../../../../assets/images';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const {width} = Dimensions.get('window');

const Banner = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const packages = useSelector(state => state.package.package);
  return (
    <View style={styles.container}>
      <CustomText
        label={t('dmvTestPrep')}
        fontFamily={fonts.jakartaSemiBold}
        fontSize={22}
        marginRight={100}
        width={200}
        lineHeight={30}
        color={'white'}
      />

      <CustomButton
        onPress={() =>
          packages === true
            ? navigation.navigate('PratiseQuestion', {roadsign: false})
            : navigation.navigate('PermitType')
        }
        title={t('start')}
        backgroundColor={COLORS.btn}
        height={32}
        width={105}
        alignSelf="start"
        fontSize={16}
        fontFamily={fonts.jakartaMedium}
        borderRadius={4}
        marginTop={10}
      />
      <ImageFast
        source={Images.bannerCircle}
        resizeMode={'contain'}
        style={styles.icon}
      />
    </View>
  );
};

export default Banner;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: COLORS.primaryColor4,
    borderRadius: 10,
    paddingTop: 15,
    paddingLeft: 20,
    height: 149,
    overflow: 'hidden',
  },
  icon: {
    height: 137,
    width: 137,
    position: 'absolute',
    left: width * 0.7,
    top: 20,
  },
});
