import React from 'react';
import { Image, View, Dimensions, Text } from 'react-native';
import { loading } from './AssetsRef';

const screen = Dimensions.get("screen");

const LoadingScreen = () => {
    return (
        <View style={{flex:1, justifyContent:'center', overflow:'visible', backgroundColor:'#fefcfe', alignItems:'center'}}>
            <Text style={{fontWeight:'800', fontSize:30}}>Đang tải</Text>
            <Image source={loading} style={{resizeMode:'contain',  width:screen.width}}/>
        </View>
    );
};

export default LoadingScreen;
