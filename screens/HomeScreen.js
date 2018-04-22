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
  ActivityIndicator,
  AsyncStorage,
  Keyboard,
} from 'react-native';
import { WebBrowser, ImagePicker, Facebook, Google, Notifications } from 'expo';
import { MonoText } from '../components/StyledText';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import StarRating from 'react-native-star-rating';
import MapView from 'react-native-maps';
import Communications from 'react-native-communications';
import { TextInputMask, TextMask } from 'react-native-masked-text';
import { GooglePlacesAutocomplete, } from 'react-native-google-places-autocomplete'; // 1.2.12
import Swiper from 'react-native-swiper';
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import uploadImageAsync from '../api/uploadImageAsync';
import saveStorageAsync from '../components/saveStorageAsync';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import convertAmountToWording from '../api/convertAmountToWording'
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import globalVariable from '../components/Global'

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


const roomBox = [];
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Trang chủ',
    title: 'Trang chủ',
    header: null,
  };


  constructor(props) {
    super(props);
    this.state = {
      sessionKey: null,
      //dataUsers: users,
      refresh: false,
      // txt: 'test threshole',
      isActionButtonVisible: true, // 1. Define a state variable for showing/hiding the action-button 
      modalVisible: false,
      modalResetPassword1: false,
      modalResetPassword2: false,
      modalReport: false,
      reportAddress: false,
      reportCall: false,
      reportHouse: false,
      starCount: 5,
      mapRegion: { latitude: 10.7777935, longitude: 106.7068674, latitudeDelta: 0.03, longitudeDelta: 0.03 },
      roomCategory: [],
      //roomBox: [],
      loadingIndicator: false,
      modalLoading: false,

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
      selectedCategory: '0',
      page: 1,
      roomPageIndex: 0,
      roomPageCount: 10,

      // Login
      modalLogin: false,
      profile: null,
      loginUsername: '',
      loginPassword: '',
      reAutoLoginUsername: '',
      reAutoLoginPassword: '',
      animation: {
        usernamePostionLeft: new Animated.Value(795),
        passwordPositionLeft: new Animated.Value(905),
        loginPositionTop: new Animated.Value(1402),
        statusPositionTop: new Animated.Value(1542)
      },

      // Register Account
      modalRegisterAccount: false,
      registerCellPhone: null,
      registerPassword: null,
      registerConfirmPassword: null,
      registerConfirmCellPhone: null,
      registerAccountImage: null,
      registerFullName: null,
      wallet: '0',
      //selected: false,
      refreshScreen: false,

      // Reset Password
      resetPasswordUsername: '',
      resetPasswordEmail: '',
      resetPasswordActiveKey: '',
      resetPasswordNewPassword: '',

      ratingRoomId: 0,
      reportRoomId: 0,
      flatListIsEnd: false,
      roomBoxByID: null,
      //reportResult:'',
    }

    // state = { selected: false };
  }
  // 2. Define a variable that will keep track of the current scroll position
  _listViewOffset = 0

  onRefreshScreen = async (data) => {
    await this.setState(data);

    //alert(this.state.loginUsername)
  }

  // static _onRefreshScreen = data => {
  //   this.setState(data);
  //   //alert(JSON.stringify(data))
  // }

  // onSelect = data => {
  //   this.setState(data);
  //   //this.data;
  //   // alert(JSON.stringify(data))

  //   // alert(this.state.selected)
  // };

  static refreshRoomBoxAfterPost = async () => {
    // alert("can")
    //this.setState({ refresh: true })
    try {
      await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_GetAllData", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "PageIndex": "0",
          "PageCount": "1",
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {
          // alert(JSON.stringify(roomBox))

          // roomBox.unshift(responseJson.obj)

          responseJson.obj.map((y) => {
            roomBox.unshift(y);
          })
          //this._saveStorageAsync('FO_RoomBox_GetAllData', JSON.stringify(responseJson.obj))


          //alert("can")


        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }
  }

  _saveStorageAsync = async (key, obj) => {
    try {
      await AsyncStorage.setItem(key, obj)
      //alert("Save OK")

    } catch (e) {
      console.log(e);
    }
  }
  _getStorageAsync = async (key) => {
    try {
      var v = await AsyncStorage.getItem(key);
      alert(v)
    } catch (e) {
      console.log(e);
    }
  }

  _refreshRoomBox() {
    this._getRoomBoxAsync(true);
    this._getWalletAsync();
  }

  componentDidMount() {

    // Register Push Notification
    this._notificationSubscription = this._registerForPushNotifications();

  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   // return a boolean value
  //   return true;
  // }

  // componentWillUpdate(nextProps, nextState) {
  //   // perform any preparations for an upcoming update
  //   if (this.state.refreshScreen) {
  //     alert("updated")
  //   }
  // }
  // componentWillReceiveProps() {
  //   // alert("can")
  // }
  // componentDidUpdate() {
  //   this._getProfileFromStorageAsync();
  //   //this._getRoomBoxAsync();
  // }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js

    //registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = async ({ origin, data }) => {
    //alert(JSON.stringify(data.params.roomBox))

    await this._getRoomByIDAsync(data.params.roomBoxID)
    //alert(JSON.stringify(this.state.roomBoxByID))
    this.props.navigation.navigate(data.screen, { ...this.state.roomBoxByID });

    // console.log(
    //   `Push notification ${origin} with data: ${JSON.stringify(data)}`
    // );
  };

  componentWillMount() {

    this._getCategoryAsync();
    this._getRoomBoxAsync(true);
    this._getProfileFromStorageAsync();
    this._getSessionKeyFromStorageAsync();

    // Remove Push Notification
    this._notificationSubscription && this._notificationSubscription.remove();
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

  _getProfileFromStorageAsync = async () => {
    try {
      //var _profile = await AsyncStorage.getItem('FO_Account_Login');
      var _username = await AsyncStorage.getItem('loginUsername');
      var _password = await AsyncStorage.getItem('loginPassword');

      //alert(_password)

      if (_username !== null && _password !== null) {
        await this.setState({
          reAutoLoginUsername: _username,
          reAutoLoginPassword: _password,
        })

        this._reAutoLoginAsync();
      }
      else { // Login false
        this.setState({
          profile: null,
        })
      }

    } catch (e) {
      console.log(e);
    }
  }

  _getSessionKeyFromStorageAsync = async () => {
    try {
      var value = await AsyncStorage.getItem('SessionKey');

      if (value !== null) {
        this.setState({
          sessionKey: JSON.parse(value)
        })
      }
      else {
        this.setState({
          sessionKey: null,
        })
      }

    } catch (e) {
      console.log(e);
    }
  }

  _moveToRoomDetail = (roombox) => {
    //alert(roomBox);
    this.props.navigation.navigate('RoomDetailScreen', { ...roombox });
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

  _pickImageAsync = async (source, imageNo) => {
    let result = null;

    if (source === 'library') {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
    }
    else {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
    }

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

  _reAutoLoginAsync = async () => {
    try {
      await fetch("http://nhabaola.vn/api/Account/FO_Account_Login", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        //body: JSON.stringify(this.state.objectRegisterAccount)
        body: JSON.stringify({
          "UserName": this.state.reAutoLoginUsername,
          "Password": this.state.reAutoLoginPassword
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          //alert(JSON.stringify(responseJson.obj.UpdatedBy))

          if (responseJson.obj.UpdatedBy != "") {

            saveStorageAsync('FO_Account_Login', JSON.stringify(responseJson.obj))
            saveStorageAsync('SessionKey', JSON.stringify(responseJson.obj.UpdatedBy))
            // saveStorageAsync('loginUsername', this.state.loginUsername)
            // saveStorageAsync('loginPassword', this.state.loginPassword)

            // alert(JSON.stringify(responseJson.obj))

            this.setState({
              profile: responseJson.obj,
              sessionKey: responseJson.obj.UpdatedBy
            })



          }
          else {
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity('Tài khoản hoặc mật khẩu đã thay đổi', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert('Oops!', 'Tài khoản hoặc mật khẩu đã thay đổi');
            }

            this.setState({ profile: null, sessionKey: null })
            saveStorageAsync('FO_Account_Login', '')
            saveStorageAsync('SessionKey', '')

          }

          //this._getStorageAsync('SessionKey')
          // var tmp = getStorageAsync('SessionKey')
          // alert(JSON.stringify(tmp))

          // this.popupLoadingIndicator.dismiss();
        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }


    if (this.state.profile !== null) {
      this._getWalletAsync();
    }
  }

  // Login by Phone
  _loginAsync = async () => {

    //Form validation
    if (Platform.OS === 'android') {
      if (this.state.loginUsername === '') {
        ToastAndroid.showWithGravity('Vui lòng nhập tài khoản', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
      if (this.state.loginPassword === '') {
        ToastAndroid.showWithGravity('Vui lòng nhập mật khẩu', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
    }
    else {
      if (this.state.loginUsername === '') {
        Alert.alert('Oops!', 'Vui lòng nhập tài khoản');
        return;
      }
      if (this.state.loginPassword === '') {
        Alert.alert('Oops!', 'Vui lòng nhập mật khẩu');
        return;
      }
    }

    if (Platform.OS == 'ios') {
      this.setState({ modalLoading: true })
    }
    else {
      this.popupLoadingIndicator.show()
    }


    try {
      await fetch("http://nhabaola.vn/api/Account/FO_Account_Login", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          "UserName": this.state.loginUsername,
          "Password": this.state.loginPassword
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {


          if (responseJson.obj.UpdatedBy != "") { // Login successful

            if (Platform.OS == 'ios') {
              this.setState({ modalLogin: false, })
            }
            else {
              this.popupLogin.dismiss()
            }

            saveStorageAsync('FO_Account_Login', JSON.stringify(responseJson.obj))
            saveStorageAsync('SessionKey', JSON.stringify(responseJson.obj.UpdatedBy))
            saveStorageAsync('loginUsername', this.state.loginUsername)
            saveStorageAsync('loginPassword', this.state.loginPassword)
            this.setState({
              loginUsername: '',
              loginPassword: '',
              profile: responseJson.obj,
              sessionKey: responseJson.obj.UpdatedBy
            })

            this._getWalletAsync();

            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity('Đăng nhập thành công!', ToastAndroid.SHORT, ToastAndroid.TOP);
            } else {
              // this.setState({ modalLogin: false })
              //Alert.alert('Thông báo', 'Đăng nhập thành công!');
            }

          }
          else { // Login False
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity('Tài khoản hoặc mật khẩu không đúng', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert('Oops!', 'Tài khoản hoặc mật khẩu không đúng');
            }

            saveStorageAsync('FO_Account_Login', '')
            saveStorageAsync('SessionKey', '')
            saveStorageAsync('loginUsername', '')
            saveStorageAsync('loginPassword', '')
            this.setState({ profile: null, sessionKey: null })
          }

          this.popupLoadingIndicator.dismiss();
          this.setState({ modalLoading: false })

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }
    // await this._getWalletAsync();
    // if (this.state.wallet != '0') {
    //   setTimeout(() => this.popupCongraForNewAccount.show(), 500)
    // }
  }

  // Login after register new Account
  _loginAfterRegisterAccountAsync = async () => {

    if (Platform.OS == 'android') {
      this.popupLoadingIndicator.show()
    }

    try {
      await fetch("http://nhabaola.vn/api/Account/FO_Account_Login", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          "UserName": this.state.loginUsername,
          "Password": this.state.loginPassword
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          if (responseJson.obj.UpdatedBy != "") { // Login successful
            this.popupLogin.dismiss();

            saveStorageAsync('FO_Account_Login', JSON.stringify(responseJson.obj))
            saveStorageAsync('SessionKey', JSON.stringify(responseJson.obj.UpdatedBy))
            saveStorageAsync('loginUsername', this.state.loginUsername)
            saveStorageAsync('loginPassword', this.state.loginPassword)
            this.setState({
              loginUsername: '',
              loginPassword: '',
              profile: responseJson.obj,
              sessionKey: responseJson.obj.UpdatedBy
            })

            ToastAndroid.showWithGravity('Đăng nhập thành công!', ToastAndroid.SHORT, ToastAndroid.TOP);

          }
          else { // Login False
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity('Tài khoản hoặc mật khẩu không đúng', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert('Oops!', 'Tài khoản hoặc mật khẩu không đúng');
            }

            saveStorageAsync('FO_Account_Login', '')
            saveStorageAsync('SessionKey', '')
            saveStorageAsync('loginUsername', '')
            saveStorageAsync('loginPassword', '')
            this.setState({ profile: null, sessionKey: null })
          }

          this.popupLoadingIndicator.dismiss();
        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

    await this._getWalletAsync();
    if (this.state.wallet != '0') {
      if (Platform.OS == 'ios') {
        Alert.alert('Chúc mừng bạn! ', 'Bạn được tặng ' + numberWithCommas(this.state.wallet) + ' đồng vào Ví Tiền');
      } else {
        setTimeout(() => this.popupCongraForNewAccount.show(), 500)
      }
    }
  }

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
        '485931318448821', // Replace with your own app id in standalone app 485931318448821, Test AppID: 1201211719949057
        { permissions: ['public_profile', 'email'] }
      );

      switch (type) {
        case 'success': {
          // Get the user's name using Facebook's Graph API
          const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
          const profile = await response.json();
          // Alert.alert(
          //   'Logged in!',
          //   `Hi ${profile.name}!`,
          // );

          Alert.alert(
            'Logged in!',
            `${JSON.stringify(profile)}!`,
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

  _registerAccountAsync = async () => {

    //Form validation
    if (Platform.OS === 'android') {
      if (this.state.registerCellPhone === null) {
        ToastAndroid.showWithGravity('Vui lòng nhập Số Điện Thoại', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
      if (this.state.registerPassword === null) {
        ToastAndroid.showWithGravity('Vui lòng nhập mật khẩu', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
      if (this.state.registerPassword != this.state.registerConfirmPassword) {
        ToastAndroid.showWithGravity('Xác nhận mật khẩu không khớp với mật khẩu', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
      if (this.state.registerFullName === null) {
        ToastAndroid.showWithGravity('Vui lòng nhập Họ Tên', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
      if (this.state.registerConfirmCellPhone === null) {
        ToastAndroid.showWithGravity('Vui lòng nhập mã xác nhận Số Điện Thoại', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
    }
    else {
      if (this.state.registerCellPhone === null) {
        Alert.alert('Oops!', 'Vui lòng nhập Số Điện Thoại');
        return;
      }
      if (this.state.registerPassword === null) {
        Alert.alert('Oops!', 'Vui lòng nhập mật khẩu');
        return;
      }
      if (this.state.registerPassword != this.state.registerConfirmPassword) {
        Alert.alert('Oops!', 'Xác nhận mật khẩu không khớp với mật khẩu');
        return;
      }
      if (this.state.registerFullName === null) {
        Alert.alert('Oops!', 'Vui lòng nhập Họ Tên');
        return;
      }
      if (this.state.registerConfirmCellPhone === null) {
        Alert.alert('Oops!', 'Vui lòng nhập mã xác nhận Số Điện Thoại');
        return;
      }
    }

    await this.setState({ modalRegisterAccount: false, })
    this.popupLoadingIndicator.show();



    let uploadResponse = await uploadImageAsync(this.state.registerAccountImage);
    let uploadResult = await uploadResponse.json();

    //Set account object
    await this.setState({

      objectRegisterAccount: {
        Avarta: uploadResult.location,
        UserName: this.state.registerCellPhone,
        FullName: this.state.registerFullName,
        Email: "",
        Sex: "",
        YearOfBirth: "2017-10-09",
        Address: "5 Hello 10 Hi 15 Hehe",
        ContactPhone: this.state.registerCellPhone,
        Password: this.state.registerPassword,
        RegistryDate: "2017-10-09",
        IsActive: "true",
        CreatedDate: "2017-10-09",
        CreatedBy: "10",
        UpdatedBy: "Olala_SessionKey",
        UpdatedDate: "2017-10-09"
      },

    })
    // console.log(JSON.stringify(this.state.objectRegisterAccount))
    //Post to register account
    try {
      await fetch("http://nhabaola.vn/api/Account/FO_Account_Add", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.objectRegisterAccount)


        // body: JSON.stringify({
        //   "UserName": "UserName",
        //   "FullName": "Nguyen Van A",
        //   "Email": "Email@gmail.com",
        //   "Sex": "Nam",
        //   "YearOfBirth": "2017-10-09",
        //   "Address": "5 Hello 10 Hi 15 Hehe",
        //   "ContactPhone": "0919999888",
        //   "Password": "Passwordvinaphuc",
        //   "RegistryDate": "2017-10-09",
        //   "IsActive": "true",
        //   "CreatedDate": "2017-10-09",
        //   "CreatedBy": "10",
        //   "UpdatedBy": "Olala_SessionKey",
        //   "UpdatedDate": "2017-10-09"
        // }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          this.setState({
            modalRegisterAccount: false, //Close register account modal
            modalRegisterAccount: false,
            registerCellPhone: null,
            registerPassword: null,
            registerConfirmPassword: null,
            registerAccountImage: null,
            registerFullName: null,
            registerConfirmCellPhone: null,
          })

          this.popupLoadingIndicator.dismiss();
        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }


  }

  // _postImage = async () => {
  //   var can = 'http://uploads.im/api?upload=http://www.google.com/images/srpr/nav_logo66.png'
  //   // console.log(JSON.stringify(this.state.objectRegisterAccount))
  //   //Post to register account
  //   try {
  //     await fetch(can)
  //       .then((response) => response.json())
  //       .then((responseJson) => {

  //         //alert(JSON.stringify(responseJson))
  //         console.log(responseJson)

  //       })
  //       .catch((e) => { console.log(e) });
  //   } catch (error) {
  //     console.log(error)
  //   }


  // }

  _getRoomByIDAsync = async (roomID) => {
    try {
      await fetch("http://nhabaola.vn//api/RoomBox/FO_RoomBox_Get/" + roomID, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({
        //   "PageIndex": "0",
        //   "PageCount": "100",
        //   "SessionKey": "Olala_SessionKey",
        //   "UserLogon": "100"
        // }),
      })
        .then((response) => response.json())
        .then((responseJson) => {
         // alert(JSON.stringify(responseJson))
          this.setState({ roomBoxByID: responseJson.obj })

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  _getCategoryAsync = async () => {
    try {
      await fetch("http://nhabaola.vn/api/Category/FO_Category_GetAllData", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "PageIndex": "0",
          "PageCount": "100",
          "SessionKey": "Olala_SessionKey",
          "UserLogon": "100"
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          this._saveStorageAsync('FO_Category_GetAllData', JSON.stringify(responseJson.obj))


          this.setState({
            //roomCategory: JSON.stringify(responseJson.obj)
            // roomCategory: responseJson.obj.map((y) => { return y.CatName })
            //roomCategory: JSON.parse(this._getCategoryAsync('roomCategory'))
            roomCategory: responseJson.obj
          })

          //this._getStorageAsync('roomCategory')
          // this._getStorageAsync('roomCategory')

          // {
          //   this.state.response.map((y) => {
          //     return (<Text>{y.prnt_usernamez}</Text>);
          //   })
          // }
        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  _postRatingByRoom = async (_rate, _roomId) => {

    // alert(_roomId + "  " + _rate + "  " + this.state.profile.ID + "  " + this.state.sessionKey)

    try {
      await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_SetLike", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "ID": _roomId,
          "Point": _rate,
          "CreatedBy": this.state.profile.ID,
          "UpdatedBy": this.state.sessionKey,
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          if (JSON.stringify(responseJson.ErrorCode) === "0") { // Rating successful
            this.popupRating.dismiss();

            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity('Cảm ơn bạn đã đánh giá!', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert('Thông báo', 'Cảm ơn bạn đã đánh giá!');
            }
            // this.popupActiveNewPassword.dismiss();
            // this.setState({ resetPasswordUsername: '' })
            // this.setState({
            //   loginUsername: this.state.resetPasswordUsername,
            //   loginPassword: resetPasswordNewPassword,
            // })

            // this._loginAsync();
          }

          // this.setState({
          //   //roomCategory: JSON.stringify(responseJson.obj)
          //   // roomCategory: responseJson.obj.map((y) => { return y.CatName })
          //   //roomCategory: JSON.parse(this._getCategoryAsync('roomCategory'))
          //   roomCategory: responseJson.obj
          // })


        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  _reportNBLAsync = async (_reportTypeId, _roomId) => {

    // alert(_roomId + "  " + _rate + "  " + this.state.profile.ID + "  " + this.state.sessionKey)

    if (Platform.OS == 'ios') {
      this.setState({ modalLoading: true })
    }
    else {
      this.popupLoadingIndicator.show()
    }

    try {
      await fetch("http://nhabaola.vn/api/ReportComment/FO_ReportComment_Add", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "RoomBoxId": _roomId,
          "ReportTypeID": _reportTypeId,
          "UserID": this.state.profile.ID,
          "CreatedBy": this.state.profile.ID,
          "UpdatedBy": this.state.sessionKey,
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          if (JSON.stringify(responseJson.ErrorCode) === "0") { // Report successful
            this.popupReportNBL.dismiss();

            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity('Cảm ơn bạn đã báo cáo chúng tôi!', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              this.setState({ modalReport: false, })
              //Alert.alert('Thông báo', 'Cảm ơn bạn đã báo cáo chúng tôi!');
            }

            this.setState({
              reportAddress: false,
              reportCall: false,
              reportHouse: false,
            })

          }

          if (Platform.OS == 'ios') {
            this.setState({ modalLoading: false })
          }
          else {
            this.popupLoadingIndicator.dismiss()
          }

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  _getRoomBoxAsync = async (isNew) => {
    await this.setState({ refresh: true })

    if (!isNew) { // Loading more page 
      this.setState((prevState, props) => ({
        page: prevState.page + 1,
      }));
    }
    else { // Refresh page
      roomBox = [];
      this.setState({ page: 1, flatListIsEnd: false })
    }

    this.setState({ // Calculate page index
      roomPageIndex: (this.state.page - 1) * this.state.roomPageCount
    })

    //alert(this.state.roomPageIndex)

    try {
      await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_GetAllData", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "PageIndex": this.state.roomPageIndex,
          "PageCount": this.state.roomPageCount

        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {



          //this._saveStorageAsync('FO_RoomBox_GetAllData', JSON.stringify(responseJson.obj))
          // responseJson.obj.map((y) => { return y.CatName })


          responseJson.obj.map((y) => {
            roomBox.push(y);
          })
          // if (isNew) {
          //   responseJson.obj.map((y) => {
          //     roomBox.unshift(y);
          //   })
          // } else {
          //   responseJson.obj.map((y) => {
          //     roomBox.push(y);
          //   })
          // }

          //roomBox.push(responseJson.obj);

          // this.setState({
          //   roomBox: responseJson.obj,
          //   refresh: false,
          // })

          // this.setState({ refresh: false })

          setTimeout(
            () => {
              this.setState({
                refresh: false
              })
            },
            1000);

          // End Flatlist
          if (JSON.stringify(responseJson.obj.length) == '0') {
            this.setState({ flatListIsEnd: true, })
            // alert(JSON.stringify(responseJson.obj.length))
          }

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  _getWalletAsync = async () => {
    //  await this.setState({ refresh: true })  

    // alert(this.state.wallet)

    try {
      await fetch("http://nhabaola.vn/api/Wallet/FO_Wallet_GetDataByUserID", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "UserID": this.state.profile.ID,
          "CreatedBy": this.state.profile.ID,
          "UpdatedBy": this.state.profile.UpdatedBy,
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {
          // alert(JSON.stringify(responseJson.obj))

          if (responseJson.obj !== null) {
            saveStorageAsync('FO_Wallet_GetDataByUserID', JSON.stringify(responseJson.obj[0].CurrentAmount))
            this.setState({
              wallet: responseJson.obj[0].CurrentAmount,
            })
          }

          //alert(JSON.stringify(this.state.wallet[0].CurrentAmount))
          //this._saveStorageAsync('FO_RoomBox_GetAllData', JSON.stringify(responseJson.obj))
          // responseJson.obj.map((y) => { return y.CatName })


          //   this.setState({ refresh: false })

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }


  _resetPasswordStep1 = async () => {
    //alert(this.state.resetPasswordUsername)
    //Form validation
    if (Platform.OS === 'android') {
      if (this.state.resetPasswordUsername === '') {
        ToastAndroid.showWithGravity('Vui lòng nhập số điện thoại', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
      // if (this.state.resetPasswordEmail === null) {
      //   ToastAndroid.showWithGravity('Vui lòng nhập email đã đăng ký', ToastAndroid.SHORT, ToastAndroid.TOP);
      //   return;
      // }
    }
    else {
      if (this.state.resetPasswordUsername === '') {
        Alert.alert('Oops!', 'Vui lòng nhập số điện thoại');
        return;
      }
      // if (this.state.resetPasswordEmail === null) {
      //   Alert.alert('Oops!', 'Vui lòng nhập email đã đăng ký');
      //   return;
      // }
    }

    if (Platform.OS == 'ios') {
      this.setState({ modalLoading: true })
    } else {
      this.popupLoadingIndicator.show()
    }


    try {
      await fetch("http://nhabaola.vn/api/ForgetPassword/FO_ForgetPassword_Add/", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "UserName": this.state.resetPasswordUsername,
          //  "Email": this.resetPasswordEmail,
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          // this._saveStorageAsync('FO_Category_GetAllData', JSON.stringify(responseJson.obj))
          if (JSON.stringify(responseJson.ErrorCode) === "23") {

            if (Platform.OS == 'ios') {
              Alert.alert('Thông báo', 'Tài khoản này không tồn tại');
            } else {
              ToastAndroid.showWithGravity('Tài khoản này không tồn tại', ToastAndroid.SHORT, ToastAndroid.TOP);
            }

            //Loading
            if (Platform.OS == 'ios') {
              this.setState({ modalLoading: false })
            } else {
              this.popupLoadingIndicator.dismiss()
            }

            return;
          }
          if (JSON.stringify(responseJson.ErrorCode) === "24") { //Account is exist

            if (Platform.OS == 'ios') {
              this.popupLoadingIndicator.dismiss()
              this.setState({ modalResetPassword1: false, modalResetPassword2: true })

            } else {
              this.popupLoadingIndicator.dismiss()
              this.popupResetPassword.dismiss();
              this.popupActiveNewPassword.show();
            }
          }

          // Loading
          if (Platform.OS == 'ios') {
            this.setState({ modalLoading: false })
          } else {
            this.popupLoadingIndicator.dismiss()
          }


        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  _resetPasswordStep2 = async () => {

    //Form validation
    if (Platform.OS === 'android') {
      if (this.state.resetPasswordActiveKey === '') {
        ToastAndroid.showWithGravity('Vui lòng nhập Mã Kích Hoạt', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
      if (this.state.resetPasswordNewPassword === '') {
        ToastAndroid.showWithGravity('Vui lòng nhập mật khẩu mới', ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
    }
    else {
      if (this.state.resetPasswordActiveKey === '') {
        Alert.alert('Oops!', 'Vui lòng nhập Mã Kích Hoạt');
        return;
      }
      if (this.state.resetPasswordNewPassword === '') {
        Alert.alert('Oops!', 'Vui lòng nhập mật khẩu mới');
        return;
      }
    }

    //Loading
    if (Platform.OS == 'ios') {
      this.setState({ modalLoading: true })
    } else {
      this.popupLoadingIndicator.show()
    }


    // Get Username and new Password after Reset password
    await this.setState({
      loginUsername: this.state.resetPasswordUsername,
      loginPassword: this.state.resetPasswordNewPassword,
    })

    try {
      await fetch("http://nhabaola.vn/api/ForgetPassword/FO_ForgetPassword_ActiveAccount", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({

          "UserName": this.state.resetPasswordUsername,
          "ActiveKey": this.state.resetPasswordActiveKey,
          "NewPassword": this.state.resetPasswordNewPassword,
          "SessionKey": this.state.resetPasswordUsername,
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          // this._saveStorageAsync('FO_Category_GetAllData', JSON.stringify(responseJson.obj))

          if (JSON.stringify(responseJson.ErrorCode) === "0") { // Reset password successful
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity('Lấy lại mật khẩu thành công!', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert('Thông báo', 'Lấy lại mật khẩu thành công!');
            }
            this.popupActiveNewPassword.dismiss();
            this.setState({ resetPasswordUsername: '' })

            // Login after reset password
            this._loginAfterRegisterAccountAsync();
          }
          else {
            if (Platform.OS === 'android') { // Active Code not correct
              ToastAndroid.showWithGravity('Mã kích hoạt không đúng', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert('Thông báo', 'Mã kích hoạt không đúng');
            }

            this.refs.ActiveKeyInput.focus()
          }

          if (Platform.OS == 'ios') {
            this.setState({ modalLoading: false })
          } else {
            this.popupLoadingIndicator.dismiss()
          }

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  // _sendProps() {
  //   // this.props.navigator.push({
  //   //   name: 'ProfileScreen'
  //   // })

  //   this.props.navigation.navigate('ProfileScreen', {
  //     passProfile: {
  //       name: 'Can HO',
  //       age: '16'
  //     }
  //   });
  // }


  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }


  render() {
    let { image } = this.state;

    return (
      // <View style={styles.container} key={this.state.refreshScreen}>
      <View style={styles.container} key={this.state.refreshScreen}>

        <FlatList
          //onScroll={this._onScroll}
          // ref='homepage'
          refreshing={this.state.refresh}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          initialNumToRender={2}
          shouldItemUpdate={this._shouldItemUpdate}
          onRefresh={() => { this._refreshRoomBox() }}

          onEndReachedThreshold={0.2}
          onEndReached={() => {
            // this.setState({
            //   refresh: true
            // });
            if (this.state.flatListIsEnd == false) {
              this._getRoomBoxAsync(false);
            }

            {/* this.setState({
              refresh: true
            }); */}
          }}

          data={roomBox}//{this.state.dataUsers}
          extraData={this.state}
          renderItem={({ item }) =>
            <View style={{
              flex: 1,
              height: height * 0.8,
              borderColor: '#d6d7da',
              padding: 0,
              flexDirection: 'column',
              //backgroundColor: item.IsHighlight ? '#a4d227' : '#fff'
            }}>
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
                      source={{ uri: item.AccountAvarta }} />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardAvatarTextBox}>
                  <Text style={styles.cardAvatarName}>{item.AccountName}</Text>
                  <TouchableOpacity style={styles.cardAvatarPhoneBox}
                    onPress={() => { Communications.phonecall(item.ContactPhone, true) }}
                  >
                    <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />
                    <Text style={styles.cardAvatarPhone}>: {item.ContactPhone}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Highlight */}
              {item.IsHighlight &&
                <Image
                  style={{
                    position: 'absolute', right: 15, zIndex: 10, width: responsiveWidth(30),
                    height: responsiveWidth(30), top: 20
                  }}
                  source={require('../assets/images/nbl-highlight.gif')}
                />
              }

              {/* Wartermark */}
              <Image
                style={{
                  position: 'absolute', top: 270, right: 15, zIndex: 10, opacity: 0.5,
                  width: responsiveWidth(15),
                  height: responsiveWidth(15), borderRadius: 100,
                }}
                source={require('../images/app-icon.png')}
              />

              <TouchableWithoutFeedback
                style={{
                  flex: 6,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
                onPress={() => {
                  //this._sendProps();
                  //this._moveToRoomDetail(item)
                  alert(JSON.stringify(item))
                  this.props.navigation.navigate('RoomDetailScreen', { item });
                }
                }
              >


                <Image
                  style={styles.cardImage}
                  //source={require('../images/1.jpg')}
                  source={item.Title !== "" ? { uri: item.Title } : require("../images/nha-bao-la.jpg")}
                />



              </TouchableWithoutFeedback>
              <View style={{ flexDirection: 'row', paddingLeft: 20, paddingRight: 20, paddingTop: 5, paddingBottom: 5, marginTop: -50, backgroundColor: '#000', opacity: 0.6 }}>
                {/* <TextMask
                  style={{ flex: 1, color: '#fff', fontSize: 15 }}
                  value={item.Price}
                  type={'money'}
                  options={{ suffixUnit: ' đ', precision: 0, unit: 'Giá:   ', separator: ' ' }}
                /> */}
                <Text
                  style={{
                    flex: 1, color: '#fff', fontWeight: '300',
                    fontSize: responsiveFontSize(1.7)
                  }}>
                  Giá: {convertAmountToWording(item.Price)}
                </Text>

                {

                  this.state.roomCategory.map((y, i) => {
                    return (
                      y.ID == item.CategoryID &&
                      <Text
                        style={{
                          flex: 2, color: '#fff', fontWeight: '300',
                          fontSize: responsiveFontSize(1.7), textAlign: 'right'
                        }}
                        key={i}>{y.CatName}:  {item.Acreage} m</Text>
                      // : null
                    )
                  })
                }
                {/* <Text style={{ flex: 1, textAlign: 'right', color: '#fff' }}> {item.CategoryID} Diện tích:   {item.Acreage} m</Text> */}
                <Text style={{ fontSize: 8, marginBottom: 5, color: '#fff' }}>2</Text>

              </View>
              <View style={styles.cardDesBox}>



                <Text style={{
                  fontSize: responsiveFontSize(1.8)
                }}
                  ellipsizeMode='tail'
                  numberOfLines={2}
                >
                  Địa chỉ:   {item.Address}</Text>
                <Text
                  style={{ marginTop: 10, color: '#9B9D9D', fontSize: responsiveFontSize(1.8) }}
                  ellipsizeMode='tail'
                  numberOfLines={2}
                >
                  {item.Description}</Text>

                {/* <Text style={styles.cardDesText}>
                  {item.Description}
                </Text> */}
                {/* <Text>{item.Images.split('|')[2]}</Text> */}
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.cardBottomLeft}>
                  <Text style={styles.cardBottomIconText}>{item.Point}</Text>

                  {/* Rating */}
                  <TouchableOpacity
                    onPress={async () => {
                      if (this.state.profile === null) {
                        if (Platform.OS == 'ios') {
                          Alert.alert('Thông Báo', 'Bạn vui lòng đăng nhập')
                        } else {
                          ToastAndroid.showWithGravity("Bạn vui lòng đăng nhập!", ToastAndroid.SHORT, ToastAndroid.TOP)
                        }
                      } else {
                        await this.setState({
                          ratingRoomId: item.ID,
                          starCount: parseFloat(item.Point)
                        })
                        this.popupRating.show();
                      }
                    }}
                  >
                    <Ionicons style={styles.cardBottomIcon} name='ios-star' />
                  </TouchableOpacity>
                  <Text style={styles.cardBottomIconText}></Text>

                  {/* Comment */}
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('RoomDetailScreen', { item, isComment: true });
                    }}
                  >
                    <Ionicons style={styles.cardBottomIcon} name='ios-chatbubbles' />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBottomRight}>
                  {/* <TouchableOpacity >
                    <Ionicons style={styles.cardBottomIcon} name='ios-thumbs-up' />
                  </TouchableOpacity> */}
                  <TouchableOpacity
                    onPress={async () => {

                      let loadBDS = '';
                      await this.state.roomCategory.map((y, i) => {
                        if (y.ID == item.CategoryID) {
                          loadBDS = y.CatName
                        }



                      })

                      if (Platform.OS == 'ios') {
                        Share.share({
                          message: "*Chia Sẻ từ Ứng Dụng Nhà Bao La*"
                            + "\n\nLiên hệ: " + item.AccountName + "\nĐiện thoại: " + item.ContactPhone
                            + "\n\nLoại bất động sản: " + loadBDS
                            + "\nGiá: " + item.Price + " đồng"
                            + "\nDiện tích: " + item.Acreage + " mét vuông"
                            + "\nĐịa chỉ: " + item.Address + "\n\nMô tả:\n" + item.Description
                            + "\n\nCài đặt: "
                            + "\niOS: \nhttps://itunes.apple.com/vn/app/nhabaola/id1287451307?mt=8"
                            + "\n\nAndroid: \nhttps://play.google.com/store/apps/details?id=vn.nhabaola.nhabaola",
                          url: '',
                          title: '*Chia Sẻ từ Ứng Dụng Nhà Bao La*'
                        }, {
                            // Android only:
                            dialogTitle: '*Chia Sẻ từ Ứng Dụng Nhà Bao La*',
                            // iOS only:
                            excludedActivityTypes: [
                              'http://nhabaola.vn'
                            ]
                          })
                      } else { //Android
                        Share.share({
                          message: "*Chia Sẻ từ Ứng Dụng Nhà Bao La*"
                            + "\n\nLiên hệ: " + item.AccountName + "\nĐiện thoại: " + item.ContactPhone
                            + "\n\nLoại bất động sản: " + loadBDS
                            + "\nGiá: " + item.Price + " đồng"
                            + "\nDiện tích: " + item.Acreage + " mét vuông"
                            + "\nĐịa chỉ: " + item.Address + "\n\nMô tả:\n" + item.Description
                            + "\n\nCài đặt: "
                            + "\niOS: \nhttps://itunes.apple.com/vn/app/nhabaola/id1287451307?mt=8"
                            + "\n\nAndroid: \nhttps://play.google.com/store/apps/details?id=vn.nhabaola.nhabaola",
                          url: 'http://nhabaola.vn',
                          title: '*Chia Sẻ từ Ứng Dụng Nhà Bao La*'
                        }, {
                            // Android only:
                            dialogTitle: '*Chia Sẻ từ Ứng Dụng Nhà Bao La*',
                            // iOS only:
                            excludedActivityTypes: [
                              'http://nhabaola.vn'
                            ]
                          })
                      }
                    }}>
                    <Ionicons style={styles.cardBottomIcon} name='md-share' />
                  </TouchableOpacity>

                  {/* Report Admin */}
                  <TouchableOpacity
                    onPress={async () => {
                      if (this.state.profile === null) {
                        if (Platform.OS == 'ios') {
                          Alert.alert('Thông Báo', 'Bạn vui lòng đăng nhập')
                        } else {
                          ToastAndroid.showWithGravity("Bạn vui lòng đăng nhập!", ToastAndroid.SHORT, ToastAndroid.TOP)
                        }
                      } else {
                        await this.setState({
                          reportRoomId: item.ID,
                        })

                        if (Platform.OS == 'ios') {
                          this.setState({ modalReport: true })
                        } else {
                          this.popupReportNBL.show();
                        }

                      }
                    }}
                  >
                    <Ionicons style={styles.cardBottomIconRightEnd} name='md-flag' />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
          keyExtractor={item => item.ID + 'nhabaola'}

        /* horizontal={false}
        numColumns={3} */
        />
        {this.state.refresh && Platform.OS == 'ios' &&
          <View style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator
              style={{}}
              animating={true}
              size="small"
              color="#73aa2a"
            />
          </View>
        }
        {/* Action Button */}
        {this.state.isActionButtonVisible ?
          <ActionButton buttonColor="#73aa2a"
          //bgColor={"red"}
          >

            {this.state.profile === null &&
              <ActionButton.Item buttonColor='#a4d227'
                textContainerStyle={{ backgroundColor: '#73aa2a' }}
                textStyle={{ color: '#fff' }}
                title="Đăng nhập" onPress={() => {


                  if (Platform.OS == 'ios') {
                    this.setState({ modalLogin: true })
                  } else {
                    this.popupLogin.show()
                  }


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
            }
            <ActionButton.Item buttonColor='#a4d227'
              textContainerStyle={{ backgroundColor: '#73aa2a' }}
              textStyle={{ color: '#fff' }}
              title="Đăng tin" onPress={() => {
                this.state.profile
                  ?
                  //this.props.navigation.navigate('PostRoomScreen', { onSelect: this.onSelect })
                  this.props.navigation.navigate('PostRoomScreen', {
                    onRefreshScreen: this.onRefreshScreen,
                    _getWalletAsync: this._getWalletAsync,
                  })
                  :
                  Platform.OS === 'android'
                    ? ToastAndroid.showWithGravity('Vui lòng đăng nhập', ToastAndroid.SHORT, ToastAndroid.TOP)
                    : Alert.alert("Vui lòng đăng nhập")


                //this.popupLogin.show();
              }}>
              <Icon name="md-cloud-upload" style={styles.actionButtonIcon} />
            </ActionButton.Item>


            {/* {this.state.refreshScreen &&

              <ActionButton.Item buttonColor='#a4d227' title="Testing" onPress={() => {
                // alert(this.state.selected)
              }}>
                <Icon name="logo-usd" style={styles.actionButtonIcon} />
              </ActionButton.Item>
            } */}

            {this.state.profile !== null &&
              <ActionButton.Item buttonColor='#a4d227'
                textContainerStyle={{ backgroundColor: '#73aa2a' }}
                textStyle={{ color: '#fff' }}
                title="Trang Cá Nhân" onPress={() => {

                  this.props.navigation.navigate("ProfileScreen", {
                    onRefreshScreen: this.onRefreshScreen,
                    _getWalletAsync: this._getWalletAsync
                  });

                }}>
                <Icon name="md-person" style={styles.actionButtonIcon} />
              </ActionButton.Item>
            }

            {this.state.profile !== null &&
              <ActionButton.Item buttonColor='#a4d227'
                textContainerStyle={{ backgroundColor: '#73aa2a' }}
                textStyle={{ color: '#fff' }}
                title={numberWithCommas(this.state.wallet) + " đ"} onPress={() => {
                  //alert(this.state.selected)
                }}>
                <Icon name="logo-usd" style={styles.actionButtonIcon} />
              </ActionButton.Item>
            }
            {/* <ActionButton.Item buttonColor='#1abc9c' title="All Tasks" onPress={() => { }}>
              <Icon name="md-done-all" style={styles.actionButtonIcon} />
            </ActionButton.Item> */}
          </ActionButton>
          : null}




        {/* Popup Reset Password Step 1 */}
        <PopupDialog
          ref={(popupResetPassword) => { this.popupResetPassword = popupResetPassword; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title="Lấy lại mật khẩu" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{
            marginBottom: 150, width: width * 0.9,
            height: 240,
          }}
          onShown={() => {
            this.refs.resetUserNameInput.focus()
          }}
        >

          <View style={{
            padding: 20
          }}>
            {/* Username */}
            <Animated.View style={{
              position: 'relative', left: this.state.animation.usernamePostionLeft,
              flexDirection: 'row',
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-call' />
              <FormInput
                ref='resetUserNameInput'
                returnKeyType={"done"}
                onSubmitEditing={(event) => {
                  this._resetPasswordStep1();
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Số điện thoại'
                autoCapitalize='sentences'
                keyboardType='phone-pad'
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(resetPasswordUsername) => this.setState({ resetPasswordUsername })}
                value={this.state.resetPasswordUsername}
              />
            </Animated.View>
          </View>
          {/* Button */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, }}>
            <Button
              buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'ios-backspace', type: 'ionicon' }}
              title='Hủy'
              onPress={() => {
                Keyboard.dismiss();
                this.popupResetPassword.dismiss()
                this.setState({ resetPasswordUsername: '' })
              }}
            />

            <Button
              buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'md-checkmark', type: 'ionicon' }}
              onPress={() => {
                Keyboard.dismiss();
                this._resetPasswordStep1();
              }}
              title='Đồng ý' />
          </View>

        </PopupDialog>

        {/* Modal Reset Password Step 1 */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalResetPassword1}
          // onRequestClose={() => {
          //   //alert("Modal has been closed.")
          // }}
          onShow={() => {
            this.refs.iosResetUserNameInput.focus()
          }}
        >
          {this.state.modalLoading &&

            <ActivityIndicator
              style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
              animating={true}
              size="large"
              color="#73aa2a"
            />

          }

          <View style={{
            padding: 20,
            marginTop: responsiveHeight(30)
          }}>


            {/* Username */}
            <Animated.View style={{
              position: 'relative', left: this.state.animation.usernamePostionLeft,
              flexDirection: 'row',
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-call' />
              <FormInput
                ref='iosResetUserNameInput'
                returnKeyType={"done"}
                onSubmitEditing={(event) => {
                  this._resetPasswordStep1();
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Số điện thoại'
                autoCapitalize='sentences'
                keyboardType='phone-pad'
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(resetPasswordUsername) => this.setState({ resetPasswordUsername })}
                value={this.state.resetPasswordUsername}
              />
            </Animated.View>
          </View>
          {/* Button */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, }}>
            <Button
              buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'ios-backspace', type: 'ionicon' }}
              title='Hủy'
              onPress={() => {
                Keyboard.dismiss();
                this.setState({
                  resetPasswordUsername: '',
                  modalResetPassword1: false,
                  modalLoading: false,
                })
              }}
            />

            <Button
              buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'md-checkmark', type: 'ionicon' }}
              onPress={() => {
                Keyboard.dismiss();
                this._resetPasswordStep1();
              }}
              title='Đồng ý' />
          </View>
        </Modal>

        {/* Popup Reset Password Step 2 */}
        <PopupDialog
          ref={(popupActiveNewPassword) => { this.popupActiveNewPassword = popupActiveNewPassword; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title="Mật khẩu mới" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{
            marginBottom: 220, width: width * 0.9,

          }}
          onShown={() => {
            this.refs.ActiveKeyInput.focus()
          }}
        >

          <View style={{
            padding: 15
          }}>
            <Text style={{ textAlign: 'center', color: '#73aa2a' }}>Bạn vui lòng kiểm tra Email để lấy Mã Kích Hoạt mật khẩu mới!</Text>
            {/* Active Key */}
            <Animated.View style={{
              position: 'relative', left: this.state.animation.usernamePostionLeft,
              flexDirection: 'row',
              marginTop: 5,
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-key' />
              <FormInput
                ref='ActiveKeyInput'
                returnKeyType={"next"}
                onSubmitEditing={(event) => {
                  this.refs.newPasswordInput.focus();
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Mã kích hoạt mật khẩu mới'
                autoCapitalize='sentences'
                keyboardType='numeric'
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(resetPasswordActiveKey) => this.setState({ resetPasswordActiveKey })}
                value={this.state.resetPasswordActiveKey}
              />
            </Animated.View>
            {/* New password  */}
            <Animated.View style={{
              position: 'relative', left: this.state.animation.usernamePostionLeft,
              flexDirection: 'row',
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-lock' />
              <FormInput
                ref='newPasswordInput'
                returnKeyType={"done"}
                onSubmitEditing={(event) => {
                  this._resetPasswordStep2();
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Mật khẩu mới'
                autoCapitalize='sentences'
                //keyboardType='email-address'
                secureTextEntry={true}
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(resetPasswordNewPassword) => this.setState({ resetPasswordNewPassword })}
                value={this.state.resetPasswordNewPassword}
              />
            </Animated.View>



          </View>
          {/* Button */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, }}>
            <Button
              buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'ios-backspace', type: 'ionicon' }}
              title='Hủy'
              onPress={() => {
                Keyboard.dismiss();
                this.popupActiveNewPassword.dismiss()
              }}
            />

            <Button
              buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'md-checkmark', type: 'ionicon' }}
              onPress={() => {
                Keyboard.dismiss();
                this._resetPasswordStep2();
              }}
              title='Đồng ý' />
          </View>
        </PopupDialog>


        {/* Modal Reset Password Step 2 */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalResetPassword2}
          // onRequestClose={() => {
          //   //alert("Modal has been closed.")
          // }}
          onShow={() => {
            this.refs.ActiveKeyInput.focus();
          }}
        >

          {this.state.modalLoading &&
            <ActivityIndicator
              style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
              animating={true}
              size="large"
              color="#73aa2a"
            />}

          <View style={{
            padding: 15,
            marginTop: 60,
          }}>
            <Text style={{ textAlign: 'center', color: '#73aa2a' }}>Bạn vui lòng kiểm tra Email để lấy Mã Kích Hoạt mật khẩu mới!</Text>
            {/* Active Key */}
            <Animated.View style={{
              position: 'relative', left: this.state.animation.usernamePostionLeft,
              flexDirection: 'row',
              marginTop: 10,
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-key' />
              <FormInput
                ref='ActiveKeyInput'
                returnKeyType={Platform.OS == 'ios' ? 'done' : "next"}
                onSubmitEditing={(event) => {
                  this.refs.newPasswordInput.focus();
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Mã kích hoạt mật khẩu mới'
                autoCapitalize='sentences'
                keyboardType='numeric'
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(resetPasswordActiveKey) => this.setState({ resetPasswordActiveKey })}
                value={this.state.resetPasswordActiveKey}
              />
            </Animated.View>
            {/* New password  */}
            <Animated.View style={{
              position: 'relative', left: this.state.animation.usernamePostionLeft,
              flexDirection: 'row',
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-lock' />
              <FormInput
                ref='newPasswordInput'
                returnKeyType={"done"}
                onSubmitEditing={(event) => {
                  this._resetPasswordStep2();
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Mật khẩu mới'
                autoCapitalize='sentences'
                //keyboardType='email-address'
                secureTextEntry={true}
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(resetPasswordNewPassword) => this.setState({ resetPasswordNewPassword })}
                value={this.state.resetPasswordNewPassword}
              />
            </Animated.View>



          </View>
          {/* Button */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, }}>
            <Button
              buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'ios-backspace', type: 'ionicon' }}
              title='Hủy'
              onPress={() => {
                Keyboard.dismiss();
                this.setState({
                  modalResetPassword2: false,
                  modalLoading: false,
                })
              }}
            />

            <Button
              buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'md-checkmark', type: 'ionicon' }}
              onPress={() => {
                Keyboard.dismiss();
                this._resetPasswordStep2();
              }}
              title='Đồng ý' />
          </View>

        </Modal>

        {/* Popup Login */}
        <PopupDialog
          ref={(popupLogin) => { this.popupLogin = popupLogin; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title="Đăng nhập" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{ marginBottom: 150, width: width * 0.9, }}
        // onShown={() => {
        //   this.refs.userNameInput.focus()
        // }}

        >
          <View>
            {/* Username */}
            <Animated.View style={{ position: 'relative', left: this.state.animation.usernamePostionLeft, flexDirection: 'row', padding: 10, }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person' />
              <FormInput
                ref='userNameInput'
                returnKeyType={"next"}
                onSubmitEditing={(event) => {
                  this.refs.passwordInput.focus();
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Số điện thoại'
                autoCapitalize='sentences'
                keyboardType='phone-pad'
                value={this.state.loginUsername}
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(loginUsername) => this.setState({ loginUsername })}
              />
            </Animated.View>
            {/* Password */}
            <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-lock' />
              <FormInput
                ref='passwordInput'
                returnKeyType={"done"}
                onSubmitEditing={(event) => {
                  this._loginAsync()
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Mật khẩu'
                underlineColorAndroid={'#73aa2a'}
                secureTextEntry={true}
                value={this.state.loginPassword}
                onChangeText={(loginPassword) => this.setState({ loginPassword })}
              />
            </Animated.View>
            {/* Button */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, }}>
              <Button
                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                title='Hủy'
                onPress={() => {
                  Keyboard.dismiss();
                  this.popupLogin.dismiss()
                }}
              />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'md-checkmark', type: 'ionicon' }}
                title='Đăng nhập'
                onPress={() => {
                  Keyboard.dismiss();
                  this._loginAsync()
                }}
              />
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
                  //this.setState({ modalRegisterAccount: true })
                  this.props.navigation.navigate('RegisterAccountScreen', {
                    onRefreshScreen: this.onRefreshScreen,
                    login: this._loginAfterRegisterAccountAsync
                  })
                  {/* this.props.navigation.navigate('RegisterAccountScreen', {
                    onRefreshScreen: this.onRefreshScreen,
                    //login: this._loginAsync()
                  }) */}
                }}
              >
                <Text style={{ padding: 15, textAlign: 'center' }}>Đăng ký mới</Text>
              </TouchableOpacity>
            </View>


            {/* <FormLabel
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
            </Animated.View> */}
          </View>
        </PopupDialog>


        {/* Modal Login */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalLogin}
        // onRequestClose={() => {
        //   //alert("Modal has been closed.")
        // }}
        // onShow={() => {
        //   this.refs.iosUserNameInput.focus()
        // }}
        >

          <View>

            {this.state.modalLoading &&

              <ActivityIndicator
                style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
                animating={true}
                size="large"
                color="#73aa2a"
              />
            }

            {/* Username */}
            <Animated.View style={{
              position: 'relative',
              left: this.state.animation.usernamePostionLeft,
              flexDirection: 'row', padding: 10,
              marginTop: responsiveHeight(10),
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person' />
              <FormInput
                ref='iosUserNameInput'
                returnKeyType={Platform.OS == 'ios' ? 'done' : "next"}
                onSubmitEditing={(event) => {
                  this.refs.passwordInput.focus();
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Số điện thoại'
                autoCapitalize='sentences'
                keyboardType='phone-pad'
                value={this.state.loginUsername}
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(loginUsername) => this.setState({ loginUsername })}
              />
            </Animated.View>
            {/* Password */}
            <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-lock' />
              <FormInput
                ref='passwordInput'
                returnKeyType={"done"}
                onSubmitEditing={(event) => {
                  Keyboard.dismiss()
                  this._loginAsync()
                }}
                containerStyle={{ flex: 15 }}
                placeholder='Mật khẩu'
                underlineColorAndroid={'#73aa2a'}
                secureTextEntry={true}
                value={this.state.loginPassword}
                onChangeText={(loginPassword) => this.setState({ loginPassword })}
              />
            </Animated.View>
            {/* Button */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, }}>
              <Button
                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                title='Hủy'
                onPress={() => {
                  Keyboard.dismiss();
                  if (Platform.OS == 'ios') {
                    this.setState({ modalLogin: false, modalLoading: false })
                  }
                  else {
                    this.popupLogin.dismiss()
                  }

                }}
              />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'md-checkmark', type: 'ionicon' }}
                title='Đăng nhập'
                onPress={() => {
                  Keyboard.dismiss();
                  //this.setState({ modalLoading: true })
                  this._loginAsync()
                }}
              />
            </View>



            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, }}>

              {/* Forget password */}
              <TouchableOpacity style={{ flex: 1, }}
                onPress={() => {
                  Keyboard.dismiss()
                  this.setState({ modalLogin: false, modalResetPassword1: true })
                }}
              >
                <Text style={{ padding: 15, textAlign: 'center', }}>Quên mật khẩu</Text>
              </TouchableOpacity>

              {/* Register new account */}
              <TouchableOpacity style={{ flex: 1, }}
                onPress={() => {
                  Keyboard.dismiss()
                  this.setState({ modalLogin: false })
                  this.props.navigation.navigate('RegisterAccountScreen', {
                    onRefreshScreen: this.onRefreshScreen,
                    login: this._loginAfterRegisterAccountAsync
                  })
                  {/* this.props.navigation.navigate('RegisterAccountScreen', {
                    onRefreshScreen: this.onRefreshScreen,
                    //login: this._loginAsync()
                  }) */}
                }}
              >
                <Text style={{ padding: 15, textAlign: 'center' }}>Đăng ký mới</Text>
              </TouchableOpacity>
            </View>


            {/* <FormLabel
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
            </Animated.View> */}
          </View>
          {/* <KeyboardSpacer /> */}
        </Modal>

        {/* Popup Report */}
        <PopupDialog
          ref={(popupReportNBL) => { this.popupReportNBL = popupReportNBL; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title="Báo cáo Nhà Bao La" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{ marginBottom: 100, width: width * 0.9 }}

        >
          <View>
            <CheckBox
              title='Không đúng địa chỉ'
              checked={this.state.reportAddress}
              onPress={() => {
                this.setState({
                  reportAddress: !this.state.reportAddress
                })
              }}
            />
            <CheckBox
              title='Không gọi được'
              checked={this.state.reportCall}
              onPress={() => {
                this.setState({
                  reportCall: !this.state.reportCall
                })
              }}
            />
            <CheckBox
              title='Nhà đã cho thuê'
              checked={this.state.reportHouse}
              onPress={() => {
                this.setState({
                  reportHouse: !this.state.reportHouse
                })
              }}
            />

            {/* Button */}
            <View style={{ height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 20, }}>
              {/* <View style={{ height: 80, flexDirection: 'row', marginBottom: 15, }}> */}


              <Button
                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                onPress={() => {
                  this.popupReportNBL.dismiss()
                  this.setState({
                    reportAddress: false,
                    reportCall: false,
                    reportHouse: false,
                  })
                }}
                title='Hủy' />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                icon={{ name: 'md-cloud-upload', type: 'ionicon' }}
                title='Gửi'
                onPress={() => {
                  if (this.state.reportAddress) {
                    this._reportNBLAsync(2, this.state.reportRoomId)
                  }
                  if (this.state.reportCall) {
                    this._reportNBLAsync(3, this.state.reportRoomId)
                  }
                  if (this.state.reportHouse) {
                    this._reportNBLAsync(5, this.state.reportRoomId)
                  }

                }}
              />
            </View>
          </View>
        </PopupDialog>


        {/* Modal Report */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalReport}
        // onRequestClose={() => {
        //   //alert("Modal has been closed.")
        // }}
        >

          {this.state.modalLoading &&

            <ActivityIndicator
              style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
              animating={true}
              size="large"
              color="#73aa2a"
            />

          }


          <View
            style={{ marginTop: 70 }}
          >
            <CheckBox
              title='Không đúng địa chỉ'
              checked={this.state.reportAddress}
              onPress={() => {
                this.setState({
                  reportAddress: !this.state.reportAddress
                })
              }}
            />
            <CheckBox
              title='Không gọi được'
              checked={this.state.reportCall}
              onPress={() => {
                this.setState({
                  reportCall: !this.state.reportCall
                })
              }}
            />
            <CheckBox
              title='Nhà đã cho thuê'
              checked={this.state.reportHouse}
              onPress={() => {
                this.setState({
                  reportHouse: !this.state.reportHouse
                })
              }}
            />

            {/* Button */}
            <View style={{ height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 20, }}>
              {/* <View style={{ height: 80, flexDirection: 'row', marginBottom: 15, }}> */}


              <Button
                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                onPress={() => {

                  this.setState({
                    modalReport: false,
                    reportAddress: false,
                    reportCall: false,
                    reportHouse: false,
                    modalLoading: false,
                  })
                }}
                title='Hủy' />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                icon={{ name: 'md-cloud-upload', type: 'ionicon' }}
                title='Gửi'
                onPress={() => {
                  if (this.state.reportAddress) {
                    this._reportNBLAsync(2, this.state.reportRoomId)
                  }
                  if (this.state.reportCall) {
                    this._reportNBLAsync(3, this.state.reportRoomId)
                  }
                  if (this.state.reportHouse) {
                    this._reportNBLAsync(5, this.state.reportRoomId)
                  }

                }}
              />
            </View>
          </View>

        </Modal>


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
            selectedStar={(rating) => {
              //this.onStarRatingPress(rating)
              this._postRatingByRoom(rating, this.state.ratingRoomId)
            }}
          />
        </PopupDialog>




        {/* Modal Register Account */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalRegisterAccount}
        // onRequestClose={() => {
        //   //alert("Modal has been closed.")
        // }}
        >
          <ScrollView>


            <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity
                style={{}}
                onPress={async () => {
                  //this._pickPostRoomImage('registerAccountImage')
                  await this.setState({ modalRegisterAccount: false })
                  this.popupSelectedImage.show()
                }
                }
              >
                <Ionicons style={{ opacity: 0.7, fontSize: 100, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-contact' />
                {this.state.registerAccountImage
                  && <Image source={{ uri: this.state.registerAccountImage }}
                    style={{ width: 80, height: 80, borderRadius: Platform.OS === 'ios' ? 25 : 100, marginTop: Platform.OS === 'ios' ? -99 : -90, marginLeft: Platform.OS === 'ios' ? 7 : 1, marginBottom: 10, }}
                  />
                }
                <Text style={{}}>Hình đại diện</Text>
              </TouchableOpacity>

            </View>
            <View>

              <Animated.View style={{ position: 'relative', left: this.state.animation.usernamePostionLeft, flexDirection: 'row', padding: 10, }}>
                <Ionicons style={{ flex: 2, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-call' />
                <FormInput
                  containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 20 : 10 }}
                  inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                  placeholder='Số điện thoại'
                  autoCapitalize='sentences'
                  keyboardType='numeric'
                  underlineColorAndroid={'#73aa2a'}
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
                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock' />
                <FormInput
                  containerStyle={{ flex: 15 }}
                  inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                  placeholder='Mật khẩu'
                  secureTextEntry={true}
                  underlineColorAndroid={'#73aa2a'}
                  value={this.state.registerPassword}
                  onChangeText={(registerPassword) => { this.setState({ registerPassword }) }}
                />
              </Animated.View>
              <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                {/* <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock-outline' /> */}
                <FormInput
                  containerStyle={{ flex: 15, marginLeft: 36 }}
                  inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                  placeholder='Xác nhận mật khẩu'
                  secureTextEntry={true}
                  underlineColorAndroid={'#73aa2a'}
                  value={this.state.registerConfirmPassword}
                  onChangeText={(registerConfirmPassword) => { this.setState({ registerConfirmPassword }) }}
                />
              </Animated.View>
              <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person' />
                <FormInput
                  containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                  inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                  placeholder='Họ và tên'
                  underlineColorAndroid={'#73aa2a'}
                  value={this.state.registerFullName}
                  onChangeText={(registerFullName) => { this.setState({ registerFullName }) }}
                />

              </Animated.View>
              <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>

                <FormInput
                  containerStyle={{ flex: 1, borderWidth: 0.6, borderColor: '#9B9D9D', borderRadius: 10, padding: 5, marginTop: 10, }}
                  inputStyle={{}}
                  placeholder='Mã xác nhận số điện thoại (4 số)'
                  secureTextEntry={true}
                  underlineColorAndroid={'#fff'}
                  keyboardType='numeric'
                  value={this.state.registerConfirmCellPhone}
                  onChangeText={(registerConfirmCellPhone) => { this.setState({ registerConfirmCellPhone }) }}
                />
              </Animated.View>
              {/* The view that will animate to match the keyboards height */}
              {/* {Platform.OS === 'ios' ? <KeyboardSpacer /> : null} */}
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
                    registerAccountImage: null,
                    registerFullName: null,
                    registerConfirmCellPhone: null,
                  })

                }}
              />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'md-checkmark', type: 'ionicon' }}
                title='Đăng ký'
                onPress={() => {
                  this._registerAccountAsync();
                }}
              />
            </View>
          </ScrollView>
        </Modal>


        {/* Popup select image library or camera */}
        <PopupDialog
          ref={(popupSelectedImage) => { this.popupSelectedImage = popupSelectedImage; }}
          dialogAnimation={new ScaleAnimation()}
          dialogStyle={{ marginBottom: 10, width: width * 0.9, height: 130, justifyContent: 'center', padding: 20 }}
          dismissOnTouchOutside={false}
        >
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
            <TouchableOpacity
              style={{ justifyContent: 'center', alignContent: 'center', paddingRight: 30 }}
              onPress={async () => {
                this.popupSelectedImage.dismiss();
                this._pickImageAsync('library', 'registerAccountImage')
                await this.setState({ modalRegisterAccount: true })
              }}
            >
              <Ionicons style={{ fontSize: 40, borderRadius: 10, backgroundColor: '#a4d227', color: '#fff', textAlign: 'center', padding: 10 }} name='ios-folder-open' >
              </Ionicons>
              <Text style={{ textAlign: 'center', marginTop: 5 }}>Thư viện ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ justifyContent: 'center', alignContent: 'center', }}
              onPress={async () => {
                this.popupSelectedImage.dismiss();
                this._pickImageAsync('camera', 'registerAccountImage')
                await this.setState({ modalRegisterAccount: true })
              }}
            >
              <Ionicons style={{ fontSize: 40, borderRadius: 10, backgroundColor: '#a4d227', color: '#fff', textAlign: 'center', padding: 10 }} name='md-camera' />
              <Text style={{ textAlign: 'center', marginTop: 5 }}>Camera</Text>
            </TouchableOpacity>
          </View>
        </PopupDialog>


        {/* Popup Loading Indicator */}
        <PopupDialog
          ref={(popupLoadingIndicator) => { this.popupLoadingIndicator = popupLoadingIndicator; }}
          dialogAnimation={new ScaleAnimation()}
          dialogStyle={{ marginBottom: 100, width: 80, height: 80, justifyContent: 'center', padding: 20 }}
          dismissOnTouchOutside={false}
        >
          <ActivityIndicator
            style={{}}
            animating={true}
            size="large"
            color="#73aa2a"
          />
        </PopupDialog>

        {/* Popup Congratulation For New Account */}
        <PopupDialog
          ref={(popupCongraForNewAccount) => { this.popupCongraForNewAccount = popupCongraForNewAccount; }}
          //dialogTitle={<DialogTitle title="Chúc Mừng Bạn" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dialogAnimation={new ScaleAnimation()}
          dialogStyle={{ marginBottom: 100, width: responsiveWidth(90), height: 100, justifyContent: 'center', padding: 20 }}
        //dismissOnTouchOutside={false}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {/* <Image
              style={{ position: 'absolute', width: responsiveWidth(90), height: responsiveHeight(30) }}
              source={require('../assets/images/nbl-highlight.gif')} /> */}
            <Text style={{ fontSize: responsiveFontSize(2), color: '#73aa2a', marginBottom: 10, }}>Chúc Mừng Bạn</Text>
            <Text>Bạn được tặng {numberWithCommas(this.state.wallet)} đồng vào Ví Tiền</Text>
          </View>
        </PopupDialog>
      </View >
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
    //flex: 4,
    paddingLeft: 20,
  },
  cardAvatarName: {
    fontSize: responsiveFontSize(2),
  },
  cardAvatarPhoneBox: {
    //flex: 1,
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
  // cardImageBox: {
  //   flex: 6,
  //   paddingLeft: 20,
  //   paddingRight: 20,
  //   // borderWidth: 1,
  //   // borderColor: 'blue',
  // },
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