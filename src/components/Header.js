import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React from "react";

import CustomText from "./CustomText";
import Icons from "./Icons";

import fonts from "../assets/fonts";
import { useTheme, useThemedStyles } from "../theme/useTheme";

const Header = ({
  title,
  hideBackArrow,
  onBackPress,
  isAdd,
  onPress,
  textColor,
  onPhonePress,
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useThemedStyles((c) =>
    StyleSheet.create({
      mainContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        padding: 20,
        marginTop: 10,
        backgroundColor: c.screenBg,
      },
      backIcon: {
        width: 38,
        height: 38,
        backgroundColor: c.cardMuted,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
      },
    })
  );
  return (
    <View style={styles.mainContainer}>
      <View style={{ width: "12%" }}>
        {hideBackArrow ? null : (
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.backIcon}
            onPress={
              onBackPress
                ? onBackPress
                : () => {
                    if (navigation.canGoBack()) navigation.goBack();
                  }
            }
          >
            <Icons family="Ionicons" name="chevron-back-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ width: "76%", alignItems: "center" }}>
        <CustomText
          label={title}
          color={textColor ? textColor : colors.textPrimary}
          fontFamily={fonts.bold}
          fontSize={22}
        />
      </View>

      <View style={[{ width: "12%", alignItems: "flex-end" }]}>
        {isAdd ? (
          <>
            <TouchableOpacity onPress={onPress} style={styles.backIcon}>
              <Icons family="AntDesign" name="pluscircleo" color={colors.textPrimary} />
            </TouchableOpacity>
          </>
        ) : null}
        {onPhonePress ? (
          <>
            <TouchableOpacity onPress={onPhonePress} style={styles.backIcon}>
              <Icons
                family="FontAwesome5"
                name="phone-alt"
                color={colors.accent}
                size={18}
              />
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );
};

export default Header;
