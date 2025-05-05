import fetch from 'node-fetch';

interface NotificationMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data: Record<string, any>;
}

export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<any> => {
  const message: NotificationMessage = {
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
