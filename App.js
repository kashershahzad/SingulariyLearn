import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import RNBootSplash from 'react-native-bootsplash';
import { StripeProvider } from '@stripe/stripe-react-native';

import { store, persistor } from './src/store';
import i18n from './src/language/i18n';
import Navigation from './src/navigation';
import SocketProvider from './src/components/SocketProvider';
import BrainBox from './src/components/BrainBox';
import { COLORS } from './src/utils/COLORS';

const AppInner = () => {
  // Get current language from Redux
  const currentLanguage = useSelector(state => state.language.language);

  // Update i18n language whenever Redux state changes
  useEffect(() => {
    if (currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  // Hide splash screen
  useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);

  // Handle foreground push notifications
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
        smallIcon: 'ic_launcher', // your app icon
      },
    });
  };

  useEffect(() => {
    const unsubscribeMessaging = messaging().onMessage(onMessageHandler);
    return () => unsubscribeMessaging();
  }, []);

  // Notifee background & foreground event handlers
  useEffect(() => {
    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      // Handle foreground events here
    });

    const unsubscribeBackground = notifee.onBackgroundEvent(async ({ type, detail }) => {
      // Handle background events here
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <NavigationContainer>
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
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StripeProvider publishableKey="pk_live_51Oyb4uP42C3kj5TCZALaGkrCa59dFdZdwubMNGyp209fLXbVt6oIVVyQWF2On8cNBv3zOD6ImwGtIoKgt12nbcXT00JM8g5qp9">
          <AppInner />
        </StripeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
