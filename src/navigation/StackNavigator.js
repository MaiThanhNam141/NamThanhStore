import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from '../screen/HomeScreen'
import ProfileScreen from'../screen/ProfileScreen'
import LoginScreen from "../screen/LoginScreen";
import ChatBotScreen from "../screen/ChatBotScreen";
import SearchScreen from "../screen/SearchScreen";
import { UserContext } from "../context/UserContext";
import Setting from "../component/Setting";
import Cart from "../component/Cart";
import About from "../component/About";
import UserInfo from "../component/UserInfo";
import Payment from "../component/Payment";
import DetailScreen from "../component/DetailScreen";
import PaymentCallback from "../component/PaymentCallback";
import ListProduct from "../component/ListProduct";
import OrderedPanel from "../component/OrderedPanel";
import OrderDetail from "../component/OrderDetail";

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
            <Stack.Screen name="cart" component={Cart} />
            <Stack.Screen name="payment" component={Payment} />
            <Stack.Screen name="loginscreen" component={LoginScreen} />
            <Stack.Screen name="userinfo" component={UserInfo} />
            <Stack.Screen name="detail" component={DetailScreen} />
            <Stack.Screen name="paymentcallback" component={PaymentCallback} />
            <Stack.Screen name="listproduct" component={ListProduct} />
        </Stack.Navigator>
    )
}

const ProfileStackNavigator = () =>{
    const { userExist } = useContext(UserContext);

    return(
        <Stack.Navigator 
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
            <Stack.Screen name="setting" component={Setting} />
            <Stack.Screen name="cart" component={Cart} />
            <Stack.Screen name="about" component={About} />
            <Stack.Screen name="userinfo" component={UserInfo} />
            <Stack.Screen name="payment" component={Payment} />
            <Stack.Screen name="paymentcallback" component={PaymentCallback} />
            <Stack.Screen name="orderpanel" component={OrderedPanel} />
            <Stack.Screen name="orderdetail" component={OrderDetail} />
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
                <Stack.Screen name="detail" component={DetailScreen} />
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