import React, { useState, useEffect, useContext } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CartContext } from '../context/CartContext';
import firestore from '@react-native-firebase/firestore'
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { loading } from '../data/AssetsRef';
import { playSound } from '../context/playSound';

const PaymentCallback = ({ navigation, route }) => {
    const { clearCart } = useContext(CartContext);
    const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
    const app_trans_id = route.params.app_trans_id;

    useEffect(() => {
        const listenForPaymentStatus = (appTransId) => {
            const orderRef = firestore().collection('orders').doc(appTransId);

            // Lắng nghe thay đổi trong Firestore
            const unsubscribe = orderRef.onSnapshot((docSnapshot) => {
                if (docSnapshot.exists) {
                    const orderData = docSnapshot.data();
                    if (orderData && orderData.embed_data) {
                        setIsPaymentCompleted(true);
                        clearCart([]);
                    }
                }
            });

            return unsubscribe;
        };

        const unsubscribe = listenForPaymentStatus(app_trans_id);
        return () => unsubscribe();
    }, [app_trans_id]);

    const goBackHome = () => {
        playSound();
        navigation.reset({
            index: 0,
            routes: [{ name: 'homescreen' }], // Đặt lại ngăn xếp và đưa màn hình chính lên đầu
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor:'#fff' }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBackHome}>
                    <MaterialIcons name="chevron-left" size={50} color="#333" />
                </TouchableOpacity>
                <Text style={{ fontWeight: '600', fontSize: 20, color: '#000' }}>Thanh toán</Text>
            </View>
            <View style={styles.container}>
                {isPaymentCompleted ? 
                    (
                        <View style={styles.successContainer}>
                            <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
                            <Text style={styles.successText}>Thanh toán thành công!</Text>
                            <TouchableOpacity style={styles.button} onPress={goBackHome}>
                                <Text style={styles.buttonText}>Quay về trang chính</Text>
                            </TouchableOpacity>
                        </View>
                    ) :
                    (
                        <View style={styles.loadingContainer}>
                            <Image source={loading} style={styles.loadingImg} />
                            <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
                            <Text style={styles.loadingText}>Bạn có thể thoát khỏi trang này</Text>
                        </View>
                    )
                }
            </View>
        </View>
    );
};

export default PaymentCallback;

const styles = StyleSheet.create({
    header: {
        width:'100%',
        height:60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        backgroundColor: '#DEFFD3'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successContainer: {
        alignItems: 'center',
        justifyContent:'center',
        flex: 1,
        width: '100%'
    },
    successText: {
        fontSize: 24,
        color: '#4CAF50',
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent:'center',
        backgroundColor:'#fefcfe',
        flex: 1,
        width: '100%',
    },
    loadingImg: {
        width:"90%",
        marginBottom: 20,
        resizeMode:'contain',
    },
    loadingText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    button: {
        marginTop: 20,
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});