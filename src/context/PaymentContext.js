import React, { createContext, useState, useContext } from 'react';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [order, setOrder] = useState(null); // Holds the current order information
  const [paymentStatus, setPaymentStatus] = useState(null); // Tracks the payment status

  const createOrder = async (amount, app_user, items, email, address) => {
    try {
      const response = await fetch('https://us-central1-namthanhstores.cloudfunctions.net/createPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, app_user, items, email, address })
      });
      
      if (!response.ok) {
        throw new Error("Error creating order");
      }
      
      const data = await response.json();
      setOrder(data); // Store order info from server response
      return data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const checkOrderStatus = async (appTransId) => {
    try {
      const response = await fetch('https://us-central1-namthanhstores.cloudfunctions.net/checkOrderStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ app_trans_id: appTransId })
      });
      
      if (!response.ok) {
        throw new Error("Error checking order status");
      }

      const data = await response.json();
      setPaymentStatus(data); // Update payment status
      return data;
    } catch (error) {
      console.error("Error checking order status:", error);
      throw error;
    }
  };

  return (
    <PaymentContext.Provider value={{ order, paymentStatus, createOrder, checkOrderStatus }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);
