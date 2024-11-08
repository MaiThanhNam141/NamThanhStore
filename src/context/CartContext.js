import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from './FirebaseFunction';
import firestore from '@react-native-firebase/firestore'
import { ToastAndroid } from 'react-native';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const user = getCurrentUser();
    const ref = firestore().collection('users').doc(user.uid).collection('cart');

    useEffect(() => {
        const loadCartItems = async () => {
            try {
                const snapshot = await ref.get();
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCartItems(items);
                setCartCount(items.reduce((count, item) => count + item.quantity, 0));
            } catch (error) {
                ToastAndroid.show("Không thể đồng bộ giỏ hàng", ToastAndroid.SHORT);
                console.error(error);
            }
        };
        loadCartItems();
    }, []);

    const syncCartWithFirestore = async (items) => {
        const batch = firestore().batch();
        if (items.length === 0) {
            // Nếu mảng rỗng, xóa toàn bộ batch
            const snapshot = await ref.get();
            snapshot.forEach(doc => {
                batch.delete(doc.ref); // Xóa từng document trong collection
            });
            batch.commit();
            return;
        }
        items.forEach(item => {
            const docRef = ref.doc(item.id);
            if (item.quantity > 0) {
                batch.set(docRef, item);
            } else {
                batch.delete(docRef);
            }
        });
        batch.commit();
    };

    const addItemToCart = (item) => {
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        let updatedCartItems;

        if (existingItem) {
            updatedCartItems = cartItems.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            );
        } else {
            updatedCartItems = [...cartItems, { ...item, quantity: 1 }];
        }
        setCartItems(updatedCartItems);
        setCartCount(cartCount + 1);
        syncCartWithFirestore(updatedCartItems);
    };

    const subtractItemsFromCart = (itemId) => {
        const existingItem = cartItems.find(cartItem => cartItem.id === itemId);

        if (existingItem.quantity > 1) {
            // Decrease the quantity of the item
            const updatedCartItems = cartItems.map(cartItem =>
                cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
            );
            setCartItems(updatedCartItems);
            setCartCount(cartCount - 1);
            syncCartWithFirestore(updatedCartItems);
        } else {
            // If quantity is 1, remove the item from the cart
            removeItemFromCart(itemId);
        }
    };

    const removeItemFromCart = (itemId) => {
        const updatedCartItems = cartItems.filter(item => item.id !== itemId);
        const existingItem = cartItems.map(cartItem =>
            cartItem.id === itemId ? { ...cartItem, quantity: 0 } : cartItem
        );
        setCartItems(updatedCartItems);
        setCartCount(cartCount - 1);
        syncCartWithFirestore(existingItem);
    };

    const clearCart = () => {
        setCartItems([]);
        setCartCount(0);
        syncCartWithFirestore([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, cartCount, addItemToCart, subtractItemsFromCart, removeItemFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
