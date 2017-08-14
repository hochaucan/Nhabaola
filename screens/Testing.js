import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StatusBar
}
  from 'react-native';
import MapView from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';



export default class Testing extends React.Component {
  static navigationOptions = {
    // title: 'app.json',
    header: null,
  };

  constructor(props) {
    super(props);


  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#f3f3f3' }}>

      

        <Text style={styles.fontColor}>Nguyen Thi Hoang Oanh</Text>
        <ActionButton buttonColor="rgba(231,76,60,1)">
          <ActionButton.Item buttonColor='#9b59b6' title="New Task" onPress={() => console.log("notes tapped!")}>
            <Icon name="md-create" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#3498db' title="Notifications" onPress={() => { }}>
            <Icon name="md-notifications-off" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#1abc9c' title="All Tasks" onPress={() => { }}>
            <Icon name="md-done-all" style={styles.actionButtonIcon} />
          </ActionButton.Item>
        </ActionButton>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fontColor: {
    marginTop: 50,
    color: 'red',
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },


});
