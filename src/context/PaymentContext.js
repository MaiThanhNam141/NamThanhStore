import React, { createContext, useState, useContext } from 'react';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [order, setOrder] = useState(null); // Lưu thông tin đơn hàng hiện tại
  const [paymentStatus, setPaymentStatus] = useState(null); // Trạng thái thanh toán

  const createOrder = async (amount, userId) => {
    // Logic để gọi API create order từ server và lưu thông tin đơn hàng
    try {
      const response = await axios.post('YOUR_SERVER/payment', { amount, userId });
      setOrder(response.data); // Lưu thông tin order
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const checkOrderStatus = async (appTransId) => {
    // Logic để kiểm tra trạng thái đơn hàng
    try {
      const response = await axios.post('YOUR_SERVER/check-status-order', { app_trans_id: appTransId });
      setPaymentStatus(response.data); // Cập nhật trạng thái thanh toán
      return response.data;
    } catch (error) {
      console.error("Error checking order status:", error);
    }
  };

  return (
    <PaymentContext.Provider value={{ order, paymentStatus, createOrder, checkOrderStatus }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);
