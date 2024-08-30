import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Login from '../component/Login';
import Register from '../component/Register';

const Tab = createMaterialTopTabNavigator();

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Login />
    </View>
  );
};

const RegisterScreen = () => {
  return (
    <View style={styles.container}>
      <Register />
    </View>
  );
};

const App = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3F8F60', 
        tabBarInactiveTintColor: '#9E9D9D',
        tabBarStyle: {
          borderRadius: 100,
          marginHorizontal: '15%',
          marginTop: '3%',
          height: 50,
        },
        tabBarIndicatorStyle: {
          backgroundColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          textAlign: 'center',
          fontWeight:'bold',
        },
      }}
    >
      <Tab.Screen name="Đăng nhập" component={LoginScreen} />
      <Tab.Screen name="Đăng ký" component={RegisterScreen} />
    </Tab.Navigator>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});