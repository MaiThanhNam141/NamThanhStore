import React, {useState, useEffect, useContext} from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { CartContext } from '../context/CartContext';

const PaymentCallback = () => {
    const { clearCart } = useContext(CartContext);
    return (
        <View style={styles.container}>
            <Text>PaymentCallback</Text>
        </View>
    );
};

export default PaymentCallback;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});