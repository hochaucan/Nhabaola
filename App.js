import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { AppLoading, Asset, Font } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import RootNavigation from './navigation/RootNavigation';
import FeedStack from './components/examples/NavigatorDemo'

// var STRINGS = require('./components/Localisation');
var GLOBAL = require('./components/Global');
var { height, width } = Dimensions.get('window');

export default class App extends React.Component {

  state = {
    assetsAreLoaded: false,
    topLogo: new Animated.Value(500),

  };

  componentWillMount() {
    this._loadAssetsAsync();

    Animated.timing(                  // Animate over time
      this.state.topLogo,            // The animated value to drive
      {
        toValue: 3,                   // Animate to opacity: 1 (opaque)
        duration: 3000,
        easing: Easing.bounce,         // Make it take a while
      }
    ).start();
  }

  render() {
    let { topLogo } = this.state;
    if (!this.state.assetsAreLoaded && !this.props.skipLoadingScreen) {
      return <AppLoading />;
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' &&
            <StatusBar barStyle="light-content" /> &&
            <View style={styles.statusBarUnderlay} />
          }

          {Platform.OS === 'android' &&
            <View style={styles.statusBarUnderlay} />
          }
          <View style={Platform.OS === 'ios' ? styles.headerLogoBackgroundIos : styles.headerLogoBackgroundAndroid}>

            <Animated.Image
              style={{
                width: 40,
                height: 40,
                position: 'absolute',
                top: topLogo,
                zIndex: 2,
                borderRadius: Platform.OS === 'ios' ? 10 : 100,
              }}
              /* source={{ uri: 'https://facebook.github.io/react/img/logo_og.png' }} */
              source={require('./images/nha-bao-la.jpg')}
            />
          </View>
          <View style={styles.headerBar}>
            <Text style={styles.headerBarTitle}> </Text>
          </View>
          <RootNavigation />

        </View>
      );
    }
  }

  async _loadAssetsAsync() {
    try {
      await Promise.all([
        Asset.loadAsync([
          require('./assets/images/robot-dev.png'),
          require('./assets/images/robot-prod.png'),
        ]),
        Font.loadAsync([
          // This is the font that we are using for our tab bar
          Ionicons.font,
          // We include SpaceMono because we use it in HomeScreen.js. Feel free
          // to remove this if you are not using it in your app
          { 'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf') },
        ]),
      ]);
    } catch (e) {
      // In this case, you might want to report the error to your error
      // reporting service, for example Sentry
      console.warn(
        'There was an error caching assets (see: App.js), perhaps due to a ' +
        'network timeout, so we skipped caching. Reload the app to try again.'
      );
      console.log(e);
    } finally {
      this.setState({ assetsAreLoaded: true });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: Platform.OS === 'ios' ? '#73aa2a' : '#b8fb02', //b8fb02, ccff00, b4fe02, d1ff18
  },
  headerBar: {
    height: 32,
    backgroundColor: '#a4d227',
    justifyContent: 'center',
    // alignItems: 'center',
    zIndex: 1,
  },
  headerBarTitle: {
    color: '#fff',
    paddingLeft: 10,
  },
  headerLogo: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: 3,
    zIndex: 2,
    borderRadius: Platform.OS === 'ios' ? 10 : 100,

  },
  headerLogoBackgroundIos: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3
  },
  headerLogoBackgroundAndroid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
