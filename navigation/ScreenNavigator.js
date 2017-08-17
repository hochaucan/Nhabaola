
import { TabNavigator, StackNavigator } from 'react-navigation';
// import Icon from 'react-native-vector-icons/Ionicons';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';

export default ScreenStack = StackNavigator({
    Settings: {
        screen: SettingsScreen,
        navigationOptions: ({ navigation }) => ({
            // title: 'CanHO'
        }),
    },
    Links: {
        screen: LinksScreen,
        navigationOptions: ({ navigation }) => ({
            // title: 'CanHO'
        }),
    },
});