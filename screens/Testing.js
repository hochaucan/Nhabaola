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

  _scrollToInput(reactNode) {
    // Add a 'scroll' ref to your ScrollView
    this.scroll.props.scrollToFocusedInput(reactNode)
    //this.scroll.props.scrollToPosition(0, 20)
    //alert(reactNode)
  }

  render() {

    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView
          innerRef={ref => { this.scroll = ref }}
        //extraHeight={50}
        //extraScrollHeight={50}
        >
          <View>

            <TextInput
              style={{ height: 40, marginTop: 300, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={(text) => this.setState({ text })}
              value={this.state.text}
              onFocus={(event) => {
                // `bind` the function if you're using ES6 classes
                // alert(event.target)
                this._scrollToInput(event.target)
                //this._scrollToInput(ReactNative.findNodeHandle(event.target))
              }}
            />

            <TextInput
              style={{ marginTop: 500, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={(text) => this.setState({ text })}
              value={this.state.text}
              onFocus={(event) => {
                //alert(findNodeHandle(event.target))
                // this._scrollToInput(event.target)
                // this._scrollToInput(findNodeHandle(event.target))
                this._scrollToInput(event.target)

              }}
            />
            <KeyboardSpacer />
          </View>
        </KeyboardAwareScrollView>

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


