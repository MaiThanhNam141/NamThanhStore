import React, { useState, useContext, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, ToastAndroid, ActivityIndicator, FlatList } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { CartContext } from '../context/CartContext';
import ImageViewing from 'react-native-image-viewing';
import SkeletonPost from '../data/SkeletonPost';
import firestore from '@react-native-firebase/firestore';

const ListProduct = ({ navigation, route }) => {
    const condition = route.params.condition;
    const [visible, setVisible] = useState(false);
    const [images, setImages] = useState([]);
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const { addItemToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const productRef = firestore().collection('productFood');
                let snapshot;
                if (condition === "Mới") {
                    snapshot = await productRef.limit(5).get();
                } else {
                    snapshot = await productRef.where("discount", ">", 0).get();
                }
                const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProduct(products);
            } catch (error) {
                console.error("Fetch posts error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [])

    const handleImagePress = (imageUri) => {
        setImages([{ uri: imageUri }]);
        setVisible(true);
    };

    const handleImageViewingClose = () => {
        setVisible(false);
    };

    const formatNumberWithDots = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAddToCart = (item) => {
        addItemToCart(item);
        ToastAndroid.show("Thêm thành công", ToastAndroid.SHORT)
    };

    const handleDetailScreen = (item) => {
        navigation.navigate('detail', { selectedItem: item })
    }

    const renderProduct = ({ item }) => {
        const isDiscount = item.discount > 0;

        return (
            <View style={styles.productContainer}>
                {isDiscount && <Text style={styles.sale}>Sale {item.discount}%</Text>}
                <TouchableOpacity onPress={() => handleImagePress(item.image)}>
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDetailScreen(item)}>
                    <Text style={styles.productName}>{item.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.priceButton} onPress={() => handleAddToCart(item)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.discountPrice}>
                            {formatNumberWithDots(Math.floor(item.price * (1 - item.discount / 100)))} VND
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    const renderProductHome = () => {
        return (
            <FlatList
                data={product}
                keyExtractor={(item) => item.id}
                renderItem={renderProduct}
                numColumns={2}
                ListFooterComponent={() => (loading ? <ActivityIndicator size="small" /> : null)}
                ListEmptyComponent={() => <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 20 }}>Đã có lỗi nào đó xảy ra</Text>}
            />
        )
    };

    const renderSkeleton = () => {
        return (
            <ScrollView>
                <SkeletonPost />
                <SkeletonPost />
                <SkeletonPost />
            </ScrollView>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="chevron-left" size={50} color="#333" />
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#000' }}>Danh sách sản phẩm {condition}</Text>
            </View>
            {
                loading ? renderSkeleton() : renderProductHome()
            }
            <ImageViewing images={images} visible={visible} onRequestClose={handleImageViewingClose} />
        </View>
    );
};

export default ListProduct;

const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        backgroundColor: '#DEFFD3'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productContainer: {
        flex: 1,
        margin: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        maxWidth: '45%',
        minWidth: '45%',
        overflow: 'hidden',
    },
    productImage: {
        width: 170,
        height: 170,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    productName: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
        textAlign: 'center',
        zIndex: 1,
    },
    sale: {
        position: 'absolute',
        right: '-15%',
        top: '5%',
        backgroundColor: 'red',
        padding: 5,
        width: 125,
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        transform: [{ rotate: '45deg' }],
        fontSize: 10,
        zIndex: 2,
    },
    priceButton: {
        backgroundColor: '#fff',
        padding: 10,
        marginHorizontal: 5,
        marginBottom: 5,
        maxWidth: '80%',
        minWidth: '80%',
        alignItems: 'center',
        borderRadius: 5,
        borderWidth: StyleSheet.hairlineWidth,
    },
    productPrice: {
        color: '#000',
        fontWeight: '500',
        fontSize: 10,
        textAlign: 'center',
    },
    discountPrice: {
        color: '#FF6347',
        fontWeight: '700',
        fontSize: 10,
    },
});