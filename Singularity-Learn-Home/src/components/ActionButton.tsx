import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles as s } from '../styles';

export function ActionButton({ label, onPress, secondary = false, selected }: {
  label: string; onPress: () => void; secondary?: boolean; selected?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={selected === undefined ? undefined : { selected }} onPress={onPress}
    style={({ pressed }) => [s.button, secondary && s.secondary, pressed && s.pressed]}>
    <Text style={[s.buttonText, secondary && s.secondaryText]}>{label}</Text>
  </Pressable>;
}
