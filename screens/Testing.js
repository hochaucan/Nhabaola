import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  Button,
  Platform,
}
  from 'react-native';
import { Constants, Location, Permissions } from 'expo';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import FlatListDemo from '../components/examples/FlatListDemo';
import FloatingButtonDemo from '../components/examples/FloatingButtonDemo';
import PostDemo from '../components/examples/PostDemo';
import AsyncStorageDemo from '../components/examples/AsyncStorageDemo';
import MyLocationMapMarker from '../components/examples/MyLocationMapMakerDemo';
import { GooglePlacesAutocomplete, } from 'react-native-google-places-autocomplete'; // 1.2.12


var date = new Date();
var timeZone = (-1) * date.getTimezoneOffset() / 60;

export default class Testing extends React.Component {
  static navigationOptions = {
    // title: 'app.json',
    header: null,
  };

  constructor(props) {
    super(props)
    this.state = {

      txt: 'Hoang Oanh',
      location: null,
      errorMessage: null,
    }
  }

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };

  handleSettingsPress = () => {
    this.props.navigation.navigate('Settings4');
  };


  render() {

    return (
      <View style={styles.container}>
        {/* <uploadFileDemo /> */}

      </View>

    );

  }





}


const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
});


