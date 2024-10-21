import React, { createContext, useState } from 'react';

// Create the Cart Context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const addItemToCart = (item) => {
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            // Update the quantity of the existing item
            const updatedCartItems = cartItems.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            );
            setCartItems(updatedCartItems);
        } else {
            // Add the new item to the cart with quantity 1
            setCartItems([...cartItems, { ...item, quantity: 1 }]);
        }
        
        setCartCount(cartCount + 1);
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
        } else {
            // If quantity is 1, remove the item from the cart
            removeItemFromCart(itemId);
        }
    };
    

    const removeItemFromCart = (itemId) => {
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
        setCartCount(cartCount - 1);
    };

    const clearCart = () => {
        setCartItems([]);
        setCartCount(0);
    };

    return (
        <CartContext.Provider value={{ cartItems, cartCount, addItemToCart, subtractItemsFromCart, removeItemFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
