import React, { useState, useEffect } from 'react';
import { Modal, Alert, View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid, SafeAreaView } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { getUserInfo, updateUserInfo } from '../context/FirebaseFunction';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage'
import LinearGradient from 'react-native-linear-gradient';
import LoadingScreen from '../data/LoadingScreen';

const ProfileScreen = ({navigation}) => {
  const [user, setUser] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [modalNotificationVisible, setModalNotificationVisible] = useState(false);

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

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={{ fontWeight: 'bold', fontSize: 30, color: '#000', flex: 3 }}>Profile</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', flex: 2 }}>
          <MaterialIcons name="shopping-cart" size={24} color="#333" onPress={() => navigation.navigate('cart')} />
          <MaterialIcons name="notifications" size={24} color="#333" onPress={() => setModalNotificationVisible(true)} />
          <MaterialIcons name="settings" size={24} color="#333" onPress={() => navigation.navigate('setting', {user: user})} />
        </View>
      </View>
      <View style={{ flex: 1, backgroundColor: '#DEFFD3' }} />
      <LinearGradient style={styles.container} colors={['#f7f7f7', '#DEFFD3']}>
        <View style={styles.user}>
          <TouchableOpacity onPress={handleUpload} style={{ borderRadius: 100, borderWidth: 6, borderColor: '#fff', alignItems: 'center' }}>
            <Image source={{ uri: user?.photoURL || 'https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png' }} style={styles.avatar} />
            <MaterialIcons name="edit" size={28} color="#0f0f0f" style={{ position: 'absolute', right: 0, top: 0 }} />
          </TouchableOpacity>
          <Text style={styles.name}>{user?.displayName || 'Tên người dùng'}</Text>
        </View>
        <View style={styles.uilities}>
          <View style={styles.uilitiesRow}>
            <TouchableOpacity style={[styles.uilitiesBtn, { borderTopRightRadius: 40, borderBottomRightRadius: 40 }]}>
              <MaterialIcons name="system-security-update" size={50} color="#333" />
              <Text>Chờ xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.uilitiesBtn, { borderTopLeftRadius: 40, borderBottomLeftRadius: 40 }]}>
              <MaterialIcons name="shopping-cart-checkout" size={50} color="#333" />
              <Text>Chờ lấy hàng</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.uilitiesRow}>
            <TouchableOpacity style={[styles.uilitiesBtn, { borderTopRightRadius: 40, borderBottomRightRadius: 40 }]}>
              <MaterialIcons name="local-shipping" size={50} color="#333" />
              <Text>Chờ giao hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.uilitiesBtn, { borderTopLeftRadius: 40, borderBottomLeftRadius: 40 }]}>
              <MaterialIcons name="new-releases" size={50} color="#333" />
              <Text>Đáng giá</Text>
            </TouchableOpacity>
          </View>
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
            <Text style={styles.modalTitle}>Thông báo</Text>
            <View style={styles.dividerModal} />
            <View style={{ alignItems: 'center', }}>
              <Text style={styles.notificationText}>Bạn chưa có thông báo nào</Text>
            </View>
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

export default ProfileScreen;

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    backgroundColor: '#DEFFD3'
  },
  container: {
    flex: 8,
    alignItems: 'center',
  },
  user: {
    alignItems: 'center',
    marginTop: '-15%'
  },
  avatar: {
    width: 110,
    height: 110,
    resizeMode: 'cover',
  },
  name: {
    marginTop: 10,
    fontSize: 25,
    color: '#a0a0a0',
    fontWeight: '600'
  },
  uilities: {
    marginTop: 50,
    width: "100%",
    height: "60%",
    justifyContent: 'space-evenly'
  },
  uilitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uilitiesBtn: {
    width: "47%",
    borderWidth: 0,
    borderColor: 'blue',
    alignItems: 'center',
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 100,
    elevation: 5,
    backgroundColor: '#DEFFD3'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#202020',
  },
  dividerModal: {
    backgroundColor: '#333',
    height: 1,
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});