import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { feedbackOrder } from '../context/FirebaseFunction';

const ModelReviewOrder = ({ id, onClose }) => {
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleStarPress = (star) => {
        setRating(star);
    };

    const handleReview = async() => {
        try {
            setLoading(true);
            await feedbackOrder(id, rating, review);
        } catch (error) {
            console.error("handleReview error: ", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Đánh giá đơn hàng</Text>
                <View style={styles.dividerModal} />
                <View style={{ flexDirection: "row", justifyContent: 'space-around', alignItems: 'center', marginVertical: 30, width: 280 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => handleStarPress(star)}
                        >
                            <MaterialIcons
                                name="star"
                                size={45}
                                color={star <= rating ? "#FFD700" : "#E0E0E0"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput
                    style={styles.notesInput}
                    multiline={true}
                    numberOfLines={4}
                    value={review}
                    onChangeText={setReview}
                    placeholder="Nhận xét về đơn hàng này"
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleReview} disabled={loading}>
                    { loading ? <ActivityIndicator /> : <Text style={styles.submitButtonText}> Gửi đánh giá </Text>}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <MaterialIcons name="close" size={25} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ModelReviewOrder;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: "92%",
        height: "60%",
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingBottom: 15,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#202020',
        marginTop: 30
    },
    dividerModal: {
        backgroundColor: '#333',
        height: 1,
        marginBottom: 10,
        width: '90%',
        alignSelf: 'center'
    },
    notesInput: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        fontSize: 16,
        color: '#333',
        minHeight: 80,
        width: '90%',
        alignSelf: 'center',
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#87bc9d',
        padding: 20,
        marginTop: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    submitButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});