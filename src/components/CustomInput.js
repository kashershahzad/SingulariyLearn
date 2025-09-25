import {Image, StyleSheet, TextInput, View} from 'react-native';
import React, {useState} from 'react';

import CustomText from './CustomText';
import Icons from './Icons';

import {COLORS} from '../utils/COLORS';
import i18n from '../language/i18n';
import fonts from '../assets/fonts';
import {Images} from '../assets/images';

const CustomInput = ({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType,
  multiline,
  maxLength,
  placeholderTextColor,
  editable,
  textAlignVertical,
  marginBottom,
  height = 58,
  autoCapitalize,
  error,
  isFocus,
  isBlur,
  width,
  onEndEditing,
  autoFocus,
  ref,
  borderRadius,
  marginTop,
  withLabel,
  isError,
  labelColor,
  borderColor,
  bgcolor = '#FBFBFB',
  // for image icon
  iconImage,
  iconPosition = 'left', // 'left' or 'right'
  iconWidth = 20,
  iconHeight = 20,
  iconStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePass, setHidePass] = useState(true);

  const handleFocus = () => {
    setIsFocused(true);
    isFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    isBlur?.();
  };

  return (
    <View style={{width: width || '100%'}}>
      {withLabel && (
        <CustomText
          label={withLabel}
          marginBottom={4}
          color={labelColor || COLORS.black}
        />
      )}
      <View
        style={[
          styles.mainContainer,
          {
            marginBottom: error ? 5 : marginBottom || 10,
            marginTop,
            borderColor:
              error || isError
                ? COLORS.primaryColor4
                : isFocused
                ? COLORS.primaryColor
                : borderColor,
            borderWidth: isFocused || error || isError ? 1 : 1,
            height: height ? height : multiline ? 180 : 56,
            width: '100%',
            borderRadius: borderRadius || 12,
            paddingLeft: iconImage && iconPosition === 'left' ? 10 : 20,
            paddingRight: iconImage && iconPosition === 'right' ? 10 : 20,
            backgroundColor: isFocused ? '#FBFBFB#' : bgcolor,
          },
        ]}>
        {iconImage && iconPosition === 'left' && (
          <Image
            source={iconImage}
            style={[
              styles.leftIcon,
              {width: iconWidth, height: iconHeight},
              iconStyle,
            ]}
            resizeMode="contain"
          />
        )}

        <TextInput
          ref={ref}
          placeholder={i18n.t(placeholder)}
          style={[
            styles.input,
            {
              width: secureTextEntry || (iconImage && iconPosition === 'right') ? '92%' : '99%',
              paddingVertical: multiline ? 18 : 0,
              marginLeft: iconImage && iconPosition === 'left' ? 10 : 0,
              marginRight: iconImage && iconPosition === 'right' ? 10 : 0,
            },
          ]}
          secureTextEntry={secureTextEntry ? (hidePass ? true : false) : false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          onEndEditing={onEndEditing}
          maxLength={maxLength}
          placeholderTextColor={placeholderTextColor || COLORS.inputLabel}
          editable={editable}
          textAlignVertical={multiline ? 'top' : textAlignVertical}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
        />

        {secureTextEntry && (
          <Icons
            name={!hidePass ? 'eye' : 'eye-off'}
            color={COLORS.black}
            size={20}
            family="Feather"
            onPress={() => setHidePass(!hidePass)}
          />
        )}

        {iconImage && iconPosition === 'right' && !secureTextEntry && (
          <Image
            source={iconImage}
            style={[
              styles.rightIcon,
              {width: iconWidth, height: iconHeight},
              iconStyle,
            ]}
            resizeMode="contain"
          />
        )}
      </View>
      {error && (
        <CustomText
          label={error}
          color={COLORS.primaryColor4}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={15}
        />
      )}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  input: {
    height: '100%',
    padding: 0,
    margin: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  leftIcon: {
    marginRight: 5,
  },
  rightIcon: {
    marginLeft: 10,
  },
});