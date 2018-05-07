import { Permissions, Notifications } from 'expo';
import globalVariable from '../components/Global'

// Example server, implemented in Rails: https://git.io/vKHKv
const PUSH_ENDPOINT = 'https://expo-push-server.herokuapp.com/tokens';

export default (async function registerForPushNotificationsAsync() {
  // Android remote notification permissions are granted during the app
  // install, so this will only ask on iOS
  let { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

  // Stop here if the user did not grant permissions
  if (status !== 'granted') {
    Alert.alert("Thông báo", "Quyền được nhận Thông Báo từ Nhàbaola bị từ chối")
    return;
  }

  // Get the token that uniquely identifies this device
  let token = globalVariable.PHONE_TOKEN = await Notifications.getExpoPushTokenAsync();
  //globalVariable.PHONE_TOKEN = token;
  //console.log(token)
  // alert(token)
  //alert(globalVariable.PHONE_TOKEN)

  // POST the token to our backend so we can use it to send pushes from there
  return fetch(PUSH_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: {
        value: token,
      },
    }),
  });
});
