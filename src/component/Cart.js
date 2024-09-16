import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const Cart = () => {
    return (
        <View style={styles.container}>
            <Text>Cart</Text>
        </View>
    );
};

export default Cart;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});