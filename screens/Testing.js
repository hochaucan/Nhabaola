import React, { Component } from 'react';
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
  TextInput,
  findNodeHandle,
}
  from 'react-native';
import { Constants, Location, Permissions } from 'expo';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import { GooglePlacesAutocomplete, } from 'react-native-google-places-autocomplete'; // 1.2.12
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import KeyboardSpacer from 'react-native-keyboard-spacer';
import getDirections from 'react-native-google-maps-directions'
import SlidingUpPanel from 'react-native-sliding-up-panel';




var date = new Date();
var timeZone = (-1) * date.getTimezoneOffset() / 60;

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

var MAXIMUM_HEIGHT = deviceHeight - 100;
var MINUMUM_HEIGHT = 80;

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
      containerHeight: 0
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

  _scrollToInput(reactNode) {
    // Add a 'scroll' ref to your ScrollView
    //this.scroll.props.scrollToFocusedInput(reactNode)
    //this.scroll.props.scrollToPosition(0, 20)
    //alert(reactNode)
  }

  handleGetDirections = () => {
    const data = {
      source: {
        latitude: -33.8356372,
        longitude: 18.6947617
      },
      destination: {
        latitude: -33.8600024,
        longitude: 18.697459
      },
      params: [
        {
          key: "dirflg",
          value: "w"
        }
      ]
    }

    getDirections(data)
  }

  getContainerHeight = (height) => {
    this.setState({
      containerHeight: height
    });
  }

  render() {

    return (
      <View style={styles.container}>
        <Button onPress={this.handleGetDirections} title="Get Directions" />
        <Text style={{
          //color: 'white',
          fontWeight: '700',
        }}>Panel Height: {this.state.containerHeight}</Text>

        <Image style={{ height: this.state.containerHeight }} source={require("../images/app-icon.png")} />

        <SlidingUpPanel
          ref={panel => { this.panel = panel; }}
          containerMaximumHeight={MAXIMUM_HEIGHT}
          containerBackgroundColor={'green'}
          handlerHeight={MINUMUM_HEIGHT}
          allowStayMiddle={false}
          handlerDefaultView={<HandlerOne />}
          getContainerHeight={this.getContainerHeight}>
          <View style={{ flex: 1 }}>
            <Text style={styles.panelText}>Hello guys!</Text>
          </View>
        </SlidingUpPanel>

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


class HandlerOne extends Component {
  render() {
    return (
      <Image style={styles.image} source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Cloud_banner.jpg' }}>
        <View style={styles.textContainer}>
          <Text style={styles.handlerText}>Another Sample Text</Text>
        </View>
      </Image>
    );
  }
};