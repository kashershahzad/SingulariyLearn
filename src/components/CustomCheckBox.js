import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/COLORS';
import Icons from './Icons';

const CustomCheckbox = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity 
      hitSlop={{ top: 10, bottom: 10, left: 300, right: 50 }}
      style={styles.checkboxContainer}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, value && styles.checked]}>
        {value && <View style={styles.innerCircle} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20, // Slightly increased for better visibility
    height: 20, // Slightly increased for better visibility
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ED7D20',
    marginRight: 10,
  },
  checkbox: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checked: {
    backgroundColor: 'white',
    borderRadius:50,
  },
  innerCircle: {
    width: 12, // Size of the white inner circle
    height: 12, // Size of the white inner circle
    borderRadius: 50,
    backgroundColor: '#ED7D20',
  },
});

export default CustomCheckbox;