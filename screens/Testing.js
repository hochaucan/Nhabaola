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
}
  from 'react-native';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import FlatListDemo from '../components/examples/FlatListDemo';
import FloatingButtonDemo from '../components/examples/FloatingButtonDemo';
import PostDemo from '../components/examples/PostDemo';
import AsyncStorageDemo from '../components/examples/AsyncStorageDemo';
// import NavigatorDemo from '../components/examples/NavigatorDemo';



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

      txt: 'Hoang Oanh'
    }
  }

  handleSettingsPress = () => {
    this.props.navigation.navigate('Settings4');
  };


  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Detail"
          buttonStyle={{ marginTop: 20 }}
          onPress={this.handleSettingsPress}
        />


        <FloatingButtonDemo hoten='Ho Chau Can2' />
      </View>

    );

  }





}


const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
});


