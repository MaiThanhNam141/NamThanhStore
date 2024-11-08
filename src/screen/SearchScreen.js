import React, { useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [titleResults, setTitleResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastVisible, setLastVisible] = useState(null); // to track pagination
    const [isLoadingMore, setIsLoadingMore] = useState(false); // to manage loading state for additional items

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

    const renderResultItem = ({ item }) => {
        const isDiscount = item.discount > 0;
        return (
            <View style={styles.productContainer}>
                {isDiscount && <Text style={styles.sale}>Sale {item.discount}%</Text>}
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <TouchableOpacity style={styles.priceButton}>
                    {isDiscount ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.productPrice, { textDecorationLine: 'line-through', marginRight: 5, color: '#898989' }]}>
                                {formatNumberWithDots(item.price)} VND
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
        if (loading || isLoadingMore) return; // Avoid multiple calls
    
        setLoading(isNewSearch); // Show main loader for a fresh search
        setIsLoadingMore(!isNewSearch); // Show loading more for pagination
        try {
            const db = firestore();
            let articlesRef = db.collection('productFood')
                .orderBy('name') // Order by name for consistent pagination
                .where('name', '>=', query)
                .where('name', '<=', query + '\uf8ff')
                .limit(6);
    
            if (lastVisible && !isNewSearch) {
                articlesRef = articlesRef.startAfter(lastVisible); // Paginate based on the last visible document
            }
    
            const titleSnapshot = await articlesRef.get();
            const newResults = titleSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            const lastVisibleDoc = titleSnapshot.docs[titleSnapshot.docs.length - 1];
    
            if (isNewSearch) {
                setTitleResults(newResults);
            } else {
                setTitleResults([...titleResults, ...newResults]);
            }
    
            setLastVisible(lastVisibleDoc); // Save last visible document for pagination
    
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
            searchArticles(searchQuery, true); // Refresh search
        }
    }, [refreshing]);

    const renderIndependentResults = () => {
        return (
            <FlatList
                data={titleResults}
                keyExtractor={(item) => item.id}
                renderItem={renderResultItem}
                ListEmptyComponent={() => <Text style={styles.emptyText}>Không có kết quả</Text>}
                numColumns={2}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => setRefreshing(true)}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5} // Trigger when user scrolls to 50% from bottom
                ListFooterComponent={() => isLoadingMore ? <ActivityIndicator size="small" /> : null}
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
            {loading ? <ActivityIndicator size="large" /> : renderIndependentResults()}
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
    productContainer: {
        flex: 1,
        margin: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '45%',
        minWidth: '45%',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 170,
        resizeMode: 'cover',
        marginBottom: 10,
    },
    productName: {
        fontWeight: 'bold',
        fontSize: 16,
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
        borderRadius: 5,
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
