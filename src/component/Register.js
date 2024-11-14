import React, {useState} from 'react';
import { KeyboardAvoidingView, Text, View, StyleSheet, Image, TextInput, TouchableOpacity, ToastAndroid, ActivityIndicator } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import auth from "@react-native-firebase/auth";
import { setuserInfo } from '../context/FirebaseFunction';
import { logo } from '../data/AssetsRef';

const Register = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rePassword, setRePassword] = useState("")
    const [showPassword, setShowPassword] = useState(true);
    const [showRePassword, setShowRePassword] = useState(true);
    const [loading, setLoading] = useState(false);

    const signUp = async () => {
        setLoading(true);
        const e = email.trim();
        const p = password.trim();
        const reP = rePassword.trim();
        if (!e || e.length < 6){
            setLoading(false);
            ToastAndroid.show("Email quá ngắn", ToastAndroid.SHORT);
            return null;
        }
        if (!p || p.length < 6){
            setLoading(false);
            ToastAndroid.show("Password quá ngắn", ToastAndroid.SHORT);
            return null;
        }
        try {
            if (p !== reP){
                ToastAndroid.show("Mật khẩu nhập lại không chính xác!", ToastAndroid.SHORT);
                return null;
            }
            await auth().createUserWithEmailAndPassword(e, p)
                .then(() => {
                    ToastAndroid.show("Đăng ký thành công", ToastAndroid.SHORT);
                    const userDocData = {
                        email: e,
                        displayName: e.split('@')[0],
                        photoURL: 'https://firebasestorage.googleapis.com/v0/b/namthanhstores.appspot.com/o/static%2FAIImage.png?alt=media&token=6b84bbfd-a81d-4915-a7d4-8f3803b9aa71',
                        notification: true,
                        voice: true,
                    };
                    setuserInfo(userDocData)
                })
                .catch((error) => {
                    console.error(error);
                    if (error.code === 'auth/invalid-email') {
                        ToastAndroid.show("Email không hợp lệ", ToastAndroid.SHORT);
                    } else if (error.code === 'auth/wrong-password') {
                        ToastAndroid.show("Sai tài khoản hoặc mật khẩu", ToastAndroid.SHORT);
                    }
                    else ToastAndroid.show("Đăng ký thất bại! Kiểm tra lại internet.", ToastAndroid.SHORT);
                })
        } catch (error) {
            console.error("signin function error: ", error)
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container}>
            <Image style={styles.logo} source={logo}/>
            <View style={styles.mainContainer}>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" color="gray" size={24}/>
                    <TextInput 
                      value={email} 
                      onChangeText={(text) => setEmail(text)} 
                      placeholderTextColor={"gray"} 
                      style={[styles.textInput, {width:270}]} 
                      spellCheck={false}
                      autoCorrect={false}
                      autoCapitalize={false}
                      placeholder="Email"
                      keyboardType='email-address'/>
                </View>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" color="gray" size={24}/>
                    <TextInput 
                      secureTextEntry={showPassword} 
                      value={password} 
                      onChangeText={(text) => setPassword(text)} 
                      placeholderTextColor={"gray"} 
                      style={styles.textInput} 
                      spellCheck={false}
                      autoCorrect={false}
                      autoCapitalize={false}
                      placeholder="Mật khẩu"
                    />
                    <MaterialIcons
                        name={showPassword ? 'visibility-off' : 'visibility'}
                        size={24}
                        color="#aaa"
                        style={styles.icon}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" color="gray" size={24}/>
                    <TextInput 
                        secureTextEntry={showRePassword} 
                        value={rePassword} 
                        onChangeText={(text) => setRePassword(text)} 
                        placeholderTextColor={"gray"} 
                        style={styles.textInput} 
                        spellCheck={false}
                        autoCorrect={false}
                        autoCapitalize={false}
                        placeholder="Nhập lại mật khẩu"
                    />
                    <MaterialIcons
                        name={showRePassword ? 'visibility-off' : 'visibility'}
                        size={24}
                        color="#aaa"
                        style={styles.icon}
                        onPress={() => setShowRePassword(!showRePassword)}
                    />
                </View>
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={signUp} disabled={loading}>
                { loading ? <ActivityIndicator size={'large'} /> :<Text style={styles.loginTextButton}>ĐĂNG KÝ</Text> }
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    logo:{
        height:150,
        resizeMode:'contain'
    },
    mainContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    inputContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        padding: 10,
        marginVertical: 10,
    },
    textInput:{
        flex: 1,
        fontSize: 14,
        padding: 10,
        color: 'gray',
    },
    loginButton:{
        backgroundColor: '#4CAF50',
        padding: 10,
        paddingHorizontal:20,
        borderRadius: 5,
        marginTop:5,
        marginBottom: 15,
    },
    loginTextButton:{
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
});