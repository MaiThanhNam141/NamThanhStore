import React, { useEffect, useState, useContext } from 'react';
import { RefreshControl, SafeAreaView, View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ToastAndroid } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import ImageViewing from 'react-native-image-viewing';
import { CartContext } from '../context/CartContext';
import { Picker } from '@react-native-picker/picker';

const SearchScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [titleResults, setTitleResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredResults, setFilteredResults] = useState([]);
    const [selectedType, setSelectedType] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    const [lastVisible, setLastVisible] = useState(null); 
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [visible, setVisible] = useState(false);
    const [images, setImages] = useState([]);

    const { addItemToCart } = useContext(CartContext);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim() || query.length < 3) {
            setTitleResults([]);
            setLastVisible(null); // Reset pagination when the query changes
            return;
        }
        searchArticles(query, true); // Pass 'true' to indicate a fresh search
    };

    const formatNumberWithDots = (number) => {
        return number
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    const handleDetailScreen = (item) => {
        navigation.navigate('detail', { selectedItem: item })
    }

    const handleImagePress = (imageUri) => {
        setImages([{ uri: imageUri }]);
        setVisible(true);
    };

    const handleImageViewingClose = () => {
        setVisible(false);
    };

    const handleAddToCart = (item) => {
        ToastAndroid.show("Thêm thành công", ToastAndroid.SHORT);
        addItemToCart(item);
    };

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
                    {isDiscount ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={[styles.productPrice, { textDecorationLine: 'line-through', marginRight: 5, color: '#898989', fontSize: 7 }]}>
                                {formatNumberWithDots(item.price)}
                            </Text>
                            <Text style={styles.discountPrice}>
                                {formatNumberWithDots(Math.floor(item.price * (1 - item.discount / 100)))} VND
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.productPrice}>{formatNumberWithDots(item.price)} VND</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const searchArticles = async (query, isNewSearch = false) => {
        if (loading || isLoadingMore) return;
        setLoading(isNewSearch);
        setIsLoadingMore(!isNewSearch);
        try {
            const db = firestore();
            let ref = db.collection('productFood')
                .orderBy('name')
                .where('name', '>=', query)
                .where('name', '<=', query + '\uf8ff')
                .limit(6);

            if (lastVisible && !isNewSearch) {
                ref = ref.startAfter(lastVisible);
            }

            const titleSnapshot = await ref.get();
            const newResults = titleSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            const lastVisibleDoc = titleSnapshot.docs[titleSnapshot.docs.length - 1];

            if (isNewSearch) {
                setTitleResults(newResults);
            } else {
                setTitleResults([...titleResults, ...newResults]);
            }

            setLastVisible(lastVisibleDoc);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!isLoadingMore && lastVisible) {
            searchArticles(searchQuery);
        }
    };

    useEffect(() => {
        if (refreshing && searchQuery) {
            searchArticles(searchQuery, true);
        }
    }, [refreshing]);
    useEffect(() => {
        if (selectedType === "") {
            setFilteredResults(titleResults);
        } else {
            setFilteredResults(titleResults.filter(item => item.animal === selectedType));
        }
    }, [selectedType, titleResults]);

    const renderIndependentResults = () => {
        return (
            <FlatList
                data={filteredResults}
                keyExtractor={(item) => item.id}
                renderItem={renderProduct}
                ListEmptyComponent={() => <Text style={styles.emptyText}>Không có kết quả</Text>}
                numColumns={2}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => setRefreshing(true)}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => (loading ? <ActivityIndicator size="small" /> : null)}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchBar}>
                <MaterialIcons name="search" size={24} color="#000" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Lọc theo đối tượng chăn nuôi</Text>
                <Picker
                    selectedValue={selectedType}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedType(itemValue)}
                >
                    <Picker.Item label="Tất cả " value="" />
                    <Picker.Item label="Bò" value="Bò" />
                    <Picker.Item label="Gà" value="Gà" />
                    <Picker.Item label="Heo" value="Heo" />
                    <Picker.Item label="Dê" value="Dê" />
                    <Picker.Item label="Cá" value="Cá" />
                </Picker>
            </View>
            {loading ? <ActivityIndicator size="large" /> : renderIndependentResults()}
            <ImageViewing images={images} visible={visible} onRequestClose={handleImageViewingClose} />
        </SafeAreaView>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        marginHorizontal: 0,
        backgroundColor: '#fff',
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    picker: {
        flex: 1,
        marginLeft: 10,
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
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});
