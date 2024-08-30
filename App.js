import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigation from './src/navigation/BottomTabNavagition';
import { UserProvider } from './src/context/UserContext';

const App = () => {
  return (
    <SafeAreaView style={{flex:1}}>
      <NavigationContainer>
        <UserProvider>
          <BottomTabNavigation />
        </UserProvider>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;
