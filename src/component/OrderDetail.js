import React, { useState, useEffect, useRef } from 'react';
import { Linking, Text, View, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Animated, PanResponder, Alert, Modal } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { fetchItemsCheckout, updateOrderWithID, updateRateProduct } from '../context/FirebaseFunction';
import { Preparing, Shipping, Review } from '../data/AssetsRef';
import ModalRefund from './ModalRefund';
import ModelReviewOrder from './ModelReviewOrder';

const OrderDetail = ({ navigation, route }) => {
    const order = route.params.order;
    const [itemCheckout, setItemCheckout] = useState(null);
    const [swiped, setSwiped] = useState(false);
    const [modalRefund, setModalRefund] = useState(false);
    const [modalReview, setModalReview] = useState(false);
    const [ratings, setRatings] = useState({});

    const swipeX = useRef(new Animated.Value(0)).current;

    const totalQuantity = order.item.reduce((total, current) => total + current.itemCount, 0)

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const item = await fetchItemsCheckout(order.item);
                setItemCheckout(item);
            } catch (error) {
                console.error("Fetch items checkout error: ", error);
            }
        }
        fetchItems();
    }, [])

    const formatDateToVietnamTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

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

    const handleCancelOrder = async () => {
        try {
            if (order.embed_data.status === "Pending" || order.embed_data.status === "Preparing") {
                order.embed_data.status = "Cancelled";
                setSwiped(true);
                const result = await updateOrderWithID(order.app_trans_id, order.embed_data, "Cancelled");
                if (result) {
                    Alert.alert("Thông báo", "Bạn đã hủy đơn hàng thành công.");
                }
            } else {
                Alert.alert("Thông báo", `Bạn không thể hủy đơn hàng khi đơn hàng đang ở trạng thái ${translateStatus(order.embed_data.status)}.`);
            }
        } catch (error) {
            console.error("delete error ", error);
        }
    };

    const handleCompleteOrder = async () => {
        try {
            if (order.embed_data.status === "Shipping") {
                order.embed_data.status = "Completed";
                setSwiped(true);
                await updateOrderWithID(order.app_trans_id, order.embed_data, "Completed");
            } else {
                Alert.alert("Thông báo", "Đã xảy ra lỗi nào đó");
            }
        } catch (error) {
            console.error("Complete error: ", error);
        }
    };

    const handlePress = (url) => {
        try {
            if (url.startsWith('mailto:')) {
                Linking.openURL(url);
            } else {
                Linking.openURL(`tel:${url}`);
            }
        } catch (error) {
            ToastAndroid.show("Đã có lỗi nào đó xảy ra", ToastAndroid.SHORT);
        }
    };

    const openSpecificFacebookPage = async () => {
        try {
            const canOpen = await Linking.canOpenURL('fb://');
            if (canOpen) {
                const url = 'fb://profile/100006771705823';
                Linking.openURL(url);
            } else {
                const url = 'https://www.facebook.com/profile.php?id=100006771705823';
                Linking.openURL(url);
            }
        } catch (error) {
            ToastAndroid.show("Đã có lỗi nào đó xảy ra", ToastAndroid.SHORT);
        }
    };

    const handleChangeStatus = () => {
        Alert.alert(
            "Xác nhận ?",
            "Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này không?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Đồng ý",
                    onPress: () => {
                        Animated.spring(swipeX, { toValue: 0, useNativeDriver: false }).start();
                        if (order.embed_data.status === "Pending" || order.embed_data.status === "Preparing") {
                            handleCancelOrder();
                        } else if (order.embed_data.status === "Shipping") {
                            handleCompleteOrder();
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    }

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx > 0) {
                    swipeX.setValue(Math.min(gestureState.dx, 260));
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > 240) {
                    handleChangeStatus();
                } else {
                    Animated.spring(swipeX, { toValue: 0, useNativeDriver: false }).start();
                }
            },
        })
    ).current;

    const renderOrderDetails = () => {
        return itemCheckout?.map((item, index) => {
            const selectedItem = order.item.find(o => o.id === item.id);
            return selectedItem ? (
                <View style={styles.itemRow} key={item.id}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                    <Text style={[styles.itemText, { flex: 3, marginHorizontal: 5, textAlign: 'justify' }]}>{item.name}</Text>
                    <Text style={[styles.itemText, { flex: 1, marginHorizontal: 5, fontSize: 13, textAlign: 'right' }]}>x <Text style={{ fontWeight: 'bold' }}>{selectedItem.itemCount}</Text></Text>
                    {order?.embed_data?.status === "Completed" && (
                        <View style={styles.starContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => handleRatingChange(item.id, star, index)}
                                >
                                    <MaterialIcons
                                        name="star"
                                        size={30}
                                        color={star <= (ratings[item.id] || 0) ? "#FFD700" : "#E0E0E0"}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            ) : null;
        });
    };

    const handleRatingChange = (itemId, star, index) => {
        try {
            setRatings((prevRatings) => ({
                ...prevRatings,
                [itemId]: star,
            }));

            const currentRating = itemCheckout[index].rate;
            const currentRatingCount = itemCheckout[index].rateCount;

            const newRating = ((currentRating * currentRatingCount) + star) / (currentRatingCount + 1);
            const newRatingCount = currentRatingCount + 1;

            updateRateProduct(itemId, newRating.toFixed(1), newRatingCount);
        } catch (error) {
            console.error("handle rating: ", error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="chevron-left" size={50} color="#333" />
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000' }}>Chi tiết đơn hàng</Text>
            </View>
            <ScrollView style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 10, }}>
                <View style={{ marginVertical: 15 }}>
                    <Text style={styles.title}>Trạng thái đơn hàng</Text>
                    <View style={[styles.statusContainer, { backgroundColor: order.embed_data.status === "Cancelled" ? "#fff" : "#E8F5E9", borderColor: order.embed_data.status === "Cancelled" ? "#000" : "#E8F5E9" }]}>
                        <Text style={[styles.statusText, { color: order.embed_data.status === "Cancelled" ? "red" : '#87bc9d' }]}>
                            {translateStatus(order.embed_data.status)}
                        </Text>
                        <View style={styles.iconRow}>
                            <MaterialIcons
                                name="hourglass-empty"
                                size={30}
                                color={["Pending", "Preparing", "Shipping", "Completed"].includes(order.embed_data.status) ? "green" : "gray"}
                            />
                            <View style={[styles.line, { backgroundColor: ["Pending", "Preparing", "Shipping", "Completed"].includes(order.embed_data.status) ? "green" : "gray" }]} />
                            <MaterialIcons
                                name="archive"
                                size={30}
                                color={["Preparing", "Shipping", "Completed"].includes(order.embed_data.status) ? "green" : "gray"}
                            />
                            <View style={[styles.line, { backgroundColor: ["Preparing", "Shipping", "Completed"].includes(order.embed_data.status) ? "green" : "gray" }]} />
                            <MaterialIcons
                                name="local-shipping"
                                size={30}
                                color={["Shipping", "Completed"].includes(order.embed_data.status) ? "green" : "gray"}
                            />
                            <View style={[styles.line, { backgroundColor: order.embed_data.status === "Completed" ? "green" : "gray" }]} />
                            <MaterialIcons
                                name="check-circle"
                                size={30}
                                color={order.embed_data.status === "Completed" ? "green" : "gray"}
                            />
                        </View>
                        {
                            order.embed_data.status === "Preparing" && (
                                <Image source={Preparing} style={styles.statusImage} />
                            )
                        }
                        {
                            order.embed_data.status === "Shipping" && (
                                <Image source={Shipping} style={styles.statusImage} />
                            )
                        }
                        {
                            order.embed_data.status === "Completed" && (
                                <TouchableOpacity style={{ alignItems:'center'}} onPress={() => setModalReview(true)}>
                                    <Image source={Review} style={styles.statusImage} />
                                    <Text style={styles.title}>Đánh giá đơn hàng</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>
                <View style={{ marginVertical: 5 }}>
                    <Text style={styles.title}>Địa chỉ giao hàng</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text>{order.embed_data?.name}</Text>
                        <Text>{` | ${order.embed_data?.phone || 'Chưa có số điện thoại'}`}</Text>
                    </View>
                    <View style={styles.addressArea}>
                        <Text>{order.embed_data?.address || "Chưa có thông tin về địa chỉ"} </Text>
                    </View>
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
                        <Text style={[styles.title, { fontSize: 13 }]}>Ngày đặt</Text>
                        <Text style={styles.totalPrice}>{formatDateToVietnamTime(order.server_time)}</Text>
                    </View>
                    <View style={styles.itemRow}>
                        <Text style={[styles.title, { fontSize: 13 }]}>Tổng tiền</Text>
                        <Text style={[styles.totalPrice, { color: '#3a915e' }]}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}</Text>
                    </View>
                </View>
                <View style={{ marginVertical: 15 }}>
                    <Text style={styles.title}>Ghi chú</Text>
                    <TextInput
                        style={styles.notesInput}
                        multiline={true}
                        numberOfLines={4}
                        value={order.embed_data?.note || "Không có ghi chú nào cả..."}
                        editable={false}
                    />
                </View>
                <View style={{ marginVertical: 15 }}>
                    <Text style={styles.title}>Cần hỗ trợ ?</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => handlePress('0387142380')}>
                        <MaterialIcons name="call" size={30} color="#333" />
                        <Text style={styles.linkText}>  Số điện thoại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => handlePress(`mailto:2024801030167@student.tdmu.edu.vn?subject=Yêu cầu hỗ trợ cho đơn hàng #${order.app_trans_id}`)}>
                        <MaterialIcons name="mail" size={30} color="#333" />
                        <Text style={styles.linkText}>  Email</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => openSpecificFacebookPage()}>
                        <MaterialIcons name="diversity-3" size={30} color="#333" />
                        <Text style={styles.linkText}>  NamThanhStores Fanpage</Text>
                    </TouchableOpacity>
                </View>
                {(order?.embed_data?.status === "Pending" || order?.embed_data?.status === "Preparing") && (
                    <View style={{ marginVertical: 15, borderWidth: 1, borderRadius: 10, borderColor: '#87bc9d' }}>
                        <Animated.View
                            style={[styles.cancelBtn, { transform: [{ translateX: swipeX }], width: swiped ? '100%' : 150 }]}
                            {...panResponder.panHandlers}
                        >
                            <Text style={styles.cancelText}>
                                {swiped ? "Đơn hàng đã bị hủy" : "Hủy đơn hàng →"}
                            </Text>
                        </Animated.View>
                    </View>
                )}

                {order?.embed_data?.status === "Shipping" && (
                    <View style={{ marginVertical: 15, borderWidth: 1, borderRadius: 10, borderColor: '#87bc9d' }}>
                        <Animated.View
                            style={[styles.completeBtn, { transform: [{ translateX: swipeX }], width: swiped ? '100%' : 150 }]}
                            {...panResponder.panHandlers}
                        >
                            <Text style={styles.completeText}>
                                {swiped ? "Đơn hàng đã hoàn thành" : "Giao thành công? →"}
                            </Text>
                        </Animated.View>
                    </View>
                )}

                <View style={{ marginBottom: 5, alignSelf: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setModalRefund(true)}>
                        <Text style={{ fontSize: 12, textDecorationLine: 'underline', color: 'black', textAlign: 'right', fontWeight: '300' }}>Chính sách hoàn tiền của NamThanhStores</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalRefund}
                onRequestClose={() => setModalRefund(false)}
            >
                <ModalRefund onClose={() => setModalRefund(false)}/>
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalReview}
                onRequestClose={() => setModalReview(false)}
            >
                <ModelReviewOrder onClose={() => setModalReview(false)} id={order.id} />
            </Modal>
        </View>
    );
};

export default OrderDetail;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#DEFFD3'
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    statusContainer: {
        marginTop: 10,
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: "#E8F5E9",
        borderRadius: 12,
        borderColor: "#4CAF50",
        borderWidth: 2,
    },
    statusText: {
        fontSize: 21,
        fontWeight: "bold",
        marginBottom: 15,
        marginHorizontal: 15,
        color: '#87bc9d'
    },
    iconRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        width: "90%",
        marginLeft: 10
    },
    statusImage: {
        resizeMode: 'contain',
        height: 150,
        minWidth: 200,
        alignSelf:'center',
    },
    line: {
        width: 60,
        height: 3,
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
    cancelBtn: {
        padding: 15,
        backgroundColor: "#FFCDD2",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    completeBtn: {
        padding: 15,
        backgroundColor: "#87bc9d",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelText: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#D32F2F",
    },
    completeText: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    linkText: {
        fontSize: 13,
        marginVertical: 3,
        fontWeight: '600',
    },
    starContainer: {
        flexDirection: "row",
        marginTop: 5,
    }
});