import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomText from '../../../components/CustomText';
import CustomToggle from '../../../components/CustomToggle';
import fonts from '../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const SUB_A =
  'screens.profileNotifications.storesSubtitle';

const NOTIFICATION_ITEMS = [
  {
    id: 'allow',
    title: 'screens.profileNotifications.allow',
    subtitle: null,
  },
  {
    id: 'discount',
    title: 'screens.profileNotifications.discountTitle',
    subtitle: 'screens.profileNotifications.discountSubtitle',
  },
  {
    id: 'stores',
    title: 'screens.profileNotifications.storesTitle',
    subtitle: SUB_A,
  },
  {
    id: 'system',
    title: 'screens.profileNotifications.systemTitle',
    subtitle: 'screens.profileNotifications.systemSubtitle',
  },
  {
    id: 'location',
    title: 'screens.profileNotifications.locationTitle',
    subtitle: 'screens.profileNotifications.locationSubtitle',
  },
  {
    id: 'payment',
    title: 'screens.profileNotifications.paymentTitle',
    subtitle: 'screens.profileNotifications.paymentSubtitle',
  },
];

const ProfileNotifications = () => {
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
        alignItems: 'flex-start',
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
    allow: true,
    discount: true,
    stores: false,
    system: false,
    location: false,
    payment: false,
  });

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      headerUnScrollable={() => <Header2 title="screens.profileNotifications.header" />}>
      <View style={styles.container}>
        <View style={styles.card}>
          {NOTIFICATION_ITEMS.map((item, index) => (
            <View key={item.id}>
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <CustomText
                    label={item.title}
                    fontSize={16}
                    fontFamily={fonts.jakartaSemiBold}
                    color={colors.textPrimary}
                    lineHeight={20}
                  />
                  {item.subtitle ? (
                    <CustomText
                      label={item.subtitle}
                      fontSize={12}
                      fontFamily={fonts.jakartaRegular}
                      color={colors.textSecondary}
                      lineHeight={16}
                      marginTop={6}
                    />
                  ) : null}
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
              {index < NOTIFICATION_ITEMS.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ProfileNotifications;
