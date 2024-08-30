import React, { useState, useEffect } from 'react';
import { TextInput, Modal, Alert, View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { getUserInfo, updateUserInfo } from '../context/FirebaseFunction';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage'

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newInfo, setNewInfo] = useState('');
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getUserInfo();
        if (userDoc) {
          setUser(userDoc);
        }
      } catch (error) {
        ToastAndroid.show("Đã xảy ra lỗi", ToastAndroid.SHORT)
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    };
    if (refresh) {
      fetchUser();
    }
  }, [refresh]);
  const handleSignOut = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Thoát', onPress: signOut },
      ],
    );
  };
  const handleUpload = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn muốn đổi hình ảnh đại diện?',
      [
        { text: 'Chụp ảnh', onPress: takePhotoFromCamera },
        { text: 'Thư viện ảnh', onPress: uploadImageFromLibrary },
        { text: 'Hủy', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
      ],
    );
  };
  const takePhotoFromCamera = () => {
    try {
      ImagePicker.openCamera({
        width: 100,
        height: 100,
        cropping: true,
      }).then((image) => {
        const imageUri = image.path;
        uploadCloudStorage(imageUri);
      })
        .catch((error) => {
          console.error(error);
          ToastAndroid.show("Đổi avatar thất bại", ToastAndroid.SHORT);
        })

    } catch (error) {
      ToastAndroid.show("Đổi avatar thất bại", ToastAndroid.SHORT);
      console.log(error);
    }
  };
  const uploadImageFromLibrary = () => {
    try {
      ImagePicker.openPicker({
        width: 100,
        height: 100,
        cropping: true,
      }).then(image => {
        const imageUri = image.path;
        uploadCloudStorage(imageUri);
      })
        .catch((error) => {
          console.error(error);
          ToastAndroid.show("Đổi avatar thất bại", ToastAndroid.SHORT);
        })
    } catch (error) {
      ToastAndroid.show("Đổi avatar thất bại", ToastAndroid.SHORT);
      console.log(error);
    }
  }

  const uploadCloudStorage = (uri) => {
    try {
      const storageRef = storage().ref();
      const userRef = storageRef.child('users');

      const fileName = user?.email.split('@')[0]
      const imageRef = userRef.child(fileName);

      imageRef.putFile(uri)
        .then(() => {
          ToastAndroid.show("Cập nhật avatar thành công", ToastAndroid.SHORT);
          imageRef.getDownloadURL()
            .then((url) => {
              updateUserInfo({ photoURL: url })
              setTimeout(() => setRefresh(true), 1000);
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.error("Upload Image: ", error);
          ToastAndroid.show("Cập nhật thất bại", ToastAndroid.SHORT)
        })
    } catch (error) {
      console.log("Upload Image ", error);
    }
  }
  const saveNewInfo = () => {
    setModalVisible(true);
    try {
      const name = newInfo.trim();
      if (name.length > 5)
        updateUserInfo({ displayName: name });
      setRefresh(true);
    } catch (error) {
      console.error("Save new Info error: ", error);
      ToastAndroid.show("Cập nhật thất bại", ToastAndroid.SHORT);
    } finally {
      setRefresh(true);
      setNewInfo('')
    }
  }

  const signOut = async () => {
    setLoading(true);
    try {
      await Promise.all([
        GoogleSignin.signOut(),
        auth().signOut(),
      ])
    } catch (error) {
      console.error("signOut: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleUpload} style={{ borderWidth: 1, width: 80, borderRadius: 100 }}>
          <Image source={{ uri: user?.photoURL || 'https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png' }} style={styles.avatar} />
          <MaterialIcons name="edit" size={24} color="#000" style={{ position: 'absolute', right: 0, top: 0 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={saveNewInfo}>
          <Text style={styles.name}>{user?.displayName || 'Tên người dùng'} <MaterialIcons name="edit" size={24} color="#333" /></Text>
        </TouchableOpacity>
        <Text style={styles.email}>{user?.email || 'Email'}</Text>
      </View>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="shopping-cart" size={24} color="#333" />
          <Text style={styles.menuText}>Xem giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="list-alt" size={24} color="#333" />
          <Text style={styles.menuText}>Xem đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="info" size={24} color="#333" />
          <Text style={styles.menuText}>Về chúng tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <MaterialIcons name="exit-to-app" size={24} color="#333" />
          <Text style={styles.menuText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
      <Modal transparent={true} animationType={'slide'} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.alertContainer}>
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>Sửa tên hiển thị</Text>
            <TextInput
              value={newInfo}
              onChangeText={(text) => setNewInfo(text)}
              placeholderTextColor={"gray"}
              style={styles.textInput}
              spellCheck={false}
              autoCorrect={false}
              autoCapitalize={false}
            >
            </TextInput>
            <View style={styles.alertButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.buttonContainer, { backgroundColor: '#fff' }]}>
                <Text style={[styles.confirmButtonText, { color: 'black' }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => saveNewInfo()} style={styles.buttonContainer}>
                <Text style={styles.confirmButtonText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 10,
  },
  alertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBox: {
    backgroundColor: 'white',
    padding: 15,
    paddingVertical: 40,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    height: 300,
    justifyContent: 'space-around'
  },
  alertText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  alertButtons: {
    flexDirection: 'row',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    paddingHorizontal: 20,
    fontWeight: '500'
  },
  buttonContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 15,
    alignItems:'center',
    textAlign:'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    borderColor:'black'
  },
  textInput:{
    color: "gray",
    fontSize: 14,
    width:270,
    textAlignVertical:'center',
    borderWidth:1,
    borderRadius:15,
    marginBottom:5,
    borderColor:'black'
  },
});