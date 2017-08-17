import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
}
    from 'react-native';
import { TabNavigator, StackNavigator } from 'react-navigation';

import Icon from 'react-native-vector-icons/Ionicons';
import LinksScreen from '../../screens/LinksScreen';
import SettingScreen from '../../screens/SettingsScreen';

export const FeedStack = StackNavigator({
    Feed: {
        screen: LinksScreen,
        navigationOptions: {
            title: 'Feed',
        }
    },
    Detail: {
        screen: SettingScreen,
        navigationOptions: ({ navigation }) => ({
            title: 'Detail',
        })

    }
})

// export default class NavigatorDemo extends React.Component {
//     static navigationOptions = {
//         title: 'Welcome',
//     };
//     render() {
//         return (

//             <View style={{ flex: 1, padding: 40 }}>
//                 <Text>NavigatorDemo</Text>
//             </View>
//         );
//     }
// }

// const SimpleApp = StackNavigator({
//   Home: { screen: LinksScreen },
// });