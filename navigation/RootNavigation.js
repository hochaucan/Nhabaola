import { Notifications } from 'expo';
import React from 'react';
import {
  View,
  Text,
  StatusBar
}
  from 'react-native'
import { StackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
// import ScreenStack from './ScreenNavigator';


import RoomDetailScreen from '../screens/RoomDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
// export const ScreenStack = StackNavigator({
//   Settings2: {
//     screen: Settings3,
//     navigationOptions: ({ navigation }) => ({
//       // title: 'CanHO'
//     }),
//   },
// });



const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: MainTabNavigator,
    },
    RoomDetailScreen: {
      screen: RoomDetailScreen,
    },
    ProfileScreen: {
      screen: ProfileScreen,
    },
  },
  {
    navigationOptions: () => ({
      headerTitleStyle: {
        fontWeight: 'normal',
      },
    }),
    // mode: 'modal',
    // headerMode: 'none',
  }
);

export default class RootNavigator extends React.Component {
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }



  render() {
    return (
      <RootStackNavigator />
    );
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({ origin, data }) => {
    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`
    );
  };
}
