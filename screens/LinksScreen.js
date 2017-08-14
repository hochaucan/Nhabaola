import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, MapView } from 'expo';

export default class LinksScreen extends React.Component {

  static navigationOptions = {
    // title: 'Links',
    header: null,
  };

  state = {
    mapRegion: { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }
  };

  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <MapView
          style={{ alignSelf: 'stretch', height: 400, marginTop: -20 }}
          region={this.state.mapRegion}
          onRegionChange={this._handleMapRegionChange}
        />

        {/* <ExpoLinksView /> */}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
