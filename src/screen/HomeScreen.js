import React, {useState} from 'react';
import { Text, View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import SkeletonPost from '../data/SkeletonPost';
import LoadingScreen from '../data/LoadingScreen';

const HomeScreen = () => {
    const [loading, setLoading] = useState(true);

    if (loading) {
        return (
            <ScrollView style={{flex:1, backgroundColor:'#ffffff'}}>
                <SkeletonPost />
                <SkeletonPost />
                <SkeletonPost />
            </ScrollView>
        )
    }


    return (
        <SafeAreaView style={styles.container}>
            <Text>HomeScreen</Text>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});