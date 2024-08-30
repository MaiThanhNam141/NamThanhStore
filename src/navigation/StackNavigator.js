import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from '../screen/HomeScreen'
import ProfileScreen from'../screen/ProfileScreen'
import LoginScreen from "../screen/LoginScreen";
import ChatBotScreen from "../screen/ChatBotScreen";
import SearchScreen from "../screen/SearchScreen";
import { UserContext } from "../context/UserContext";

const Stack = createStackNavigator()

const MainStackNavigator = () =>{
    return(
        <Stack.Navigator
            initialRouteName="homescreen"
            screenOptions={{
                headerStyle:{ backgroundColor:"#91c4f8" },
                headerShown:false,
                gestureEnabled: true,
                gestureDirection:"horizontal",
            }}>
            <Stack.Screen name="homescreen" component={HomeScreen}/>
        </Stack.Navigator>
    )
}


const ProfileStackNavigator = () =>{
    const { userExist } = useContext(UserContext);

    return(
        <Stack.Navigator 
            initialRouteName="loginscreen"
            screenOptions={{
                headerStyle: {backgroundColor: "#91c4f8"},
                headerShown: false,
                gestureEnabled: true,
                gestureDirection:"horizontal",
            }}>
            {userExist ? (
                <Stack.Screen name="profilescreen" component={ProfileScreen} />
            ) : (
                <Stack.Screen name="loginscreen" component={LoginScreen} />
            )}
        </Stack.Navigator>
    )
}

const SearchStackNavigator = () => {
    return(
        <Stack.Navigator 
            initialRouteName="search"
            screenOptions={{
                headerStyle:{ backgroundColor:"#91c4f8" },
                headerShown:false,
                gestureEnabled: true,
                gestureDirection:"horizontal",
            }}>
                <Stack.Screen name="search" component={SearchScreen} />
        </Stack.Navigator>
    )
}

const ChatBotStackNavigator = () => {
    return(
        <Stack.Navigator 
            initialRouteName="chatbot"
            screenOptions={{
                headerStyle:{ backgroundColor:"#91c4f8" },
                headerShown:false,
                gestureEnabled: true,
                gestureDirection:"horizontal",
            }}>
                <Stack.Screen name="chatbot" component={ChatBotScreen} /> 
                
        </Stack.Navigator>
    )
}

export  {MainStackNavigator, ProfileStackNavigator, SearchStackNavigator, ChatBotStackNavigator}