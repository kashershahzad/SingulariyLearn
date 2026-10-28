import React from 'react';
import { View } from 'react-native';
import { styles as s } from '../styles';
export function ProgressBar({ value }: { value: number }) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  return <View accessibilityRole="progressbar" accessibilityLabel="Course progress"
    accessibilityValue={{ min: 0, max: 100, now: percent }} style={s.track}>
    <View style={[s.fill, { width: `${percent}%` }]} />
  </View>;
}
