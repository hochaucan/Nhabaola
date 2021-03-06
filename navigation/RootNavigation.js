import { Notifications } from 'expo';
import React from 'react';
import {
  View,
  Text,
  StatusBar
}
  from 'react-native'
import { StackNavigator, NavigationActions } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
// import ScreenStack from './ScreenNavigator';

import PostRoomScreen from '../screens/PostRoomScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostedRoomHIstoryScreen from '../screens/PostedRoomHIstoryScreen';
import RegisterAccountScreen from '../screens/RegisterAccountScreen';
import UpdateRoomScreen from '../screens/UpdateRoomScreen';
import UpdateAccountScreen from '../screens/UpdateAccountScreen';
import RoomByCategoryScreen from '../screens/RoomByCategoryScreen';
import PinnedRoomScreen from '../screens/PinnedRoomScreen';
import MailboxScreen from '../screens/MailboxScreen';
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
    PostedRoomHIstoryScreen: {
      screen: PostedRoomHIstoryScreen,
    },
    PostRoomScreen: {
      screen: PostRoomScreen,
    },
    RegisterAccountScreen: {
      screen: RegisterAccountScreen,
    },
    UpdateRoomScreen: {
      screen: UpdateRoomScreen,
    },
    UpdateAccountScreen: {
      screen: UpdateAccountScreen,
    },
    RoomByCategoryScreen: {
      screen: RoomByCategoryScreen,
    },
    PinnedRoomScreen: {
      screen: PinnedRoomScreen,
    },
    MailboxScreen: {
      screen: MailboxScreen,
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

// Prevents double taps navigating twice
const navigateOnce = (getStateForAction) => (action, state) => {
  const { type, routeName } = action;
  return (
    state &&
    type === NavigationActions.NAVIGATE &&
    routeName === state.routes[state.routes.length - 1].routeName
  ) ? state : getStateForAction(action, state);
};

RootStackNavigator.router.getStateForAction = navigateOnce(RootStackNavigator.router.getStateForAction);

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


    //registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({ origin, data }) => {
    // alert("can")
    //this.props.navigation.navigate('SearchScreen');

    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`
    );
  };
}
