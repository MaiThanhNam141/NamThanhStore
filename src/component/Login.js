import React, {useState} from 'react';
import { KeyboardAvoidingView, Text, View, StyleSheet, Modal, TouchableOpacity, TextInput, Image, ActivityIndicator, ToastAndroid } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ForgetPassword from './ForgetPassword';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { getCurrentUser } from '../context/FirebaseFunction';
import { logo } from '../data/AssetsRef';

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(true);
    const [showForgetModal, setShowForgetModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const onGoogleButtonPress = async() => {
        try {
            setLoading(true);
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const { idToken } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            await auth().signInWithCredential(googleCredential);
        
            const user = getCurrentUser();
            if (user) {
                const userRef = firestore().collection('users').doc(user.uid);
                const userDoc = userRef.get();

                if (!userDoc.exists) {
                    const userDocData = {
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                    };
                    userRef.set(userDocData);
                }
            }
            ToastAndroid.show('Đăng nhập thành công', ToastAndroid.SHORT);
        } catch (error) {
            if (error.code === statusCodes.IN_PROGRESS) {
                ToastAndroid.show('Đang load đợi xíu', ToastAndroid.SHORT);
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                ToastAndroid.show('Điện thoại không có Google PlayServices', ToastAndroid.SHORT);
            } else {
                console.log("Login error: ", error.message);
                ToastAndroid.show('Đăng nhập không thành công', ToastAndroid.SHORT);
            }
        } finally {
            setLoading(false);
        }
    }

    const signIn = async () => {
        setLoading(true);
        const e = email.trim();
        const p = password.trim();
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
            await auth().signInWithEmailAndPassword(e, p)
                .then(() => {
                    ToastAndroid.show("Đăng nhập thành công", ToastAndroid.SHORT);
                })
                .catch((error) => {
                    console.error(error);
                    if (error.code === 'auth/invalid-email') {
                        ToastAndroid.show("Email không hợp lệ", ToastAndroid.SHORT);
                    } else if (error.code === 'auth/wrong-password') {
                        ToastAndroid.show("Sai tài khoản hoặc mật khẩu", ToastAndroid.SHORT);
                    }
                    else ToastAndroid.show("Sai tài khoản hoặc mật khẩu", ToastAndroid.SHORT);
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
            <Image source={logo} style={styles.logo}/>
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
                      keyboardType='email-address'
                      
                    />
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
                        onPress={() => setShowPassword(!showPassword)}
                    />
                </View>
                <TouchableOpacity style={{alignSelf:'flex-start'}} onPress={() => setShowForgetModal(true)}>
                    <Text style={styles.otherMethodText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={signIn} disabled={loading}>
                { loading ? <ActivityIndicator size={'large'} /> :<Text style={styles.loginTextButton}>ĐĂNG NHẬP</Text> }
            </TouchableOpacity>

            <GoogleSigninButton size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Light} onPress={onGoogleButtonPress}/>
            
            <Modal animationType='slide' visible={showForgetModal} onRequestClose={() => setShowForgetModal(false)}>
                <ForgetPassword email={email}/>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default Login;

const styles = StyleSheet.create({
    container:{
        justifyContent:'space-around', 
        alignItems:'center',
        flex:1
    },
    logo:{
        height:150,
        resizeMode:'contain'
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        padding: 10,
        marginVertical: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        padding: 10,
        color: 'gray',
    },
    loginButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        paddingHorizontal:20,
        borderRadius: 5,
        marginVertical: 20,
    },
    loginTextButton: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    otherMethodText: {
        fontSize: 14,
        color: 'gray',
        textDecorationLine: 'underline',
    },
});