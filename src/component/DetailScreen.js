import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ToastAndroid, TextInput, Alert, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { CartContext } from '../context/CartContext';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { defaultphotoUrl } from '../data/AssetsRef';
import { getUserRef } from '../context/FirebaseFunction';
import firestore from '@react-native-firebase/firestore';

const DetailScreen = ({ navigation, route }) => {
    const { selectedItem } = route.params;
    const { addItemToCart } = useContext(CartContext);
    const [commentInput, setCommentInput] = useState('');
    const [comment, setComment] = useState(selectedItem?.comments || []);
    const [userDataMap, setUserDataMap] = useState({});
    const [loading, setLoading] = useState(true);

    const userRef = getUserRef();

    const handleAddToCart = () => {
        addItemToCart(selectedItem);
        ToastAndroid.show("Thêm thành công", ToastAndroid.SHORT)
    };

    const formatNumberWithDots = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const fetchUserData = async (ref) => {
        try {
            const userSnapshot = await firestore().collection('users').doc(ref.toString()).get();
            if (userSnapshot.exists) {
                return userSnapshot.data();
            } else {
                console.log("Người dùng không tồn tại:", userRef.path);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu user:", error);
        }
        return null;
    };

    useEffect(() => {
        const fetchCommentsUsers = async () => {
            try {
                const userMap = { ...userDataMap };
                const promises = comment?.map(async (item) => {
                    const userRef = item.user;
                    const userId = userRef.path.split('/').pop();
                    if (!userMap[userId]) {
                        const userData = await fetchUserData(userId);
                        userMap[userId] = userData;
                    }
                });
                if (promises) {
                    await Promise.all(promises);
                }
                setUserDataMap(userMap);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommentsUsers();
    }, [comment]);

    const onLogin = () => {
        navigation.jumpTo("Profile");
    }

    const handleSendComment = () => {
        setLoading(true);
        try {
            if (commentInput.trim().length >= 5) {
                setCommentInput('');
                if (!userRef) {
                    Alert.alert(
                        'Đã xảy ra lỗi',
                        'Bạn cần đăng nhập để bình luận',
                        [
                            { text: 'Đăng nhập', onPress: onLogin },
                            { text: 'Hủy', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        ]
                    );
                    return;
                }
                onSubmitComment(commentInput, selectedItem.id);
            }
            else {
                ToastAndroid.show("Bình luận quá ngắn", ToastAndroid.SHORT);
                setLoading(false);
                return;
            }
        } catch (error) {
            setLoading(false);
            ToastAndroid.show("Hãy kiểm tra lại đường truyền internet", ToastAndroid.SHORT);
        }
    }

    const onSubmitComment = async (comment, id) => {
        try {
            const newComment = {
                user: userRef,
                contentComment: comment,
                date: firestore.Timestamp.now(),
            };

            // Tạo một mảng chứa các thao tác bất đồng bộ
            await firestore().collection('productFood').doc(id)
                .update({
                    comments: firestore.FieldValue.arrayUnion(newComment),
                })

            setComment((prevComment) => [...prevComment, newComment]);
            ToastAndroid.show("Bình luận thành công", ToastAndroid.SHORT);

        } catch (error) {
            console.error("Lỗi khi bình luận: ", error);
            ToastAndroid.show("Bình luận thất bại", ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="chevron-left" size={50} color="#333" />
                </TouchableOpacity>
                <Text style={{ fontWeight: '600', fontSize: 20, color: '#000', marginLeft: 20 }}>Chi tiết sản phẩm</Text>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <Image source={{ uri: selectedItem.image }} style={styles.image} />
                <Text style={styles.name}>{selectedItem.name}</Text>
                {selectedItem.discount > 0 ? (
                    <View style={styles.priceContainer}>
                        <Text style={styles.oldPrice}>
                            {formatNumberWithDots(selectedItem.price)} VND
                        </Text>
                        <Text style={styles.discountedPrice}>
                            {formatNumberWithDots(selectedItem.price * (1 - selectedItem.discount / 100))} VND
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.price}>{formatNumberWithDots(selectedItem.price)} VND</Text>
                )}
                <Text style={styles.ratingText}>Đánh giá: {selectedItem.rate}/5 ⭐</Text>
                <Text style={styles.ratingText}>Tổng số lượt đánh giá: {selectedItem.rateCount}</Text>
                <Text style={styles.description}>{selectedItem.desc}</Text>

                <View style={styles.detailsContainer}>
                    <Text style={styles.detail}>Loại: {selectedItem.type}</Text>
                    <Text style={styles.detail}>Đối tượng: {selectedItem.target}</Text>
                    <Text style={styles.detail}>Mục tiêu: {selectedItem.goal}</Text>
                    <Text style={styles.detail}>Khối lượng tịnh: {selectedItem.netWeight} kg</Text>
                    <Text style={styles.detail}>Số lượng tồn kho: {selectedItem.quatity}</Text>
                </View>
                <View style={styles.commentSection}>
                    <Text style={styles.title}>Bình luận</Text>
                    {comment.length > 0 ? (
                        loading ? <ActivityIndicator /> : (
                            <FlatList
                                data={comment}
                                showsVerticalScrollIndicator={true}
                                renderItem={({ item }) => {
                                    const userId = item.user.path.split('/').pop();
                                    const user = userDataMap[userId];
                                    return (
                                        <View style={styles.commentItem}>
                                            <Image
                                                source={{ uri: user?.photoURL || defaultphotoUrl }}
                                                style={styles.commentPhoto}
                                            />
                                            <View>
                                                <View style={{ backgroundColor: '#E7E7E7', paddingVertical: 3, paddingHorizontal: 3, borderRadius: 5, maxWidth: 320 }}>
                                                    <Text style={styles.commentDisplayName}>
                                                        {user?.displayName || "Tên hiển thị"}
                                                    </Text>
                                                    <Text style={styles.commentContent}>
                                                        {item.contentComment}
                                                    </Text>
                                                </View>
                                                <Text style={styles.commentDate}>
                                                    {item.date ? new Date(item.date._seconds * 1000).toLocaleString() : "Ngày hiển thị"}
                                                </Text>
                                            </View>
                                        </View>
                                    )
                                }}
                                keyExtractor={(item) => item.contentComment}
                                contentContainerStyle={{ borderBottomWidth: 1, marginVertical: 10 }}
                            />
                        )
                    ) : (
                        <Text style={styles.noCommentText}>Chưa có bình luận nào.</Text>
                    )}
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Viết bình luận..."
                        multiline={true}
                        value={commentInput}
                        onChangeText={(text) => setCommentInput(text)}
                    />
                    <TouchableOpacity
                        style={styles.submitCommentButton}
                        onPress={handleSendComment}
                    >
                        <Text style={styles.submitCommentText}>Gửi bình luận</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.paymentButton} onPress={handleAddToCart}>
                    <Text style={styles.paymentButtonText}>Thêm vào giỏ hàng</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        backgroundColor: '#DEFFD3',
        minHeight: 50,
    },
    image: {
        width: '100%',
        height: 250,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center'
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6347',
        marginBottom: 10,
    },
    oldPrice: {
        fontSize: 16,
        color: '#898989',
        textDecorationLine: 'line-through',
        marginRight: 10,
    },
    discountedPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6347',
    },
    ratingText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFA500',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign: 'justify',
    },
    detailsContainer: {
        marginBottom: 20,
    },
    detail: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    paymentButton: {
        backgroundColor: '#87bc9d',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        width: '85%',
        height: 60,
        alignSelf: 'center',
        marginVertical: 20
    },
    paymentButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    commentSection: {
        marginVertical: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#F9F9F9',
        borderColor: '#87bc9d',
        borderWidth: 1,
    },
    commentItem: {
        padding: 10,
        flex: 5,
        flexDirection: 'row'
    },
    commentContent: {
        fontSize: 16,
        marginBottom: 5,
        flexWrap: 'wrap',
        textAlign: 'justify'
    },
    commentDate: {
        fontSize: 14,
        color: '#666',
    },
    commentDisplayName: {
        fontSize: 16,
        fontWeight: 'bold',
        flexWrap: 'wrap',
    },
    commentPhoto: {
        width: 30,
        height: 30,
        borderRadius: 100,
        marginRight: 10,
        resizeMode: 'cover',
    },
    commentInput: {
        backgroundColor: '#FFF',
        borderColor: '#DDD',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#333',
        minHeight: 50,
        textAlignVertical: 'top',
    },
    submitCommentButton: {
        marginTop: 10,
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        borderWidth: 1,
        paddingVertical: 10,
        borderRadius: 8,
    },
    submitCommentText: {
        color: '#87bc9d',
        fontSize: 14,
        fontWeight: '500',
    },
    noCommentText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginVertical: 20,
    },
});

export default DetailScreen;
