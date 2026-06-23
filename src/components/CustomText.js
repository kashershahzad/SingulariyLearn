import { Text, TouchableOpacity, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import React from "react";

import { useTheme } from "../theme/useTheme";
import fonts from "../assets/fonts";
import i18n from "../language/i18n";

const CustomText = ({
  textStyle,
  fontSize,
  marginTop,
  marginBottom,
  marginRight,
  marginLeft,
  alignSelf,
  fontFamily=fonts.regular,
  fontStyle,
  textTransform,
  textAlign,
  label,
  color,
  fontWeight,
  bottom,
  width,
  borderColor,
  borderBottomWidth,
  onPress,
  marginVertical,
  paddingBottom,
  activeOpacity,
  textDecorationLine,
  lineHeight=30,
  containerStyle,
  right,
  left,
  numberOfLines,
  children,
  removeTranslation,
  disabled,
  letterSpacing,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  // iOS: Poppins/Jakarta don't support Urdu/Arabic script — use system font so text renders
  const isRTLScript = (i18n.language === 'ur' || i18n.language === 'ar');
  const resolvedFontFamily = (Platform.OS === 'ios' && isRTLScript)
    ? undefined
    : (fontFamily || fonts.regular);

  return (
    <TouchableOpacity
      style={[containerStyle, { alignSelf }]}
      onPress={onPress}
      disabled={!onPress || disabled}
      activeOpacity={activeOpacity || 0.6}
    >
      <Text
        numberOfLines={numberOfLines}
        style={[
          {
            fontSize: fontSize || 14,
            color: color || colors.textPrimary,
            marginTop: marginTop || 0,
            marginBottom: marginBottom || 0,
            marginLeft: marginLeft || 0,
            marginRight: marginRight || 0,
            fontFamily: resolvedFontFamily,
            fontStyle: fontStyle,
            lineHeight: lineHeight,
            textAlign: textAlign,
            textTransform: textTransform,
            fontWeight: fontWeight,
            bottom: bottom,
            borderBottomWidth: borderBottomWidth,
            borderColor: borderColor,
            width: width,
            marginVertical: marginVertical,
            paddingBottom: paddingBottom,
            right: right,
            left: left,
            letterSpacing,
            textDecorationLine: textDecorationLine || "none",
          },
          textStyle,
        ]}
      >
        {removeTranslation ? label : t(label)}
        {children}
      </Text>
    </TouchableOpacity>
  );
};
export default CustomText;
