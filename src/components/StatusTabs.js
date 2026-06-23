import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

import CustomText from './CustomText';
import fonts from '../assets/fonts';
import {useTheme} from '../theme/useTheme';

const StatusTabs = ({tabs = [], activeTab, onTabPress, style}) => {
  const {colors} = useTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginTop: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        tabButton: {
          flex: 1,
          minHeight: 44,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 6,
          paddingVertical: 10,
          backgroundColor: colors.chipInactiveBg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        activeTabButton: {
          backgroundColor: colors.accent,
          borderColor: colors.accent,
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.container, style]}>
      {tabs.map(tab => {
        const isActive = tab === activeTab;

        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.85}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => onTabPress?.(tab)}>
            <CustomText
              label={tab}
              removeTranslation
              fontFamily={fonts.jakartaSemiBold}
              fontSize={16}
              lineHeight={22}
              color={isActive ? colors.textOnAccent : colors.chipInactiveText}
              textAlign="center"
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default StatusTabs;
