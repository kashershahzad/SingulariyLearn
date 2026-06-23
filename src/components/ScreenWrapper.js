import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import ImageFast from './ImageFast';
import {useTheme} from '../theme/useTheme';
import {lightTheme} from '../theme/themes';

const {width, height} = Dimensions.get('window');

const FocusAwareStatusBar = ({barStyle, backgroundColor, translucent}) => {
  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
  }
  return (
    <StatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      translucent={translucent}
    />
  );
};

const ScreenWrapper = ({
  children,
  statusBarColor,
  translucent = false,
  scrollEnabled = false,
  backgroundImage,
  backgroundColor,
  headerUnScrollable = () => null,
  footerUnScrollable = () => null,
  barStyle,
  refreshControl,
  paddingBottom,
  nestedScrollEnabled,
  paddingHorizontal = 16,
  scrollViewRef,
}) => {
  const {colors: themeColors} = useTheme();
  const colors = themeColors ?? lightTheme;
  const resolvedBackground = backgroundColor ?? colors.screenBg;
  const resolvedStatusBarColor = statusBarColor ?? colors.screenBg;
  const resolvedBarStyle = barStyle ?? colors.statusBarStyle;

  const inset = useSafeAreaInsets();

  const content = () => (
    <View
      style={[
        styles.container,
        {
          paddingBottom: paddingBottom
            ? paddingBottom
            : Platform.OS === 'android'
              ? 0
              : 20,
          backgroundColor: backgroundImage ? 'transparent' : resolvedBackground,
          paddingTop: translucent ? 0 : inset.top,
        },
      ]}>
      <FocusAwareStatusBar
        barStyle={resolvedBarStyle}
        backgroundColor={resolvedStatusBarColor}
        translucent={translucent}
      />
      {headerUnScrollable()}

      {scrollEnabled ? (
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          nestedScrollEnabled={nestedScrollEnabled}
          refreshControl={refreshControl}
          style={[
            styles.container,
            {
              backgroundColor: resolvedBackground,
              paddingHorizontal,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={100}>
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={{paddingHorizontal, flex: 1}}>{children}</View>
      )}
      {footerUnScrollable()}
    </View>
  );

  return backgroundImage ? (
    <View style={{width, height: height + 70, zIndex: 999}}>
      {content()}
      <ImageFast
        source={backgroundImage}
        style={{
          width,
          height: height + 70,
          position: 'absolute',
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
