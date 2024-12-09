import { Switch, Text, View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList, Image, KeyboardAvoidingView, ToastAndroid, Keyboard } from "react-native";
import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { process } from 'react-native-dotenv';
import { logo, AIImage, effect } from "../data/AssetsRef";
import { Nutrition } from "../data/Nutrition";
import { Product } from "../data/Product";
import Sound from 'react-native-sound';
import { getCurrentUser } from "../context/FirebaseFunction";
import database from '@react-native-firebase/database';

const ChatBotScreen = () => {
    const [enableTextToSpeech, setEnableTextToSpeech] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingResponse, setLoadingResponse] = useState(false);
    const [isHumanSupport, setIsHumanSupport] = useState(false);
    const flatListRef = useRef(null);

    const user = getCurrentUser();

    const genAI = useMemo(() => new GoogleGenerativeAI(process.env.GEMINI_API), []);
    const textToSpeechAPI = useMemo(() => process.env.ZALO_API, []);

    useEffect(() => {
        if (!isHumanSupport) {
            return;
        }
        const messagesRef = database().ref(`conversations/${user.uid}/messages`);
        const onValueChange = messagesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const formattedMessages = Object.keys(data)
                    .map(key => ({ id: key, ...data[key], avatar: AIImage }))
                    .sort((a, b) => a.timestamp - b.timestamp); // Sắp xếp theo timestamp
                setMessages(formattedMessages);
            }
        });

        // Clean up listener on unmount
        return () => messagesRef.off('value', onValueChange);
    }, []);

    useEffect(() => {
        if (!global.isDefaultMessageSent) {
            const defaultMessage = {
                id: Math.random().toString(),
                text: 'Bạn có cần giúp đỡ gì không? Tôi có thể cung cấp cho bạn thông tin về dinh dưỡng cho gia cầm, gia súc đó hoặc hỗ trợ bạn sử dụng ứng dụng này!',
                sender: 'NamThanhStores',
                avatar: AIImage,
            };
            setMessages([defaultMessage]);

            global.isDefaultMessageSent = true;
        }
    }, []);

    const textToSpeech = async (message) => {
        try {
            // Kiểm tra tham số đầu vào
            if (!message || message.length === 0) {
                console.error("Message is empty");
                return;
            }

            // Sử dụng URLSearchParams để mã hóa URL đúng cách
            const params = new URLSearchParams();
            params.append('input', message);      // Dữ liệu văn bản
            params.append('speaker_id', '4');     // ID người nói
            params.append('speed', '0.8');        // Tốc độ phát giọng

            // Gửi yêu cầu POST tới API Zalo
            const response = await fetch('https://api.zalo.ai/v1/tts/synthesize', {
                method: 'POST',
                headers: {
                    'apikey': textToSpeechAPI,        // Thay thế bằng API key đúng
                    'Content-Type': 'application/x-www-form-urlencoded',  // Đảm bảo header đúng
                },
                body: params.toString()  // Chuyển dữ liệu thành chuỗi URL-encoded
            });

            const result = await response.json();
            const { error_code, error_message, data } = result;
            console.log(result);

            // Kiểm tra mã lỗi trả về từ API
            if (error_code === 0) {
                const audioUrl = data.url;

                // Lấy URL của file âm thanh và phát nó
                const audioResponse = await fetch(audioUrl, { method: 'GET' });
                if (audioResponse.ok) {
                    const audioFilePath = audioUrl; // Phát trực tiếp từ URL

                    // Sử dụng Sound để phát âm thanh
                    const sound = new Sound(audioFilePath, null, (error) => {
                        if (error) {
                            console.error('Error loading sound:', error);
                            return;
                        }
                        sound.play((success) => {
                            if (!success) {
                                console.error('Playback failed due to audio decoding errors');
                            }
                            sound.release(); // Giải phóng tài nguyên sau khi phát xong
                        });
                    });
                } else {
                    console.error('Error fetching audio from URL:', audioResponse.status);
                }
            } else {
                // Xử lý lỗi từ API
                console.error(`Error: ${error_message} (Code: ${error_code})`);
            }
        } catch (error) {
            console.error('Error in textToSpeech:', error);
        }
    };

    const playSendSound = async () => {
        console.log('try');
        
        try {
            const sound = new Sound(effect, (error) => {
                if (error) {
                    console.error('Error loading sound:', error);
                    return;
                }
                sound.play((success) => {
                    if (!success) {
                        console.error('Playback failed due to audio decoding errors');
                    }
                    sound.release();
                });
            });
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const handleGenerateContent = async (message) => {
        try {
            setLoadingResponse(true);
            const productData = Product.map(p => `
                Tên sản phẩm: ${p.name}
                Mục đích: ${p.goal}
                Mô tả: ${p.desc}
                Giá: ${p.price} VND
                Cân nặng tịnh: ${p.netWeight} kg
                Loại: ${p.type}
            `).join("\n");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(`
                Act as a friendly, supportive, and slightly humorous customer service representative from NamThanhStores, a Vietnamese livestock and poultry feed store. 
                Use an informal tone, making the conversation feel casual and approachable. Refer to yourself as "tớ" and the customer as "cậu." 
                Always show empathy, understanding, and support while keeping the tone positive and uplifting. If the customer has a concern, offer solutions or guide them to available resources.
                **Nutrition Data:** ${JSON.stringify(Nutrition)}
                **Product Data:** ${productData}
                Avoid sounding robotic or scripted. Make it feel like a natural.
                **Customer Message:** ${message}
            `);
            if (enableTextToSpeech) {
                textToSpeech(result.response.text());
            }
            return result.response.text();
        } catch (e) {
            console.error(e);
            return "Lỗi: Có vẻ tin nhắn của bạn đã vi phạm chính sách an toàn của NamThanhStores. Vui lòng thử lại với nội dung khác.";
        } finally {
            setLoadingResponse(false);
        }
    };

    const sendMessage = async () => {
        Keyboard.dismiss();
        playSendSound();
        if (newMessage.trim().length < 5)
            return ToastAndroid.show("Tin nhắn quá ngắn!", ToastAndroid.SHORT);
        try {
            const userMessage = { id: Math.random().toString(), text: newMessage, sender: "You", avatar: null, timestamp: Date.now() };
            setMessages(prevMessages => [...prevMessages, userMessage]);
            setNewMessage('');
            let responde;
            if (isHumanSupport) {
                const messagesRef = database().ref(`conversations/${user.uid}/messages`);
                messagesRef.push(userMessage);
            } else {
                responde = await handleGenerateContent(newMessage);
                const resMessage = { id: Math.random().toString(), text: responde, sender: 'NamThanhStores Chatbot', avatar: AIImage };
                setMessages(prevMessages => [...prevMessages, resMessage]);
            }
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
        }
    };

    const handleChangeSupport = async () => {
        try {
            setIsHumanSupport(!isHumanSupport);

            if (!user) {
                ToastAndroid.show("Hãy đăng nhập để sử dụng tính năng này", ToastAndroid.SHORT);
                return;
            }
            if (!isHumanSupport) { // Chuyển sang người thật
                const conversationRef = database().ref(`conversations/${user.uid}`);
                ToastAndroid.show("Đang gửi yêu cầu hỗ trợ, vui lòng chờ...", ToastAndroid.SHORT);
                console.log(conversationRef);

                await conversationRef.set({
                    customerName: user.displayName || "Người dùng ẩn danh",
                    messages,
                });

                ToastAndroid.show("Yêu cầu hỗ trợ đã được gửi.", ToastAndroid.SHORT);
            } else {
                ToastAndroid.show("Đã chuyển về chế độ chatbot.", ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("handleChangeSupport: ", error);
        }
    }

    const scrollToBottom = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    const isCurrentUser = useCallback((sender) => sender === "You", []);

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <View style={styles.title}>
                <Image source={logo} style={styles.titleAvatar}></Image>
                <Text style={{ fontSize: 8, color: '#6F6F6F', textAlign: 'center' }}>NamThanhStores ChatBot có thể mắc sai sót, vì vậy, hãy xác minh lại các câu trả lời trước khi hoàn toàn tin tưởng</Text>
                <View style={{ flexDirection: 'row', justifyContent: " space-between", width: '100%', paddingVertical: 5, marginVertical: 1 }}>
                    <Text>Chuyển sang người thật hỗ trợ</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#B4F0A0" }}
                        thumbColor={isHumanSupport ? "#FFDFD2" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={handleChangeSupport}
                        value={isHumanSupport}
                    />
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                showsVerticalScrollIndicator={true}
                onContentSizeChange={scrollToBottom}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    return (
                        <View style={[styles.messageContainer, isCurrentUser(item.sender) && styles.currentUserMessage]}>
                            {!isCurrentUser(item.sender) && (
                                <View style={styles.senderInfo}>
                                    <Image style={styles.avatar} source={item?.avatar} />
                                    <Text style={styles.senderName}>{item?.sender}</Text>
                                </View>
                            )}
                            <Text style={styles.answer}>{item.text}</Text>
                        </View>
                    );
                }}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Nhập tin nhắn ở đây..."
                />
                {loadingResponse ? (
                    <TouchableOpacity style={styles.btnSend} disabled={true}>
                        <ActivityIndicator size={34} color="#0EE4C4" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.btnSend} onPress={sendMessage}>
                        <MaterialIcons name="send" color="#0EE4C4" size={35} />
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatBotScreen;

const styles = StyleSheet.create({
    messageContainer: {
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        maxWidth: '80%',
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#b3e5fc',
    },
    senderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        maxWidth: 240,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 100,
        marginRight: 5,
    },
    senderName: {
        fontWeight: 'bold',
        marginLeft: 5,
        marginBottom: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    input: {
        flex: 1,
        marginRight: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        minWidth: 300,
    },
    btnSend: {
        borderRadius: 45,
    },
    title: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 50,
        marginBottom: 20,
        marginTop: 5,
    },
    titleAvatar: {
        margin: 5,
        resizeMode: 'center',
        width: 220,
        height: 80,
    },
    answer: {
        textAlign: 'justify',
        fontSize: 14
    }
});
