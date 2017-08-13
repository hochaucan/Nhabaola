import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
 StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
}
  from 'react-native';
import MapView from 'react-native-maps';



export default class Testing extends React.Component {
  static navigationOptions = {
    // title: 'app.json',
    header: null,
  };

  constructor(props) {
    super(props);


  }

  // state = {
  //   coordinate: new Animated.Region({
  //     latitude: LATITUDE,
  //     longitude: LONGITUDE,
  //   }),
  // };

  render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return (
      <View>
        <Text style={styles.fontColor}>Nguyen Thi Hoang Oanh + Can</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fontColor: {
    marginTop: 50,
    color: 'red',
  }
});
