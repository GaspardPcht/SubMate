const fetch = require('node-fetch');

const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(JSON.stringify(result));
    }
    
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

module.exports = { sendPushNotification };
