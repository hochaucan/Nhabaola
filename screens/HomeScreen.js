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
  Animated,
  ToastAndroid,
  Picker,
} from 'react-native';
import { WebBrowser, ImagePicker, Facebook, Google } from 'expo';
import { MonoText } from '../components/StyledText';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import { users } from '../components/examples/data';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import StarRating from 'react-native-star-rating';
import MapView from 'react-native-maps';
import Communications from 'react-native-communications';
import ModalDropdown from 'react-native-modal-dropdown';
import { TextInputMask } from 'react-native-masked-text';
import { GooglePlacesAutocomplete, } from 'react-native-google-places-autocomplete'; // 1.2.12
import Swiper from 'react-native-swiper';
//import FO_Category_GetAllData from '../api/FO_Category_GetAllData';


const homePlace = {
  description: 'Home',
  geometry: { location: { lat: 48.8152937, lng: 2.4597668 } },
};
const workPlace = {
  description: 'Work',
  geometry: { location: { lat: 48.8496818, lng: 2.2940881 } },
};

var { height, width } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

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
      mapRegion: { latitude: 10.7777935, longitude: 106.7068674, latitudeDelta: 0.03, longitudeDelta: 0.03 },
      roomCategory: [],

      // Post Room
      postRoomImage1: null,
      postRoomImage2: null,
      postRoomImage3: null,
      postRoomImage4: null,
      postRoomImage5: null,
      postRoomImage6: null,
      postRoomAddressMaker: {
        latitude: null,
        longitude: null,
      },

      // Login
      username: '',
      password: '',
      animation: {
        usernamePostionLeft: new Animated.Value(795),
        passwordPositionLeft: new Animated.Value(905),
        loginPositionTop: new Animated.Value(1402),
        statusPositionTop: new Animated.Value(1542)
      },

      // Register Account
      modalRegisterAccount: false,
      objectRegisterAccount: {
        cellPhone: null,
        password: null,
        confirmPassword: null,
      },
      registerCellPhone: null,
      registerPassword: null,
      registerConfirmPassword: null,
      registerConfirmCellPhone: null,
      registerAccountImage: null,
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
    //FO_Category_GetAllData();


  }

  componentWillMount() {
    this._getCategory();
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

  _pickPostRoomImage = async (imageNo) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    // console.log(result);
    if (!result.cancelled) {
      switch (imageNo) {
        case '1':
          console.log(result);
          this.setState({ postRoomImage1: result.uri });
          break;
        case '2':
          this.setState({ postRoomImage2: result.uri });
          break;
        case '3':
          this.setState({ postRoomImage3: result.uri });
          break;
        case 'registerAccountImage':
          this.setState({ registerAccountImage: result.uri });
          break;

        default:

      }
    }

  };

  _handleGoogleLogin = async () => {
    try {
      const { type, user } = await Google.logInAsync({
        androidStandaloneAppClientId: '297432470822-scsfjomce7e9b1u068mrvnbv68okgj2n.apps.googleusercontent.com',
        iosStandaloneAppClientId: '297432470822-3eeghi19b5vc25qs29vv1mb8dvbulc2o.apps.googleusercontent.com',
        androidClientId: '603386649315-9rbv8vmv2vvftetfbvlrbufcps1fajqf.apps.googleusercontent.com',
        iosClientId: '603386649315-vp4revvrcgrcjme51ebuhbkbspl048l9.apps.googleusercontent.com',
        scopes: ['profile', 'email']
      });

      switch (type) {
        case 'success': {
          Alert.alert(
            'Logged in!',
            `Hi ${user.name}!`,
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

  _handleFacebookLogin = async () => {
    try {
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(
        '1201211719949057', // Replace with your own app id in standalone app 485931318448821
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

  _registerAccount = () => {
    if (Platform.OS === 'android') {
      if (this.state.registerCellPhone === null) {
        ToastAndroid.showWithGravity('Vui lòng nhập Số Điện Thoại', ToastAndroid.SHORT, ToastAndroid.CENTER);
        return;
      }
      if (this.state.registerPassword === null) {
        ToastAndroid.showWithGravity('Vui lòng nhập mật khẩu', ToastAndroid.SHORT, ToastAndroid.CENTER);
        return;
      }
      if (this.state.registerPassword != this.state.registerConfirmPassword) {
        ToastAndroid.showWithGravity('Xác nhận mật khẩu không khớp với mật khẩu', ToastAndroid.SHORT, ToastAndroid.CENTER);
        return;
      }
      if (this.state.registerPassword != this.state.registerConfirmPassword) {
        ToastAndroid.showWithGravity('Vui lòng nhập mã xác nhận Số Điện Thoại', ToastAndroid.SHORT, ToastAndroid.CENTER);
        return;
      }
    } else {
      if (this.state.registerCellPhone === null) {
        Alert.alert('Oops!', 'Vui lòng nhập Số Điện Thoại');
        return;
      }
    }
  }

  _dropdown_onSelect(idx, value) {
    // BUG: alert in a modal will auto dismiss and causes crash after reload and touch. @sohobloo 2016-12-1
    //alert(`idx=${idx}, value='${value}'`);
    //console.debug(`idx=${idx}, value='${value}'`);

  }


  _getCategory() {
    fetch("http://nhabaola.vn/api/Category/FO_Category_GetAllData", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "PageIndex": "0",
        "PageCount": "5",
        "SessionKey": "Olala_SessionKey",
        "UserLogon": "100"
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {

        this.setState({
          //roomCategory: JSON.stringify(responseJson.obj)
          roomCategory: responseJson.obj.map((y) => { return y.CatName })
        })

        console.log(this.state.roomCategory)

        // {
        //   this.state.response.map((y) => {
        //     return (<Text>{y.prnt_usernamez}</Text>);
        //   })
        // }
      }).
      catch((error) => { console.log(error) });
  }

  render() {
    let { image } = this.state;
    return (
      <View style={styles.container}>


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

        {/* Action Button */}
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




        {/* Popup Reset Password */}
        <PopupDialog
          ref={(popupResetPassword) => { this.popupResetPassword = popupResetPassword; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title="Lấy lại mật khẩu" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{ marginBottom: 150, width: width * 0.9, height: Platform.OS === 'ios' ? height * 0.35 : height * 0.3, }}


        >

          <View>
            <Animated.View style={{ position: 'relative', left: this.state.animation.usernamePostionLeft, flexDirection: 'row', padding: 10, }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-call-outline' />
              <FormInput
                containerStyle={{ flex: 15 }}
                placeholder='Số điện thoại'
                autoCapitalize='sentences'
                keyboardType='phone-pad'
                underlineColorAndroid={'#fff'}
                onChangeText={(text) => this.setState({ text })}
                value={this.state.text}
              />

            </Animated.View>

          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
            <Button
              buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'ios-backspace', type: 'ionicon' }}
              title='Hủy'
              onPress={() => { this.popupResetPassword.dismiss() }}
            />

            <Button
              buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'md-checkmark', type: 'ionicon' }}
              title='Đồng ý' />
          </View>
        </PopupDialog>


        {/* Popup Login */}
        <PopupDialog
          ref={(popupLogin) => { this.popupLogin = popupLogin; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title="Đăng nhập" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{ marginBottom: 150, width: width * 0.9, height: Platform.OS === 'ios' ? height * 0.7 : height * 0.64 }}


        >
          <View>

            <Animated.View style={{ position: 'relative', left: this.state.animation.usernamePostionLeft, flexDirection: 'row', padding: 10, }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person-outline' />
              <FormInput
                containerStyle={{ flex: 15 }}
                placeholder='Số điện thoại'
                autoCapitalize='sentences'
                keyboardType='phone-pad'
              />
            </Animated.View>
            <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock-outline' />
              <FormInput
                containerStyle={{ flex: 15 }}
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
              <TouchableOpacity style={{ flex: 1, }}
                onPress={() => {
                  this.popupLogin.dismiss();
                  this.popupResetPassword.show();
                }}
              >
                <Text style={{ padding: 15, textAlign: 'center', }}>Quên mật khẩu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, }}
                onPress={() => {
                  this.popupLogin.dismiss();
                  //this.popupRegisterAccount.show();
                  this.setState({ modalRegisterAccount: true })
                }}
              >
                <Text style={{ padding: 15, textAlign: 'center' }}>Đăng ký mới</Text>
              </TouchableOpacity>
            </View>


            <FormLabel
              containerStyle={{
                alignItems: 'center', justifyContent: 'center',
                height: 50,
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
                onPress={this._handleGoogleLogin}
              />
              <SocialIcon
                type='twitter'
                raised={false}
                onPress={this._handleFacebookLogin}
              />
            </Animated.View>
          </View>
        </PopupDialog>

        {/* Popup Report */}
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

        {/* Popup Rating */}
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

        {/* Modal Register Account */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalRegisterAccount}
          onRequestClose={() => { alert("Modal has been closed.") }}
        >
          <ScrollView>
            <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity
                style={{}}
                onPress={() => this._pickPostRoomImage('registerAccountImage')}
              >
                <Ionicons style={{ opacity: 0.7, fontSize: 100, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-contact' />
                {this.state.registerAccountImage && <Image source={{ uri: this.state.registerAccountImage }} style={{ width: 80, height: 80, borderRadius: 100, marginTop: -90, marginLeft: 1, marginBottom: 10, }} />}
                <Text style={{}}>Hình đại diện</Text>
              </TouchableOpacity>

            </View>
            <View>
              <Animated.View style={{ position: 'relative', left: this.state.animation.usernamePostionLeft, flexDirection: 'row', padding: 10, }}>
                <Ionicons style={{ flex: 2, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person-outline' />
                <FormInput
                  containerStyle={{ flex: 15, }}
                  placeholder='Số điện thoại'
                  autoCapitalize='sentences'
                  keyboardType='numeric'
                  underlineColorAndroid={'#fff'}
                  onChangeText={(registerCellPhone) => this.setState({ registerCellPhone })}
                  value={this.state.registerCellPhone}
                />
                <TouchableOpacity>
                  <FormLabel
                    containerStyle={{
                      alignItems: 'center', justifyContent: 'center',

                    }}
                  >
                    (Xác nhận ĐT)
                </FormLabel>
                </TouchableOpacity>
                {/* <FormValidationMessage>
                {'This field is required'}
              </FormValidationMessage> */}
              </Animated.View>
              <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock-outline' />
                <FormInput
                  containerStyle={{ flex: 15 }}
                  placeholder='Mật khẩu'
                  secureTextEntry={true}
                  underlineColorAndroid={'#fff'}
                  value={this.state.registerPassword}
                  onChangeText={(registerPassword) => { this.setState({ registerPassword }) }}
                />
              </Animated.View>
              <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock-outline' />
                <FormInput
                  containerStyle={{ flex: 15 }}
                  placeholder='Xác nhận mật khẩu'
                  secureTextEntry={true}
                  underlineColorAndroid={'#fff'}
                  value={this.state.registerConfirmPassword}
                  onChangeText={(registerConfirmPassword) => { this.setState({ registerConfirmPassword }) }}
                />

              </Animated.View>
              <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>

                <FormInput
                  containerStyle={{ flex: 1, borderWidth: 0.6, borderColor: '#9B9D9D', borderRadius: 10, padding: 5, marginTop: 10, }}
                  placeholder='Mã xác nhận số điện thoại (4 số)'
                  secureTextEntry={true}
                  underlineColorAndroid={'#fff'}
                  keyboardType='numeric'
                  value={this.state.registerConfirmCellPhone}
                  onChangeText={(registerConfirmCellPhone) => { this.setState({ registerConfirmCellPhone }) }}
                />
              </Animated.View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
              <Button
                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                title='Hủy'
                onPress={() => {
                  this.setState({
                    modalRegisterAccount: false,
                    registerCellPhone: null,
                    registerPassword: null,
                    registerConfirmPassword: null,
                  })

                }}
              />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'md-checkmark', type: 'ionicon' }}
                title='Đăng ký'
                onPress={() => {
                  this._registerAccount();
                }}
              />
            </View>
          </ScrollView>
        </Modal>

        {/* Modal Post Room */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => { alert("Modal has been closed.") }}
        >
          <ScrollView style={{ paddingTop: 10, marginTop: 20, }}>
            <FormLabel>Hình ảnh</FormLabel>
            <View style={{
              height: 120, paddingRight: 20,
              paddingLeft: 20, flexDirection: 'row', justifyContent: 'space-between',

            }}>

              <TouchableOpacity
                style={{}}
                onPress={() => this._pickPostRoomImage('1')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage1 && <Image source={{ uri: this.state.postRoomImage1 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={{}}
                onPress={() => this._pickPostRoomImage('2')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage2 && <Image source={{ uri: this.state.postRoomImage2 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={{}}
                onPress={() => this._pickPostRoomImage('3')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage3 && <Image source={{ uri: this.state.postRoomImage3 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>

            </View>
            <View style={{
              height: 120, paddingRight: 20,
              paddingLeft: 20, flexDirection: 'row', justifyContent: 'space-between',

            }}>

              <TouchableOpacity
                style={{}}
                onPress={() => this._pickPostRoomImage('4')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage4 && <Image source={{ uri: this.state.postRoomImage4 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={{}}
                onPress={() => this._pickPostRoomImage('5')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage5 && <Image source={{ uri: this.state.postRoomImage5 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={{}}
                onPress={() => this._pickPostRoomImage('6')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage6 && <Image source={{ uri: this.state.postRoomImage6 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>

            </View>
            {/* <FormLabel style={{ borderBottomWidth: 0.7, borderColor: '#a4d227', marginTop: 15, }}>Địa chỉ</FormLabel> */}
            <View style={{ height: 270, padding: 20, }}>
              {/* <FormInput
                containerStyle={{ marginLeft: 0, marginRight: 0, }}
                placeholder='Vui lòng nhập địa chỉ'
                autoCapitalize='sentences'
                maxLength={300}
              /> */}




              <GooglePlacesAutocomplete
                placeholder="Vui lòng nhập địa chỉ"
                minLength={1} // minimum length of text to search
                autoFocus={false}
                returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                listViewDisplayed="auto" // true/false/undefined
                fetchDetails={true}
                renderDescription={row => row.description} // custom description render
                onPress={(data, details = null) => {
                  // 'details' is provided when fetchDetails = true
                  {/* console.log(data); */ }
                  console.log(details.geometry.location);

                  let currentMaker = {
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                  }
                  this.map.animateToRegion(currentMaker, 1000);

                  {/* this.setState({
                    postRoomAddressMaker: {
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    }
                  })
                  this.map.animateToCoordinate(this.state.postRoomAddressMaker, 1000); */}

                }}
                getDefaultValue={() => {
                  return ''; // text input default value
                }}
                query={{
                  // available options: https://developers.google.com/places/web-service/autocomplete
                  key: 'AIzaSyC2QhtACfVZ2cr9HVvxQuzxd3HT36NNK3Q',
                  language: 'vi', // language of the results
                  //types: '(cities)', // default: 'geocode'
                }}
                styles={{
                  description: {
                    fontWeight: 'bold',
                  },
                  predefinedPlacesDescription: {
                    color: '#1faadb',
                  },
                  textInputContainer: {
                    backgroundColor: '#fff',
                    height: 44,
                    //borderTopColor: '#7e7e7e',
                    borderBottomColor: '#b5b5b5',
                    borderTopWidth: 0,
                    borderBottomWidth: 0.5,
                    flexDirection: 'row',
                  },
                }}
                currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
                currentLocationLabel="Current location"
                nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                GoogleReverseGeocodingQuery={{
                  // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                }}
                GooglePlacesSearchQuery={{
                  // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                  rankby: 'distance',
                  types: 'food',
                }}
                filterReverseGeocodingByTypes={[
                  'locality',
                  'administrative_area_level_3',
                ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
                //predefinedPlaces={[homePlace, workPlace]}
                debounce={200}
              />






              <MapView
                style={{ height: 150, alignSelf: 'stretch' }}
                ref={ref => { this.map = ref; }}
                region={this.state.mapRegion}
                provider='google'
                showsUserLocation={false}
                showsMyLocationButton={false}
                followsUserLocation={false}
              >

                {this.state.postRoomAddressMaker.latitude ?
                  <MapView.Marker
                    coordinate={this.state.postRoomAddressMaker}
                    title='Im here'
                    description='Home'
                  >

                  </MapView.Marker>
                  : null}
              </MapView>


            </View>
            {/* <FormLabel style={{ borderBottomWidth: 0.7, borderColor: '#a4d227' }}>Thông tin chi tiết</FormLabel> */}
            <View style={{ height: 200, paddingTop: 20, }}>
              <View style={{ flexDirection: 'row', }}>
                <FormLabel style={{}}>Giá:</FormLabel>
                <TextInputMask
                  ref={'price'}
                  type={'money'}
                  options={{ suffixUnit: '', precision: 0, unit: '', separator: ' ' }}
                  style={{ flex: 1, paddingLeft: 25, paddingTop: Platform.OS === 'ios' ? 11 : 7, }}
                  placeholder=''
                  underlineColorAndroid='#fff'
                />
                <FormLabel>(đồng)</FormLabel>
                {/* <FormInput
                  containerStyle={{ flex: 1, paddingLeft: 29 }}
                  placeholder='Vui lòng nhập giá (triệu)'
                  autoCapitalize='sentences'
                  maxLength={300}
                  underlineColorAndroid='#fff'
                  keyboardType='numeric'
                /> */}
              </View>
              <View style={{ flexDirection: 'row', }}>
                <FormLabel style={{}}>Diện tích:</FormLabel>
                <TextInputMask
                  ref={'acreage'}
                  type={'only-numbers'}
                  style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 11 : 7, marginLeft: Platform.OS === 'ios' ? -11 : -5, }}
                  placeholder=''
                  underlineColorAndroid='#fff'
                />

                {/* <FormInput
                  containerStyle={{ flex: 1, }}
                  placeholder=''
                  autoCapitalize='sentences'
                  maxLength={300}
                  underlineColorAndroid='#fff'
                  keyboardType='numeric'
                  onFocus={() => {

                  }}
                /> */}
                <FormLabel>(mét vuông)</FormLabel>
              </View>
              <View style={{ flexDirection: 'row', }}>
                <FormLabel style={{}}>Loại BĐS:</FormLabel>
                <ModalDropdown
                  style={{ paddingTop: 15, marginLeft: -5, }}
                  dropdownStyle={{ padding: 10, width: 150 }}
                  textStyle={{}}
                  //options={['Nhà trọ', 'Khách sạn', 'Biệt thự', 'Vila', 'Đất thổ cư']}
                  options={this.state.roomCategory.sort()}
                  defaultIndex={0}
                  defaultValue='Nhà trọ'
                  onSelect={(idx, value) => this._dropdown_onSelect(idx, value)}
                >
                </ModalDropdown>
              </View>
              <FormLabel style={{ marginTop: 10, }}>Chi tiết:</FormLabel>
              <FormInput
                containerStyle={{ paddingLeft: 8, borderWidth: 0.5, borderColor: '#9B9D9D', borderRadius: 10, height: 140, }}
                placeholder='Vui lòng nhập thông tin chi tiết'
                multiline={true}
                autoCapitalize='sentences'
                maxLength={300}
                clearButtonMode='always'
                underlineColorAndroid='#fff'
              />

            </View>
            <View style={{ marginTop: 140, }}>
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
                  title='Đăng tin'
                  onPress={() => {

                  }}
                />
              </View>
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
