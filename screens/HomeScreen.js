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
  Share,
  Alert,
  Animated
} from 'react-native';
import { WebBrowser, ImagePicker, Facebook } from 'expo';
import { MonoText } from '../components/StyledText';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import { users } from '../components/examples/data';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon } from 'react-native-elements'
import StarRating from 'react-native-star-rating';
import MapView from 'react-native-maps';
import Communications from 'react-native-communications';




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
      reportCheck: false,
      starCount: 3.5,
      mapRegion: { latitude: 10.7777935, longitude: 106.7068674, latitudeDelta: 0.0922, longitudeDelta: 0.0421 },
      image: null,

      // Login
      username: '',
      password: '',
      animation: {
        usernamePostionLeft: new Animated.Value(795),
        passwordPositionLeft: new Animated.Value(905),
        loginPositionTop: new Animated.Value(1402),
        statusPositionTop: new Animated.Value(1542)
      }
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
    // Animation for Login

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

  ratingCompleted(rating) {
    console.log("Rating is: " + rating)
  }

  onStarRatingPress(rating) {
    this.popupRating.dismiss();
    this.setState({
      starCount: rating
    });

    // console.log(rating);
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    console.log(result);

    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }
  };

  _handleFacebookLogin = async () => {
    try {
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(
        '143030619610047', // Replace with your own app id in standalone app
        { permissions: ['public_profile'] }
      );

      switch (type) {
        case 'success': {
          // Get the user's name using Facebook's Graph API
          const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
          const profile = await response.json();
          Alert.alert(
            'Logged in!',
            `Hi ${profile.name}!`,
          );
          break;
        }
        case 'cancel': {
          Alert.alert(
            'Cancelled!',
            'Login was cancelled!',
          );
          break;
        }
        default: {
          Alert.alert(
            'Oops!',
            'Login failed!',
          );
        }
      }
    } catch (e) {
      Alert.alert(
        'Oops!',
        'Login failed!',
      );
    }
  };



  render() {
    let { image } = this.state;
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
                      {/* this.props.navigation.navigate('ProfileScreen', { key: 'CanHo' }); */ }
                    }}
                  >
                    <Image
                      style={styles.cardAvatarImage}
                      source={{ uri: item.picture.large }} />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardAvatarTextBox}>
                  <Text style={styles.cardAvatarName}>{item.name.first} {item.name.last}</Text>
                  <TouchableOpacity style={styles.cardAvatarPhoneBox}
                    onPress={() => { Communications.phonecall(item.phone, true) }}
                  >
                    <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />
                    <Text style={styles.cardAvatarPhone}>: {item.phone}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableWithoutFeedback
                style={styles.cardImageBox}
                onPress={() => this._moveToRoomDetail(item)}
              >
                {/* <Image
                  style={styles.cardImage}
                  source={{ uri: item.picture.large }} /> */}
                <Image
                  style={styles.cardImage}
                  source={require('../images/1.jpg')} />
              </TouchableWithoutFeedback>
              <View style={styles.cardDesBox}>
                <Text style={styles.cardDesText}>
                  Although dimensions are available immediately, they may change (e.g due to device rotation) so any rendering logic or styles that depend on these constants should try to
                </Text>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.cardBottomLeft}>
                  <Text style={styles.cardBottomIconText}>5</Text>
                  <TouchableOpacity
                    onPress={() => {
                      this.popupRating.show();
                    }}
                  >
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
                  <TouchableOpacity
                    onPress={() => {
                      Share.share({
                        message: item.name.first,
                        url: 'http://bam.tech',
                        title: 'Wow, did you see that?'
                      }, {
                          // Android only:
                          dialogTitle: 'Share BAM goodness',
                          // iOS only:
                          excludedActivityTypes: [
                            'com.apple.UIKit.activity.PostToTwitter'
                          ]
                        })
                    }}>
                    <Ionicons style={styles.cardBottomIcon} name='md-share' />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.popupDialog.show();
                    }}
                  >
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
            <ActionButton.Item buttonColor='#a4d227' title="Đăng nhập" onPress={() => {
              this.popupLogin.show()
              const timing = Animated.timing;
              Animated.parallel([
                timing(this.state.animation.usernamePostionLeft, {
                  toValue: 0,
                  duration: 900
                }),
                timing(this.state.animation.passwordPositionLeft, {
                  toValue: 0,
                  duration: 1100
                }),
                timing(this.state.animation.loginPositionTop, {
                  toValue: 0,
                  duration: 700
                }),
                timing(this.state.animation.statusPositionTop, {
                  toValue: 0,
                  duration: 700
                })

              ]).start()
            }}>
              <Icon name="ios-contact" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item buttonColor='#a4d227' title="Đăng tin" onPress={() => this._setModalVisible(true)}>
              <Icon name="md-cloud-upload" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item buttonColor='#a4d227' title="Nạp ví tiền" onPress={() => { }}>
              <Icon name="logo-usd" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            {/* <ActionButton.Item buttonColor='#1abc9c' title="All Tasks" onPress={() => { }}>
              <Icon name="md-done-all" style={styles.actionButtonIcon} />
            </ActionButton.Item> */}
          </ActionButton>
          : null}


        {/* Popup Login */}
        <PopupDialog
          ref={(popupLogin) => { this.popupLogin = popupLogin; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title="Đăng nhập" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{ marginBottom: 20, width: width * 0.9, height: height * 0.6 }}


        >
          <View>

            <Animated.View style={{ position: 'relative', left: this.state.animation.usernamePostionLeft, flexDirection: 'row', padding: 10, }}>
              <Ionicons style={{ fontSize: 22, }} name='ios-person-outline' />
              <FormInput
                containerStyle={{ flex: 1 }}
                placeholder='Số điện thoại'
                autoCapitalize='sentences'
                keyboardType='phone-pad'
              />
            </Animated.View>
            <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
              <Ionicons style={{ fontSize: 22, }} name='ios-lock-outline' />
              <FormInput
                containerStyle={{ flex: 1 }}
                placeholder='Mật khẩu'
                secureTextEntry={true}

              />
            </Animated.View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, }}>
              <Button
                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                title='Hủy'
                onPress={() => { this.popupLogin.dismiss() }}
              />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'md-checkmark', type: 'ionicon' }}
                title='Đăng nhập' />
            </View>



            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, }}>
              <TouchableOpacity style={{ flex: 1, }}>
                <Text style={{ padding: 15, textAlign: 'center' }}>Quên mật khẩu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, }}>
                <Text style={{ padding: 15, textAlign: 'center' }}>Đăng ký mới</Text>
              </TouchableOpacity>
            </View>


            <FormLabel
              containerStyle={{
                alignItems: 'center', justifyContent: 'center',
                height: 50, marginTop: 5,
              }}
            >
              ----- Hoặc đăng nhập bằng -----
            </FormLabel>

            <Animated.View style={{
              position: 'relative',
              top: this.state.animation.loginPositionTop, marginTop: 5, flexDirection: 'row',
              alignItems: 'center', justifyContent: 'center'

            }}>
              <SocialIcon
                type='facebook'
                raised={false}
                onPress={this._handleFacebookLogin}
              />
              <SocialIcon
                type='youtube'
                raised={false}
                onPress={this._handleFacebookLogin}
              />
            </Animated.View>





          </View>
        </PopupDialog>

        <PopupDialog
          ref={(popupDialog) => { this.popupDialog = popupDialog; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title="Báo cáo Nhà baola" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{ marginBottom: 10, width: width * 0.9 }}

        >
          <View>
            <CheckBox
              title='Không đúng địa chỉ'
              checked={this.state.reportCheck}
              onPress={() => {

              }}
            />
            <CheckBox
              title='Không gọi được'
              checked={this.state.checked}
            />
            <CheckBox
              title='Nhà đã cho thuê'
              checked={this.state.checked}
            />
            <View style={{ height: 80, flexDirection: 'row', marginBottom: 15, }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#9B9D9D', margin: 20, }}
                onPress={() => { this.popupDialog.dismiss() }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', padding: 10 }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#73aa2a', margin: 20, }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', padding: 10 }}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </PopupDialog>


        <PopupDialog
          ref={(popupRating) => { this.popupRating = popupRating; }}
          dialogAnimation={new ScaleAnimation()}
          dialogStyle={{ marginBottom: 10, width: width * 0.9, height: 100, justifyContent: 'center', padding: 20 }}
        >
          <StarRating
            disabled={false}
            maxStars={5}
            starColor={'#a4d227'}
            rating={this.state.starCount}
            selectedStar={(rating) => { this.onStarRatingPress(rating) }}
          />
        </PopupDialog>

        <PopupDialog
          ref={(popupPosting) => { this.popupPosting = popupPosting; }}
          dialogAnimation={new ScaleAnimation()}
          dialogStyle={{ marginBottom: 10, width: width * 0.9, height: height * 0.9 }}
          dialogTitle={<DialogTitle title="Đăng bài" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
        >
          <View>
            <Text>Đăng bài</Text>
          </View>
        </PopupDialog>


        {/* Post Room */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => { alert("Modal has been closed.") }}
        >
          <ScrollView style={{ paddingTop: 10, marginTop: 20, }}>
            <FormLabel>Hình ảnh</FormLabel>
            <View style={{ height: 100, padding: 20, flexDirection: 'row' }}>
              <Button
                title="Pick an image from camera roll"
                onPress={this._pickImage}
              />
              {image &&
                <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}


              <Ionicons style={{ fontSize: 80, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
              <Ionicons style={{ fontSize: 80, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
              <Ionicons style={{ fontSize: 80, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
            </View>
            <View style={{ height: 100, padding: 20, flexDirection: 'row' }}>
              <Ionicons style={{ fontSize: 80, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
              <Ionicons style={{ fontSize: 80, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
              <Ionicons style={{ fontSize: 80, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
            </View>
            <FormLabel style={{ borderBottomWidth: 0.7, borderColor: '#a4d227' }}>Địa chỉ</FormLabel>
            <View style={{ height: 200, padding: 20, }}>
              <FormInput
                placeholder='Vui lòng nhập địa chỉ'
                autoCapitalize='sentences'
                maxLength={300}
              />
              <MapView
                style={{ flex: 1 }}
                region={this.state.mapRegion}
              />
            </View>
            <FormLabel style={{ borderBottomWidth: 0.7, borderColor: '#a4d227' }}>Thông tin chi tiết</FormLabel>
            <View style={{ height: 200, paddingTop: 20 }}>

              <FormInput
                placeholder='Vui lòng nhập thông tin chi tiết'
                multiline={true}
                autoCapitalize='sentences'
                maxLength={300}
                clearButtonMode='always'
                underlineColorAndroid='#fff'
              />
              {/* <FormInput onChangeText={} /> */}
            </View>
            <View style={{ height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 50, }}>
              <Button
                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                onPress={() => {
                  this._setModalVisible(false)
                  this.setState({ image: null })
                }}
                title='Hủy' />
              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                icon={{ name: 'md-cloud-upload', type: 'ionicon' }}
                title='Đăng tin' />
            </View>

          </ScrollView>
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
    height: 100,

    flexDirection: 'row',
    borderWidth: 1
    // justifyContent: 'flex-start',
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
    textAlign: 'justify',
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
    paddingRight: 25,
    paddingLeft: 5,
    color: '#8B8E8E',
  },
  cardBottomIconRightEnd: {
    fontSize: 20,
    paddingLeft: 5,
    color: '#8B8E8E',
    textAlign: 'right',
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
