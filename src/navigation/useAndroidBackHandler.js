import {useEffect} from 'react';
import {BackHandler, Platform} from 'react-native';
import {StackActions} from '@react-navigation/native';

import {navigationRef} from './navigationRef';

function tryPopRootChildStack() {
  if (!navigationRef.isReady()) {
    return false;
  }

  const root = navigationRef.getRootState();
  const rootRoute = root?.routes?.[root.index ?? 0];
  const childStack = rootRoute?.state;

  if (
    childStack &&
    typeof childStack.index === 'number' &&
    childStack.index > 0 &&
    childStack.key
  ) {
    navigationRef.dispatch({
      ...StackActions.pop(),
      target: childStack.key,
    });
    return true;
  }

  return false;
}

function goToHomeTab() {
  if (!navigationRef.isReady()) {
    return true;
  }
  // LandingPage lives inside TabStack (MainStack child)
  navigationRef.navigate('TabStack', {screen: 'LandingPage'});
  return true;
}

function onHardwareBackPress() {
  if (!navigationRef.isReady()) {
    return false;
  }

  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
    return true;
  }

  if (tryPopRootChildStack()) {
    return true;
  }

  return goToHomeTab();
}

export function useAndroidBackHandler() {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress,
    );

    return () => subscription.remove();
  }, []);
}
