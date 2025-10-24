import PhoneInput from "react-native-phone-number-input";
import { StyleSheet, View } from "react-native";
import React, { useRef, useState } from "react";

import CustomText from "./CustomText";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const CountryPhoneInput = ({
  value = "+1869",
  setValue,
  withLabel,
  onEndEditing,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef();
  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };
  return (
    <View style={{ marginBottom: error ? 0 : 20 }}>
      {withLabel && (
        <CustomText
          label={withLabel}
          fontFamily={fonts.jakartaMedium}
          marginBottom={8}
          fontSize={16}
        />
      )}
      <PhoneInput
        ref={ref}
        textInputStyle={{
          fontSize: 14,
          fontFamily: fonts.regular,
        }}
        defaultValue={value}
        defaultCode="PK"
        layout="first"
        textInputProps={{
          placeholderTextColor: COLORS.inputLabel,
          maxLength: 12,
          style: [
            styles.phoneInput,
            { flex: 1, backgroundColor: isFocused ? "#e3ebef" : "#FAFAFA" },
          ],
          onFocus: handleFocus,
          onBlur: handleBlur,
          onEndEditing,
        }}
        countryPickerButtonStyle={{
          backgroundColor: isFocused ? "#e3ebef" : "#FAFAFA",
        }}
        codeTextStyle={[styles.phoneInput, { marginLeft: -20 }]}
        containerStyle={[
          styles.phoneInputContainer,
          {
            borderColor: error
              ? COLORS.primaryColor4
              : isFocused
              ? COLORS.primaryColor
              : COLORS.inputBg,
            backgroundColor: isFocused ? "#e3ebef" : "#FAFAFA",
          },
        ]}
        textContainerStyle={[
          styles.textContainerStyle,
          { backgroundColor: isFocused ? "#e3ebef" : "#FAFAFA" },
        ]}
        onChangeFormattedText={(formattedValue) => setValue(formattedValue)}
      />
      {error && (
        <CustomText
          label={error}
          color={COLORS.primaryColor4}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={15}
          marginTop={5}
        />
      )}
    </View>
  );
};
export default CountryPhoneInput;
const styles = StyleSheet.create({
  phoneInput: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: COLORS.black,
  },
  phoneInputContainer: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  textContainerStyle: {
    paddingVertical: 0,
  },
});
