import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext } from "react";
import { MainStackNavigator, ProfileStackNavigator, SearchStackNavigator, ChatBotStackNavigator } from "./StackNavigator";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../context/UserContext';

const Tab = createBottomTabNavigator();

const BottomTabNavigation = () => {
  const { loading } = useContext(UserContext);

  if (loading){
    return null
  }

  return (
    <Tab.Navigator
      initialRouteName={'Home'}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#16C318",
        tabBarInactiveTintColor: "gray",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#DEFFD3",
          height: 49,
        },
      }}
    >
      <Tab.Screen name='Home' component={MainStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={25} color={color} />
          )
        }}
      />
      <Tab.Screen name='Search' component={SearchStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="search" size={25} color={color} />
          )
        }}
      />
      <Tab.Screen name='AI' component={ChatBotStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="contact-support" size={25} color={color} />
          )
        }}
      />
      <Tab.Screen name='Profile' component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-circle" size={25} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
