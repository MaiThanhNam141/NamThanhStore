import React, { useState } from 'react';
import {SafeAreaView, View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import firestore  from '@react-native-firebase/firestore';

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [titleResults, setTitleResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if(!query.trim() ||  query.length < 3) {
            setTitleResults([])
            clearTimeout(debounceTimeout);
            return;
        }
        clearTimeout(debounceTimeout);
        setDebounceTimeout(setTimeout(() => {
          console.log(query);
        }, 500)); 
    };

    const renderResultItem = ({ item }) => (
        <View style={styles.resultItem}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.desc}</Text>
        </View>
    );

    const renderIndependentResults = () => {
        return (
            <>
                <FlatList
                    data={titleResults}
                    keyExtractor={(item) => item.id}
                    renderItem={renderResultItem}
                    ListEmptyComponent={() => <Text style={styles.emptyText}>Không có kết quả</Text>}
                />
            </>
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
            {
                loading ? <ActivityIndicator size={'large'} /> : renderIndependentResults()
            }
            
        </SafeAreaView>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 10,
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
    resultItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
});
