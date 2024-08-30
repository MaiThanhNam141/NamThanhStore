import React, {useState} from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, ActivityIndicator, SafeAreaView } from 'react-native';
import auth from '@react-native-firebase/auth';

const ForgetPasswd = (props) => {
    const [email, setEmail] = useState(props.email);
    const [loading, setLoading] = useState(false);

    const handleSendEmail = async () => {
      setLoading(true);
        try {
          await auth().sendPasswordResetEmail(email)
          ToastAndroid.show(`Gửi thành công! Hãy kiểm tra email`, ToastAndroid.SHORT);
        } catch (error) {
          ToastAndroid.show(`Thất bại. Hãy kiểm tra lại Internet`, ToastAndroid.SHORT);
        }
        finally{
          setLoading(false)
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Quên mật khẩu</Text>
            <View>
                <Text style={styles.subTitle}>Nhập email đã đăng ký của bạn:</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Nhập Email"
                    placeholderTextColor={"gray"} 
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email"
                    spellCheck={false}
                    autoCorrect={false}
                    autoCapitalize={false}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSendEmail}>
                {loading ? <ActivityIndicator size={'large'} />:<Text style={styles.buttonText}>Gửi Email</Text>}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default ForgetPasswd;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color:'black',
    marginBottom:100
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 15,
  },
  textInput: {
    color: "gray",
    fontSize: 14,
    width:300,
    textAlignVertical:'center',
    borderRadius:15,
    borderWidth:1,
    paddingHorizontal:10,
    alignSelf:'center'
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    paddingHorizontal:20,
    borderRadius: 5,
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});
