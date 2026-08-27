import {StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import ScreenWrapper from '../../../components/ScreenWrapper';
import Header2 from '../DmvLicenses/Molecules/Header2';
import CustomText from '../../../components/CustomText';
import CustomToggle from '../../../components/CustomToggle';
import fonts from '../../../assets/fonts';
import {useTheme, useThemedStyles} from '../../../theme/useTheme';
import {ApiRequest} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';

const NOTIFICATION_ITEMS = [
  {
    id: 'allow',
    apiKey: 'allow_notifications',
    title: 'screens.profileNotifications.allow',
    subtitle: null,
  },
  {
    id: 'discount',
    apiKey: 'discount_notifications',
    title: 'screens.profileNotifications.discountTitle',
    subtitle: 'screens.profileNotifications.discountSubtitle',
  },
  {
    id: 'system',
    apiKey: 'system_notifications',
    title: 'screens.profileNotifications.systemTitle',
    subtitle: 'screens.profileNotifications.systemSubtitle',
  },
  {
    id: 'location',
    apiKey: 'location_notifications',
    title: 'screens.profileNotifications.locationTitle',
    subtitle: 'screens.profileNotifications.locationSubtitle',
  },
  {
    id: 'payment',
    apiKey: 'payment_notifications',
    title: 'screens.profileNotifications.paymentTitle',
    subtitle: 'screens.profileNotifications.paymentSubtitle',
  },
];

const DEFAULT_TOGGLES = {
  allow: true,
  discount: true,
  stores: false,
  system: true,
  location: true,
  payment: true,
  category: true,
  profileView: false,
};

const API_KEY_BY_ID = {
  allow: 'allow_notifications',
  discount: 'discount_notifications',
  stores: 'stores_notifications',
  system: 'system_notifications',
  location: 'location_notifications',
  payment: 'payment_notifications',
  category: 'category_notifications',
  profileView: 'profile_view_notifications',
};

const ID_BY_API_KEY = Object.fromEntries(
  Object.entries(API_KEY_BY_ID).map(([id, key]) => [key, id]),
);

const buildSettingsPayload = toggles =>
  Object.entries(API_KEY_BY_ID).map(([id, key]) => ({
    key,
    enabled: toggles[id] ? 1 : 0,
  }));

const parseSettingsToToggles = settings => {
  if (!Array.isArray(settings)) {
    return null;
  }
  const next = {...DEFAULT_TOGGLES};
  settings.forEach(item => {
    const id = ID_BY_API_KEY[item?.key];
    if (!id) {
      return;
    }
    next[id] = Number(item?.enabled) === 1 || item?.enabled === true;
  });
  return next;
};

const ProfileNotifications = () => {
  const token = useSelector(state => state.authConfig.token);
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

  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);
  const [savingKey, setSavingKey] = useState(null);
  const togglesRef = useRef(toggles);

  useEffect(() => {
    togglesRef.current = toggles;
  }, [toggles]);

  const saveNotificationSettings = useCallback(
    async nextToggles => {
      if (!token) {
        ToastMessage('Please login to update notification settings.', 'error');
        return false;
      }

      const body = {
        type: 'save_notification_settings',
        user_id: String(token),
        settings: buildSettingsPayload(nextToggles),
      };
      console.log('save_notification_settings body', body);

      try {
        const response = await ApiRequest(body);
        console.log('save_notification_settings response', response);
        if (response?.status === 200 && response?.data?.result !== false) {
          return true;
        }
        ToastMessage(
          response?.data?.message || 'Failed to save notification settings.',
          'error',
        );
        return false;
      } catch (error) {
        console.log('save_notification_settings error', error);
        ToastMessage('Failed to save notification settings.', 'error');
        return false;
      }
    },
    [token],
  );

  useEffect(() => {
    let cancelled = false;
    const loadSettings = async () => {
      if (!token) {
        return;
      }
      try {
        const body = {
          type: 'get_notification_settings',
          user_id: String(token),
        };
        console.log('get_notification_settings body', body);
        const response = await ApiRequest(body);
        console.log('get_notification_settings response', response);
        if (cancelled || response?.status !== 200) {
          return;
        }
        const raw =
          response?.data?.settings ||
          response?.data?.data?.settings ||
          response?.data?.data;
        const parsed = parseSettingsToToggles(raw);
        if (parsed) {
          setToggles(parsed);
        }
      } catch (error) {
        console.log('get_notification_settings error', error);
      }
    };
    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleToggle = async (id, value) => {
    if (savingKey) {
      return;
    }
    const previous = togglesRef.current;
    const next = {...previous, [id]: value};
    setToggles(next);
    setSavingKey(id);
    const ok = await saveNotificationSettings(next);
    if (!ok) {
      setToggles(previous);
    }
    setSavingKey(null);
  };

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      headerUnScrollable={() => (
        <Header2 title="screens.profileNotifications.header" />
      )}>
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
                    onValueChange={value => handleToggle(item.id, value)}
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
