// Đây là đoạn code được lưu trữ và thực thi trên Google App Script 
// dùng để gửi email và gọi api token của bot trong telegram để gửi 
// tin nhắn thông báo về đơn hàng

function getBotToken() {
    const scriptProperties = PropertiesService.getScriptProperties();
    return scriptProperties.getProperty('BOT_TOKEN');
}

function getChatID() {
    const scriptProperties = PropertiesService.getScriptProperties();
    return scriptProperties.getProperty('chat_ID');
}

function doPost(e) {
    const requestBody = JSON.parse(e.postData.contents);
    const email = requestBody.email;
    const items = requestBody.item;
    const amount = requestBody.amount;
    const subject = 'Cám ơn vì đã tin tưởng NamThanhStores';
    const message = `Một đơn hàng mới từ ${email}`;

    const itemsListHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
        </td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${item.name}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.itemCount}</td>
      </tr>
    `).join('');

    const htmlBody = `
    <html>
    <head>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              background-color: #f3f4f6;
              color: #333333;
              margin: 0;
              padding: 0;
          }
  
          .header {
              background-color: #17693F;
              padding: 30px;
              text-align: center;
              color: #ffffff;
          }
  
          .header h1 {
              margin: 0;
              font-size: 28px;
          }
  
          .content {
              background-color: #ffffff;
              margin: 20px;
              padding: 25px;
              font-size: 16px;
              line-height: 1.8;
              color: #333333;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
  
          .footer {
              margin-top: 40px;
              padding: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #555555;
              text-align: center;
          }
  
          a {
              color: #17693F;
              text-decoration: none;
          }
  
          a:hover {
              text-decoration: underline;
          }
  
          .signature {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
          }
  
          .signature .logo {
              width: 40%;
              text-align: left;
          }
  
          .signature .info {
              width: 60%;
              text-align: right;
              font-size: 15px;
          }
  
          .signature img {
              max-width: 150px;
          }
  
          .signature p {
              margin: 6px 0;
          }
      </style>
    </head>
  
    <body>
      <div class="header">
          <h1>Cảm ơn bạn đã tin tưởng NamThanhStores!</h1>
      </div>
      <div class="content">
          <p>Kính chào,</p>
          <p>
              Cảm ơn bạn đã hoàn tất thanh toán cho đơn hàng. Bạn có thể kiểm tra trạng thái đơn hàng trong mục
              <strong>"Đơn hàng của tôi"</strong>. Nếu đơn hàng chưa xuất hiện, hãy chờ thêm 15 phút để hệ thống cập nhật
              hoàn tất. Nếu sau thời gian đó đơn hàng vẫn chưa được hiển thị, xin vui lòng liên hệ chúng tôi qua email
              hoặc số điện thoại dưới đây để được hỗ trợ ngay.
          </p>
          <p>
              Email này có thể sử dụng như một hóa đơn bán hàng
          </p>
          <table>
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHTML}
            </tbody>
          </table>
          <p style="margin-top: 20px;"><strong>Tổng giá tiền:</strong> ${amount.toLocaleString('vi-VN')} VNĐ</p>
          <p>
              Chúng tôi rất mong sẽ mang lại cho bạn trải nghiệm tốt nhất. Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào,
              đừng ngần ngại liên hệ với NamThanhStores qua email hoặc gọi cho chúng tôi qua số điện thoại bên dưới.
          </p>
      </div>
      <div class="signature">
          <div class="logo">
              <img src="https://firebasestorage.googleapis.com/v0/b/namthanhstores.appspot.com/o/static%2Flogo.png?alt=media&token=bdb4fede-d51e-4d72-adc9-e679f124d572"
                  alt="NamThanhStores Logo">
          </div>
          <div class="info">
              <p><strong>NamThanhStores</strong></p>
              <p>Chuyên bán các sản phẩm thức ăn chăn nuôi chất lượng</p>
              <p>Email: <a href="mailto:maithanhnam141@gmail.com">maithanhnam141@gmail.com</a></p>
              <p>Phone: <a href="tel:+84387142380">0387 142 380</a></p>
          </div>
      </div>
      <div class="footer">
          <p>Đây là email tự động. Vui lòng không trả lời lại email này.</p>
          <p>Trân trọng,<br>Đội ngũ vận hành NamThanhStores</p>
      </div>
    </body>
    </html>
    `;

    try {
        MailApp.sendEmail({
            to: email,
            subject: subject,
            htmlBody: htmlBody,
            noReply: true,
        });
        sendTele(message);
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Email đã được gửi thành công.' }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message, data: data }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function sendTele(message) {
    const BOT_TOKEN = getBotToken();
    const chat_ID = getChatID();

    const payload = {
        chat_id: chat_ID,
        text: message
    }

    const options = {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify(payload)
    }

    try {
        const response = UrlFetchApp.fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, options);
        return response.getContentText();
    } catch (error) {
        console.error('Failed to send Telegram message:', error.message);
        return false;
    }
}