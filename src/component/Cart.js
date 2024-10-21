import React, { useContext, useState, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, Image, Animated } from 'react-native';
import CheckBox from '@react-native-community/checkbox'; // Updated import
import { CartContext } from '../context/CartContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { emptyCart } from '../data/AssetsRef';

const Cart = ({ navigation }) => {
    const { cartItems, removeItemFromCart, clearCart, addItemToCart, subtractItemsFromCart } = useContext(CartContext);
    const [selectedItems, setSelectedItems] = useState([]);

    const translateX = useRef(new Animated.Value(0)).current;

    const handleGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const handleGestureEnd = () => {
        if (translateX._value < -100) {
            // Trigger removal when swiped past -100px
            removeItemFromCart(item.id);
        } else {
            // Snap back if not swiped far enough
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true
            }).start();
        }
    };

    // Group items by id and calculate quantity
    const groupedItems = cartItems.reduce((acc, item) => {
        const existingItem = acc.find((i) => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            acc.push({ ...item });
        }
        return acc;
    }, []);

    const handleIncreaseQuantity = (item) => {
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            // Increase the quantity of the existing item
            addItemToCart({ ...item, quantity: existingItem.quantity + 1 });
        } else {
            // Add the item with quantity 1 if it's not already in the cart
            addItemToCart({ ...item, quantity: 1 });
        }
    };

    const handleDecreaseQuantity = (item) => {
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        if (existingItem && existingItem.quantity > 1) {
            // Decrease the quantity of the existing item
            subtractItemsFromCart(item.id);
        } else {
            // Remove the item if quantity is 1 or less
            removeItemFromCart(item.id);
        }
    };
    const handleRemoveItem = (item) => {
        removeItemFromCart(item.id);
    }

    const toggleItemSelection = (item) => {
        if (selectedItems.includes(item.id)) {
            setSelectedItems(selectedItems.filter(id => id !== item.id));
        } else {
            setSelectedItems([...selectedItems, item.id]);
        }
    };
    const formatNumberWithDots = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const totalQuantity = selectedItems.reduce((acc, itemId) => {
        const item = groupedItems.find((i) => i.id === itemId);
        return acc + item?.quantity || 0;
    }, 0);

    const totalPrice = selectedItems.reduce((acc, itemId) => {
        const item = groupedItems.find((i) => i.id === itemId);
        return acc + item?.price * item?.quantity;
    }, 0);

    const renderItem = ({ item }) => {

        return (
            <PanGestureHandler onGestureEvent={handleGestureEvent} onEnded={handleGestureEnd}>
                <Animated.View style={[styles.cartItem, { transform: [{ translateX }] }]}>
                    <CheckBox
                        value={selectedItems.includes(item.id)}
                        onValueChange={() => toggleItemSelection(item)}
                    />
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                    <View style={styles.productDetails}>
                        <Text>{item.name}</Text>
                        <Text>Đơn giá: {formatNumberWithDots(item.price)} vnđ</Text>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity onPress={() => handleDecreaseQuantity(item)} style={styles.quantityButton}>
                                <Text style={{ fontSize: 16, color: '#f7f7f7' }}>-</Text>
                            </TouchableOpacity>
                            <Text style={{ fontWeight: 'semibold', fontSize: 16 }}>{item.quantity}</Text>
                            <TouchableOpacity onPress={() => handleIncreaseQuantity(item)} style={styles.quantityButton}>
                                <Text style={{ fontSize: 16, color: '#f7f7f7' }}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Animated.View
                        style={[styles.removeIcon, {
                            opacity: translateX.interpolate({
                                inputRange: [-100, 0],
                                outputRange: [1, 0],
                            })
                        }]}
                    >
                        <MaterialIcons name="remove" size={24} color="red" onPress={() => handleRemoveItem(item.id)} />
                    </Animated.View>
                </Animated.View>
            </PanGestureHandler>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giỏ hàng</Text>
            {groupedItems.length > 0 && (
                <View style={{ flexDirection: 'row', marginBottom: 5, justifyContent: 'space-between' }}>
                    <Text style={{ color: 'black' }}>{selectedItems.length} sản phẩm</Text>
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={{ color: 'red' }}>Xóa giỏ hàng</Text>
                    </TouchableOpacity>
                </View>
            )}

            {groupedItems.length === 0 ? (
                <View style={{ alignItems: 'center' }}>
                    <Text>Giỏ hàng trống...</Text>
                    <Image source={emptyCart} style={{height: 150, width: 150}} />
                    <TouchableOpacity style={[styles.totalPriceCardCheckout, { marginTop: 20 }]} onPress={() => navigation.goBack()}>
                        <Text style={styles.totalPriceCardText}>Tiếp tục mua sắm</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={groupedItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                />
            )}
            {
                selectedItems.length > 0 && (
                    <View style={styles.totalPriceCard}>
                        <View style={styles.totalPriceCardItem}>
                            <Text style={styles.totalPriceCardTitle}>Tổng số lượng:</Text>
                            <Text style={styles.totalPriceCardText}>{totalQuantity}</Text>
                        </View>
                        <View style={styles.totalPriceCardItem}>
                            <Text style={styles.totalPriceCardTitle}>Giá tiền:</Text>
                            <Text style={styles.totalPriceCardText}>{formatNumberWithDots(totalPrice)} vnđ</Text>
                        </View>
                        <TouchableOpacity style={styles.totalPriceCardCheckout}>
                            <Text style={{ color: ' white', fontSize: 20 }}>Thanh toán</Text>
                        </TouchableOpacity>
                    </View>
                )
            }

        </View>
    );
};

export default Cart;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center',
        borderBottomWidth: 1,
        marginBottom: 50
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    productImage: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    productDetails: {
        flex: 1,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    quantityButton: {
        borderRadius: 100,
        backgroundColor: '#87bc9d',
        width: 25,
        height: 25,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    totalPriceCard: {
        borderColor: '#87bc9d',
        width: '90%',
        height: 150,
        borderBottomWidth: 2,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderRadius: 15,
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        alignSelf: 'center'
    },
    totalPriceCardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        width: '95%',
    },
    totalPriceCardTitle: {
        color: '#000',
        fontWeight: 'condensed',
        fontSize: 18,
    },
    totalPriceCardText: {
        fontSize: 15
    },
    totalPriceCardCheckout: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#87bc9d',
        width: '80%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
