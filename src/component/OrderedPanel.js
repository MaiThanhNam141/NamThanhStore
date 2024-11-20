import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import firestore from '@react-native-firebase/firestore';
import { getCurrentUser } from '../context/FirebaseFunction';
import LoadingScreen from '../data/LoadingScreen';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const translateStatus = (status) => {
    switch (status) {
        case "Pending":
            return "Đang chờ xác nhận";
        case "Preparing":
            return "Đang chuẩn bị";
        case "Shipping":
            return "Đang giao hàng";
        case "Completed":
            return "Hoàn thành";
        case "Cancelled":
            return "Đã hủy";
        default:
            return "Không xác định";
    }
};

const OrderList = ({ route }) => {
    const { orders } = route.params;
    const navigation = useNavigation();
    
    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.orderItem} onPress={() => navigation.navigate('orderdetail', { order: item })}>
                        <Text style={styles.orderText}>Mã đơn hàng: {item.id}</Text>
                        <Text style={styles.orderText}>Trạng thái: {translateStatus(item.embed_data.status)}</Text>
                        <Text style={styles.orderText}>
                            Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text>Không có đơn hàng nào cả</Text>}
            />
        </View>
    );
};

const OrderedPanel = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const uid = getCurrentUser().uid;
                const ref = firestore().collection('orders').where('app_user', '==', uid);
                const snapshot = await ref.get();
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllOrders(orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filterOrdersByStatus = (status) => {
        return status === ''
            ? allOrders
            : allOrders.filter(order => order.embed_data?.status === status);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarScrollEnabled: true,
                tabBarLabelStyle: { fontSize: 12 },
                tabBarItemStyle: { minWidth: 200, height: 60 },
                tabBarIndicatorStyle: { backgroundColor: '#007bff' },
            }}
        >
            <Tab.Screen
                name="Tất cả đơn hàng"
                component={OrderList}
                initialParams={{ orders: filterOrdersByStatus('') }}
            />
            <Tab.Screen
                name="Đang chờ xác nhận"
                component={OrderList}
                initialParams={{ orders: filterOrdersByStatus('Pending') }}
            />
            <Tab.Screen
                name="Đang chuẩn bị"
                component={OrderList}
                initialParams={{ orders: filterOrdersByStatus('Preparing') }}
            />
            <Tab.Screen
                name="Đang giao hàng"
                component={OrderList}
                initialParams={{ orders: filterOrdersByStatus('Shipping') }}
            />
            <Tab.Screen
                name="Giao thành công"
                component={OrderList}
                initialParams={{ orders: filterOrdersByStatus('Completed') }}
            />
            <Tab.Screen
                name="Đã hủy"
                component={OrderList}
                initialParams={{ orders: filterOrdersByStatus('Cancelled') }}
            />
        </Tab.Navigator>
    );
};

export default OrderedPanel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    orderItem: {
        padding: 10,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    orderText: {
        fontSize: 14,
        color: '#555',
    },
});
