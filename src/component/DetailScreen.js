import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ToastAndroid } from 'react-native';
import { CartContext } from '../context/CartContext';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const DetailScreen = ({ navigation, route }) => {
    const { selectedItem } = route.params;
    const { addItemToCart } = useContext(CartContext);

    const handleAddToCart = () => {
        addItemToCart(selectedItem);
        ToastAndroid.show("Thành công", ToastAndroid.SHORT)
    };

    const formatNumberWithDots = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <MaterialIcons name="chevron-left" size={30} color="#333" onPress={() => navigation.goBack()} />
                <Text style={{ fontWeight: '600', fontSize: 20, color: '#000', marginLeft: 20 }}>Chi tiết sản phẩm</Text>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <Image source={{ uri: selectedItem.image }} style={styles.image} />
                <Text style={styles.name}>{selectedItem.name}</Text>
                {selectedItem.discount > 0 ? (
                    <View style={styles.priceContainer}>
                        <Text style={styles.oldPrice}>
                            {formatNumberWithDots(selectedItem.price)} VND
                        </Text>
                        <Text style={styles.discountedPrice}>
                            {formatNumberWithDots(selectedItem.price * (1 - selectedItem.discount / 100))} VND
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.price}>{formatNumberWithDots(selectedItem.price)} VND</Text>
                )}

                <Text style={styles.description}>{selectedItem.desc}</Text>

                <View style={styles.detailsContainer}>
                    <Text style={styles.detail}>Loại: {selectedItem.type}</Text>
                    <Text style={styles.detail}>Đối tượng: {selectedItem.target}</Text>
                    <Text style={styles.detail}>Mục tiêu: {selectedItem.goal}</Text>
                    <Text style={styles.detail}>Khối lượng tịnh: {selectedItem.netWeight} kg</Text>
                    <Text style={styles.detail}>Số lượng tồn kho: {selectedItem.quatity}</Text>
                </View>
                <TouchableOpacity style={styles.paymentButton} onPress={handleAddToCart}>
                    <Text style={styles.paymentButtonText}>Thêm vào giỏ hàng</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        backgroundColor: '#DEFFD3',
        minHeight: 50,
    },
    image: {
        width: '100%',
        height: 250,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign:'center'
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6347',
        marginBottom: 10,
    },
    oldPrice: {
        fontSize: 16,
        color: '#898989',
        textDecorationLine: 'line-through',
        marginRight: 10,
    },
    discountedPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6347',
    },
    description: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign:'justify',
    },
    detailsContainer: {
        marginBottom: 20,
    },
    detail: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    paymentButton: {
        backgroundColor: '#87bc9d',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    paymentButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    }
});

export default DetailScreen;
