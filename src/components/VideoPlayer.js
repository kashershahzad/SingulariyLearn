import {Animated, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Video from 'react-native-video';
import Icons from './Icons';

const VideoPlayer = ({source, style, videoStyle, repeat = true}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const fadeTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const handleTogglePlayback = () => {
    setIsPaused(prev => !prev);
  };

  useEffect(() => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }

    if (isPaused) {
      setShowIcon(true);
      iconOpacity.stopAnimation();
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      return;
    }

    setShowIcon(true);
    iconOpacity.setValue(1);
    fadeTimeoutRef.current = setTimeout(() => {
      Animated.timing(iconOpacity, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          setShowIcon(false);
        }
      });
    }, 250);
  }, [iconOpacity, isPaused]);

  return (
    <View style={[styles.videoWrapper, style]}>
      <Video
        source={source}
        style={[styles.video, videoStyle]}
        resizeMode="cover"
        repeat={repeat}
        paused={isPaused}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.touchLayer}
        onPress={handleTogglePlayback}>
        {showIcon && (
          <Animated.View style={[styles.centerControl, {opacity: iconOpacity}]}>
            <Icons
              family="Ionicons"
              name={isPaused ? 'play' : 'pause'}
              size={26}
              color="#3525CD"
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  videoWrapper: {
    width: '100%',
    height: 201,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  touchLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerControl: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
