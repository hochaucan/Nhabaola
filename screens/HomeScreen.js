import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
} from 'react-native';
import { WebBrowser } from 'expo';
import { MonoText } from '../components/StyledText';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import { users } from '../components/examples/data';
var { height, width } = Dimensions.get('window');

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      dataUsers: users,
      refresh: false,
      txt: 'test threshole'
    }

  }
  refresh() {
    this.setState({
      refresh: false,
    })
  }

  componentDidMount() {

  }

  render() {
    return (
      <View style={styles.container}>
        {/* <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          
        </ScrollView> */}

        <FlatList
          ref='homepage'
          refreshing={this.state.refresh}
          onRefresh={() => { this.refresh() }}

          onEndReachedThreshold={-0.2}
          onEndReached={() => {
            this.setState({
              txt: 'Can Ho'
            });
          }}

          data={this.state.dataUsers}
          renderItem={({ item }) =>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardAvatarBox}>
                  <Image
                    style={styles.cardAvatarImage}
                    source={{ uri: item.picture.thumbnail }} />
                </View>
                <View style={styles.cardAvatarTextBox}>
                  <Text style={styles.cardAvatarName}>{item.name.first} {item.name.last}</Text>
                  <View style={styles.cardAvatarPhoneBox}>
                    <Ionicons name='ios-star' size={15} />
                    <Text style={styles.cardAvatarPhone}>{item.phone}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.cardImageBox}
                onPress={() => {
                  alert("item.title")
                }}
              >
                <Image
                  style={styles.cardImage}
                  source={{ uri: item.picture.large }} />
              </TouchableOpacity>
              <View style={styles.cardDes}>
                <Text>
                  Although dimensions are available immediately, they may change (e.g due to device rotation) so any rendering logic or styles that depend on these constants should try to
                </Text>
              </View>
              <View style={styles.cardBottom}>
                <Ionicons
                  name='ios-star'
                  size={20}
                />
              </View>
            </View>
          }
          keyExtractor={item => item.email}

        /* horizontal={false}
        numColumns={3} */
        />
        <ActionButton buttonColor="#73aa2a">
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

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use
          useful development tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/development-mode'
    );
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 480,
    // borderBottomWidth: 0.5,
    borderColor: '#d6d7da',
    padding: 0,
    flexDirection: 'column',
  },
  cardHeader: {
    flex: 2,
    flexDirection: 'row',
    padding: 20,
    // borderWidth: 1,
    // borderColor: 'green',
  },
  cardAvatarBox: {
    flex: 1
  },
  cardAvatarImage: {
    borderRadius: Platform.OS === 'ios' ? 23 : 50,
    height: 45,
    width: 45,
  },
  cardAvatarTextBox: {
    flex: 4,
  },
  cardAvatarName: {
    fontSize: 17,
  },
  cardAvatarPhoneBox: {
    flex: 1,
    flexDirection: 'row',
  },
  cardAvatarPhone: {
    color: '#9B9D9D',
    fontSize: 13,
    paddingLeft: 8,
  },
  cardImageBox: {
    flex: 9,
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  cardImage: {
    height: height * 0.4,

  },
  cardDes: {
    flex: 3,
    padding: 20,
    backgroundColor: '#fff',
    // borderWidth: 1,
    // borderColor: 'red',
  
  },
  cardBottom: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop:10,
    // paddingBottom:5,
    // borderWidth: 1,
    // borderColor: 'black',

  },


















  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
