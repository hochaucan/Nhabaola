import React from 'react';
import { Platform } from 'react-native';
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
    Links: {
      screen: LinksScreen,
    },
    Settings: {
      screen: SettingsScreen,
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Home':
            iconName = Platform.OS === 'ios'
              ? `ios-home${focused ? '' : '-outline'}`
              : 'md-home';
            break;
          case 'Links':
            iconName = Platform.OS === 'ios'
              ? `ios-link${focused ? '' : '-outline'}`
              : 'md-link';
            break;
          case 'Settings':
            iconName = Platform.OS === 'ios'
              ? `ios-options${focused ? '' : '-outline'}`
              : 'md-options';
          case 'Testing':
            iconName = Platform.OS === 'ios'
              ? `ios-options${focused ? '' : '-outline'}`
              : 'md-options';
        }
        return (
          <Ionicons
            name={iconName}
            size={28}
            style={{ marginTop: Platform.OS === 'ios' ? 40 : 0 }}
            color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
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
        fontSize: 10,
        marginTop: 25,
      },
      tabStyle: {
        // width: 100,
      },
      style: {
        backgroundColor: 'green',
      },
      showIcon: true,
      indicatorStyle:{
        opacity: 1,
        backgroundColor:'red'
      },
      upperCaseLabel: false,
      showLabel: true,
      activeTintColor:'yellow'
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