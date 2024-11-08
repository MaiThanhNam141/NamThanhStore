const functions = require('firebase-functions');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs');
const admin = require('firebase-admin');

admin.initializeApp();

// APP INFO
// EXAMPLE DATA FROM ZALOPAY MERCHANT
const config = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
};

// Tạo đơn hàng thanh toán
exports.createPayment = functions.https.onRequest(async (req, res) => {
    const { amount, app_user, items, email, address } = req.body;

    if (!amount || !app_user || !items || !email || !address) {
        return res.status(500).json({ message: 'Cannot create payment without required information' });
    }

    const embed_data = {};
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
        app_user: app_user,
        app_time: Date.now(),
        item: JSON.stringify(items),
        email: JSON.stringify(email),
        address: JSON.stringify(address),
        embed_data: JSON.stringify(embed_data),
        status: "Pending",
        amount: amount,
        callback_url: 'https://us-central1-namthanhstores.cloudfunctions.net/paymentCallback',
        description: `Payment for the order #${transID}`,
        bank_code: '',
    };

    const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const result = await axios.post(config.endpoint, null, { params: order });
        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating order', error });
    }
});

// Thanh toán thành công sẽ tự động gọi đến hàm này để sửa lại dữ liệu đơn hàng
exports.paymentCallback = functions.https.onRequest((req, res) => {
    let result = {};
    try {
        const { data: dataStr, mac: reqMac } = req.body;
        const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = 'mac not equal';
        } else {
            const dataJson = JSON.parse(dataStr);
            const orderRef = admin.firestore().collection('orders').doc(dataJson.app_trans_id);
            orderRef.set(dataJson);
            fetch("https://script.google.com/macros/s/AKfycbxtGHV6R0XAWI02Rlu3McVzK9SC7gNAce6jtZBOCtk4CFg_pXz5VO3qQPHCeM4BPWXO/exec", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: dataJson,
                }),
            });
            result.return_code = 1;
            result.return_message = 'success';
        }
    } catch (ex) {
        result.return_code = 0;
        result.return_message = ex.message;
    }

    res.json(result);
});

// Kiểm tra trạng thái đơn hàng
exports.checkOrderStatus = functions.https.onRequest(async (req, res) => {
    const { app_trans_id } = req.body;
    const postData = {
        app_id: config.app_id,
        app_trans_id,
    };

    const data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`;
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const result = await axios.post('https://sb-openapi.zalopay.vn/v2/query', qs.stringify(postData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ message: 'Error checking order status', error });
    }
});
