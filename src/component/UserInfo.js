import React, { useState } from 'react';
import { ToastAndroid, Text, View, StyleSheet, SafeAreaView, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const UserInfo = ({ navigation, route }) => {
  const user = route.params?.user;
  const [name, setName] = useState(user?.displayName);
  const [address, setAddress] = useState(user?.address);
  const [location, setLocation] = useState(user?.location);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <MaterialIcons name="chevron-left" size={50} color="#333" onPress={() => navigation.goBack()} />
        <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#000' }}>Sửa hồ sơ</Text>
      </View>
      <LinearGradient style={styles.container} colors={['#f7f7f7', '#DEFFD3']}>
        <ScrollView>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Tên:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên"
              value={name}
              onChangeText={(text) => setName(text)}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ"
              value={address}
              onChangeText={(text) => setAddress(text)}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Vị trí:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập vị trí"
              value={location}
              onChangeText={(text) => setLocation(text)}
            />
          </View>
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
    flexDirection:'row',
    marginVertical: 10,
    paddingHorizontal: 15,
    justifyContent:'space-between',
    width:'100%',
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
  },
});