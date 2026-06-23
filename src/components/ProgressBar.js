import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {useTheme} from '../theme/useTheme';

const ProgressBar = ({progress = 0, trackStyle, fillStyle}) => {
  const {colors} = useTheme();
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        track: {
          marginTop: 5,
          height: 9,
          borderRadius: 999,
          backgroundColor: colors.progressTrack,
          overflow: 'hidden',
        },
        fill: {
          height: '100%',
          borderRadius: 999,
          backgroundColor: colors.progressFill,
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.track, trackStyle]}>
      <View style={[styles.fill, {width: `${safeProgress}%`}, fillStyle]} />
    </View>
  );
};

export default ProgressBar;
