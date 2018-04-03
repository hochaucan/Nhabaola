import React from 'react';
import {
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom, TabBarTop } from 'react-navigation';

import Colors from '../constants/Colors';
import HomeScreen from '../screens/HomeScreen';
import Testing from '../screens/Testing';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import RegisterRoomScreen from '../screens/RegisterRoomScreen';


export default TabNavigator(
  {
    // Testing: {
    //   screen: Testing,
    // },
    Home: {
      screen: HomeScreen,
    },
    Search: {
      screen: SearchScreen,
    },
    // Notifications: {
    //   screen: RegisterRoomScreen,
    // },
    // Profiles: {
    //   screen: ProfileScreen,
    // }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Testing':
            iconName = Platform.OS === 'ios'
              ? `ios-navigate${focused ? '' : '-outline'}`
              : 'md-navigate';
            break;
          case 'Home':
            iconName = Platform.OS === 'ios'
              ? `ios-home${focused ? '' : '-outline'}`
              : 'md-home';
            break;
          case 'Search':
            iconName = Platform.OS === 'ios'
              ? `ios-search${focused ? '' : '-outline'}`
              : 'md-search';
            break;
          case 'Notifications':
            iconName = Platform.OS === 'ios'
              ? `ios-notifications${focused ? '' : '-outline'}`
              : 'md-notifications';
            break;
          case 'Profiles':
            iconName = Platform.OS === 'ios'
              ? `ios-person${focused ? '' : '-outline'}`
              : 'md-person';

            break;
          default:

            StatusBar.setBarStyle('light-content');
            if (Platform.OS === 'ios') {
              // StatusBar.setTranslucent(false);
              // StatusBar.setBackgroundColor('#a4d227')
            }
            else {

              // StatusBar.setHidden(false);
              // StatusBar.setBackgroundColor('transparent')
              // StatusBar.setTranslucent(true);

            }
            break;

        }
        return (
          <Ionicons
            name={iconName}
            size={28}
            style={{ marginTop: Platform.OS === 'ios' ? 20 : 0 }}
            //color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
            color={focused ? '#fff' : '#5D5D5D'}
          />
          // <Ionicons
          //   name={iconName}
          //   size={28}
          //   style={{ marginBottom: -3, width: 25 }}
          //   color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
          // />
        );
      },
    }),
    tabBarComponent: TabBarTop,
    tabBarPosition: 'top',
    animationEnabled: true,
    swipeEnabled: true,
    tabBarOptions: {
      labelStyle: {
        // fontSize: 10,
        marginTop: 0,
      },
      tabStyle: {
        // width: 100,
      },
      style: {
        backgroundColor: '#a4d227',
        height: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      showIcon: true,
      indicatorStyle: {
        //opacity: 1,
        backgroundColor: '#fff'//'#a4d227'
      },
      upperCaseLabel: false,
      showLabel: false,
      activeTintColor: '#a4d227',
      inactiveTintColor: '#000',
      iconStyle: {
        marginTop: Platform.OS === 'ios' ? -23 : 0,
        height: Platform.OS === 'ios' ? 50 : 30,
      }
    }
  }
);


// tabBarOptions for TabBarTop (default tab bar on Android)

// activeTintColor - label and icon color of the active tab
// inactiveTintColor - label and icon color of the inactive tab
// showIcon - whether to show icon for tab, default is false
// showLabel - whether to show label for tab, default is true
// upperCaseLabel - whether to make label uppercase, default is true
// pressColor - color for material ripple (Android >= 5.0 only)
// pressOpacity - opacity for pressed tab (iOS and Android < 5.0 only)
// scrollEnabled - whether to enable scrollable tabs
// tabStyle - style object for the tab
// indicatorStyle - style object for the tab indicator (line at the bottom of the tab)
// labelStyle - style object for the tab label
// iconStyle - style object for the tab icon
// style - style object for the tab bar