import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigation from './src/navigation/BottomTabNavagition';
import { UserProvider } from './src/context/UserContext';
import { CartProvider } from './src/context/CartContext';

const App = () => {

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
