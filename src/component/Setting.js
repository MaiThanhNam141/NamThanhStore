import React, { useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, ToastAndroid, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LoadingScreen from '../data/LoadingScreen';
import { updateUserInfo } from '../context/FirebaseFunction';

const Setting = ({ navigation, route }) => {
    const user = route.params.user;
    const [isEnabledNotification, setIsEnabledNotification] = useState('notification' in route.params.user ? route.params.user.notification : true);
    const [isEnabledAIVoice, setIsEnabledAIVoice] = useState('voice' in route.params.user ? route.params.user.voice : true);
    const [loading, setLoading] = useState(true);

    const handleSignOut = () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn đăng xuất không?',
            [
                { text: 'Hủy', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Thoát', onPress: signOut },
            ],
        );
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await Promise.all([
                GoogleSignin.signOut(),
                auth().signOut(),
            ])
            ToastAndroid.show("Đăng xuất thành công", ToastAndroid.SHORT);
        } catch (error) {
            console.error("signOut: ", error);
            ToastAndroid.show(`Đăng xuất thất bại. Error ${error}`, ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        <LoadingScreen />
    }

    const handleNotification = () => {
        try {
            setIsEnabledNotification(!isEnabledNotification);
            updateUserInfo({ notification: !isEnabledNotification })
        } catch (error) {
            console.error();
        }
    }

    const handleAIVoice = () => {
        try {
            setIsEnabledAIVoice(!isEnabledAIVoice)
            updateUserInfo({ voice: !isEnabledAIVoice })
        } catch (error) {
            console.error();
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
                <MaterialIcons name="chevron-left" size={50} color="#333" onPress={() => navigation.goBack()} />
                <Text style={{ fontWeight: 'bold', fontSize: 30, color: '#000' }}>Setting</Text>
            </View>
            <View style={{ flex: 2, backgroundColor: '#FAF5FF' }}>
                <View style={styles.user}>
                    <View style={{ marginLeft: 15 }}>
                        <Text style={styles.name}>{user?.displayName || 'Tên người dùng'}</Text>
                        <Text style={[styles.name, { fontSize: 17, fontWeight: 400 }]}>{user?.email || 'Email'}</Text>
                    </View>
                    <View style={{ borderRadius: 100, borderWidth: 6, borderColor: '#fff', alignItems: 'center' }}>
                        <Image source={{ uri: user?.photoURL || 'https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png' }} style={styles.avatar} />
                    </View>
                </View>
            </View>
            <LinearGradient style={styles.container} colors={['#f7f7f7', '#DEFFD3']}>
                <TouchableOpacity style={[styles.utilities, { paddingVertical: 30 }]} onPress={() => navigation.navigate('userinfo')}>
                    <MaterialIcons name="person" size={50} style={{ flex: 1, marginLeft: 10 }} />
                    <View style={{ flex: 6 }}>
                        <Text style={styles.utilitiesText}>Tài khoản</Text>
                        <Text style={styles.utilitiesText}>Tên, địa chỉ, vị trí, ...</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={30} style={{ flex: 1 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.utilities} onPress={() => navigation.navigate('about')}>
                    <MaterialIcons name="info" size={35} style={{ flex: 1, marginLeft: 15 }} />
                    <View style={{ flex: 6 }}>
                        <Text style={styles.utilitiesText}>Về NamThanhStores</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={30} style={{ flex: 1 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.utilities}>
                    <MaterialIcons name="notifications" size={35} style={{ flex: 1, marginLeft: 15 }} />
                    <View style={{ flex: 6 }}>
                        <Text style={styles.utilitiesText}> Bật thông báo</Text>
                    </View>
                    <View style={styles.utilitiesSwitch}>
                        <Switch
                            trackColor={{ false: "#767577", true: "#B4F0A0" }}
                            thumbColor={isEnabledNotification ? "#FFDFD2" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={handleNotification}
                            value={isEnabledNotification}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.utilities}>
                    <MaterialIcons name="smart-toy" size={35} style={{ flex: 1, marginLeft: 15 }} />
                    <View style={{ flex: 6 }}>
                        <Text style={styles.utilitiesText}> Bật giọng nói của AI</Text>
                    </View>
                    <View style={styles.utilitiesSwitch}>
                        <Switch
                            trackColor={{ false: "#767577", true: "#B4F0A0" }}
                            thumbColor={isEnabledAIVoice ? "#FFDFD2" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={handleAIVoice}
                            value={isEnabledAIVoice}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.utilities, { borderBottomWidth: 0 }]} onPress={handleSignOut}>
                    <MaterialIcons name="logout" size={35} style={{ flex: 1, marginLeft: 15 }} />
                    <View style={{ flex: 6 }}>
                        <Text style={styles.utilitiesText}>Đăng xuất</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={30} style={{ flex: 1 }} />
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default Setting;

const styles = StyleSheet.create({
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        backgroundColor: '#DEFFD3'
    },
    container: {
        flex: 7,
        alignItems: 'center',
    },
    user: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    avatar: {
        width: 110,
        height: 110,
        resizeMode: 'cover',
    },
    name: {
        marginTop: 10,
        fontSize: 20,
        color: '#a0a0a0',
        fontWeight: '600'
    },
    utilities: {
        width: "100%",
        borderBottomWidth: 4,
        borderColor: '#FAF5FF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15
    },
    utilitiesText: {
        fontSize: 20,
        fontWeight: '300'
    },
    utilitiesSwitch: {
        flex: 1,
        marginRight: 15,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
        paddingHorizontal: 5,
        paddingVertical: 3,
        backgroundColor: '#FFF4EF',
    },
});