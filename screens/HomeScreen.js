import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  View,
  FlatList,
  Dimensions,
  LayoutAnimation,
  Modal,
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
      txt: 'test threshole',
      isActionButtonVisible: true, // 1. Define a state variable for showing/hiding the action-button 
      modalVisible: false,
    }

  }
  // 2. Define a variable that will keep track of the current scroll position
  _listViewOffset = 0

  refresh() {
    this.setState({
      refresh: false,
    })
  }

  componentDidMount() {

  }

  _onScroll = (event) => {
    // Simple fade-in / fade-out animation
    const CustomLayoutLinear = {
      duration: 100,
      create: { type: LayoutAnimation.Types.linear, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.linear, property: LayoutAnimation.Properties.opacity },
      delete: { type: LayoutAnimation.Types.linear, property: LayoutAnimation.Properties.opacity }
    }
    // Check if the user is scrolling up or down by confronting the new scroll position with your own one
    const currentOffset = event.nativeEvent.contentOffset.y
    const direction = (currentOffset > 0 && currentOffset > this._listViewOffset)
      ? 'down'
      : 'up'
    // If the user is scrolling down (and the action-button is still visible) hide it
    const isActionButtonVisible = direction === 'up'
    if (isActionButtonVisible !== this.state.isActionButtonVisible) {
      LayoutAnimation.configureNext(CustomLayoutLinear)
      this.setState({ isActionButtonVisible })
    }
    // Update your scroll position
    this._listViewOffset = currentOffset

    //alert(currentOffset)
  }

  _moveToRoomDetail = (user) => {
    this.props.navigation.navigate('RoomDetailScreen', { ...user });
  };

  _setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  render() {
    return (
      <View style={styles.container}>
        {/* <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          
        </ScrollView> */}

        <FlatList
          //onScroll={this._onScroll}
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
                  <TouchableOpacity
                    onPress={() => {
                      //alert("item.title")
                      this.props.navigation.navigate('ProfileScreen', { key: 'CanHo' });
                    }}
                  >
                    <Image
                      style={styles.cardAvatarImage}
                      source={{ uri: item.picture.large }} />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardAvatarTextBox}>
                  <Text style={styles.cardAvatarName}>{item.name.first} {item.name.last}</Text>
                  <TouchableOpacity style={styles.cardAvatarPhoneBox}>
                    <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />
                    <Text style={styles.cardAvatarPhone}>: {item.phone}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableWithoutFeedback
                style={styles.cardImageBox}
                onPress={() => this._moveToRoomDetail(item)}
              >
                <Image
                  style={styles.cardImage}
                  source={{ uri: item.picture.large }} />
              </TouchableWithoutFeedback>
              <View style={styles.cardDesBox}>
                <Text style={styles.cardDesText}>
                  Although dimensions are available immediately, they may change (e.g due to device rotation) so any rendering logic or styles that depend on these constants should try to
                </Text>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.cardBottomLeft}>
                  <Text style={styles.cardBottomIconText}>5</Text>
                  <TouchableOpacity>
                    <Ionicons style={styles.cardBottomIcon} name='ios-star' />
                  </TouchableOpacity>
                  <Text style={styles.cardBottomIconText}>3</Text>
                  <TouchableOpacity >
                    <Ionicons style={styles.cardBottomIcon} name='ios-chatbubbles' />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBottomRight}>
                  <TouchableOpacity >
                    <Ionicons style={styles.cardBottomIcon} name='ios-thumbs-up' />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons style={styles.cardBottomIcon} name='md-share' />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons style={styles.cardBottomIconRightEnd} name='md-flag' />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
          keyExtractor={item => item.email}

        /* horizontal={false}
        numColumns={3} */
        />
        {this.state.isActionButtonVisible ?
          <ActionButton buttonColor="#73aa2a">
            <ActionButton.Item buttonColor='#9b59b6' title="Đăng tin" onPress={() => this._setModalVisible(true)}>
              <Icon name="md-cloud-upload" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item buttonColor='#3498db' title="Nạp ví tiền" onPress={() => { }}>
              <Icon name="logo-usd" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            {/* <ActionButton.Item buttonColor='#1abc9c' title="All Tasks" onPress={() => { }}>
              <Icon name="md-done-all" style={styles.actionButtonIcon} />
            </ActionButton.Item> */}
          </ActionButton>
          : null}



        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => { alert("Modal has been closed.") }}
        >
          <View style={styles.searchFilterModalBox}>

            <View style={styles.searchFilterButtonBox} >

              <TouchableOpacity
                style={styles.searchFilterButtonCancel}
                onPress={() => {
                  this._setModalVisible(!this.state.modalVisible)
                }}>
                <Text style={styles.searchFilterButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.searchFilterButtonSubmit}
                onPress={() => {
                  this._setModalVisible(!this.state.modalVisible)
                }}>
                <Text style={styles.searchFilterButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>

          </View>
        </Modal>
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
  searchFilterButtonBox: {
    flex: 1,
    flexDirection: 'row',
    borderColor: 'black',
    justifyContent: 'flex-start',
  },
  searchFilterButtonCancel: {
    flex: 1,
    height: 50,
    backgroundColor: '#73aa2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  searchFilterButtonSubmit: {
    flex: 1,
    height: 50,
    backgroundColor: '#73aa2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchFilterButtonText: {
    color: '#fff',
  },
  card: {
    flex: 1,
    height: height * 0.8, //500,
    // borderBottomWidth: 0.5,
    borderColor: '#d6d7da',
    padding: 0,
    flexDirection: 'column',
  },
  cardHeader: {
    // flex: 2,
    flexDirection: 'row',
    padding: 20,
    // borderWidth: 1,
    // borderColor: 'green',
  },
  cardAvatarBox: {
    // flex: 1
  },
  cardAvatarImage: {
    borderRadius: Platform.OS === 'ios' ? 23 : 50,
    height: 45,
    width: 45,
  },
  cardAvatarTextBox: {
    flex: 4,
    paddingLeft: 20,
  },
  cardAvatarName: {
    fontSize: 17,
  },
  cardAvatarPhoneBox: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
  },
  cardAvatarPhoneIcon: {
    color: '#7E7E7E',
    fontSize: 15,
  },
  cardAvatarPhone: {
    color: '#7E7E7E',
    fontSize: 13,
    paddingLeft: 8,
  },
  cardImageBox: {
    flex: 6,
    paddingLeft: 20,
    paddingRight: 20,
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  cardImage: {
    flex: 1,

  },
  cardDesBox: {
    // flex: 2,
    padding: 20,
    backgroundColor: '#fff',
    // borderWidth: 1,
    // borderColor: 'red',

  },
  cardDesText: {
    color: '#7E7E7E',
  },
  cardBottom: {
    // flex: 1,
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    // paddingTop: 20,
    paddingBottom: 10,
    // borderWidth: 1,
    // borderColor: 'black',
  },
  cardBottomLeft: {
    flex: 1,
    flexDirection: 'row',
    // borderWidth: 1,
    // borderColor: 'black',
  },
  cardBottomRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // borderWidth: 1,
    // borderColor: 'black',
  },
  cardBottomIcon: {

    fontSize: 20,
    paddingRight: 20,
    paddingLeft: 5,
    color: '#8B8E8E',
  },
  cardBottomIconRightEnd: {
    fontSize: 20,
    paddingLeft: 5,
    color: '#8B8E8E',
  },
  cardBottomIconText: {
    color: '#8B8E8E',
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
