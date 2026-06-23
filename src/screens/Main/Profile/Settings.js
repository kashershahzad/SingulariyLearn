import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomText from '../../../components/CustomText';
import CustomToggle from '../../../components/CustomToggle';
import fonts from '../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const SETTINGS_ITEMS = [
  {
    id: 'notification',
    title: 'screens.settings.notificationTitle',
    subtitle: 'screens.settings.notificationSubtitle',
  },
  {
    id: 'profileView',
    title: 'screens.settings.profileViewTitle',
    subtitle: 'screens.settings.profileViewSubtitle',
  },
];

const Settings = () => {
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      container: {
        padding: 20,
        paddingBottom: 24,
        backgroundColor: c.screenBg,
        flex: 1,
      },
      card: {
        backgroundColor: c.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.border,
        paddingHorizontal: 16,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
      },
      rowText: {
        flex: 1,
        paddingRight: 12,
      },
      switchWrap: {
        paddingTop: 2,
      },
      divider: {
        height: 1,
        backgroundColor: c.divider,
      },
    }),
  );
  const [toggles, setToggles] = useState({
    notification: true,
    profileView: true,
  });

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      headerUnScrollable={() => <Header2 title="screens.settings.header" />}>
      <View style={styles.container}>
        <CustomText
          label="screens.settings.categories"
          fontSize={12}
          fontFamily={fonts.jakartaSemiBold}
          color={colors.textPrimary}
          marginBottom={12}
        />
        <View style={styles.card}>
          {SETTINGS_ITEMS.map((item, index) => (
            <View key={item.id}>
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <CustomText
                    label={item.title}
                    fontSize={16}
                    fontFamily={fonts.jakartaSemiBold}
                    color={colors.textPrimary}
                    lineHeight={18}
                  />
                  <CustomText
                    label={item.subtitle}
                    fontSize={12}
                    fontFamily={fonts.jakartaRegular}
                    color={colors.textSecondary}
                    lineHeight={16}
                    marginTop={6}
                  />
                </View>
                <View style={styles.switchWrap}>
                  <CustomToggle
                    value={toggles[item.id]}
                    onValueChange={value =>
                      setToggles(prev => ({...prev, [item.id]: value}))
                    }
                    trackColorOn={colors.switchTrackOn}
                    trackColorOff={colors.switchTrackOff}
                    thumbColor={colors.switchThumb}
                  />
                </View>
              </View>
              {index < SETTINGS_ITEMS.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Settings;
