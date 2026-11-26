import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Icons from './Icons';
import CustomText from './CustomText';
import fonts from '../assets/fonts';
import {Images} from '../assets/images';
import {tabIcons} from '../assets/images/tabIcons';
import {useTheme} from '../theme/useTheme';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.58, 240);

const TAB_ITEMS = [
  {
    name: 'LandingPage',
    labelKey: 'screens.tabs.home',
    icon: tabIcons.house,
  },
  {
    name: 'Study',
    labelKey: 'screens.tabs.study',
    icon: tabIcons.books,
  },
  {
    name: 'Stats',
    labelKey: 'screens.tabs.stats',
    icon: tabIcons.stats,
  },
  {
    name: 'Profile',
    labelKey: 'screens.tabs.profile',
    icon: tabIcons.profile2,
  },
];

const findTabNavigation = navigation => {
  let nav = navigation;
  while (nav) {
    const state = nav.getState?.();
    const names = state?.routeNames || [];
    if (
      names.includes('LandingPage') &&
      names.includes('Study') &&
      names.includes('Profile')
    ) {
      return nav;
    }
    nav = nav.getParent?.();
  }
  return null;
};

const TabMoreMenu = ({iconColor, style}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const slideX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const tabNavigation = useMemo(
    () => findTabNavigation(navigation),
    [navigation],
  );

  const activeRouteName = useNavigationState(state => {
    let current = state;
    while (current?.routes && current.index != null) {
      const route = current.routes[current.index];
      if (!route?.state) {
        return route?.name;
      }
      current = route.state;
    }
    return current?.routes?.[current?.index]?.name;
  });

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    slideX.setValue(-DRAWER_WIDTH);
    Animated.timing(slideX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
    return undefined;
  }, [visible, slideX]);

  if (!tabNavigation) {
    return null;
  }

  const closeDrawer = (afterClose) => {
    Animated.timing(slideX, {
      toValue: -DRAWER_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        setVisible(false);
        afterClose?.();
      }
    });
  };

  const handleNavigate = screenName => {
    closeDrawer(() => {
      if (screenName && screenName !== activeRouteName) {
        tabNavigation.navigate(screenName);
      }
    });
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setVisible(true)}
        hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
        style={[styles.trigger, style]}
        accessibilityRole="button"
        accessibilityLabel={t('screens.tabs.menu', {defaultValue: 'Menu'})}>
        <Icons
          family="Ionicons"
          name="menu-outline"
          size={26}
          color={iconColor || colors.textPrimary}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => closeDrawer()}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => closeDrawer()} />
          <Animated.View
            style={[
              styles.drawer,
              {
                width: DRAWER_WIDTH,
                paddingTop: Math.max(insets.top, 12) + 8,
                paddingBottom: Math.max(insets.bottom, 16),
                backgroundColor: colors.card || '#FFFFFF',
                borderRightColor: colors.border || '#E5E7EB',
                transform: [{translateX: slideX}],
              },
            ]}>
            <View style={styles.drawerHeader}>
              <Image
                source={Images.landinglogo}
                style={styles.drawerLogo}
                resizeMode="contain"
              />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => closeDrawer()}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icons
                  family="Ionicons"
                  name="close"
                  size={22}
                  color={colors.textMuted || '#64748B'}
                />
              </TouchableOpacity>
            </View>

            <CustomText
              label="screens.tabs.menu"
              fontSize={13}
              fontFamily={fonts.jakartaMedium}
              color={colors.textMuted || '#64748B'}
              marginBottom={8}
              marginLeft={4}
            />

            {TAB_ITEMS.map(item => {
              const active = activeRouteName === item.name;
              return (
                <TouchableOpacity
                  key={item.name}
                  activeOpacity={0.85}
                  onPress={() => handleNavigate(item.name)}
                  style={[
                    styles.menuRow,
                    active && {
                      backgroundColor: colors.iconBg || '#F0F9FF',
                    },
                  ]}>
                  <Image source={item.icon} style={styles.menuIcon} />
                  <CustomText
                    label={item.labelKey}
                    fontSize={16}
                    fontFamily={
                      active ? fonts.jakartaSemiBold : fonts.jakartaMedium
                    }
                    color={
                      active
                        ? colors.accent || '#0298EF'
                        : colors.textPrimary || '#0F172A'
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

export default TabMoreMenu;

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  drawer: {
    height: '100%',
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {width: 4, height: 0},
    elevation: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  drawerLogo: {
    width: 112,
    height: 30,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
