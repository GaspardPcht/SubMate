import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { View, Button } from 'react-native';

type NotificationProps = {
  type: ALERT_TYPE;
  title: string;
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ type, title, message }) => {
  return (
    <AlertNotificationRoot>
      <View>
        <Button
          title="Afficher notification"
          onPress={() =>
            Toast.show({
              type: type,
              title: title, 
              textBody: message,
            })
          }
        />
      </View>
    </AlertNotificationRoot>
  );
};

export default Notification;