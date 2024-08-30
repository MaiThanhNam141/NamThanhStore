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
      tabBarPosition="bottom"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          overflow: "hidden",
          backgroundColor: "#fff",
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
            <MaterialIcons name="smart-toy" size={25} color={color} />
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
