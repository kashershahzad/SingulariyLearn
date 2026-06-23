import {Dimensions, StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import Svg, {Polyline} from 'react-native-svg';

import {useTheme, useThemedStyles} from '../../../theme/useTheme';

const SCREEN_W = Dimensions.get('window').width;

function buildPolylinePoints(values, width, height, pad = 14) {
  if (!values?.length) {
    return '';
  }
  const innerW = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const n = values.length;
  const step = n <= 1 ? 0 : innerW / (n - 1);

  return values
    .map((v, i) => {
      const x = pad + (n <= 1 ? innerW / 2 : i * step);
      const y = pad + innerH - ((v - min) / span) * innerH;
      return `${x},${y}`;
    })
    .join(' ');
}

const DEFAULT_VALUES = [14, 18, 22, 28, 32, 38, 45, 52, 58, 66];

const ProgressOverTimeChart = ({
  values = DEFAULT_VALUES,
  height = 160,
  strokeWidth = 3,
}) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(c =>
    StyleSheet.create({
      card: {
        alignSelf: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
        overflow: 'hidden',
      },
    }),
  );

  const horizontalPadding = 20;
  const width = SCREEN_W - horizontalPadding * 2;
  const points = useMemo(
    () => buildPolylinePoints(values, width, height),
    [values, width, height],
  );

  return (
    <View style={[styles.card, {width}]}>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default ProgressOverTimeChart;
