import React, { useState, useEffect } from 'react';
import { ToastAndroid, Text, View, StyleSheet, SafeAreaView, Button, Image, TextInput, TouchableOpacity, ScrollView, Modal, PermissionsAndroid, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { Picker } from '@react-native-picker/picker';
import Province from '../data/Province';
import { updateUserInfo } from '../context/FirebaseFunction';
import { GeoPoint } from '@react-native-firebase/firestore';
import { playSound } from '../context/playSound';

const UserInfo = ({ navigation, route }) => {
  const { user, onRefresh } = route.params;
  const [name, setName] = useState(user?.name);
  const [phone, setPhone] = useState(user?.phone);
  const [address, setAddress] = useState(user?.address?.split(', ')[0]);
  const [provinceSelected, setProvinceSelected] = useState(user?.address?.split(', ')[3] || "");
  const [districtSelected, setDistrictSelected] = useState(user?.address?.split(', ')[2] || "");
  const [wardSelected, setWardSelected] = useState(user?.address?.split(', ')[1] || "");
  const [location, setLocation] = useState(user?.location);
  const [selectedLocation, setSelectedLocation] = useState(user?.location || {
    latitude: 10.99306,
    longitude: 106.65597,
  });
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingWards, setLoadingWards] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    if (!location)
      requestLocationPermission()
  }, []);

  useEffect(() => {
    if (provinceSelected) {
      fetchDistricts(provinceSelected);
    }
  }, [provinceSelected]);

  useEffect(() => {
    if (districtSelected) {
      fetchWards(districtSelected);
    }
  }, [districtSelected]);

  // Hàm yêu cầu quyền truy cập vị trí
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        ToastAndroid.show("Không thể truy cập vị trí nếu bạn không cấp quyền", ToastAndroid.SHORT);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Hàm lấy vị trí hiện tại và dùng vị trí hiện tại để làm điểm neo cho google map
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude);

        setLocation({ latitude, longitude });
      },
      (error) => {
        console.error("getCurrentLocation: ", error);
        if (error.code === 3) { // Timeout error
          ToastAndroid.show("Vị trí không khả dụng hoặc yêu cầu bị hết thời gian", ToastAndroid.SHORT);
        } else {
          ToastAndroid.show("Không thể lấy vị trí của bạn", ToastAndroid.SHORT);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // Hàm hiển thị bản đồ khi nhấn vào nút vị trí
  const handleMapPress = async () => {
    try {
      playSound();
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted) {
        setIsMapVisible(true); // Hiển thị bản đồ dưới dạng Modal
      } else {
        Alert.alert('Lỗi', 'Không thể truy cập vị trí nếu bạn từ chối cấp quyền');
        requestLocationPermission();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Hàm xử lý hành động chọn vị trí trên bản đồ
  const handleMapPressOnMap = (event) => {
    playSound();
    const { latitude, longitude } = event.nativeEvent.coordinate || {};
    if (latitude && longitude) {
      setSelectedLocation({ latitude, longitude });
      ToastAndroid.show(`Tọa độ chọn: ${latitude}, ${longitude}`, ToastAndroid.SHORT);
    } else {
      ToastAndroid.show("Không thể lấy tọa độ từ vị trí này", ToastAndroid.SHORT);
    }
  };

  // Hàm lấy danh sách quận/huyện
  const fetchDistricts = async (provinceName) => {
    setLoadingDistricts(true);
    try {
      const selectedProvince = Province.find(province => province.name === provinceName);
      const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`);
      const data = await response.json();
      setDistricts(data.districts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Hàm lấy danh sách phường/xã
  const fetchWards = async (districtName) => {
    setLoadingWards(true);
    try {
      const selectedDistrict = districts.find(d => d.name === districtName);
      const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict?.code}?depth=2`);
      const data = await response.json();
      setWards(data.wards);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingWards(false);
    }
  };

  const handlePhoneChange = (text) => {
    if (text.length < 11) {
      setPhone(text);
    } else {
      ToastAndroid.show("Số điện thoại phải bắt đầu bằng 0 và có từ 10 đến 11 số", ToastAndroid.SHORT);
      return;
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/; // Bắt đầu bằng 0, theo sau là 9 hoặc 10 chữ số
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    playSound();
    if (!phone || !name || !address || !wardSelected || !districtSelected || !provinceSelected) {
      ToastAndroid.show("Vui lòng điền đầy đủ thông tin", ToastAndroid.SHORT);
      return;
    }
    if (!validatePhoneNumber(phone)) {
      ToastAndroid.show("Hãy nhập số điện thoại chính xác", ToastAndroid.SHORT);
      return;
    }
    try {
      updateUserInfo({
        name: name,
        phone: phone,
        address: `${address}, ${wardSelected}, ${districtSelected}, ${provinceSelected}`,
        location: new GeoPoint(selectedLocation.latitude, selectedLocation.longitude),
      })
      ToastAndroid.show("Cập nhật thành công", ToastAndroid.SHORT);
      onRefresh();
      navigation.goBack();
    } catch (error) {
      console.error("handleSubmit: ", error);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <MaterialIcons name="chevron-left" size={50} color="#333" onPress={() => navigation.goBack()} />
        <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#000' }}>Sửa hồ sơ</Text>
      </View>
      <LinearGradient style={styles.container} colors={['#f7f7f7', '#DEFFD3']}>
        <ScrollView>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Họ và Tên:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên"
              value={name}
              onChangeText={(text) => setName(text)}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              value={phone}
              keyboardType='numeric'
              onChangeText={handlePhoneChange}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Tỉnh</Text>
            <Picker
              selectedValue={provinceSelected}
              style={styles.picker}
              onValueChange={(itemValue) => setProvinceSelected(itemValue)}
            >
              <Picker.Item label="Chọn tỉnh" value="" />
              {Province.map(province => (
                <Picker.Item key={province.code} label={province.name} value={province.name} />
              ))}
            </Picker>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Quận/Huyện:</Text>
            <Picker
              selectedValue={districtSelected}
              onValueChange={(itemValue) => setDistrictSelected(itemValue)}
              style={styles.picker}
              enabled={!loadingDistricts}
            >
              <Picker.Item label={loadingDistricts ? "Đang tải..." : "Chọn quận/huyện"} value="" />
              {districts && districts.map(district => (
                <Picker.Item key={district.code} label={district.name} value={district.name} />
              ))}
            </Picker>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Phường/Xã:</Text>
            <Picker
              selectedValue={wardSelected}
              onValueChange={(itemValue) => setWardSelected(itemValue)}
              style={styles.picker}
              enabled={districtSelected !== '' && !loadingWards}
            >
              <Picker.Item label={loadingWards ? "Đang tải..." : "Chọn phường/xã"} value="" />
              {wards && wards.map(ward => (
                <Picker.Item key={ward.code} label={ward.name} value={ward.name} />
              ))}
            </Picker>
          </View>
          <View style={[styles.infoContainer, { flexDirection: 'column', borderWidth: 0, flex: 1 }]}>
            <Text style={[styles.label, { alignSelf: 'flex-start' }]}>Số nhà, tên đường:</Text>
            <TextInput
              style={[styles.input, { width: '100%', height: 100, textAlignVertical: 'top', textAlign: 'justify', }]}
              placeholder="Nhập địa chỉ"
              value={address}
              multiline={true}
              onChangeText={(text) => setAddress(text)}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Tọa độ hiện tại</Text>
            {
              location ? <Text style={[styles.label, { fontSize: 8 }]}>{`[${location.latitude}, ${location.longitude}]`}</Text> : <Text style={styles.label}>Chưa chọn vị trí</Text>
            }
          </View>
          <TouchableOpacity style={styles.locationButton} onPress={handleMapPress}>
            <Text style={styles.locationButtonText}>Chọn vị trí trên bản đồ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Lưu</Text>
          </TouchableOpacity>
          <Modal
            visible={isMapVisible}
            animationType="slide"
            onRequestClose={() => setIsMapVisible(false)} // Đóng Modal khi bấm nút back
          >
            <MapView
              provider={MapView.PROVIDER_GOOGLE}
              showsUserLocation={true}
              showsMyLocationButton={true}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: location?.latitude || 10.99306,
                longitude: location?.longitude || 106.65597,
                latitudeDelta: 0.09,
                longitudeDelta: 0.04,
              }}
              onPress={handleMapPressOnMap}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    longitude: selectedLocation?.longitude ? selectedLocation.longitude : 0,
                    latitude: selectedLocation?.latitude ? selectedLocation.latitude : 0
                  }}
                  title={'owner location'}
                />
              )}
            </MapView>
            <Button title="Xác nhận vị trí" onPress={() => setIsMapVisible(false)} />
          </Modal>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default UserInfo;

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
  infoContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center'
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    width: 150,
  },
  picker: {
    height: 50,
    width: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  locationButton: {
    borderColor: '#4CAF50',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 250
  },
  locationButtonText: {
    color: '#070707',
    fontSize: 16,
  },
  submitButton: {
    borderColor: '#4CAF50',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    width: '100%'
  },
  submitButtonText: {
    color: '#070707',
    fontSize: 18,
    fontWeight: 'bold'
  }
});