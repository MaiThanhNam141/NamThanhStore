import React, { useState, useEffect } from 'react';
import { SafeAreaView, PermissionsAndroid, ToastAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigation from './src/navigation/BottomTabNavagition';
import { UserProvider } from './src/context/UserContext';
import { CartProvider } from './src/context/CartContext';
import messaging from '@react-native-firebase/messaging';

const App = () => {

  useEffect(() => {
    const requestPermission = async () => {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        const token = await messaging().getToken();
        console.log("FCM token: ", token);

        messaging().subscribeToTopic('all_users');
        console.log('Subscribed to all_users topic');
      } else {
        ToastAndroid.show("Không thể gửi thông báo nếu bạn không cấp quyền", ToastAndroid.SHORT);
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          console.log('Authorization status:', authStatus);
          const token = await messaging().getToken();
          console.log("FCM token: ", token);

          messaging().subscribeToTopic('all_users');
          console.log('Subscribed to all_users topic');
        }
      }
    };

    requestPermission();

    // Trạng thái Foreground
    const foreground = messaging().onMessage(async remoteMessage => {
      console.log('Received a foreground message:', remoteMessage);
    });

    // Trạng thái Background
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background state:', remoteMessage);
    });

    // Trạng thái Quit
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification opened from quit state:', remoteMessage);
      }
    });

    return () => {
      foreground();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <UserProvider>
          <CartProvider>
            <BottomTabNavigation />
          </CartProvider>
        </UserProvider>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;
