import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigation from './src/navigation/BottomTabNavagition';
import { UserProvider } from './src/context/UserContext';
import { CartProvider } from './src/context/CartContext';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid } from 'react-native';

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
      }
    };

    requestPermission();

    // Đăng ký nhận thông báo khi ứng dụng ở chế độ nền
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived!', remoteMessage);
      // Xử lý hoặc hiển thị thông báo (tuỳ chọn)
    });

    return unsubscribe;
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
