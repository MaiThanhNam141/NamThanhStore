import React, { useEffect, useState, useContext } from 'react';
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, Image, Animated, Dimensions, FlatList, RefreshControl, ScrollView, ActivityIndicator, ToastAndroid } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { logo } from '../data/AssetsRef';
import SkeletonPost from '../data/SkeletonPost';
import ImageViewing from 'react-native-image-viewing';
import firestore from '@react-native-firebase/firestore';
import { CartContext } from '../context/CartContext';
const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [subMenuVisible, setSubMenuVisible] = useState(false);
  const [product, setProduct] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [visible, setVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [filterProduct, setFilterProduct] = useState([]);
  const [translateX] = useState(new Animated.Value(-width * 0.75));
  const [cartAnimation] = useState(new Animated.Value(1));

  const { addItemToCart, cartCount } = useContext(CartContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (refreshing) {
      fetchPosts();
    }
  }, [refreshing]);

  const handleScroll = () => {
    if (!loading && lastDoc) {
      fetchPosts();
    }
  };

  const handleImagePress = (imageUri) => {
    setImages([{ uri: imageUri }]);
    setVisible(true);
  };

  const handleImageViewingClose = () => {
    setVisible(false);
  };

  const handleAddToCart = (item) => {
    addItemToCart(item);
    
    Animated.sequence([
      Animated.timing(cartAnimation, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cartAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleMenu = () => {
    const toValue = menuVisible ? -width * 0.75 : 0;
    Animated.timing(translateX, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuVisible(!menuVisible);
  };

  const toggleSubMenu = () => {
    setSubMenuVisible(!subMenuVisible);
  };

  const onRefresh = () => {
    setRefreshing(true);
  };

  const formatNumberWithDots = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleCart = () => {
    navigation.navigate('cart')
  }

  const fetchPosts = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const productRef = firestore().collection('productFood');
      let query = productRef.orderBy('id', 'desc').limit(6);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const productFood = await query.get();

      const newProduct = productFood.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((newP) => !product.some((existingProduct) => existingProduct.id === newP.id));

      setProduct((prevProducts) => [...prevProducts, ...newProduct]);
      setLastDoc(productFood.docs[productFood.docs.length - 1]);

      if (initialLoading) {
        setInitialLoading(false);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => {
    const isDiscount = item.discount > 0;

    return (
      <View style={styles.productContainer}>
        {isDiscount && <Text style={styles.sale}>Sale {item.discount}%</Text>}
        <TouchableOpacity onPress={() => handleImagePress(item.image)}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
        </TouchableOpacity>
        <Text style={styles.productName}>{item.name}</Text>
        <TouchableOpacity style={styles.priceButton} onPress={() => handleAddToCart(item)}>
          {isDiscount ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[styles.productPrice, { textDecorationLine: 'line-through', marginRight: 5, color: '#898989', fontSize: 7 }]}>
                {formatNumberWithDots(item.price)}
              </Text>
              <Text style={styles.discountPrice}>
                {formatNumberWithDots(Math.floor(item.price * (1 - item.discount / 100)))} VND
              </Text>
            </View>
          ) : (
            <Text style={styles.productPrice}>{formatNumberWithDots(item.price)} VND</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const handleFilterProduct = (selected) => {
    if (selected === null) {
      setFilterProduct([]);
      setSelectedAnimal(null);
      toggleMenu()
      return ;
    }
    setSelectedAnimal(selected);
    const newProduct = product.filter((item) => item.animal === selected);
    setFilterProduct(newProduct);
    toggleMenu()
  }

  const renderMenu = () => {
    return (
      <Animated.View style={[styles.menuContainer, { transform: [{ translateX }] }]}>
        <View style={{ padding: 20}}>
          <TouchableOpacity style={styles.menuItem} onPress={toggleSubMenu}>
            <Text style={styles.menuText}>Thể loại</Text>
          </TouchableOpacity>
          {
            subMenuVisible && (
              <View style={styles.subMenu}>
                <TouchableOpacity style={styles.subItem} onPress={() => handleFilterProduct(null)}>
                  <Text style={styles.subItemText}> {' > Tất cả'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subItem} onPress={() => handleFilterProduct('Bò')}>
                  <Text style={styles.subItemText}> {' > Bò'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subItem} onPress={() => handleFilterProduct('Heo')}>
                  <Text style={styles.subItemText}> {' > Heo'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subItem} onPress={() => handleFilterProduct('Gà')}>
                  <Text style={styles.subItemText}> {' > Gà'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subItem} onPress={() => handleFilterProduct('Dê')}>
                  <Text style={styles.subItemText}> {' > Dê'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subItem} onPress={() => handleFilterProduct('Cá')}>
                  <Text style={styles.subItemText}> {' > Cá'}</Text>
                </TouchableOpacity>
              </View>
            )
          }
          <TouchableOpacity style={styles.menuItem} onPress={handleCart}>
            <Text style={styles.menuText}>Giỏ hàng</Text>
          </TouchableOpacity>
        </View>
        {
          menuVisible && <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
        }
      </Animated.View>
    );
  };

  const renderProductHome = () => {
    return (
      <FlatList
        data={ selectedAnimal ? filterProduct : product }
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleScroll}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => (loading ? <ActivityIndicator size="small" /> : null)}
      />
    );
  };

  if (initialLoading) {
    return (
      <ScrollView>
        <SkeletonPost />
        <SkeletonPost />
        <SkeletonPost />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={toggleMenu}>
          <MaterialIcons name="menu" size={30} color="#000000" />
        </TouchableOpacity>
        <View style={{ flexDirection:'row', alignItems:'center'}}>
          <TouchableOpacity style={{ paddingHorizontal: 10}} onPress={handleCart}>
            <Animated.View style={{ transform: [{ scale: cartAnimation }] }}>
              <MaterialIcons name="shopping-cart" size={30} color="#000" />
              {cartCount > 0 && (
                <View style={styles.cartCountContainer}>
                  <Text style={styles.cartCountText}>{cartCount}</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
          <Image source={logo} style={styles.logo} />
        </View>
      </View>
      {renderMenu()}
      {renderProductHome()}
      <ImageViewing images={images} visible={visible} onRequestClose={handleImageViewingClose} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  navbar: {
    width: '100%',
    height: 60,
    backgroundColor: '#BAFDA1',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  menuIcon: {
    padding: 10,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.75,
    height: '100%',
    backgroundColor: '#f7f7f7',
    zIndex: 1,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuText: {
    fontSize: 18,
  },
  subMenu: {
    paddingLeft: 10,
    paddingTop: 10,
  },
  subItem: {
    paddingVertical: 5,
  },
  subItemText: {
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: width * 0.75,
    width: width * 0.25,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  productContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    maxWidth: '45%',
    minWidth: '45%',
    overflow: 'hidden',
  },
  productImage: {
    width: 170,
    height: 170,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
    zIndex: 1,
  },
  sale: {
    position: 'absolute',
    right: '-15%',
    top: '5%',
    backgroundColor: 'red',
    padding: 5,
    width: 125,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    transform: [{ rotate: '45deg' }],
    fontSize: 10,
    zIndex: 2,
  },
  priceButton: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 5,
    marginBottom: 5,
    maxWidth: '80%',
    minWidth: '80%',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
  },
  productPrice: {
    color: '#000',
    fontWeight: '500',
    fontSize: 10,
    textAlign: 'center',
  },
  discountPrice: {
    color: '#FF6347',
    fontWeight: '700',
    fontSize: 10,
  },
  cartCountContainer: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
