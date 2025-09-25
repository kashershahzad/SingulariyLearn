// Loading.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '../utils/COLORS';

const Loading = ({
  size = 'large',
  color = COLORS.primaryColor4,
  text,
  fullScreen = true,
  style,
}) => {
  return (
    <View style={[fullScreen ? styles.full : styles.inline, style]}>
      <ActivityIndicator size={size} color={color} />
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
};

export default React.memo(Loading);

const styles = StyleSheet.create({
  full: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.8,
  },
});
