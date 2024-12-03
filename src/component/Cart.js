import React, { useContext, useState, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, Image, Animated, Easing, Modal, TextInput } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { CartContext } from '../context/CartContext';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { emptyCart } from '../data/AssetsRef';

const Cart = ({ navigation }) => {
    const { cartCount, cartItems, removeItemFromCart, clearCart, addItemToCart, subtractItemsFromCart } = useContext(CartContext);
    const [selectedItems, setSelectedItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const translateX = useRef(
        cartItems.map(() => new Animated.Value(0))
    ).current;

    const handleGestureEvent = (index) => Animated.event(
        [{ nativeEvent: { translationX: translateX[index] } }],
        { useNativeDriver: true }
    );

    const handleGestureEnd = (index) => {
        Animated.spring(translateX[index], {
            toValue: 0,
            useNativeDriver: true,
            easing: Easing.bounce,
        }).start();
    };

    // Nhóm các mục trong giỏ hàng theo id và tính toán số lượng
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


    // Chọn hoặc bỏ chọn một mục trong giỏ hàng
    const toggleItemSelection = (item) => {
        const itemExists = selectedItems.find(selectedItem => selectedItem.id === item.id);
        if (itemExists) {
            // Nếu sản phẩm đã có trong danh sách được chọn, loại bỏ nó
            setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id));
        } else {
            // Nếu sản phẩm chưa có trong danh sách được chọn, thêm vào với số lượng hiện tại
            setSelectedItems([...selectedItems, { id: item.id, itemCount: item.quantity, name: item.name, image: item.image }]);
        }
    };

    const formatNumberWithDots = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Tính tổng số lượng các mục được chọn trong giỏ hàng
    const totalQuantity = selectedItems.reduce((acc, selectedItem) => {
        return acc + selectedItem.itemCount;
    }, 0);


    // Tính tổng giá hàng của các mục được chọn trong giỏ hàng
    const totalPrice = selectedItems.reduce((acc, selectedItem) => {
        const item = groupedItems.find(i => i.id === selectedItem.id);
        return acc + (item?.price || 0) * selectedItem.itemCount;
    }, 0);

    const handlePayment = () => {
        navigation.navigate("payment", { selectedItems, totalPrice, totalQuantity })
    }

    const handleModalInput = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
    }

    const handleChangeQuantity = (quantity) => {
        setSelectedItems(
            selectedItems.map((si) => {
                if (si.id === selectedItem) {
                    return { ...si, itemCount: quantity };
                }
            }
        ))
    }

    const renderItem = ({ item, index }) => {
        return (
            <PanGestureHandler
                onGestureEvent={handleGestureEvent(index)}
                onEnded={() => handleGestureEnd(index)}
            >
                <Animated.View style={[styles.cartItem, { transform: [{ translateX: translateX[index] }] }]}>
                    <CheckBox
                        value={selectedItems.some(selectedItem => selectedItem.id === item.id)}
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
                            <TouchableOpacity onPress={() => handleModalInput(item.id)}>
                                <Text style={{ fontWeight: 'semibold', fontSize: 16 }}>{item.quantity}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleIncreaseQuantity(item)} style={styles.quantityButton}>
                                <Text style={{ fontSize: 16, color: '#f7f7f7' }}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
                    <Image source={emptyCart} style={{ height: 150, width: 150 }} />
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
                cartCount > 0 && selectedItems.length > 0 && (
                    <View style={styles.totalPriceCard}>
                        <View style={styles.totalPriceCardItem}>
                            <Text style={styles.totalPriceCardTitle}>Tổng số lượng:</Text>
                            <Text style={styles.totalPriceCardText}>{totalQuantity}</Text>
                        </View>
                        <View style={styles.totalPriceCardItem}>
                            <Text style={styles.totalPriceCardTitle}>Giá tiền:</Text>
                            <Text style={styles.totalPriceCardText}>{formatNumberWithDots(totalPrice)} vnđ</Text>
                        </View>
                        <TouchableOpacity style={styles.totalPriceCardCheckout} onPress={handlePayment}>
                            <Text style={{ color: ' white', fontSize: 20 }}>Thanh toán</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
            <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={{ flex: 1, backgroundColor: 'rga(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: 200, height: 120, backgroundColor: 'white', borderRadius: 10, padding: 10, alignItems:'center' }}>
                        <Text style={styles.title}>Số lượng</Text>
                        <TextInput
                            value={selectedItems.find(si => si.id === selectedItem).quantity}
                            onChangeText={handleChangeQuantity}
                            style={{ height: 40, borderColor: 'gray' }}
                            numberOfLines={1}
                            keyboardType='numeric'
                        />
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.totalPriceCardCheckout, { borderColor: 'red' }]}>
                            <Text style={{ color: ' white', fontSize: 20 }}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    },
});
