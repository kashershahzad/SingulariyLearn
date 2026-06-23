import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';

import CustomText from './CustomText';
import fonts from '../assets/fonts';
import {useTheme} from '../theme/useTheme';

const CircularProgress = ({
  percentage = 0,
  size = 200,
  strokeWidth = 30,
  strokeColor = '#A2DC5F',
  trackStrokeColor,
  desc = '',
  percentageTextSize = 37,
  percentageTextColor,
  descTextSize = 10,
  descTextColor,
}) => {
  const {colors} = useTheme();
  const resolvedTrack = trackStrokeColor ?? colors.progressTrack;
  const resolvedPercentColor = percentageTextColor ?? colors.textPrimary;
  const resolvedDescColor = descTextColor ?? colors.textSecondary;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedTrack}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={[styles.percentageContainer, {width: size, height: size}]}>
        <CustomText
          label={`${percentage}%`}
          removeTranslation
          fontFamily={fonts.bold}
          fontSize={percentageTextSize}
          lineHeight={44}
          textAlign="center"
          color={resolvedPercentColor}
        />
        {!!desc && (
          <CustomText
            label={desc}
            removeTranslation
            fontFamily={fonts.jakartaBold}
            fontSize={descTextSize}
            lineHeight={8}
            textAlign="center"
            color={resolvedDescColor}
          />
        )}
      </View>
    </View>
  );
};

export default CircularProgress;

const styles = StyleSheet.create({
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  percentageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
