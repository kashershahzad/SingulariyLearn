import {StyleSheet, View} from 'react-native';
import React from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const APP_VERSION = '1.0';

const About = () => {
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        paddingBottom: 24,
        backgroundColor: c.screenBg,
      },
      hero: {
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 24,
      },
      logo: {
        width: 96,
        height: 96,
        borderRadius: 20,
      },
      card: {
        backgroundColor: c.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.border,
        padding: 16,
      },
      row: {
        paddingVertical: 12,
      },
      divider: {
        height: 1,
        backgroundColor: c.divider,
      },
      description: {
        marginTop: 20,
      },
    }),
  );

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      scrollEnabled
      headerUnScrollable={() => <Header2 title="screens.about.header" />}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <ImageFast
            source={Images.newlogo || Images.logo || Images.landinglogo}
            resizeMode="contain"
            style={styles.logo}
          />
          <CustomText
            label="screens.about.appName"
            fontSize={22}
            fontFamily={fonts.jakartaBold}
            color={colors.textPrimary}
            textAlign="center"
            marginTop={14}
          />
          <CustomText
            label={`Version ${APP_VERSION}`}
            fontSize={13}
            fontFamily={fonts.jakartaMedium}
            color={colors.textSecondary}
            textAlign="center"
            marginTop={6}
            removeTranslation
          />
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <CustomText
              label="screens.about.versionTitle"
              fontSize={14}
              fontFamily={fonts.jakartaSemiBold}
              color={colors.textPrimary}
              lineHeight={18}
            />
            <CustomText
              label={APP_VERSION}
              fontSize={13}
              fontFamily={fonts.jakartaMedium}
              color={colors.textSecondary}
              marginTop={4}
              removeTranslation
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <CustomText
              label="screens.about.platformTitle"
              fontSize={14}
              fontFamily={fonts.jakartaSemiBold}
              color={colors.textPrimary}
              lineHeight={18}
            />
            <CustomText
              label="screens.about.platformValue"
              fontSize={13}
              fontFamily={fonts.jakartaMedium}
              color={colors.textSecondary}
              marginTop={4}
            />
          </View>
        </View>

        <View style={styles.description}>
          <CustomText
            label="screens.about.aboutTitle"
            fontSize={14}
            fontFamily={fonts.jakartaSemiBold}
            color={colors.textPrimary}
            marginBottom={8}
          />
          <CustomText
            label="screens.about.aboutBody"
            fontSize={13}
            fontFamily={fonts.jakartaRegular}
            color={colors.textSecondary}
            lineHeight={20}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default About;
