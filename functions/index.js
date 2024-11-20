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
    const { amount, items, email, address, name, note, phone, userid } = req.body;

    if (!amount || !items || !email || !address || !name || !phone || !userid) {
        return res.status(500).json({ message: 'Cannot create payment without required information' });
    }

    const embed_data = {
        email,
        name,
        phone,
        address,
        note,
        status: "Pending"
    };
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
        app_user: userid,
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: amount,
        callback_url: 'https://us-central1-namthanhstores.cloudfunctions.net/paymentCallback',
        description: note,
        bank_code: '',
    };

    const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const result = await axios.post(config.endpoint, null, { params: order });
        return res.status(200).json({...result.data, app_trans_id: order.app_trans_id });
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
            const itemsArray = JSON.parse(dataJson.item).map(item => ({
                id: item.id,
                itemCount: item.itemCount,
            }));
            const embedData = JSON.parse(dataJson.embed_data);
            
            // Lưu dữ liệu vào Firestore
            const orderData = {
                ...dataJson,
                item: itemsArray,
                embed_data: embedData,  
            };
            const orderRef = admin.firestore().collection('orders').doc(dataJson.app_trans_id);

            // Tạo các Promise cho các tác vụ đồng thời
            const updateOrderPromise = orderRef.set(orderData);
            const sendEmailPromise = fetch("https://script.google.com/macros/s/AKfycbxtGHV6R0XAWI02Rlu3McVzK9SC7gNAce6jtZBOCtk4CFg_pXz5VO3qQPHCeM4BPWXO/exec", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: embedData.email }),
            });
            const sendNotificationPromise = fetch("https://us-central1-namthanhstores.cloudfunctions.net/sendNotification", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: "Thông báo", message: "Đơn hàng đã được cập nhật thành công" }),
            });

            // Sử dụng Promise.all để thực hiện tất cả tác vụ đồng thời
            Promise.all([updateOrderPromise, sendEmailPromise, sendNotificationPromise])
                .then(() => {
                    result.return_code = 1;
                    result.return_message = 'success';
                    res.json(result);
                })
                .catch((error) => {
                    result.return_code = 0;
                    result.return_message = `Error: ${error.message}`;
                    res.json(result);
                });
        }
    } catch (ex) {
        result.return_code = 0;
        result.return_message = ex.message;
        res.json(result);
    }
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

exports.sendNotification = functions.https.onRequest(async (req, res) => {
    // Cấu hình header CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Xử lý preflight request
    if (req.method === 'OPTIONS') {
        return res.status(204).send('');
    }

    // Chỉ cho phép phương thức POST
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { title, body } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!title || !body) {
        return res.status(400).send('Title and body are required');
    }

    const logoUrl = "https://firebasestorage.googleapis.com/v0/b/namthanhstores.appspot.com/o/static%2Flogo.png?alt=media&token=bdb4fede-d51e-4d72-adc9-e679f124d572";

    const message = {
        notification: { 
            title, 
            body,
            image: logoUrl,
        },
        topic: 'all_users',
    };

    try {
        await admin.messaging().send(message);
        return res.status(200).send({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).send({ success: false, error: 'Error sending notification: ' + error.message });
    }
});

exports.sendNotificationToUser = functions.https.onRequest(async (req, res) => {
    // Cấu hình header CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Xử lý preflight request
    if (req.method === 'OPTIONS') {
        return res.status(204).send('');
    }

    // Chỉ cho phép phương thức POST
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { token, title, body } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!token || !title || !body) {
        return res.status(400).send('Token, title, and body are required');
    }

    const logoUrl = "https://firebasestorage.googleapis.com/v0/b/namthanhstores.appspot.com/o/static%2Flogo.png?alt=media&token=bdb4fede-d51e-4d72-adc9-e679f124d572";

    const message = {
        notification: { 
            title, 
            body,
            image: logoUrl,
        },
        token: token,
    };

    try {
        // Gửi thông báo qua FCM
        await admin.messaging().send(message);
        return res.status(200).send({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).send({ success: false, error: 'Error sending notification: ' + error.message });
    }
});
