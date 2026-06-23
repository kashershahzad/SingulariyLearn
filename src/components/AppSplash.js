import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Images} from '../assets/images';

const SPLASH_BACKGROUND = '#0298EF';

const AppSplash = () => {
  return (
    <View style={styles.container}>
      <Image
        source={Images.bootsplash}
        style={styles.background}
        resizeMode="cover"
      />
      <Image
        source={Images.splashLogo}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  logo: {
    width: 180,
    height: 40,
  },
});

export default AppSplash;
