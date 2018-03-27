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
import SimplePicker from 'react-native-simple-picker';



var date = new Date();
var timeZone = (-1) * date.getTimezoneOffset() / 60;
const options = ['Option1', 'Option2', 'Option3'];
// Labels is optional
const labels = ['Banana', 'Apple', 'Pear'];

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
      selectedOption: '',
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



  render() {

    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Current Option: {this.state.selectedOption}</Text>

        <Text
          style={{ color: '#006381', marginTop: 20 }}
          onPress={() => {
            this.refs.picker.show();
          }}
        >
            Click here to select your option
        </Text>

        <Text
          style={{ color: '#006381', marginTop: 20 }}
          onPress={() => {
            this.refs.picker2.show();
          }}
        >
            Click here to select your option with labels
        </Text>

        <SimplePicker
          ref={'picker'}
          options={options}
          onSubmit={(option) => {
            this.setState({
              selectedOption: option,
            });
          }}
        />

        <SimplePicker
          ref={'picker2'}
          options={options}
          labels={labels}
          confirmText='Đồng ý'
          itemStyle={{
            fontSize: 25,
            color: 'red',
            textAlign: 'left',
            fontWeight: 'bold',
          }}
          onSubmit={(option) => {
            this.setState({
              selectedOption: option,
            });
          }}
        />
      </View>

    );

  }





}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#efecc9',
  },

  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },

  paragraph: {
    textAlign: 'center',
    color: '#002f2f',
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 18,
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