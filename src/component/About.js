import React, { useState } from 'react';
import { ToastAndroid, Text, View, StyleSheet, SafeAreaView, Image, Linking, TouchableOpacity, Modal, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { logo } from '../data/AssetsRef';

const packageJson = require("../../package.json");

const About = ({ navigation }) => {
    const [modalNotificationVisible, setModalNotificationVisible] = useState(false);

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

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
                <MaterialIcons name="chevron-left" size={50} color="#333" onPress={() => navigation.goBack()} />
                <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#000' }}>Về NamThanhStores</Text>
            </View>
            <LinearGradient style={styles.container} colors={['#f7f7f7', '#DEFFD3']}>
                <View style={{ alignItems: 'center' }}>
                    <Image style={styles.imageHeader} source={logo} />
                    <View>
                        <Text style={styles.titleLogo}>PABMIND</Text>
                        <Text style={styles.version}>Phiên bản: {packageJson.version}</Text>
                    </View>
                </View>
                <View>
                    <Text style={styles.heading}>Các kênh liên lạc và hỗ trợ</Text>
                    <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={() => handlePress('0387142380')}>
                        <MaterialIcons name="call" size={30} color="#333"/>
                        <Text style={styles.linkText}>  Số điện thoại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={() => handlePress('mailto:2024801030167@student.tdmu.edu.vn?subject=Yêu cầu hỗ trợ')}>
                        <MaterialIcons name="mail" size={30} color="#333"/>
                        <Text style={styles.linkText}>  Email</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={() => openSpecificFacebookPage()}>
                        <MaterialIcons name="diversity-3" size={30} color="#333"/>
                        <Text style={styles.linkText}>  NamThanhStores Fanpage</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 5, alignSelf: 'flex-start' }}>
                    <TouchableOpacity onPress={() => setModalNotificationVisible(true)}>
                        <Text style={[styles.text, { fontSize: 12, textDecorationLine: 'underline' }]}>Chính sách và Điều khoản sử dụng</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalNotificationVisible}
                onRequestClose={() => setModalNotificationVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chính sách và Điều khoản sử dụng</Text>
                        <View style={styles.dividerModal} />
                        <ScrollView style={{ marginHorizontal: 7 }}>
                            <Text style={styles.subTitle}>1. Quyền và Trách nhiệm của Người Dùng</Text>
                            <Text style={styles.pureText}>Người dùng có trách nhiệm cung cấp thông tin chính xác, đầy đủ khi đăng ký và cập nhật tài khoản trong suốt quá trình sử dụng ứng dụng NamThanhStores. Ứng dụng cho phép người dùng đăng ký/đăng nhập bằng tài khoản mật khẩu hoặc thông qua dịch vụ đăng nhập Google. Người dùng cần đảm bảo rằng thông tin đăng nhập và mật khẩu được bảo mật, không chia sẻ với bất kỳ ai. Mọi hành vi đăng nhập trái phép hoặc có dấu hiệu gian lận phải được thông báo kịp thời cho đội ngũ hỗ trợ của NamThanhStores để tránh các rủi ro về bảo mật và mất tài sản. Người dùng có quyền tìm kiếm, đặt mua sản phẩm, thanh toán và theo dõi đơn hàng qua ứng dụng. Tuy nhiên, việc đặt hàng chỉ được hoàn thành khi người dùng thực hiện thanh toán và nhận được xác nhận từ hệ thống. NamThanhStores không chịu trách nhiệm cho các trường hợp chậm trễ hoặc sai sót trong quá trình giao hàng do cung cấp sai thông tin hoặc các vấn đề ngoài tầm kiểm soát.</Text>
                            <Text style={styles.subTitle}>2. Chính sách Đổi trả và Hoàn tiền</Text>
                            <Text style={styles.pureText}>Người dùng có thể yêu cầu đổi trả hàng hoá trong vòng 7 ngày kể từ khi nhận được sản phẩm, với điều kiện sản phẩm còn nguyên vẹn, chưa qua sử dụng và có hoá đơn mua hàng. Để yêu cầu đổi trả, người dùng cần liên hệ với bộ phận hỗ trợ khách hàng qua ứng dụng. Sau khi kiểm tra và xác nhận sản phẩm đủ điều kiện, NamThanhStores sẽ tiến hành đổi sản phẩm mới hoặc hoàn tiền theo yêu cầu của khách hàng. Tiền hoàn trả sẽ được chuyển qua phương thức thanh toán mà khách hàng đã sử dụng ban đầu.</Text>
                            <Text style={styles.subTitle}>3. Quyền riêng tư và Bảo mật</Text>
                            <Text style={styles.pureText}>NamThanhStores cam kết bảo vệ quyền riêng tư của người dùng. Mọi thông tin cá nhân được thu thập từ người dùng, bao gồm tên, số điện thoại, địa chỉ email và thông tin vị trí, chỉ được sử dụng cho mục đích cung cấp dịch vụ, hỗ trợ khách hàng và cải thiện trải nghiệm mua sắm. Chúng tôi không chia sẻ thông tin cá nhân của người dùng với bên thứ ba, trừ khi được yêu cầu bởi pháp luật. Người dùng có quyền truy cập, sửa đổi hoặc xoá thông tin cá nhân của mình thông qua phần cài đặt tài khoản. Trong trường hợp có vi phạm liên quan đến bảo mật hoặc lộ thông tin, NamThanhStores sẽ thông báo kịp thời và cung cấp các biện pháp bảo vệ bổ sung cho người dùng.</Text>
                            <Text style={styles.subTitle}>4. Phương thức Thanh toán</Text>
                            <Text style={styles.pureText}>NamThanhStores cung cấp nhiều phương thức thanh toán tiện lợi cho người dùng như chuyển khoản ngân hàng, thẻ tín dụng, và các ví điện tử phổ biến. Tất cả giao dịch thanh toán đều được mã hoá và bảo vệ để đảm bảo an toàn. NamThanhStores không lưu trữ thông tin thẻ tín dụng của khách hàng, mọi thông tin thanh toán sẽ được thực hiện qua các cổng thanh toán an toàn được tích hợp trên ứng dụng.</Text>
                            <Text style={styles.subTitle}>5. Điều khoản Sử dụng Dịch vụ</Text>
                            <Text style={styles.pureText}>NamThanhStores có quyền thay đổi, chỉnh sửa hoặc tạm ngưng dịch vụ bất kỳ lúc nào mà không cần thông báo trước, vì lý do bảo trì, nâng cấp hệ thống hoặc các sự cố kỹ thuật ngoài ý muốn. Mọi thay đổi về chính sách, điều khoản sử dụng sẽ được cập nhật công khai trên ứng dụng. Người dùng tiếp tục sử dụng dịch vụ sau khi có thay đổi nghĩa là đã đồng ý với các điều khoản mới. Trong trường hợp vi phạm bất kỳ điều khoản nào, NamThanhStores có quyền khóa tài khoản của người dùng mà không cần báo trước. Các hành vi sử dụng trái phép hoặc cố tình gây thiệt hại cho hệ thống sẽ bị xử lý theo quy định pháp luật hiện hành.</Text>
                            <Text style={styles.subTitle}>6. Trách nhiệm của NamThanhStores</Text>
                            <Text style={styles.pureText}>NamThanhStores cam kết cung cấp thông tin sản phẩm chính xác, đảm bảo chất lượng sản phẩm khi giao hàng. Tuy nhiên, chúng tôi không chịu trách nhiệm đối với các trường hợp bất khả kháng, bao gồm nhưng không giới hạn ở thiên tai, sự cố mạng, hoặc các tình huống không lường trước ảnh hưởng đến khả năng cung cấp dịch vụ. NamThanhStores cũng không chịu trách nhiệm cho các thiệt hại phát sinh từ việc người dùng không tuân thủ chính sách hoặc điều khoản sử dụng.</Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalNotificationVisible(false)}
                        >
                            <MaterialIcons name="close" size={25} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default About;

const styles = StyleSheet.create({
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        backgroundColor: '#f7f7f7',
    },
    container: {
        flex: 10,
        alignItems: 'center',
        paddingHorizontal: 15,
        justifyContent: 'space-between'
    },
    imageHeader: {
        resizeMode: 'contain',
        width: 150,
        height: 150,
        overflow: 'hidden',
    },
    titleLogo: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 20
    },
    version: {
        textAlign: 'center',
        fontSize: 14
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 20,
        marginVertical: 5
    },
    linkText: {
        fontSize: 13,
        marginVertical: 3,
        fontWeight: '600',
    },
    text: {
        color: 'black',
        textAlign: 'justify',
        fontWeight: '300',
        marginVertical: 4,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: "93%",
        height: "96%",
        backgroundColor: '#fff',
        borderRadius: 15
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
    },
    subTitle: {
        fontWeight: '700',
        fontSize: 14
    },
    pureText: {
        fontSize: 11,
        textAlign: 'justify',
        marginHorizontal: 10
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});