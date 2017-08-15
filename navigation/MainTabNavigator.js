import React from 'react';
import {
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom, TabBarTop } from 'react-navigation';

import Colors from '../constants/Colors';

import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Testing from '../screens/Testing';

export default TabNavigator(
  {
    Testing: {
      screen: Testing,
    },
    Home: {
      screen: HomeScreen,
    },
    Search: {
      screen: LinksScreen,
    },
    Notifications: {
      screen: SettingsScreen,
    },
    Profiles: {
      screen: HomeScreen,
    }
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
            style={{ marginTop: Platform.OS === 'ios' ? 40 : 0 }}
            //color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
            color={focused ? '#a4d227' : '#5D5D5D'}
          />
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
        // marginTop: Platform.OS === 'ios' ? 25 : 5,
      },
      tabStyle: {
        // width: 100,
      },
      style: {
        backgroundColor: '#fff',
        height: Platform.OS === 'ios' ? 50 : 50,
        // marginTop: 20,

      },
      showIcon: true,
      indicatorStyle: {
        opacity: 1,
        backgroundColor: '#a4d227'
      },
      upperCaseLabel: false,
      showLabel: false,
      activeTintColor: '#a4d227',
      inactiveTintColor: '#000',
      iconStyle: {
        marginTop: Platform.OS === 'ios' ? -25 : 0,
        height: Platform.OS === 'ios' ? 40 : 30,
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