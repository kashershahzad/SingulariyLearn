import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useIsFocused } from "@react-navigation/native";
import React from "react";
import {
  SafeAreaView,
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
  Platform,
} from "react-native";

import ImageFast from "./ImageFast";

import { COLORS } from "../utils/COLORS";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const FocusAwareStatusBar = (props) => {
  const isFocused = useIsFocused();
  return isFocused ? (
    <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} {...props} />
  ) : null;
};

const ScreenWrapper = ({
  children,
  statusBarColor = COLORS.mainBg,
  translucent = false,
  scrollEnabled = false,
  backgroundImage,
  backgroundColor = COLORS.mainBg,
  headerUnScrollable = () => null,
  footerUnScrollable = () => null,
  barStyle = "dark-content",
  refreshControl,
  paddingBottom,
  nestedScrollEnabled,
  paddingHorizontal = 16,
  scrollViewRef,
}) => {
  const content = () => {

    const inset = useSafeAreaInsets()

    return (
      <View
        style={[
          styles.container,
          {
            paddingBottom: paddingBottom
              ? paddingBottom
              : Platform.OS == "android"
              ? 0
              : 20,
            backgroundColor: backgroundImage ? "transparent" : backgroundColor,
            paddingTop:translucent ? 0 : inset.top
          },
        ]}
      >
        <FocusAwareStatusBar
          barStyle={barStyle}
          backgroundColor={statusBarColor}
          translucent={translucent}
        />
        {!translucent && (
          <SafeAreaView style={(styles.container, { backgroundColor })} />
        )}
        {headerUnScrollable()}

        {scrollEnabled ? (
          <KeyboardAwareScrollView
            ref={scrollViewRef}
            nestedScrollEnabled={nestedScrollEnabled}
            refreshControl={refreshControl}
            style={[
              styles.container,
              {
                backgroundColor,
                paddingHorizontal,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraScrollHeight={100}
          >
            {children}
          </KeyboardAwareScrollView>
        ) : (
          <View style={{ paddingHorizontal, flex: 1 }}>{children}</View>
        )}
        {footerUnScrollable()}
      </View>
    );
  };
  return backgroundImage ? (
    <View style={{ width, height: height + 70, zIndex: 999 }}>
      {content()}
      <ImageFast
        source={backgroundImage}
        style={{
          width,
          height: height + 70,
          position: "absolute",
          zIndex: -1,
        }}
        resizeMode="cover"
      />
    </View>
  ) : (
    content()
  );
};

export default ScreenWrapper;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});