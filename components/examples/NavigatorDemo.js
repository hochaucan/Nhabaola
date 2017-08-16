import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
}
    from 'react-native';
import { TabNavigator, TabBarBottom, TabBarTop, StackNavigator } from 'react-navigation';

import Icon from 'react-native-vector-icons/Ionicons';
import LinksScreen from '../../screens/LinksScreen';
import SettingScreen from '../../screens/SettingsScreen';


export default class NavigatorDemo extends React.Component {
    static navigationOptions = {
        title: 'Welcome',
    };
    render() {
        return (

            <View style={{ flex: 1, padding: 40 }}>
                <Text>NavigatorDemo</Text>
            </View>
        );
    }
}

const SimpleApp = StackNavigator({
  Home: { screen: LinksScreen },
});