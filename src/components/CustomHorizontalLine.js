import React from 'react';
import { View, StyleSheet } from 'react-native';

const CustomHorizontalLine = ({ height = 2, color = '#E5E7EB', style }) => {
  return (
    <View
      style={[
        styles.line,
        { height, backgroundColor: color },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  line: {
    marginTop:3,
    width: '100%',
  },
});

export default CustomHorizontalLine;
