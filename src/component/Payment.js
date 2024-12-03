import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, Text, View, StyleSheet, TouchableOpacity, Alert, ToastAndroid, Image, TextInput, ActivityIndicator } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { fetchItemsCheckout, getCurrentUser, getUserInfo } from '../context/FirebaseFunction';
import { Picker } from '@react-native-picker/picker';

const Payment = ({ navigation, route }) => {
    const { selectedItems, totalPrice, totalQuantity } = route.params;
    const [user, setUser] = useState(null);
    const [itemCheckout, setItemCheckout] = useState(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('zalo');

    const shippingFee = paymentMethod === 'cash' ? 10000 : 0;
    const totalAmount = totalPrice + shippingFee;
    
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userSnapshot = await getUserInfo();
                if (userSnapshot) {
                    setUser(userSnapshot);
                } else {
                    ToastAndroid.show("Không thể lấy được thông tin người dùng")
                    Alert.alert(
                        'Đã xảy ra lỗi',
                        'Bạn cần đăng nhập để đăng lại !',
                        [
                            { text: 'Đăng nhập', onPress: handleLogin },
                            { text: 'Hủy', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        ]
                    );
                }
            } catch (error) {
                Alert.alert(
                    'Đã xảy ra lỗi',
                    'Bạn cần đăng nhập để đăng lại !',
                    [
                        { text: 'Đăng nhập', onPress: handleLogin },
                        { text: 'Hủy', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    ]
                );
                console.error("Fetch user error: ", error);
            }
        }

        const fetchItems = async () => {
            try {
                const item = await fetchItemsCheckout(selectedItems);
                setItemCheckout(item);
            } catch (error) {
                console.error("Fetch items checkout error: ", error);
            }
        }
        Promise.all([
            fetchUser(),
            fetchItems(),
        ])
    }, [])

    const handleLogin = () => navigation.navigate('loginscreen');

    const handlePayment = async () => {
        if (!user?.name) {
            if (!user?.displayName) {
                ToastAndroid.show("Vui lòng cung cấp đầy đủ thông tin trước khi thanh toán!", ToastAndroid.SHORT);
                return;
            }
        }
        if (!user?.phone || !user?.address || !itemCheckout || !selectedItems || !totalAmount || !totalQuantity) {
            ToastAndroid.show("Vui lòng cung cấp đầy đủ thông tin trước khi thanh toán!", ToastAndroid.SHORT);
            return;
        }

        try {
            setLoading(true);
            const firebaseFunctionURL = 'https://us-central1-namthanhstores.cloudfunctions.net/createPayment';

            const paymentData = {
                amount: totalAmount,
                items: selectedItems,
                email: user.email,
                address: user.address,
                name: user?.name || user.displayName,
                phone: user.phone,
                note: note || 'Không có ghi chú',
                location: user?.location,
                userid: getCurrentUser().uid,
            };
            
            const response = await fetch(firebaseFunctionURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            const responseData = await response.json();
            
            if (response.ok && responseData?.order_url) {
                Linking.openURL(responseData.order_url);
                navigation.navigate('paymentcallback', { app_trans_id: responseData.app_trans_id })
            } else {
                console.error("Error creating payment:", responseData);
                ToastAndroid.show("Không thể tạo đơn hàng. Vui lòng thử lại!", ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("Error handling payment:", error);
            ToastAndroid.show("Đã xảy ra lỗi khi xử lý thanh toán!", ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };


    const renderOrderDetails = () => {
        return itemCheckout?.map((item) => {
            const selectedItem = selectedItems.find(si => si.id === item.id);
            return selectedItem ? (
                <View style={styles.itemRow} key={item.id}>
                    <Image source={{ uri: selectedItem.image }} style={styles.itemImage} />
                    <Text style={[styles.itemText, { flex: 3, marginHorizontal: 5, textAlign: 'justify' }]}>{selectedItem.name}</Text>
                    <Text style={[styles.itemText, { flex: 1, marginHorizontal: 5, fontSize: 13, textAlign: 'right' }]}>x <Text style={{ fontWeight: 'bold' }}>{selectedItem.itemCount}</Text></Text>
                </View>
            ) : null;
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="chevron-left" size={30} color="#333" />
                </TouchableOpacity>
                <Text style={{ fontWeight: '600', fontSize: 20, color: '#000', marginLeft: 20 }}>Xác nhận đơn hàng</Text>
            </View>
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={{ marginVertical: 5 }}>
                        <Text style={styles.title}>Địa chỉ giao hàng</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text>{user?.name || user?.displayName || "Tên người dùng"}</Text>
                            <Text>{` | ${user?.phone || 'Chưa có số điện thoại'}`}</Text>
                        </View>
                        <TouchableOpacity style={styles.addressArea} onPress={() => navigation.navigate("userinfo", { user: user, onRefresh: onRefresh })}>
                            <Text>{user?.address || "Chưa có thông tin về địa chỉ"} </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginVertical: 15 }}>
                        <Text style={styles.title}>Chi tiết đơn hàng</Text>
                        {renderOrderDetails()}
                    </View>
                    <View style={{ marginVertical: 15 }}>
                        <View style={styles.itemRow}>
                            <Text style={[styles.title, { fontSize: 13 }]}>Tổng số lượng đơn hàng</Text>
                            <Text style={styles.totalPrice}>{totalQuantity}</Text>
                        </View>
                        <View style={styles.itemRow}>
                            <Text style={[styles.title, { fontSize: 13 }]}>Giá trị đơn hàng</Text>
                            <Text style={styles.totalPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</Text>
                        </View>
                        <View style={styles.itemRow}>
                            <Text style={[styles.title, { fontSize: 13 }]}>Phí vận chuyển</Text>
                            <Text style={styles.totalPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}</Text>
                        </View>
                        <View style={styles.itemRow}>
                            <Text style={[styles.title, { fontSize: 13 }]}>Tổng tiền cần thanh toán</Text>
                            <Text style={[styles.totalPrice, { color: '#3a915e' }]}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</Text>
                        </View>
                        {paymentMethod === 'cash' && (
                            <Text style={{ color: '#FF0000', fontSize: 12 }}>
                                * Sẽ phụ thu phí ship 10.000đ khi chọn phương thức thanh toán bằng tiền mặt.
                            </Text>
                        )}
                    </View>
                    <View style={{ marginVertical: 15 }}>
                        <Text style={styles.title}>Ghi chú</Text>
                        <TextInput
                            style={styles.notesInput}
                            multiline={true}
                            numberOfLines={4}
                            placeholder="Nhập ghi chú cho đơn hàng của bạn..."
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>
                    <View style={{ marginVertical: 15 }}>
                        <View style={[styles.itemRow, { height: 50, borderWidth: 0, borderColor: 'red' }]}>
                            <Text style={{
                                flex: 1,
                                borderRightWidth: StyleSheet.hairlineWidth,
                                height: 50,
                                textAlignVertical: 'center',
                                fontSize: 14,
                                textAlign: 'left',
                                paddingHorizontal: 10
                            }}>
                                Phương thức thanh toán
                            </Text>
                            <Picker
                                selectedValue={paymentMethod}
                                style={styles.picker}
                                onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                            >
                                <Picker.Item label="Trả trước bằng Zalo" value="zalo" />
                                <Picker.Item label="Tiền mặt" value="cash" />
                            </Picker>
                        </View>
                        <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
                            {loading ? <ActivityIndicator size={'large'} color={"#fff"} /> : <Text style={styles.paymentButtonText}>Thanh toán</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Payment;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        backgroundColor: '#DEFFD3',
        minHeight: 50,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    addressArea: {
        padding: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: 100,
        textAlignVertical: 'top',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    itemImage: {
        flex: 1,
        width: 60,
        height: 60,
        resizeMode: 'contain'
    },
    itemText: {
        fontSize: 10,
        color: '#333',
    },
    totalPrice: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'right',
    },
    notesInput: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        fontSize: 16,
        color: '#333',
        minHeight: 50,
        textAlignVertical: 'top',
    },
    picker: {
        height: 50,
        flex: 2,
        borderColor: '#ccc',
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: '#fff',
        fontSize: 8
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
