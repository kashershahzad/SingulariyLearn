import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import RNBootSplash from 'react-native-bootsplash';
import { StripeProvider } from '@stripe/stripe-react-native';

import { store, persistor } from './src/store';
import i18n from './src/language/i18n';
import Navigation from './src/navigation';
import SocketProvider from './src/components/SocketProvider';
import BrainBox from './src/components/BrainBox';
import AppSplash from './src/components/AppSplash';
import { useTheme } from './src/theme/useTheme';

const SPLASH_MIN_MS = 3000;

const AppInner = () => {
  const currentLanguage = useSelector(state => state.language.language);
  const { isDarkMode, colors } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = isDarkMode ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: isDarkMode,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.screenBg,
        card: colors.card,
        text: colors.textPrimary,
        border: colors.border,
      },
    };
  }, [isDarkMode, colors]);

  useEffect(() => {
    if (currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  const onMessageHandler = async remoteMessage => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'Notification Title',
      body: remoteMessage.notification?.body || 'Main notification message',
      android: {
        channelId,
        smallIcon: 'ic_launcher', 
      },
    });
  };

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = messaging().onMessage(onMessageHandler);
    } catch (e) {
      if (__DEV__) console.warn('Firebase messaging init failed:', e?.message);
    }
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    let unsubscribeForeground;
    let unsubscribeBackground;
    try {
      unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      });
      unsubscribeBackground = notifee.onBackgroundEvent(async ({ type, detail }) => {
      });
    } catch (e) {
      if (__DEV__) console.warn('Notifee init failed:', e?.message);
    }
    return () => {
      unsubscribeForeground?.();
      unsubscribeBackground?.();
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.screenBg}
      />
      <NavigationContainer theme={navigationTheme}>
        <SocketProvider>
          <BrainBox>
            <Navigation />
          </BrainBox>
        </SocketProvider>
      </NavigationContainer>
    </I18nextProvider>
  );
};

const App = () => {
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [isMinSplashDone, setIsMinSplashDone] = useState(false);

  useEffect(() => {
    RNBootSplash.hide({fade: false});
    const timer = setTimeout(() => setIsMinSplashDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  const showSplash = !isStoreReady || !isMinSplashDone;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PersistGate
          loading={null}
          persistor={persistor}
          onBeforeLift={() => setIsStoreReady(true)}>
          <StripeProvider publishableKey="pk_live_51Oyb4uP42C3kj5TCZALaGkrCa59dFdZdwubMNGyp209fLXbVt6oIVVyQWF2On8cNBv3zOD6ImwGtIoKgt12nbcXT00JM8g5qp9">
            <AppInner />
          </StripeProvider>
        </PersistGate>
        {showSplash ? <AppSplash /> : null}
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
