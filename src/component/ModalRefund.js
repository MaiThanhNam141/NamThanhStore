import React from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ModalRefund = ({ onClose }) => {
    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chính sách hoàn tiền của NamThanhStores</Text>
                <View style={styles.dividerModal} />
                <ScrollView style={{ marginHorizontal: 7 }}>
                    {/* Mục 1 */}
                    <Text style={styles.subTitle}>1. Đối với thanh toán qua ứng dụng ZaloPay</Text>
                    <Text style={styles.subTitle2}>1.1. Nguồn tiền thanh toán:</Text>
                    <Text style={styles.pureText}>- Ví ZaloPay.</Text>
                    <Text style={styles.pureText}>- ATM hoặc tài khoản ngân hàng liên kết.</Text>
                    <Text style={styles.pureText}>- Thẻ Visa/Master/JCB.</Text>
                    <Text style={styles.subTitle2}>1.2. Hình thức hoàn tiền:</Text>
                    <Text style={styles.pureText}>- Hoàn tiền về Ví ZaloPay (đối với thanh toán từ Ví ZaloPay và tài khoản ngân hàng).</Text>
                    <Text style={styles.pureText}>- Hoàn tiền về thẻ (đối với thanh toán từ thẻ Visa/Master/JCB).</Text>
                    <Text style={styles.subTitle2}>1.3. Thời gian xử lý:</Text>
                    <Text style={styles.pureText}>- Ngay lập tức đối với giao dịch từ Ví ZaloPay hoặc tài khoản ngân hàng.</Text>
                    <Text style={styles.pureText}>- Từ 5-7 ngày làm việc đối với giao dịch từ thẻ Visa/Master/JCB.</Text>
                    <Text style={styles.subTitle2}>1.4. Ngân hàng hỗ trợ:</Text>
                    <Text style={styles.pureText}>- Vietcombank, Vietinbank, BIDV, Sacombank, Eximbank, SCB, Bản Việt, JCB.</Text>

                    {/* Mục 2 */}
                    <Text style={styles.subTitle}>2. Đối với thanh toán qua cổng ZaloPay Gateway</Text>
                    <Text style={styles.subTitle2}>2.1. Nguồn tiền thanh toán:</Text>
                    <Text style={styles.pureText}>- ATM hoặc tài khoản ngân hàng.</Text>
                    <Text style={styles.pureText}>- Thẻ Visa/Master/JCB.</Text>
                    <Text style={styles.subTitle2}>2.2. Hình thức hoàn tiền:</Text>
                    <Text style={styles.pureText}>- Hoàn tiền về tài khoản ngân hàng (đối với thanh toán từ ATM/Tài khoản ngân hàng).</Text>
                    <Text style={styles.pureText}>- Hoàn tiền về thẻ (đối với thanh toán từ thẻ Visa/Master/JCB).</Text>
                    <Text style={styles.subTitle2}>2.3. Thời gian xử lý:</Text>
                    <Text style={styles.pureText}>- Từ 3-5 ngày làm việc đối với hoàn tiền qua tài khoản ngân hàng (tùy thuộc vào ngân hàng).</Text>
                    <Text style={styles.pureText}>- Từ 5-7 ngày làm việc đối với hoàn tiền qua thẻ Visa/Master/JCB (tùy thuộc vào ngân hàng).</Text>
                    <Text style={styles.subTitle2}>2.4. Ngân hàng hỗ trợ:</Text>
                    <Text style={styles.pureText}>
                        - ABBank, ACB, Agribank, Bắc Á Bank, Bảo Việt Bank, BIDV, Đông Á Bank, Eximbank, GP Bank, HD Bank, Liên Việt Post Bank,
                        Maritime Bank, MB Bank, Nam Á Bank, NCB, Bản Việt, OCB, Ocean Bank, PG Bank, Sacombank, Saigon Bank, SCB, SeaBank, SHB,
                        Techcombank, TPBank, VIB.
                    </Text>

                    {/* Mục 3 */}
                    <Text style={styles.subTitle}>3. Đối với thanh toán bằng tiền mặt</Text>
                    <Text style={styles.subTitle2}>3.1. Hình thức hoàn tiền:</Text>
                    <Text style={styles.pureText}>- Hoàn tiền trực tiếp bằng tiền mặt tại cửa hàng NamThanhStores.</Text>
                    <Text style={styles.subTitle2}>3.2. Thời gian xử lý:</Text>
                    <Text style={styles.pureText}>- Hoàn tiền ngay tại thời điểm khách hàng mang sản phẩm cần hoàn trả đến cửa hàng và đáp ứng đủ điều kiện hoàn tiền.</Text>
                    <Text style={styles.subTitle2}>3.3. Điều kiện áp dụng:</Text>
                    <Text style={styles.pureText}>
                        - Khách hàng cần xuất trình hóa đơn mua hàng và sản phẩm còn nguyên vẹn, đầy đủ phụ kiện (nếu có).
                    </Text>

                    {/* Mục 4 */}
                    <Text style={styles.subTitle}>4. Lưu ý chung</Text>
                    <Text style={styles.pureText}>4.1. Thời gian xử lý có thể thay đổi tùy thuộc vào quy trình của ngân hàng hoặc tổ chức thẻ.</Text>
                    <Text style={styles.pureText}>4.2. NamThanhStores không chịu trách nhiệm về các khoản phí phát sinh do hoàn tiền.</Text>
                    <Text style={styles.pureText}>4.3. Mọi yêu cầu hoàn tiền cần được thực hiện trong vòng 7 ngày kể từ ngày mua hàng hoặc nhận sản phẩm.</Text>
                </ScrollView>
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

export default ModalRefund;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: "92%",
        height: "95%",
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingBottom: 15
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
        alignSelf:'center'
    },
    subTitle: {
        fontWeight: '700',
        fontSize: 14
    },
    subTitle2: {
        fontWeight: '500',
        fontSize: 12,
        marginHorizontal: 5,
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