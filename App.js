import React, { useEffect } from 'react';
import { SafeAreaView, PermissionsAndroid, ToastAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigation from './src/navigation/BottomTabNavagition';
import { UserProvider } from './src/context/UserContext';
import { CartProvider } from './src/context/CartContext';
import messaging from '@react-native-firebase/messaging';
import { getCurrentUser, updateUserInfo } from './src/context/FirebaseFunction';

const App = () => {
  const [loggedIn, setLoggedIn] = React.useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        ToastAndroid.show("Bạn cần cấp quyền để nhận thông báo", ToastAndroid.SHORT);
        return;
      }

      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
          const token = await messaging().getToken();
          updateUserInfo({ token: token });
          messaging().subscribeToTopic('all_users');
        } else {
          ToastAndroid.show("Không thể gửi thông báo nếu bạn không cấp quyền", ToastAndroid.SHORT);
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    requestPermission();

    const foreground = messaging().onMessage(async remoteMessage => {
      try {
        console.log('Received a foreground message:', remoteMessage);
      } catch (error) {
        console.error("Error handling foreground message:", error);
      }
    });

    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      try {
        console.log('Notification opened from background state:', remoteMessage);
      } catch (error) {
        console.error("Error handling background notification:", error);
      }
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        try {
          console.log('Notification opened from quit state:', remoteMessage);
        } catch (error) {
          console.error("Error handling quit state notification:", error);
        }
      }
    });

    return () => {
      if (foreground) foreground();
      if (unsubscribeOnNotificationOpenedApp) unsubscribeOnNotificationOpenedApp();
    };
  }, [loggedIn]);


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
