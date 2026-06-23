import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = 27;
const TRACK_PADDING = 2;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

const CustomToggle = ({
  value = false,
  onValueChange,
  trackColorOn = '#00A8FF',
  trackColorOff = '#C7CDD5',
  thumbColor = '#FFFFFF',
  disabled = false,
}) => {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      friction: 9,
      tension: 70,
    }).start();
  }, [progress, value]);

  const trackBackground = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [trackColorOff, trackColorOn],
  });

  const thumbTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, THUMB_TRAVEL],
  });

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      accessibilityRole="switch"
      accessibilityState={{checked: value, disabled}}>
      <Animated.View style={[styles.track, {backgroundColor: trackBackground}]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: thumbColor,
              transform: [{translateX: thumbTranslateX}],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: TRACK_PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

export default CustomToggle;
