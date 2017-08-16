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

}
  from 'react-native';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import FlatListDemo from '../components/examples/FlatListDemo';
import FloatingButtonDemo from '../components/examples/FloatingButtonDemo';
import PostDemo from '../components/examples/PostDemo';
import AsyncStorageDemo from '../components/examples/AsyncStorageDemo';



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

  renderScene(route, navigator) {
    switch (route.name) {
      case 'roomDetail':
        return (
          <Text>Test do mah</Text>
        );
        break;

      default:
        break;
    }

  };


  render() {
    return (
      <View style={styles.container}>

        <AsyncStorageDemo />

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


