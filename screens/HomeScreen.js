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
  Easing,
  TouchableHighlight,
  Linking,
  Switch,

} from 'react-native';
import { WebBrowser, ImagePicker, Facebook, Google, Notifications, Permissions, BarCodeScanner } from 'expo';
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
import notifyNBLAsync from '../api/notifyNBLAsync';
import enTranslation from '../components/en.json';
import zhTranslation from '../components/zh.json';
import viTranslation from '../components/vi.json';
import { setLocalization, translate, Translate } from 'react-native-translate';
import SearchScreen from './SearchScreen';
import SimplePicker from 'react-native-simple-picker';
import ModalDropdown from 'react-native-modal-dropdown';
import DropdownAlert from 'react-native-dropdownalert';

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
const roomBoxByID = null;
const isScanQR = false;
const Banner = [];

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
      refreshCategory: false,
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
      // animation: {
      //   usernamePostionLeft: new Animated.Value(795),
      //   passwordPositionLeft: new Animated.Value(905),
      //   loginPositionTop: new Animated.Value(1402),
      //   statusPositionTop: new Animated.Value(1542)
      // },

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
      toUserMailBox: '',
      flatListIsEnd: false,
      roomByCatHeigh: new Animated.Value(0),
      highLightBackgroundOpacity: new Animated.Value(-100),
      languageOpacity: new Animated.Value(0),
      isInternetIssue: false,
      isVietnamease: false,
      isEnglish: false,
      isChinease: false,
      iosSelectedCategory: translate("All real estate"),
      isEnableQR: false,
      // isTopupByQR: true,
      topUpCode: {
        data: ''
      },
      modalTopUpCode: false,
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
  // _getStorageAsync = async (key) => {
  //   try {
  //     var v = await AsyncStorage.getItem(key);
  //     //alert(v)
  //     //await this.setState({ language: v })
  //    // return v;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  _refreshRoomBox() {
    this._getRoomBoxAsync(true);
    this._getWalletAsync();
  }

  componentDidMount() {

    // Register Push Notification
    this._notificationSubscription = this._registerForPushNotifications();

    // setTimeout(() => {
    //   Animated.timing( // Language opacity
    //     this.state.languageOpacity,
    //     {
    //       toValue: 1,
    //       easing: Easing.bounce,
    //       duration: 100,
    //     }
    //   ).start();
    // }, 2000)

    // Popup messgae if internet has problem after 15 seconds
    setTimeout(() => {
      if (roomBox.length == 0) {
        this.setState({ isInternetIssue: true })
      }
    }, 15000)

    // this._postTranslator()

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
    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = async ({ origin, data }) => {

    // Notify Admin for new user comming.
    if (data.params.roomBoxID == 'DKTK') {
      this.props.navigation.navigate(data.screen);
      return;
    }

    // Notify when Comment or Report Admin
    await this._getRoomByIDAsync(data.params.roomBoxID)
    const item = roomBoxByID
    this.props.navigation.navigate(data.screen, { item });

    // console.log(
    //   `Push notification ${origin} with data: ${JSON.stringify(data)}`
    // );
  };

  _getLanguageFromStorageAsync = async () => {
    try {
      var value = await AsyncStorage.getItem('language');

      if (value !== null) {
        if (value == 'enTranslation') {
          setLocalization(enTranslation)
          this.setState({ isEnglish: true, isVietnamease: false, isChinease: false })
        } else if (value == 'zhTranslation') {
          setLocalization(zhTranslation)
          this.setState({ isEnglish: false, isVietnamease: false, isChinease: true })
        }
        else {
          setLocalization(viTranslation)
          this.setState({ isEnglish: false, isVietnamease: true, isChinease: false })
        }
      } else {
        setLocalization(viTranslation)
        this.setState({ isEnglish: false, isVietnamease: true, isChinease: false })
      }

    } catch (e) {
      console.log(e);
    }
  }

  componentWillMount() {

    this._getLanguageFromStorageAsync();

    this._getCategoryAsync();
    this._getRoomBoxAsync(true);
    this._getProfileFromStorageAsync();
    this._getSessionKeyFromStorageAsync();
    //this._getBannerAsync()

    // Remove Push Notification
    //this._notificationSubscription && this._notificationSubscription.remove();

  }

  componentWillUnmount() {
    // Remove Push Notification
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  _onScroll = (event) => {



    // Simple fade-in / fade-out animation for Action Button
    // const CustomLayoutLinear = {
    //   duration: 100,
    //   create: { type: LayoutAnimation.Types.linear, property: LayoutAnimation.Properties.opacity },
    //   update: { type: LayoutAnimation.Types.linear, property: LayoutAnimation.Properties.opacity },
    //   delete: { type: LayoutAnimation.Types.linear, property: LayoutAnimation.Properties.opacity }
    // }
    // // Check if the user is scrolling up or down by confronting the new scroll position with your own one
    // const currentOffset = event.nativeEvent.contentOffset.y
    // const direction = (currentOffset > 0 && currentOffset > this._listViewOffset)
    //   ? 'down'
    //   : 'up'
    // // If the user is scrolling down (and the action-button is still visible) hide it
    // const isActionButtonVisible = direction === 'up'
    // if (isActionButtonVisible !== this.state.isActionButtonVisible) {
    //   LayoutAnimation.configureNext(CustomLayoutLinear)
    //   this.setState({ isActionButtonVisible })

    // }
    // // Update your scroll position
    // this._listViewOffset = currentOffset

    //alert(currentOffset)

    // Hide and Show Category on Homepage
    // Check if the user is scrolling up or down by confronting the new scroll position with your own one
    const currentOffset = event.nativeEvent.contentOffset.y
    const direction = (currentOffset > 0 && currentOffset > this._listViewOffset)
      ? 'down'
      : 'up'

    if (direction === 'up') {
      //this.setState({ roomByCatHeigh: 40 })

      Animated.timing( // Show Category
        this.state.roomByCatHeigh,
        {
          toValue: 0,
          // easing: Easing.linear,
          duration: 60,
        }
      ).start();

      // Animated.timing( // Hide Highlight Room Button
      //   this.state.highLightBackgroundOpacity,
      //   {
      //     toValue: -100,
      //     // easing: Easing.linear,
      //     duration: 50,
      //   }
      // ).start();

    } else {
      //this.setState({ roomByCatHeigh: 0 })

      Animated.timing( // Hide Category
        this.state.roomByCatHeigh,
        {
          toValue: -100,
          // easing: Easing.linear,
          duration: 50,
        }
      ).start();

      // Animated.timing( // Show Highlight Room Button
      //   this.state.highLightBackgroundOpacity,
      //   {
      //     toValue: 1,
      //     //  easing: Easing.linear,
      //     duration: 50,
      //   }
      // ).start();
    }
    // Update your scroll position
    this._listViewOffset = currentOffset
    // setTimeout(() => { }, 50)



    //   Animated.timing(
    //     this.state.roomByCatHeigh,
    //     {
    //         toValue: 20,
    //         easing: Easing.bounce,
    //         duration: 500,
    //     }
    // ).start();
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
              ToastAndroid.showWithGravity(translate("Account or password was changed"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert(translate("Notice"), translate("Account or password was changed"));
            }

            this.setState({ profile: null, sessionKey: null })
            saveStorageAsync('FO_Account_Login', '')
            saveStorageAsync('SessionKey', '')

          }
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
        ToastAndroid.showWithGravity(translate('Please enter an account'), ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
      if (this.state.loginPassword === '') {
        ToastAndroid.showWithGravity(translate("Please enter a password"), ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
    }
    else {
      if (this.state.loginUsername === '') {
        Alert.alert(translate("Notice"), translate("Please enter an account"));
        return;
      }
      if (this.state.loginPassword === '') {
        Alert.alert(translate("Notice"), translate("Please enter a password"));
        return;
      }
    }

    if (Platform.OS == 'ios') {
      this.setState({ modalLoading: true })
    }
    else {
      this.popupLoadingIndicator.show()
    }
    this.setState({ modalLogin: false })

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

          // alert(JSON.stringify(responseJson))
          if (responseJson.obj.UpdatedBy != "") { // Login successful

            if (Platform.OS == 'ios') {
              this.setState({ modalLoading: false, modalLogin: false })
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
              ToastAndroid.showWithGravity(translate("Login successful"), ToastAndroid.SHORT, ToastAndroid.TOP);
            } else {
              Alert.alert(translate("Notice"), translate("Login successful"));
            }

          }
          else { // Login False

            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(translate("Incorrect username or password"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {

              this.setState({ modalLoading: false })
              this.dropdown.alertWithType('success', translate("Notice"), translate("Incorrect username or password"));
              setTimeout(() => { this.setState({ modalLogin: true }) }, 4000)

              // setTimeout(() => {
              //   Alert.alert(translate("Notice"), translate("Incorrect username or password"), [
              //     {
              //       text: translate("Cancel"), onPress: () => {
              //         this.setState({
              //           modalLoading: false,
              //           loginUsername: '',
              //           loginPassword: '',
              //         })
              //       }
              //     }
              //     , {
              //       text: translate("Retype"), onPress: () => {
              //         this.setState({ modalLogin: true })
              //         this.refs.iosUserNameInput.focus()
              //         //Loading                  
              //         this.setState({ modalLoading: false })
              //       }
              //     }]);
              // }, 1000)
            }

            saveStorageAsync('FO_Account_Login', '')
            saveStorageAsync('SessionKey', '')
            saveStorageAsync('loginUsername', '')
            saveStorageAsync('loginPassword', '')
            this.setState({ profile: null, sessionKey: null })
          }
          //alert("can")
          this.popupLoadingIndicator.dismiss();
          this.setState({ modalLoading: false, modalLogin: false })

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



            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(translate("Login successful"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert(translate("Notice"), translate("Login successful"), );
            }

          }
          else { // Login False
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(translate("Incorrect username or password"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert(translate("Notice"), translate("Incorrect username or password"));
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
        Alert.alert(translate("Congratulation"), translate("You get") + numberWithCommas(this.state.wallet) + translate("dong in wallet"));
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

  _handleFacebookLogin = async (image, message) => {


    try {
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(
        '485931318448821', // Replace with your own app id in standalone app 485931318448821, Test AppID: 1201211719949057
        { permissions: ['public_profile', 'user_friends', 'email', 'user_posts'] }//'publish_actions','manage_pages','publish_pages','user_posts'
      );

      switch (type) {
        case 'success': {

          this.popupLoadingIndicator.show()

          // Get the user's name using Facebook's Graph API
          const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
          const profile = await response.json();

          // Alert.alert(
          //   'Logged in!',
          //   `${JSON.stringify(profile)}!`,
          // );

          //alert(token + ' ' + JSON.stringify(profile))


          try {
            //await fetch('https://graph.facebook.com/v2.11/100025728168189/friends?access_token=EAAG587OfErUBAEQp8GmJKVDGB26X0xvxgQboR04gtHsKc5j75V9ZCxyoyhtr3yujILGZBWhIGSZCywdRkfT7iNjFvJOHnfagH5kKjubl5m9cZB2NnLjm09jXtUWALXtcnZAXqAJaXZC3fTHFqDcKLX3z9En8OORpFVNZB41CvL0RYkCfpg6opdekgaBzoqksuOlZBwQpXrGwZAb2iDlKfCLlRsEgZCIDaWlPmr3occd7d68RetiVDlhVEt', {
            await fetch('https://graph.facebook.com/v2.12/' + profile.id + '/feed?link=' + image + '&message=' + message + '&access_token=' + token, { // Post officialy
              //await fetch('https://graph.facebook.com/v2.11/oauth/access_token?client_id=485931318448821&client_secret=9435b271a288d4f99f5280e20f18ec1f&grant_type=client_credentials', { //Get App Token
              // await fetch('https://graph.facebook.com/v2.11/485931318448821/accounts?name=Nick HO&installed=true&permissions=publish_actions,user_posts&access_token=485931318448821|9435b271a288d4f99f5280e20f18ec1f', { //Create Test User
              //await fetch('https://graph.facebook.com/v2.11/109653393236472/feed?link=' + image + '&message=' + message + '&access_token=EAAG587OfErUBAEQZAIsllv8ZBDZAhfrzZBfWx2J2LvGGb6usSZA8SCgMvGhFNRO3ttuyDZAnqFdkora89lZC4Rr1u5c5o33jLs9ZCoMQaH1KM6fmqhGPjwGn6QcXRHwJMZCZBI6ZBZCoRJvPtjpPbsFQZAqxWzmx7e0g07OJeOf8oFu6eeje0ht0xvU32i00YpK2U85ZBKZB5uQRdScvWJZBoWGkCV3o', { //Post dummy to wall
              //await fetch('https://graph.facebook.com/v2.11/109653393236472/photos?url=' + message + '&access_token=EAAG587OfErUBAEQZAIsllv8ZBDZAhfrzZBfWx2J2LvGGb6usSZA8SCgMvGhFNRO3ttuyDZAnqFdkora89lZC4Rr1u5c5o33jLs9ZCoMQaH1KM6fmqhGPjwGn6QcXRHwJMZCZBI6ZBZCoRJvPtjpPbsFQZAqxWzmx7e0g07OJeOf8oFu6eeje0ht0xvU32i00YpK2U85ZBKZB5uQRdScvWJZBoWGkCV3o', { //Post Photo to wall
              //method: 'GET',
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },

              // body: JSON.stringify({

              // }),
            })
              .then((response) => response.json())
              .then((responseJson) => {

                //alert(JSON.stringify(responseJson))
                //console.log(JSON.stringify(responseJson))

                if (!JSON.stringify(responseJson).match('error')) { // Post wall facebook successful!
                  if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(translate("Post Facebook Successful"), ToastAndroid.SHORT, ToastAndroid.TOP);
                  }
                  else {
                    Alert.alert(translate("Notice"), translate("Post Facebook Successful"));
                  }
                } else { // Error
                  if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
                  }
                  else {
                    Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
                  }
                }

                this.popupLoadingIndicator.dismiss()

              }).
              catch((error) => { console.log(error) });
          } catch (error) {
            console.log(error)
          }

          break;
        }
        case 'cancel': {
          Alert.alert(
            translate("Notice"),
            translate("Cancel Facebook login"),
          );
          break;
        }
        default: {
          Alert.alert(
            translate("Notice"),
            translate("Login unsuccessful"),
          );
        }
      }
    } catch (e) {
      Alert.alert(
        translate("Notice"),
        translate("Login unsuccessful") + JSON.stringify(e),
      );
    }
  };

  // _registerAccountAsync = async () => {

  //   //Form validation
  //   if (Platform.OS === 'android') {
  //     if (this.state.registerCellPhone === null) {
  //       ToastAndroid.showWithGravity(translate("Please enter the cellphone"), ToastAndroid.SHORT, ToastAndroid.TOP);
  //       return;
  //     }
  //     if (this.state.registerPassword === null) {
  //       ToastAndroid.showWithGravity(translate("Please enter a password"), ToastAndroid.SHORT, ToastAndroid.TOP);
  //       return;
  //     }
  //     if (this.state.registerPassword != this.state.registerConfirmPassword) {
  //       ToastAndroid.showWithGravity(translate("Confirm password is incorrect"), ToastAndroid.SHORT, ToastAndroid.TOP);
  //       return;
  //     }
  //     if (this.state.registerFullName === null) {
  //       ToastAndroid.showWithGravity(translate("Please enter fullname"), ToastAndroid.SHORT, ToastAndroid.TOP);
  //       return;
  //     }
  //     // if (this.state.registerConfirmCellPhone === null) {
  //     //   ToastAndroid.showWithGravity('Vui lòng nhập mã xác nhận Số Điện Thoại', ToastAndroid.SHORT, ToastAndroid.TOP);
  //     //   return;
  //     // }
  //   }
  //   else {
  //     if (this.state.registerCellPhone === null) {
  //       Alert.alert('Oops!', 'Vui lòng nhập Số Điện Thoại');
  //       return;
  //     }
  //     if (this.state.registerPassword === null) {
  //       Alert.alert('Oops!', 'Vui lòng nhập mật khẩu');
  //       return;
  //     }
  //     if (this.state.registerPassword != this.state.registerConfirmPassword) {
  //       Alert.alert('Oops!', 'Xác nhận mật khẩu không khớp với mật khẩu');
  //       return;
  //     }
  //     if (this.state.registerFullName === null) {
  //       Alert.alert('Oops!', 'Vui lòng nhập Họ Tên');
  //       return;
  //     }
  //     // if (this.state.registerConfirmCellPhone === null) {
  //     //   Alert.alert('Oops!', 'Vui lòng nhập mã xác nhận Số Điện Thoại');
  //     //   return;
  //     // }
  //   }

  //   await this.setState({ modalRegisterAccount: false, })
  //   this.popupLoadingIndicator.show();



  //   let uploadResponse = await uploadImageAsync(this.state.registerAccountImage);
  //   let uploadResult = await uploadResponse.json();

  //   //Set account object
  //   await this.setState({

  //     objectRegisterAccount: {
  //       Avarta: uploadResult.location,
  //       UserName: this.state.registerCellPhone,
  //       FullName: this.state.registerFullName,
  //       Email: "",
  //       Sex: "",
  //       YearOfBirth: "2017-10-09",
  //       Address: "5 Hello 10 Hi 15 Hehe",
  //       ContactPhone: this.state.registerCellPhone,
  //       Password: this.state.registerPassword,
  //       RegistryDate: "2017-10-09",
  //       IsActive: "true",
  //       CreatedDate: "2017-10-09",
  //       CreatedBy: "10",
  //       UpdatedBy: "Olala_SessionKey",
  //       UpdatedDate: "2017-10-09"
  //     },

  //   })
  //   // console.log(JSON.stringify(this.state.objectRegisterAccount))
  //   //Post to register account
  //   try {
  //     await fetch("http://nhabaola.vn/api/Account/FO_Account_Add", {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(this.state.objectRegisterAccount)


  //       // body: JSON.stringify({
  //       //   "UserName": "UserName",
  //       //   "FullName": "Nguyen Van A",
  //       //   "Email": "Email@gmail.com",
  //       //   "Sex": "Nam",
  //       //   "YearOfBirth": "2017-10-09",
  //       //   "Address": "5 Hello 10 Hi 15 Hehe",
  //       //   "ContactPhone": "0919999888",
  //       //   "Password": "Passwordvinaphuc",
  //       //   "RegistryDate": "2017-10-09",
  //       //   "IsActive": "true",
  //       //   "CreatedDate": "2017-10-09",
  //       //   "CreatedBy": "10",
  //       //   "UpdatedBy": "Olala_SessionKey",
  //       //   "UpdatedDate": "2017-10-09"
  //       // }),
  //     })
  //       .then((response) => response.json())
  //       .then((responseJson) => {

  //         this.setState({
  //           modalRegisterAccount: false, //Close register account modal
  //           modalRegisterAccount: false,
  //           registerCellPhone: null,
  //           registerPassword: null,
  //           registerConfirmPassword: null,
  //           registerAccountImage: null,
  //           registerFullName: null,
  //           registerConfirmCellPhone: null,
  //         })

  //         this.popupLoadingIndicator.dismiss();
  //       }).
  //       catch((error) => { console.log(error) });
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
          roomBoxByID = responseJson.obj;
          //this.setState({ roomBoxByID: responseJson.obj })

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }



  _postTranslator = async (textAPI, langAPI) => {

    var url = "https://translate.yandex.net/api/v1.5/tr.json/translate",
      keyAPI = "trnsl.1.1.20130922T110455Z.4a9208e68c61a760.f819c1db302ba637c2bea1befa4db9f784e9fbb8";

    //document.querySelector('#translate').addEventListener('click', function () {
    var xhr = new XMLHttpRequest(),
      //textAPI = "I'm fine. Thanks you!",
      //langAPI = "vi"
      data = "key=" + keyAPI + "&text=" + textAPI + "&lang=" + langAPI;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(data);
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var res = this.responseText;
        // document.querySelector('#json').innerHTML = res;
        alert(res)
        var json = JSON.parse(res);
        if (json.code == 200) {
          //document.querySelector('#output').innerHTML = json.text[0];
          alert(json.text[0])
        }
        else {
          //document.querySelector('#output').innerHTML = "Error Code: " + json.code;
          alert(json.code)
        }
      }
    }
    // }, false);

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
            roomCategory: responseJson.obj
          })
        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  _postPinnedByRoom = async (isPinned, _roomId) => {

    // alert(_roomId + "  " + _rate + "  " + this.state.profile.ID + "  " + this.state.sessionKey)

    this.popupLoadingIndicator.show()

    try {
      await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_SetPinned", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "ID": _roomId,
          "IsPinned": isPinned,
          "CreatedBy": this.state.profile.ID,
          "UpdatedBy": this.state.profile.UpdatedBy, //this.state.sessionKey,
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          if (JSON.stringify(responseJson.ErrorCode) === "0") { // Rating successful


            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(translate("Mark successful"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert(translate("Notice"), translate("Mark successful"));
            }
          }
          else {
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
            }
          }
          this.popupLoadingIndicator.dismiss()
        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  _postRatingByRoom = async (_rate, _roomId) => {

    // alert(_roomId + "  " + _rate + "  " + this.state.profile.ID + "  " + this.state.sessionKey)

    this.popupLoadingIndicator.show()

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
              ToastAndroid.showWithGravity(translate("Thank you for rating"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert(translate("Notice"), translate("Thank you for rating"));
            }
          }

          this.popupLoadingIndicator.dismiss()

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  _reportNBLAsync = async (_reportTypeId, _roomId) => {

    // alert(_roomId + "  " + _rate + "  " + this.state.profile.ID + "  " + this.state.sessionKey)

    if (Platform.OS == 'ios') {
      //this.setState({ modalLoading: true })
      this.setState({ modalReport: false })
    }
    else {
      //this.popupLoadingIndicator.show()
      this.popupReportNBL.dismiss()
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
          "UpdatedBy": this.state.profile.UpdatedBy, //this.state.sessionKey,
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {
          //alert(_reportTypeId)
          if (JSON.stringify(responseJson.ErrorCode) === "0") { // Report successful
            //this.popupReportNBL.dismiss();

            if (Platform.OS === 'android') {
              //ToastAndroid.showWithGravity('Cảm ơn bạn đã báo cáo chúng tôi!', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              //this.setState({ modalReport: false, })
              //Alert.alert('Thông báo', 'Cảm ơn bạn đã báo cáo chúng tôi!');
            }


            this.setState({
              reportAddress: false,
              reportCall: false,
              reportHouse: false,
            })

          }
          else { //Post Error
            if (Platform.OS === 'android') {
              //ToastAndroid.showWithGravity('Lỗi ' + JSON.stringify(responseJson) + ', vui lòng liên hệ Admin trong mục Giúp Đỡ!', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              this.setState({ modalReport: false })
              //Alert.alert('Thông báo', 'Lỗi ' + JSON.stringify(responseJson) + ', vui lòng liên hệ Admin trong mục Giúp Đỡ!');
            }
          }

          if (Platform.OS == 'ios') {
            this.setState({ modalLoading: false })
          }
          else {
            // this.popupLoadingIndicator.dismiss()
          }

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

    // Send to Mailbox
    this._postMailboxAsync('10',//this.state.toUserMailBox,
      this.state.profile.FullName + " (" + this.state.profile.ID + ") " + translate("Complaint") + ": " + translate("Inaccurate Address or Not Called or Leased House"))

  }

  _postMailboxAsync = async (_toUserId, _AlertInfo) => {
    //this.popupLoadingIndicator.show()


    try {
      await fetch("http://nhabaola.vn/api/Notification/FO_Notification_Add", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({

          "UserId": _toUserId,
          "AlertOption": this.state.reportRoomId,//"0",
          "AlertInfo": _AlertInfo,
          "IsActive": "1",
          "CreatedBy": this.state.profile.ID,
          "UpdatedBy": this.state.profile.UpdatedBy

        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          if (JSON.stringify(responseJson.ErrorCode) === "0") { // Report successful


            if (Platform.OS === 'android') {
              //ToastAndroid.showWithGravity('Cảm ơn bạn đã báo cáo chúng tôi!', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              //this.setState({ modalReport: false, })
              //Alert.alert('Thông báo', 'Cảm ơn bạn đã báo cáo chúng tôi!');
            }



          }
          else { //Post Error
            if (Platform.OS === 'android') {
              //ToastAndroid.showWithGravity('Lỗi ' + JSON.stringify(responseJson) + ', vui lòng liên hệ Admin trong mục Giúp Đỡ!', ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              this.setState({ modalReport: false })
              //Alert.alert('Thông báo', 'Lỗi ' + JSON.stringify(responseJson) + ', vui lòng liên hệ Admin trong mục Giúp Đỡ!');
            }
          }


          // this.popupLoadingIndicator.dismiss()


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
      roomBox = await [];
      this.setState({ page: 1, flatListIsEnd: false })
    }

    this.setState({ // Calculate page index
      roomPageIndex: (this.state.page - 1) * this.state.roomPageCount
    })

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

          //alert(JSON.stringify(responseJson.obj.length))
          if (JSON.stringify(responseJson.obj.length) > 0) {
            responseJson.obj.map((y) => {
              roomBox.push(y);
            })
          }

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
          }

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

    // Get Banner
    this._getBannerAsync()
  }

  _getWalletAsync = async () => {


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

          if (responseJson.obj !== null) {
            saveStorageAsync('FO_Wallet_GetDataByUserID', JSON.stringify(responseJson.obj[0].CurrentAmount))
            this.setState({
              wallet: responseJson.obj[0].CurrentAmount,
            })
          }

        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }


  _resetPasswordStep1 = async () => {

    //Form validation
    if (Platform.OS === 'android') {
      if (this.state.resetPasswordUsername === '') {
        ToastAndroid.showWithGravity(translate("Please enter the cellphone"), ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }

    }
    else {
      if (this.state.resetPasswordUsername === '') {
        Alert.alert(translate("Notice"), translate("Please enter the cellphone"));
        return;
      }

    }

    if (Platform.OS == 'ios') {
      this.setState({ modalLoading: true })
    } else {
      this.popupLoadingIndicator.show()
    }
    this.setState({ modalResetPassword1: false })

    try {
      await fetch("http://nhabaola.vn/api/ForgetPassword/FO_ForgetPassword_Add/", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "UserName": this.state.resetPasswordUsername,
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          if (JSON.stringify(responseJson.ErrorCode) === "23") { // Username is not exist

            if (Platform.OS == 'ios') {

              this.setState({ modalLoading: false })
              this.dropdown.alertWithType('success', translate("Notice"), translate("This account does not exist"));
              setTimeout(() => { this.setState({ modalResetPassword1: true }) }, 4000)

              // this.setState({ modalLoading: false })

              // setTimeout(() => {
              //   Alert.alert(translate("Notice"), translate("This account does not exist"),
              //     [
              //       {
              //         text: translate("Cancel"),
              //         onPress: () => {
              //           this.setState({ modalLoading: false })
              //           this.setState({ resetPasswordUsername: '' })
              //         }
              //       },
              //       {
              //         text: translate("Retype"),
              //         onPress: () => {
              //           this.setState({ modalResetPassword1: true })
              //           this.refs.iosResetUserNameInput.focus()
              //           //Loading                  
              //           this.setState({ modalLoading: false })
              //         }

              //       }

              //     ]);
              // }, 1000)
            } else {
              ToastAndroid.showWithGravity(translate("This account does not exist"), ToastAndroid.SHORT, ToastAndroid.TOP);
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
        ToastAndroid.showWithGravity(translate("Please enter the Activation Code"), ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
      if (this.state.resetPasswordNewPassword === '') {
        ToastAndroid.showWithGravity(translate("Please enter a new password"), ToastAndroid.SHORT, ToastAndroid.TOP);
        return;
      }
    }
    else {
      if (this.state.resetPasswordActiveKey === '') {
        Alert.alert(translate("Notice"), translate("Please enter the Activation Code"));
        return;
      }
      if (this.state.resetPasswordNewPassword === '') {
        Alert.alert(translate("Notice"), translate("Please enter a new password"));
        return;
      }
    }

    //Loading
    if (Platform.OS == 'ios') {
      this.setState({ modalLoading: true })
    } else {
      this.popupLoadingIndicator.show()
    }
    this.setState({ modalResetPassword2: false })

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

          if (JSON.stringify(responseJson.ErrorCode) === "0") { // Reset password successful
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(translate("Reset password successful"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert(translate("Notice"), translate("Reset password successful"));
            }
            this.popupActiveNewPassword.dismiss();
            this.setState({ resetPasswordUsername: '' })

            // Login after reset password
            this._loginAsync()
            // this._loginAfterRegisterAccountAsync();
          }
          else {
            if (Platform.OS === 'android') { // Active Code not correct
              ToastAndroid.showWithGravity(translate("Incorrect activation code"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {

              this.setState({ modalLoading: false })
              this.dropdown.alertWithType('success', translate("Notice"), translate("Incorrect activation code"));
              setTimeout(() => { this.setState({ modalResetPassword2: true }) }, 4000)

              // this.setState({ modalLoading: false })
              // setTimeout(() => {
              //   Alert.alert(translate("Notice"), translate("Incorrect activation code"),
              //     [
              //       {
              //         text: translate("Cancel"),
              //         onPress: () => {
              //           this.setState({
              //             modalLoading: false,
              //             resetPasswordNewPassword: '',
              //             resetPasswordActiveKey: ''
              //           })
              //         }
              //       },
              //       {
              //         text: translate("Retype"),
              //         onPress: () => {
              //           this.setState({ modalResetPassword2: true })
              //           this.refs.ActiveKeyInput.focus();

              //           //Loading                  
              //           this.setState({ modalLoading: false })
              //         }
              //       }
              //     ]
              //   );
              // }, 1000)
            }

            this.refs.ActiveKeyInput.focus()
          }

          //Loading
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

  _handleBarCodeRead = async (data) => {
    // Alert.alert(
    //   'Scan successful!',
    //   JSON.stringify(data.data)
    // );


    if (isScanQR) {
      isScanQR = await false


      if (data.data.indexOf("nbl") <= -1) {

        this.popupQRPay.dismiss();

        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(translate("QR is invalid"), ToastAndroid.SHORT, ToastAndroid.TOP);
        }
        else {
          //Alert.alert(translate("Notice"), translate("QR is invalid"));
          this.dropdown.alertWithType('success', translate("Notice"), translate("QR is invalid"));
          //setTimeout(() => { this.setState({ modalTopUpCode: true }) }, 400)
        }
        return;
      }

      this.popupLoadingIndicator.show()

      try {
        await fetch("http://nhabaola.vn/api/Wallet/FO_Wallet_TopUp", {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "UserID": this.state.profile.ID,
            "Code": data.data,
            "CreatedBy": this.state.profile.ID,
            "UpdatedBy": this.state.sessionKey//this.state.profile.UpdatedBy,


            // "UserID": "10",
            // "Code": "ntp-1905-1985-HCM-DN",
            // "CreatedBy": "10",
            // "UpdatedBy": "b2650091aaffa1da86dae09963d52649"
          }),
        })
          .then((response) => response.json())
          .then((responseJson) => {

            //alert(JSON.stringify(responseJson))
            // this.popupQRPay.dismiss();

            this.popupLoadingIndicator.dismiss()

            if (JSON.stringify(responseJson.ErrorCode) === "22") { // Successful
              //isScanQR = ''
              if (Platform.OS === 'android') {
                ToastAndroid.showWithGravity(translate("Top up successfully") + '\n'
                  + JSON.stringify(responseJson.obj.Description) + '\n'
                  + translate("Wallet available") + ': ' + numberWithCommas(JSON.stringify(responseJson.obj.CurrentAmount)) + ' đ', ToastAndroid.LONG, ToastAndroid.TOP);
              }
              else {
                // Alert.alert(translate("Notice"), translate("Top up successfully") + '\n'
                //   + JSON.stringify(responseJson.obj.Description) + '\n'
                //   + translate("Wallet available") + ': ' + numberWithCommas(JSON.stringify(responseJson.obj.CurrentAmount)) + ' đ'
                // );

                this.dropdown.alertWithType('success', translate("Notice"), translate("Top up successfully") + '\n'
                  + JSON.stringify(responseJson.obj.Description) + '\n'
                  + translate("Wallet available") + ': ' + numberWithCommas(JSON.stringify(responseJson.obj.CurrentAmount)) + ' đ'

                );
              }

              this._getWalletAsync()
              this.setState({ topUpCode: { data: '' } })
            }
            else if (JSON.stringify(responseJson.ErrorCode) === "21") {
              // isScanQR = ''
              if (Platform.OS === 'android') {
                ToastAndroid.showWithGravity(translate("QR has been used"), ToastAndroid.SHORT, ToastAndroid.TOP);
              }
              else {
                //Alert.alert(translate("Notice"), translate("QR has been used"));
                this.dropdown.alertWithType('success', translate("Notice"), translate("QR has been used"));
              }
            }
            else {
              //isScanQR = ''
              if (Platform.OS === 'android') {
                ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
              }
              else {
                // Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
                this.dropdown.alertWithType('success', translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
              }
            }

            // this._saveStorageAsync('FO_Category_GetAllData', JSON.stringify(responseJson.obj))

            this.popupQRPay.dismiss();

            // this.setState({
            //   isEnableQR: false
            // })
          }).
          catch((error) => { console.log(error) });
      } catch (error) {
        console.log(error)
      }

      // alert(isScanQR)
      //isScanQR = await false
    }

    await this.setState({
      isEnableQR: false
    })

  };

  _getBannerAsync = async () => {

    Banner = await [];

    try {
      await fetch("http://nhabaola.vn/api/Banner/FO_Banner_GetAllData", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "PageIndex": "0",
          "PageCount": "100"
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          if (JSON.stringify(responseJson.ErrorCode) === "0") { //  Successful
            //this._saveStorageAsync('FO_Category_GetAllData', JSON.stringify(responseJson.obj))

            //Banner = responseJson.obj

            responseJson.obj.map((y) => {
              y.IsActive &&
                Banner.push(y);
            })

          }
          else { // Error
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
            }
            else {
              Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
            }
          }
        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
    }

  }

  render() {
    let { image } = this.state;

    return (
      // <View style={styles.container} key={this.state.refreshScreen}>
      <View style={styles.container} key={this.state.refreshScreen}>

        {this.state.modalLoading &&

          <ActivityIndicator
            style={{
              position: 'absolute',
              left: responsiveWidth(42),
              top: 30,
              backgroundColor: '#fff',
              zIndex: 30,
              padding: 15,
              opacity: 0.6,
              borderRadius: 15,
              // shadowColor: '#000',
              // shadowOffset: { width: 0, height: 2 },
              // shadowOpacity: 0.2,
              // shadowRadius: 2,
            }}
            animating={true}
            size="large"
            color="#73aa2a"
          />
        }


        {this.state.isInternetIssue &&
          <View
            style={{
              position: 'absolute', height: responsiveHeight(100),
              width: responsiveWidth(100), zIndex: 50, backgroundColor: '#fff'
            }}
          >
            <TouchableOpacity
              style={{ alignContent: 'center', alignItems: 'center' }}
              onPress={async () => {
                this.setState({ isInternetIssue: false })
                this._getCategoryAsync()
                this._getRoomBoxAsync(true)
                this._getProfileFromStorageAsync();
                this._getSessionKeyFromStorageAsync();

                setTimeout(() => {
                  if (roomBox.length == 0) {
                    this.setState({ isInternetIssue: true })
                  }
                }, 15000)

              }}
            >

              <Ionicons style={{
                fontSize: responsiveFontSize(10),
                paddingTop: 12, textAlign: 'center',
                color: '#73aa2a',
                marginTop: responsiveHeight(25)
              }} name='md-refresh' />
              <Text style={{
                color: '#6c6d6d',
                padding: 20, fontSize: responsiveFontSize(2.5)
              }}>Bạn vui lòng kiểm tra INTERNET và tải lại trang</Text>
            </TouchableOpacity>
          </View>
        }
        {/* Banner Marketing */}
        {Banner.length > 0 &&
          <View
            style={{
              height: 80,
            }}
          >
            <Swiper
              style={{}}
              horizontal={true}
              autoplay={true}
              loop={false}
              dotStyle={{ opacity: 0.5 }}
              dotColor='#9B9D9D'
              activeDotStyle={{ opacity: 0.8 }}
              activeDotColor='#fff'

            //showsButtons={true}
            >

              {
                // this.state.roomBox.Images !== "" ?

                Banner.map((y, i) => {

                  return (
                    <Image
                      key={i}
                      style={{ flex: 1 }}
                      source={{ uri: y.Description }} />
                  )

                })
                // :
                // <Image source={require("../images/nha-bao-la.jpg")} />
              }
            </Swiper>
          </View>
        }

        {/* Flatlist RoomBox */}
        <FlatList
          onScroll={this._onScroll}
          // ref='homepage'
          refreshing={this.state.refresh}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          initialNumToRender={2}
          shouldItemUpdate={this._shouldItemUpdate}
          onRefresh={() => { this._refreshRoomBox() }}
          horizontal={false}
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
            <View
              style={{
                paddingLeft: 7, paddingRight: 7,
                paddingBottom: 8,
                paddingTop: 8,
                backgroundColor: '#edeeef',

              }}
            >
              <View style={{
                flex: 1,
                height: height * 0.8,
                borderColor: '#d6d7da',
                padding: 0,
                flexDirection: 'column',

                borderRadius: 7,
                elevation: 2,

                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0.3 },
                shadowOpacity: 0.2,
                shadowRadius: 2,

                backgroundColor: '#fff',
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
                    <View
                      style={{
                        flexDirection: 'row',
                        // alignContent: 'center',
                        alignItems: 'center',
                        // justifyContent: 'center',
                        // paddingTop: 10
                      }}
                    >
                      <Text style={{
                        fontSize: responsiveFontSize(2),
                        fontWeight: 'bold',

                      }}>{item.AccountName.indexOf('|') > -1
                        ?
                        item.AccountName.split('|')[0]
                        :
                        item.AccountName
                        }</Text>

                      {/* Facebook Messenger */}
                      {
                        item.AccountName.indexOf('http://m.me/') > -1 &&
                        <TouchableOpacity
                          style={{
                            // lexDirection: 'row',
                            //flex: 2,
                            //alignItems: 'center',
                          }}
                          onPress={() => {
                            //const FANPAGE_ID = '1750146621679564'
                            //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                            const URL_FOR_BROWSER = item.AccountName.slice(item.AccountName.indexOf('http://m.me/'),
                              item.AccountName.indexOf('|', item.AccountName.indexOf('http://m.me/')))//'http://m.me/thomas.ho.5492216'//ho.can.7'

                            Linking.canOpenURL(URL_FOR_BROWSER)
                              .then((supported) => {
                                if (!supported) {
                                  Linking.openURL(URL_FOR_BROWSER)
                                } else {
                                  Linking.openURL(URL_FOR_BROWSER)
                                }
                              })
                              .catch(err => console.error('An error occurred', err))
                          }}
                        >
                          <Image style={{ width: 18, height: 25, marginLeft: 10, }} source={require('../assets/icons/chat_fm.png')} />
                        </TouchableOpacity>
                      }

                      {/* Zalo Messenger */}
                      {
                        item.AccountName.indexOf('http://zalo.me/') > -1 &&
                        <TouchableOpacity
                          style={{
                            // lexDirection: 'row',
                            //flex: 2,
                            //alignItems: 'center',
                          }}
                          onPress={() => {
                            //const FANPAGE_ID = '1750146621679564'
                            //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                            const URL_FOR_BROWSER = item.AccountName.slice(item.AccountName.indexOf('http://zalo.me/'),
                              item.AccountName.indexOf('|', item.AccountName.indexOf('http://zalo.me/')))//'http://m.me/thomas.ho.5492216'//ho.can.7'

                            Linking.canOpenURL(URL_FOR_BROWSER)
                              .then((supported) => {
                                if (!supported) {
                                  Linking.openURL(URL_FOR_BROWSER)
                                } else {
                                  Linking.openURL(URL_FOR_BROWSER)
                                }
                              })
                              .catch(err => console.error('An error occurred', err))
                          }}
                        >
                          <Image style={{ width: 18, height: 25, marginLeft: 15, }} source={require('../assets/icons/chat_zalo.png')} />
                        </TouchableOpacity>
                      }

                      {/* Whatapps Messenger */}
                      {
                        item.AccountName.indexOf('https://api.whatsapp.com/') > -1 &&
                        <TouchableOpacity
                          style={{
                            // lexDirection: 'row',
                            //flex: 2,
                            //alignItems: 'center',
                          }}
                          onPress={() => {
                            //const FANPAGE_ID = '1750146621679564'
                            //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                            const URL_FOR_BROWSER = item.AccountName.slice(item.AccountName.indexOf('https://api.whatsapp.com/'),
                              item.AccountName.indexOf('|', item.AccountName.indexOf('https://api.whatsapp.com/')))//'http://m.me/thomas.ho.5492216'//ho.can.7'

                            Linking.canOpenURL(URL_FOR_BROWSER)
                              .then((supported) => {
                                if (!supported) {
                                  Linking.openURL(URL_FOR_BROWSER)
                                } else {
                                  Linking.openURL(URL_FOR_BROWSER)
                                }
                              })
                              .catch(err => console.error('An error occurred', err))
                          }}
                        >
                          <Image style={{ width: 18, height: 20, marginLeft: 15, }} source={require('../assets/icons/chat_whatapps.png')} />
                        </TouchableOpacity>
                      }


                      {/* <Ionicons style={{ marginLeft: 5, marginRight: 5, color: '#73aa2a' }} name='ios-arrow-forward' />
                    <Text style={{ fontSize: responsiveFontSize(1.8), color: '#6c6d6d' }}>Chat ngay</Text> */}

                    </View>
                    <TouchableOpacity style={styles.cardAvatarPhoneBox}
                      onPress={() => {
                        Communications.phonecall(
                          item.ContactPhone.indexOf("|") > -1 ? item.ContactPhone.split('|')[0]
                            : item.ContactPhone
                          , true)
                      }}
                    >
                      <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />
                      <Text style={{
                        color: '#7E7E7E',

                        fontSize: responsiveFontSize(1.8),//13,
                        paddingLeft: 8,
                      }}>: {item.ContactPhone.indexOf("|") > -1 ? item.ContactPhone.split('|')[0] + '. LH: ' + item.ContactPhone.split('|')[1]
                        : item.ContactPhone}</Text>
                    </TouchableOpacity>

                  </View>
                </View>

                {/* Highlight */}
                {item.IsHighlight &&

                  // <Ionicons style={{
                  //   position: 'absolute', right: 15, top: 30, zIndex: 10,
                  //   fontSize: responsiveFontSize(6),
                  //   color: '#73aa2a'
                  // }} name="ios-flame" />

                  <Image
                    style={{
                      position: 'absolute',
                      top: Platform.OS == 'ios' ? -4 : -10,
                      right: Platform.OS == 'ios' ? -4 : -10,
                      zIndex: 50,
                      width: responsiveWidth(30),
                      height: responsiveWidth(30),
                    }}
                    source={require('../assets/icons/hot-ico.png')}
                  />
                }

                {/* Wartermark */}
                <Image
                  style={{
                    position: 'absolute', top: 120, right: 15, zIndex: 10, opacity: 0.3,
                    width: responsiveWidth(15),
                    height: responsiveWidth(15),
                    //borderRadius: 100,
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
                    //alert(JSON.stringify(item))
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
                {/* <Text
                  style={{
                    position: 'absolute',
                    top: 330, left: 8,
                    zIndex: 50,
                    flex: 1, color: '#fff', fontWeight: '300',
                    //fontWeight: 'bold',
                    fontSize: responsiveFontSize(1.7)
                  }}>
                  {translate("Price")}: {convertAmountToWording(item.Price)}
                </Text> */}
                <View style={{
                  flexDirection: 'row', paddingLeft: 20,
                  paddingRight: 20, paddingTop: 5, paddingBottom: 5, marginTop: -50,
                  backgroundColor: '#000', opacity: 0.5
                }}>
                  <Text
                    style={{
                      flex: 1, color: '#fff', fontWeight: '300',
                      fontWeight: 'bold',
                      fontSize: responsiveFontSize(1.7)
                    }}>
                    {translate("Price")}: {convertAmountToWording(item.Price)}
                  </Text>

                  {

                    this.state.roomCategory.map((y, i) => {
                      return (
                        y.ID == item.CategoryID &&
                        <Text
                          style={{
                            flex: 2, color: '#fff', fontWeight: '300',
                            fontWeight: 'bold',
                            fontSize: responsiveFontSize(1.7), textAlign: 'right'
                          }}
                          key={i}>{this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]}:  {item.Acreage} m</Text>
                        // : null
                      )
                    })
                  }
                  {/* <Text style={{ flex: 1, textAlign: 'right', color: '#fff' }}> {item.CategoryID} Diện tích:   {item.Acreage} m</Text> */}
                  <Text style={{ fontSize: 8, marginBottom: 5, color: '#fff', fontWeight: 'bold', }}>2</Text>

                </View>
                <View style={styles.cardDesBox}>


                  <View style={{
                    flexDirection: 'row',
                    //marginLeft: 5,
                    marginBottom: 10,
                    marginTop: -10,
                  }}
                  >

                    {/* Posting Date  */}
                    <View
                      style={{ flex: 1, flexDirection: 'row' }}
                    >
                      <Ionicons style={{
                        color: '#7E7E7E',
                        fontSize: responsiveFontSize(1.8),
                      }} name='md-time' />
                      <Text style={{
                        color: '#7E7E7E',
                        fontSize: responsiveFontSize(1.4),//13,
                        paddingLeft: 2,
                      }}>: {item.UpdatedDate}</Text>
                    </View>

                    {/* Room ID */}
                    <View
                      style={{
                        flex: 1, flexDirection: 'row',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Ionicons style={{

                        color: '#7E7E7E',
                        fontSize: responsiveFontSize(1.8),
                      }} name='ios-pricetag-outline' />
                      <Text style={{
                        color: '#7E7E7E',
                        fontSize: responsiveFontSize(1.4),//13,
                        paddingLeft: 2,
                        marginLeft: 3,
                      }}>{translate("RoomId")}: {item.ID}</Text>
                    </View>
                  </View>

                  <Text style={{

                    fontSize: responsiveFontSize(1.8)
                  }}
                    ellipsizeMode='tail'
                    numberOfLines={2}
                  >
                    {translate("Address")}:   {item.Address}</Text>
                  <Text
                    style={{
                      marginTop: 10, color: '#9B9D9D', fontSize: responsiveFontSize(1.8),

                    }}
                    ellipsizeMode='tail'
                    numberOfLines={2}
                  >
                    {item.Description.indexOf('###') > -1 ? (this.state.isVietnamease ? item.Description.split('###')[0] : this.state.isEnglish ? item.Description.split('###')[1] : item.Description.split('###')[2]) : item.Description}</Text>

                  {/* <Text style={styles.cardDesText}>
                  {item.Description}
                </Text> */}
                  {/* <Text>{item.Images.split('|')[2]}</Text> */}
                </View>
                <View style={styles.cardBottom}>
                  {/* Room Icon Left */}
                  <View style={styles.cardBottomLeft}>
                    <Text style={{
                      color: '#8B8E8E'//item.Point == 5 ? '#a4d227' : '#8B8E8E',
                    }}>{item.Point}</Text>

                    {/* Rating */}
                    <TouchableOpacity
                      onPress={async () => {
                        if (this.state.profile === null) {
                          if (Platform.OS == 'ios') {
                            Alert.alert(translate("Notice"), translate("Please login"))
                          } else {
                            ToastAndroid.showWithGravity(translate("Please login"), ToastAndroid.SHORT, ToastAndroid.TOP)
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
                      <Ionicons style={{
                        fontSize: 20,
                        paddingRight: 25,
                        paddingLeft: 5,
                        color: item.Point == 5 ? '#a4d227' : '#8B8E8E',
                      }} name='ios-star' />
                    </TouchableOpacity>
                    <Text style={styles.cardBottomIconText}></Text>

                    {/* Comment */}
                    <TouchableOpacity
                      onPress={() => {
                        //this._postTranslator(item.Address,'zh')
                        this.props.navigation.navigate('RoomDetailScreen', { item, isComment: true });
                      }}
                    >
                      <Ionicons style={styles.cardBottomIcon} name='ios-chatbubbles' />
                    </TouchableOpacity>

                    {/* Pinned */}
                    <TouchableOpacity
                      onPress={() => {
                        if (this.state.profile === null) {
                          if (Platform.OS == 'ios') {
                            Alert.alert(translate("Notice"), translate("Please login"))
                          } else {
                            ToastAndroid.showWithGravity(translate("Please login"), ToastAndroid.SHORT, ToastAndroid.TOP)
                          }
                        } else {

                          this._postPinnedByRoom("true", item.ID)
                        }


                      }}
                    >
                      <Ionicons style={{
                        fontSize: 20,
                        paddingRight: 25,
                        paddingLeft: 5,
                        color: '#8B8E8E',
                      }} name='md-heart-outline' />
                    </TouchableOpacity>

                  </View>

                  {/* Room Icon Righ */}
                  <View style={styles.cardBottomRight}>

                    {/* Like Facebook */}
                    <TouchableOpacity
                      style={{}}
                      onPress={() => {

                        Alert.alert(
                          translate("Notice"),
                          translate("You need to login to Facebook to post this on your Timeline") + '.  \n' + translate("Do you want to login now"),
                          [
                            {
                              text: translate("Cancel"), onPress: () => {

                              }
                            },
                            {
                              text: translate("Agree"), onPress: () => {
                                this._handleFacebookLogin(item.Title, item.Description.indexOf('###') > -1 ? (this.state.isVietnamease ? item.Description.split('###')[0] : this.state.isEnglish ? item.Description.split('###')[1] : item.Description.split('###')[2]) : item.Description
                                  + '\n\n\n' + translate("Install the Nhabaola Application for more Real Estate")
                                  + '\n - iOS: https://itunes.apple.com/vn/app/nhabaola/id1287451307?mt=8'
                                  + '\n - Android: ' + 'https://play.google.com/store/apps/details?id=vn.nhabaola.nhabaola')
                              }
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons style={styles.cardBottomIcon} name='logo-facebook' />
                    </TouchableOpacity>

                    {/* Sharing */}
                    <TouchableOpacity
                      onPress={async () => {

                        let loadBDS = '';
                        await this.state.roomCategory.map((y, i) => {
                          if (y.ID == item.CategoryID) {
                            loadBDS = this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]
                          }
                        })

                        const _contactName = item.ContactPhone.indexOf('|') > -1 ? item.ContactPhone.split('|')[1] : item.AccountName.indexOf('|') > -1
                          ?
                          item.AccountName.split('|')[0]
                          :
                          item.AccountName
                        const _contactPhone = item.ContactPhone.indexOf('|') > -1 ? item.ContactPhone.split('|')[0] : item.ContactPhone
                        const _description = item.Description.indexOf('###') > -1 ? (this.state.isVietnamease ? item.Description.split('###')[0] : this.state.isEnglish ? item.Description.split('###')[1] : item.Description.split('###')[2]) : item.Description

                        if (Platform.OS == 'ios') {
                          Share.share({
                            message: translate("Share from Nhabaola application")
                              + "\n\n" + translate("Contact") + ": " + _contactName
                              + "\n" + translate("Cellphone") + ": " + _contactPhone
                              + "\n\n" + translate("Type of real estate") + ": " + loadBDS
                              + "\n" + translate("Price") + ": " + item.Price + " đồng"
                              + "\n" + translate("Area") + ": " + item.Acreage + " " + translate("Square meters")
                              + "\n" + translate("Address") + ": " + item.Address + "\n\n" + translate("Description") + ":\n" + _description
                              + "\n\n" + translate("Installation") + ": "
                              + "\nAndroid: \nhttps://play.google.com/store/apps/details?id=vn.nhabaola.nhabaola"
                              + "\n\niOS: \nhttps://itunes.apple.com/vn/app/nhabaola/id1287451307?mt=8",
                            //url: 'https://itunes.apple.com/vn/app/nhabaola/id1287451307?mt=8',
                            title: translate("Share from Nhabaola application")
                          }, {
                              // Android only:
                              dialogTitle: translate("Share from Nhabaola application"),
                              // iOS only:
                              excludedActivityTypes: [
                                'http://nhabaola.vn'
                              ]
                            })
                        } else { //Android

                          Share.share({
                            message: translate("Share from Nhabaola application")
                              + "\n\n" + translate("Contact") + ": " + _contactName
                              + "\n" + translate("Cellphone") + ": " + _contactPhone
                              + "\n\n" + translate("Type of real estate") + ": " + loadBDS
                              + "\n" + translate("Price") + ": " + item.Price + " đồng"
                              + "\n" + translate("Area") + ": " + item.Acreage + " " + translate("Square meters")
                              + "\n" + translate("Address") + ": " + item.Address + "\n\n" + translate("Description") + ":\n" + _description
                              + "\n\n" + translate("Installation") + ": "
                              + "\niOS: \nhttps://itunes.apple.com/vn/app/nhabaola/id1287451307?mt=8"
                              + "\n\nAndroid: \nhttps://play.google.com/store/apps/details?id=vn.nhabaola.nhabaola",
                            url: 'https://play.google.com/store/apps/details?id=vn.nhabaola.nhabaola',
                            title: translate("Share from Nhabaola application")
                          }, {
                              // Android only:
                              dialogTitle: translate("Share from Nhabaola application"),
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
                            Alert.alert(translate("Notice"), translate("Please login"))
                          } else {
                            ToastAndroid.showWithGravity(translate("Please login"), ToastAndroid.SHORT, ToastAndroid.TOP)
                          }
                        } else {
                          await this.setState({
                            reportRoomId: item.ID,
                            toUserMailBox: item.CreatedBy
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
            </View>
          }
          keyExtractor={item => item.ID + 'nhabaola'}

        /* horizontal={false}
        numColumns={3} */
        />
        {
          this.state.refresh && Platform.OS == 'ios' &&
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
        {
          this.state.isActionButtonVisible ?
            <ActionButton
              buttonColor="#73aa2a" s
              //hadowStyle={{ elevation: 2 }}
              //bgColor={"red"}
              offsetX={20}
              offsetY={55}
              renderIcon={active => active
                ? (<Icon name="md-create" style={{
                  fontSize: 25,
                  height: 22,
                  color: 'white',
                }} />)
                : (<Icon name="md-create" style={{
                  fontSize: 25,
                  height: 22,
                  color: 'white',
                }} />)}
              // shadowStyle={{
              //   shadowColor: "#000000",
              //   shadowOpacity: 0.8,
              //   shadowRadius: 2,
              //   shadowOffset: {
              //     height: 1,
              //     width: 0
              //   },
              //   elevation: 2
              // }}
              onPress={() => {
                if (this.state.profile === null) {
                  // if (Platform.OS == 'ios') {
                  //   Alert.alert(translate("Notice"), translate("Please login"))
                  // } else {
                  //   ToastAndroid.showWithGravity(translate("Please login"), ToastAndroid.SHORT, ToastAndroid.TOP)
                  // }
                  if (Platform.OS == 'ios') {
                    this.setState({ modalLogin: true })
                  } else {
                    this.popupLogin.show()
                  }


                  // const timing = Animated.timing;
                  // Animated.parallel([
                  //   timing(this.state.animation.usernamePostionLeft, {
                  //     toValue: 0,
                  //     duration: 900
                  //   }),
                  //   timing(this.state.animation.passwordPositionLeft, {
                  //     toValue: 0,
                  //     duration: 1100
                  //   }),
                  //   timing(this.state.animation.loginPositionTop, {
                  //     toValue: 0,
                  //     duration: 700
                  //   }),
                  //   timing(this.state.animation.statusPositionTop, {
                  //     toValue: 0,
                  //     duration: 700
                  //   })

                  // ]).start()

                } else { // Already Login


                  this.props.navigation.navigate('PostRoomScreen', {
                    onRefreshScreen: this.onRefreshScreen,
                    _getWalletAsync: this._getWalletAsync,
                  })
                }
              }}
            >

              {/* {this.state.profile === null &&
                <ActionButton.Item buttonColor='#a4d227'
                  textContainerStyle={{ backgroundColor: '#73aa2a' }}
                  textStyle={{ color: '#fff' }}
                  title={translate('Login')} onPress={() => {


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
              } */}
              {/* <ActionButton.Item buttonColor='#a4d227'
                textContainerStyle={{ backgroundColor: '#73aa2a' }}
                textStyle={{ color: '#fff' }}
                title={translate('Post')} onPress={() => {
                  this.state.profile
                    ?
                    //this.props.navigation.navigate('PostRoomScreen', { onSelect: this.onSelect })
                    this.props.navigation.navigate('PostRoomScreen', {
                      onRefreshScreen: this.onRefreshScreen,
                      _getWalletAsync: this._getWalletAsync,
                    })
                    :
                    Platform.OS === 'android'
                      ? ToastAndroid.showWithGravity(translate('Please login'), ToastAndroid.SHORT, ToastAndroid.TOP)
                      : Alert.alert(translate('Please login'))



                }}>
                <Icon name="md-cloud-upload" style={styles.actionButtonIcon} />
              </ActionButton.Item> */}


              {/* {this.state.refreshScreen &&
              <ActionButton.Item buttonColor='#a4d227' title="Testing" onPress={() => {
                // alert(this.state.selected)
              }}>
                <Icon name="logo-usd" style={styles.actionButtonIcon} />
              </ActionButton.Item>
            } */}

              {/* {this.state.profile !== null &&
                <ActionButton.Item buttonColor='#a4d227'
                  textContainerStyle={{ backgroundColor: '#73aa2a' }}
                  textStyle={{ color: '#fff' }}
                  title={translate('Personal page')} onPress={() => {

                    this.props.navigation.navigate("ProfileScreen", {
                      onRefreshScreen: this.onRefreshScreen,
                      _getWalletAsync: this._getWalletAsync
                    });

                  }}>
                  <Icon name="md-person" style={styles.actionButtonIcon} />
                </ActionButton.Item>
              } */}

              {/* {this.state.profile !== null &&
                <ActionButton.Item buttonColor='#a4d227'
                  textContainerStyle={{ backgroundColor: '#73aa2a' }}
                  textStyle={{ color: '#fff' }}
                  title={numberWithCommas(this.state.wallet) + " đ"} onPress={() => {

                    this.popupSelectedImage.show()
                    //this.setState({ isEnableQR: true })

                  }}>
                  <Icon name="logo-usd" style={styles.actionButtonIcon} />
                </ActionButton.Item>
              } */}
              {/* <ActionButton.Item buttonColor='#1abc9c' title="All Tasks" onPress={() => { }}>
              <Icon name="md-done-all" style={styles.actionButtonIcon} />
            </ActionButton.Item> */}

              {/* <Icon name="md-create" style={{ color: '#fff' }} /> */}
            </ActionButton>
            : null
        }


        {/* Sub Menu */}

        <Animated.View
          style={{
            //position:'absolute',
            flexDirection: 'row',
            height: 45,
            borderTopWidth: 0.5,
            borderColor: '#73aa2a',
            //marginTop: this.state.roomByCatHeigh,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,

          }}
        >
          {/* Avartar */}
          <TouchableOpacity
            style={{
              flex: 2,
              //borderRightWidth: 0.5,
              // borderColor: '#73aa2a',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {

              if (this.state.profile === null) {

                if (Platform.OS == 'ios') {
                  this.setState({ modalLogin: true })
                } else {
                  this.popupLogin.show()
                }


                // const timing = Animated.timing;
                // Animated.parallel([
                //   timing(this.state.animation.usernamePostionLeft, {
                //     toValue: 0,
                //     duration: 900
                //   }),
                //   timing(this.state.animation.passwordPositionLeft, {
                //     toValue: 0,
                //     duration: 1100
                //   }),
                //   timing(this.state.animation.loginPositionTop, {
                //     toValue: 0,
                //     duration: 700
                //   }),
                //   timing(this.state.animation.statusPositionTop, {
                //     toValue: 0,
                //     duration: 700
                //   })

                // ]).start()
              } else {
                this.props.navigation.navigate("ProfileScreen", {
                  onRefreshScreen: this.onRefreshScreen,
                  _getWalletAsync: this._getWalletAsync
                });
              }
            }}
          >
            {this.state.profile ?
              <Image source={{ uri: this.state.profile.Avarta }} style={{ width: 30, height: 30, borderRadius: Platform.OS === 'ios' ? 15 : 100, }} />
              :
              <Ionicons style={{
                fontSize: responsiveFontSize(4),
                color: '#73aa2a'
              }}
                name='md-person'
              />
            }

            {/* <Text style={{ fontSize: responsiveFontSize(1.4), color: '#73aa2a' }}>QR</Text> */}
          </TouchableOpacity>

          {/* QR */}
          <TouchableOpacity
            style={{
              flex: 2,
              //borderRightWidth: 0.5,
              // borderColor: '#73aa2a',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              if (this.state.profile === null) {
                if (Platform.OS == 'ios') {
                  Alert.alert(translate("Notice"), translate("Please login"))
                } else {
                  ToastAndroid.showWithGravity(translate("Please login"), ToastAndroid.SHORT, ToastAndroid.TOP)
                }
              } else {

                // this.setState({ isEnableQR: true })
                this.popupSelectedImage.show()

                // this.props.navigation.navigate("QRScreen", {
                //   onRefreshScreen: this.onRefreshScreen,
                //   _getWalletAsync: this._getWalletAsync
                // });

              }


            }}
          >
            <Ionicons style={{
              fontSize: responsiveFontSize(3),
              color: '#73aa2a'
            }}
              name='ios-qr-scanner'
            />
            <Text style={{ fontSize: responsiveFontSize(1.4), color: '#73aa2a' }}>QR</Text>
          </TouchableOpacity>


          {/* Category */}
          <TouchableOpacity
            style={{
              flex: 2,
              //borderRightWidth: 0.5,
              //borderColor: '#73aa2a',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}

            onPress={() => {
              if (Platform.OS == 'ios') {
                this.refs.pickerCategory.show()
              }
              else {
                this.refs.modalDropdownCategory.show()
              }
            }}
          >
            <Ionicons style={{
              fontSize: responsiveFontSize(3),
              color: '#73aa2a'
            }}
              name='ios-menu-outline'
            />
            <Text style={{ fontSize: responsiveFontSize(1.4), color: '#73aa2a' }}>{translate("Type of real estate")}</Text>

            {Platform.OS == 'ios' ?

              <SimplePicker
                ref={'pickerCategory'}
                options={this.state.roomCategory.map((y, i) => y.ID)}
                labels={this.state.roomCategory.map((y, i) => this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1])}
                confirmText={translate("Agree")}
                cancelText={translate("Cancel")}
                itemStyle={{
                  fontSize: 25,
                  color: '#73aa2a',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
                onSubmit={async (option, label) => {

                  let _catName = '';
                  this.state.roomCategory.map((y, i) => {
                    if (y.ID === option) {
                      _catName = this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]

                    }
                  })

                  this.props.navigation.navigate('RoomByCategoryScreen', {
                    CategoryID: option,
                    CategoryName: _catName
                  })
                }}
              />
              : // Android
              <ModalDropdown
                ref="modalDropdownCategory"
                options={this.state.roomCategory.map((y, i) => {
                  return cat = {
                    id: y.ID,
                    name: this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]
                  }
                  //return '{"id":' + y.ID + ',"name":' + '"' + y.CatName + '"}'
                  //return `{"id":"${y.ID}", "name":"${y.CatName}"}`;
                })}

                style={{
                  // marginRight: 2,
                  // marginLeft: 2,
                  // flexDirection: 'row',
                  // alignContent: 'center',
                  // alignItems: 'center',
                  // justifyContent: 'center'

                }}
                dropdownStyle={{
                  width: responsiveWidth(50),
                  elevation: 2,
                  height: responsiveHeight(40),
                  marginTop: -65,
                  marginLeft: -responsiveWidth(25),
                  borderRadius: 10,
                }}
                dropdownTextStyle={{ textAlign: 'center' }}
                defaultValue={''}
                //  onDropdownWillShow={this._dropdown_5_willShow.bind(this)}
                // onDropdownWillHide={this._dropdown_5_willHide.bind(this)}
                //options={DEMO_OPTIONS_2}
                renderButtonText={(rowData) => {
                  // const { name, age } = rowData;
                  // return `${name} - ${age}`;
                  return <Text style={{}}></Text>
                }}
                renderRow={(rowData, rowID, highlighted) => {
                  //let icon = highlighted ? require('../assets/images/nbl-house_icon.png') : require('../assets/images/nbl-house_icon.png');
                  let evenRow = rowID % 2;
                  return (
                    <TouchableOpacity underlayColor='cornflowerblue'
                      style={{}}
                    >
                      <View style={{
                        //backgroundColor: evenRow ? '#a4d227' : 'white',
                        borderBottomWidth: 0.3,
                        borderColor: '#73aa2a'
                      }}>
                        {/* <Image style={{width:20,height:20}}
            mode='stretch'
            source={icon}
          /> */}
                        {/* <Text style={[styles.dropdown_2_row_text, highlighted && { color: 'mediumaquamarine' }]}> */}
                        <Text style={{
                          padding: 5,
                          color: '#73aa2a'
                        }}>
                          {/* {`${rowData.id} ${rowData.name})`} */}
                          {rowData.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => {
                  // if (rowID == DEMO_OPTIONS_2.length - 1) return;
                  // let key = `spr_${rowID}`;
                  // return (<View style={styles.dropdown_2_separator}
                  //   key={key}
                  // />);
                }}
                onSelect={async (idx, value) => {
                  //alert(JSON.stringify(value))

                  this.props.navigation.navigate('RoomByCategoryScreen', {
                    CategoryID: value.id,
                    CategoryName: value.name
                  })
                }}
              >
              </ModalDropdown>

            }
          </TouchableOpacity>

          {/* Hot Room */}
          <TouchableOpacity
            style={{
              flex: 2,
              // borderRightWidth: 0.5,
              // borderColor: '#73aa2a',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              this.props.navigation.navigate('RoomByCategoryScreen', { CategoryID: 0, CategoryName: "HOT" })
            }}
          >
            <Ionicons style={{
              fontSize: responsiveFontSize(3),
              color: '#73aa2a'
            }}
              name='ios-flame'
            />
            <Text style={{ fontSize: responsiveFontSize(1.4), color: '#73aa2a' }}>Hot</Text>
          </TouchableOpacity>

          {/* Multi Language */}
          <View
            style={{
              flex: 4,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              //borderRightWidth: 0.5,
              //borderColor: '#73aa2a'
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                // alignContent: 'center',
                // alignItems: 'center',
                // justifyContent: 'center',
                //opacity: this.state.languageOpacity,//0.2,
              }}
            >
              {/* Vietnamese */}
              <TouchableOpacity
                style={{
                  //padding: 8,
                  paddingRight: 15,

                }}
                onPress={async () => {
                  setLocalization(viTranslation);
                  this.setState({ isVietnamease: true, isEnglish: false, isChinease: false })
                  this._getRoomBoxAsync(true)
                  if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(translate("You have switched languages to Vietnamease"), ToastAndroid.SHORT, ToastAndroid.TOP);
                  }
                  else {
                    Alert.alert(translate("Notice"), translate("You have switched languages to Vietnamease"))
                  }
                  await this._saveStorageAsync('language', 'viTranslation')
                  this.forceUpdate()

                }}
              >
                <Text style={{
                  fontSize: responsiveFontSize(1.7),
                  color: this.state.isVietnamease ? '#73aa2a' : '#9B9D9D',

                }}>VI</Text>
              </TouchableOpacity>

              {/* English */}
              <TouchableOpacity
                style={{
                  paddingRight: 15,

                }}
                onPress={async () => {
                  setLocalization(enTranslation);
                  this.setState({ isVietnamease: false, isEnglish: true, isChinease: false })
                  this._getRoomBoxAsync(true)
                  if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(translate("You have switched languages to English"), ToastAndroid.SHORT, ToastAndroid.TOP);
                  }
                  else {
                    Alert.alert(translate("Notice"), translate("You have switched languages to English"))
                  }
                  await this._saveStorageAsync('language', 'enTranslation')
                  this.forceUpdate()

                }}
              >
                <Text style={{
                  fontSize: responsiveFontSize(1.7),
                  color: this.state.isEnglish ? '#73aa2a' : '#9B9D9D',
                }}>EN</Text>
              </TouchableOpacity>

              {/* Chinease */}
              <TouchableOpacity
                style={{
                  // padding: 8,

                }}

                onPress={async () => {
                  setLocalization(zhTranslation);
                  this.setState({ isVietnamease: false, isEnglish: false, isChinease: true })
                  this._getRoomBoxAsync(true)
                  if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(translate("You have switched languages to Chinease"), ToastAndroid.SHORT, ToastAndroid.TOP);
                  }
                  else {
                    Alert.alert(translate("Notice"), translate("You have switched languages to Chinease"))
                  }
                  await this._saveStorageAsync('language', 'zhTranslation')
                  this.forceUpdate()

                }}
              >
                <Text style={{
                  fontSize: responsiveFontSize(1.7),
                  color: this.state.isChinease ? '#73aa2a' : '#9B9D9D',
                }}>中文</Text>
              </TouchableOpacity>
            </View>
          </View>

        </Animated.View>


        {/* Popup Reset Password Step 1 */}
        <PopupDialog
          ref={(popupResetPassword) => { this.popupResetPassword = popupResetPassword; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title={translate("Retrieve password")} titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{
            marginBottom: responsiveHeight(45), width: responsiveWidth(90),
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
              //position: 'relative', left: this.state.animation.usernamePostionLeft,
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
                placeholder={translate("Cellphone")}
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
              title={translate("Cancel")}
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
              title={translate("Agree")} />
          </View>

        </PopupDialog>

        {/* Modal Reset Password Step 1 */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalResetPassword1}
          onRequestClose={() => {
            this.setState({ modalResetPassword1: false })
          }}
          onShow={() => {
            this.refs.iosResetUserNameInput.focus()
          }}
        >
          {/* {this.state.modalLoading &&

            <ActivityIndicator
              style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
              animating={true}
              size="large"
              color="#73aa2a"
            />

          } */}

          <View style={{
            padding: 20,
            marginTop: responsiveHeight(30)
          }}>


            {/* Username */}
            <Animated.View style={{
              //position: 'relative', left: this.state.animation.usernamePostionLeft,
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
                placeholder={translate("Cellphone")}
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
              title={translate("Cancel")}
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
              title={translate("Agree")} />
          </View>
        </Modal>

        {/* Popup Reset Password Step 2 */}
        <PopupDialog
          ref={(popupActiveNewPassword) => { this.popupActiveNewPassword = popupActiveNewPassword; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title={translate("New password")} titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{
            marginBottom: responsiveHeight(45), width: responsiveWidth(90),

          }}
          onShown={() => {
            this.refs.ActiveKeyInput.focus()
          }}
        >

          <View style={{
            padding: 15
          }}>
            <Text style={{ textAlign: 'center', color: '#73aa2a' }}>{translate("Please check Email to get Activation Code for new password")}</Text>
            {/* Active Key */}
            <Animated.View style={{
              //position: 'relative', left: this.state.animation.usernamePostionLeft,
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
                placeholder={translate("Activation code for new password")}
                autoCapitalize='sentences'
                keyboardType='numeric'
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(resetPasswordActiveKey) => this.setState({ resetPasswordActiveKey })}
                value={this.state.resetPasswordActiveKey}
              />
            </Animated.View>
            {/* New password  */}
            <Animated.View style={{
              //position: 'relative', left: this.state.animation.usernamePostionLeft,
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
                placeholder={translate("New password")}
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
              title={translate("Cancel")}
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
              title={translate("Agree")} />
          </View>
        </PopupDialog>


        {/* Modal Reset Password Step 2 */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalResetPassword2}
          onRequestClose={() => {
            this.setState({ modalResetPassword2: false })
          }}
          onShow={() => {
            this.refs.ActiveKeyInput.focus();
          }}
        >

          {/* {this.state.modalLoading &&
            <ActivityIndicator
              style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
              animating={true}
              size="large"
              color="#73aa2a"
            />} */}

          <View style={{
            padding: 15,
            marginTop: 60,
          }}>
            <Text style={{ textAlign: 'center', color: '#73aa2a' }}>{translate("Please check Email to get Activation Code for new password")}</Text>
            {/* Active Key */}
            <Animated.View style={{
              //position: 'relative', left: this.state.animation.usernamePostionLeft,
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
                placeholder={translate("Activation code for new password")}
                autoCapitalize='sentences'
                keyboardType='numeric'
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(resetPasswordActiveKey) => this.setState({ resetPasswordActiveKey })}
                value={this.state.resetPasswordActiveKey}
              />
            </Animated.View>
            {/* New password  */}
            <Animated.View style={{
              //position: 'relative', left: this.state.animation.usernamePostionLeft,
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
                placeholder={translate("New password")}
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
              title={translate("Cancel")}
              onPress={() => {
                Keyboard.dismiss();
                this.setState({
                  modalResetPassword2: false,
                  modalLoading: false,
                  resetPasswordNewPassword: '',
                  resetPasswordActiveKey: ''
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
              title={translate("Agree")} />
          </View>

        </Modal>

        {/* Popup Login */}
        <PopupDialog
          ref={(popupLogin) => { this.popupLogin = popupLogin; }}
          dialogAnimation={new ScaleAnimation()}
          dialogTitle={<DialogTitle title={translate("Login")} titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{ marginBottom: responsiveHeight(45), width: responsiveWidth(90) }}
          onShown={() => {
            this.refs.userNameInput.focus()
          }}

        >
          <View>
            {/* Username */}
            <Animated.View style={{
              //position: 'relative', left: this.state.animation.usernamePostionLeft,
              flexDirection: 'row', padding: 10,
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person' />
              <FormInput
                ref='userNameInput'
                returnKeyType={"next"}
                onSubmitEditing={(event) => {
                  this.refs.passwordInput.focus();
                }}
                containerStyle={{ flex: 15 }}
                placeholder={translate("Cellphone")}
                autoCapitalize='sentences'
                keyboardType='phone-pad'
                value={this.state.loginUsername}
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(loginUsername) => this.setState({ loginUsername })}
              />
            </Animated.View>
            {/* Password */}
            <Animated.View style={{
              //position: 'relative', left: this.state.animation.passwordPositionLeft,
              flexDirection: 'row', padding: 10, paddingTop: 0,
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-lock' />
              <FormInput
                ref='passwordInput'
                returnKeyType={"done"}
                onSubmitEditing={(event) => {
                  this._loginAsync()
                }}
                containerStyle={{ flex: 15 }}
                placeholder={translate("Password")}
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
                title={translate("Cancel")}
                onPress={() => {
                  Keyboard.dismiss();
                  this.popupLogin.dismiss()
                }}
              />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                raised={false}
                icon={{ name: 'md-checkmark', type: 'ionicon' }}
                title={translate("Login")}
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
                <Text style={{ padding: 15, textAlign: 'center', }}>{translate("Forgot password")}</Text>
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
                <Text style={{ padding: 15, textAlign: 'center' }}>{translate("Sign up")}</Text>
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
          onRequestClose={() => {
            this.setState({ modalLogin: false })
          }}
          onShow={() => {
            // setTimeout(() => {
            this.refs.iosUserNameInput.focus()
            // }, 150)
          }}
        >

          <View>

            {/* {this.state.modalLoading &&

              <ActivityIndicator
                style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
                animating={true}
                size="large"
                color="#73aa2a"
              />
            } */}

            {/* Username */}
            <Animated.View style={{
              //  position: 'relative',
              //left: this.state.animation.usernamePostionLeft,
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
                placeholder={translate("Cellphone")}
                autoCapitalize='sentences'
                keyboardType='phone-pad'
                value={this.state.loginUsername}
                underlineColorAndroid={'#73aa2a'}
                onChangeText={(loginUsername) => this.setState({ loginUsername })}
              />
            </Animated.View>
            {/* Password */}
            <Animated.View style={{
              //position: 'relative', left: this.state.animation.passwordPositionLeft,
              flexDirection: 'row', padding: 10, paddingTop: 0,
            }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-lock' />
              <FormInput
                ref='passwordInput'
                returnKeyType={"done"}
                onSubmitEditing={(event) => {
                  Keyboard.dismiss()
                  this._loginAsync()
                }}
                containerStyle={{ flex: 15 }}
                placeholder={translate("Password")}
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
                title={translate("Cancel")}
                onPress={() => {
                  Keyboard.dismiss();
                  if (Platform.OS == 'ios') {
                    this.setState({
                      modalLogin: false,
                      modalLoading: false,
                      loginUsername: '',
                      loginPassword: '',
                    })
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
                title={translate("Login")}
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
                <Text style={{ padding: 15, textAlign: 'center', }}>{translate("Forgot password")}</Text>
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
                <Text style={{ padding: 15, textAlign: 'center' }}>{translate("Sign up")}</Text>
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
          dialogTitle={<DialogTitle title={translate("Violation report")} titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
          dismissOnTouchOutside={false}
          dialogStyle={{ marginBottom: responsiveHeight(45), width: responsiveWidth(90) }}

        >
          <View>
            <CheckBox
              title={translate("Address is not correct")}
              checked={this.state.reportAddress}
              onPress={() => {
                this.setState({
                  reportAddress: !this.state.reportAddress
                })
              }}
            />
            <CheckBox
              title={translate("Cannot contact")}
              checked={this.state.reportCall}
              onPress={() => {
                this.setState({
                  reportCall: !this.state.reportCall
                })
              }}
            />
            <CheckBox
              title={translate("The house has been rented")}
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
                title={translate("Cancel")} />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                icon={{ name: 'md-cloud-upload', type: 'ionicon' }}
                title={translate("Send")}
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

                  ToastAndroid.showWithGravity(translate("Thanks your for reporting to Nhabaola"), ToastAndroid.SHORT, ToastAndroid.TOP);

                  // Notify Admin 
                  notifyNBLAsync(globalVariable.ADMIN_PUSH_TOKEN
                    , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.reportRoomId } } //{ ...roombox }
                    , "default"
                    , this.state.profile.FullName + " " + translate("Complaint") + ":"
                    , translate("Inaccurate Address or Not Called or Leased House")
                  ); //pushToken, data, sound, title, body

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
          onRequestClose={() => {
            this.setState({ modalReport: false })
          }}
        >

          {/* {this.state.modalLoading &&

            <ActivityIndicator
              style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
              animating={true}
              size="large"
              color="#73aa2a"
            />

          } */}


          <View
            style={{ marginTop: 70 }}
          >
            <CheckBox
              title={translate("Address is not correct")}
              checked={this.state.reportAddress}
              onPress={() => {
                this.setState({
                  reportAddress: !this.state.reportAddress
                })
              }}
            />
            <CheckBox
              title={translate("Cannot contact")}
              checked={this.state.reportCall}
              onPress={() => {
                this.setState({
                  reportCall: !this.state.reportCall
                })
              }}
            />
            <CheckBox
              title={translate("The house has been rented")}
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
                title={translate("Cancel")} />

              <Button
                buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                icon={{ name: 'md-cloud-upload', type: 'ionicon' }}
                title={translate("Send")}
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

                  this.dropdown.alertWithType('success', translate("Notice"), translate("Thanks your for reporting to Nhabaola"));
                  // Alert.alert(translate("Notice"), translate("Thanks your for reporting to Nhabaola"));

                  // Notify Admin 
                  notifyNBLAsync(globalVariable.ADMIN_PUSH_TOKEN
                    , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.reportRoomId } } //{ ...roombox }
                    , "default"
                    , this.state.profile.FullName + " " + translate("Complaint") + ":"
                    , translate("Inaccurate Address or Not Called or Leased House")
                  ); //pushToken, data, sound, title, body       

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
            fullStarColor={'#a4d227'}
            rating={this.state.starCount}
            selectedStar={(rating) => {
              //this.onStarRatingPress(rating)
              this._postRatingByRoom(rating, this.state.ratingRoomId)
            }}
          />
        </PopupDialog>




        {/* Modal Register Account */}
        {/* <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalRegisterAccount}
          onRequestClose={() => {
            this.setState({ modalRegisterAccount: false })
          }}
        >
          <ScrollView>
            <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity
                style={{}}
                onPress={async () => {
                 
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
        </Modal> */}



        {/* Popup QR scanner */}
        <PopupDialog
          ref={(popupSelectedImage) => { this.popupSelectedImage = popupSelectedImage; }}
          dialogAnimation={new ScaleAnimation()}
          dialogStyle={{ marginBottom: 10, width: width * 0.9, height: 130, justifyContent: 'center', padding: 20 }}
          dismissOnTouchOutside={true}
        //onShown={() => { this.setState({ isScanQR: true }) }}
        >
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
            <TouchableOpacity
              style={{ flex: 2, justifyContent: 'center', alignContent: 'center' }}
              onPress={async () => {
                this.popupSelectedImage.dismiss();
                //this._pickImageAsync('library', this.state.selectedImages)
              }}
            >
              <Ionicons style={{
                fontSize: 40, borderRadius: 10,
                //backgroundColor: '#a4d227',
                color: '#a4d227', textAlign: 'center', padding: 10
              }} name='ios-qr-scanner' >
              </Ionicons>
              <Text style={{ textAlign: 'center', marginTop: 5 }}>{translate("QR Pay")}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}></View>
            <TouchableOpacity
              style={{ flex: 2, justifyContent: 'center', alignContent: 'center', }}
              onPress={async () => {
                await this.setState({ isEnableQR: true })
                await this.popupSelectedImage.dismiss();
                this.popupQRPay.show()
                // this.setState({ modalQRScan: true })
              }}
            >

              <Ionicons style={{
                fontSize: 40, borderRadius: 10,
                // backgroundColor: '#a4d227', 
                color: '#a4d227', textAlign: 'center', padding: 10
              }} name='md-qr-scanner' />
              <Text style={{ textAlign: 'center', marginTop: 5 }}>{translate("QR Top Up")}</Text>
            </TouchableOpacity>
          </View>
        </PopupDialog>


        {/* Popup QR Pay */}
        {this.state.isEnableQR &&
          <PopupDialog
            ref={(popupQRPay) => { this.popupQRPay = popupQRPay; }}
            dialogAnimation={new ScaleAnimation()}
            dialogStyle={{
              marginBottom: 10,
              width: responsiveWidth(90),
              height: responsiveHeight(80),
              justifyContent: 'center', padding: 20,
            }}
            //dialogTitle={<DialogTitle title={translate("QR Top Up")} />}
            dismissOnTouchOutside={false}
            // onDismissed={() => { this.setState({ isScanQR: false }) }}
            // actions={<DialogButton text={translate("Cancel")} align="center" onPress={() => this.popupQRPay.dismiss()} />}
            onShown={() => { isScanQR = true }}
          >
            <View style={{
              flex: 1,
              //flexDirection: 'row',
              justifyContent: 'center', alignContent: 'center'
            }}>



              <Text style={{
                textAlign: 'center', marginTop: 5,
                marginBottom: 10, color: '#73aa2a',
                textAlign: 'center',
                fontSize: responsiveFontSize(2.2)
              }}>{translate("QR Top Up")}</Text>


              <BarCodeScanner
                onBarCodeRead={
                  this._handleBarCodeRead
                }
                style={{
                  width: responsiveWidth(80),
                  height: responsiveHeight(55),
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons style={{
                  fontSize: responsiveFontSize(25),
                  zIndex: 25,
                  textAlign: 'center',
                  color: '#fff',
                  opacity: 0.8,
                }} name='ios-qr-scanner' />

              </BarCodeScanner>

              {/* Top Up Code */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                  marginTop: 10,
                }}
              >

                <TouchableOpacity style={{
                  //  flex: 2,
                  // height: 40,
                  // backgroundColor: '#73aa2a',
                  //marginLeft: 10,
                  //  borderRadius: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                  onPress={async () => {
                    //this._handleBarCodeRead(this.state.topUpCode)
                    this.popupQRPay.dismiss()
                    this.setState({ modalTopUpCode: true, })
                    //  this._postCommentsAsync();
                  }}
                >
                  <Text style={{ color: '#73aa2a', }}>{translate("Or enter your top up code here")}</Text>
                </TouchableOpacity>

              </View>


              <TouchableOpacity
                onPress={() => {
                  this.popupQRPay.dismiss()
                  this.setState({ isEnableQR: false })
                }}
              >

                <Text style={{
                  textAlign: 'center',
                  padding: 20,
                  //marginBottom: 10,
                  color: '#6c6d6d',
                  textAlign: 'center',
                  fontSize: responsiveFontSize(2.2),
                }}>{translate("Cancel")}</Text>
              </TouchableOpacity>

            </View>
          </PopupDialog>
        }

        {/* Modal Top Up Code */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalTopUpCode}
          onRequestClose={() => {
            this.setState({ modalTopUpCode: false })
          }}
          onShow={() => {
            this.refs.topUpCodeInput.focus()
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              //marginBottom: 10,
              marginTop: 50,
              marginBottom: 20,
            }}
          >
            {/* <FormLabel style={{}}>{translate("Contact Person")}</FormLabel> */}

            <Ionicons style={{ flex: 1, fontSize: 18, paddingTop: 12, paddingLeft: 5, textAlign: 'center', }} name='logo-usd' />
            <FormInput
              ref='topUpCodeInput'
              returnKeyType={'done'}//{Platform.OS == 'ios' ? "done" : "next"}
              onSubmitEditing={(event) => {

                if (this.state.topUpCode.data == '') {
                  if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(translate("Please enter top up code"), ToastAndroid.SHORT, ToastAndroid.TOP);
                  }
                  else {
                    //Alert.alert('Thông báo', 'Vui lòng nhập Mã Nạp Tiền');
                  }

                  return
                }
                Keyboard.dismiss()
                this.setState({ modalTopUpCode: false })
                this._handleBarCodeRead(this.state.topUpCode)
              }}
              onFocus={(event) => {
                // this._scrollToInput(event.target)
              }}
              containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
              inputStyle={{ color: '#000' }}
              placeholder={translate("Top Up Code")}
              multiline={false}
              // maxLength={8}
              //numberOfLines={5}
              //keyboardType='default'
              // autoCapitalize='sentences'
              //maxLength={300}
              clearButtonMode='always'
              underlineColorAndroid='#73aa2a'
              blurOnSubmit={false}
              value={this.state.topUpCode.data}
              onChangeText={(topUpCode) => this.setState({ topUpCode: { data: topUpCode } })}
            />

          </View>

          {/* Form Button */}
          <View style={{
            height: 80, flexDirection: 'row',
            alignItems: 'center', justifyContent: 'center',

            // paddingBottom: 10,
            // shadowColor: '#000',
            // shadowOffset: { width: 0, height: 2 },
            // shadowOpacity: 0.2,
            // shadowRadius: 2,
            // elevation: 2,
          }}>
            <Button
              buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'ios-backspace', type: 'ionicon' }}
              title={translate("Cancel")}
              onPress={() => {
                Keyboard.dismiss()
                this.setState({
                  modalTopUpCode: false,
                  isEnableQR: false,
                })
              }}
            />

            <Button
              buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
              raised={false}
              icon={{ name: 'md-checkmark', type: 'ionicon' }}
              title={translate("Agree")}
              onPress={async () => {


                if (this.state.topUpCode.data == '') {
                  if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(translate("Please enter top up code"), ToastAndroid.SHORT, ToastAndroid.TOP);
                  }
                  else {
                    //Alert.alert('Thông báo', 'Vui lòng nhập Mã Nạp Tiền');
                  }
                  return
                }
                Keyboard.dismiss()
                this.setState({ modalTopUpCode: false })
                this._handleBarCodeRead(this.state.topUpCode)
              }}
            />
          </View>

        </Modal>


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
            <Text style={{ fontSize: responsiveFontSize(2), color: '#73aa2a', marginBottom: 10, }}>{translate("Congratulation")}</Text>
            <Text>{translate("You get")} {numberWithCommas(this.state.wallet)} {translate("dong in wallet")}</Text>
          </View>
        </PopupDialog>


        {/* DropdownAlert - https://github.com/testshallpass/react-native-dropdownalert */}
        <DropdownAlert
          ref={ref => this.dropdown = ref}
          containerStyle={{}}
          defaultContainer={{
            opacity: 0.9,
            padding: 5,
            paddingTop: Platform.OS == 'ios' ? 20 : 0,
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
          showCancel={true}
          // onClose={data => {
          //   this.setState({ modalLogin: true })
          // }}
          // onCancel={data => {
          //   this.setState({ modalLogin: true })
          // }}
          // containerStyle={}
          titleStyle={{
            fontSize: responsiveFontSize(2.5),
            textAlign: 'left',
            fontWeight: 'bold', color: '#73aa2a', backgroundColor: 'transparent'
          }}
          messageStyle={{
            fontSize: responsiveFontSize(2.2),
            textAlign: 'left',
            // fontWeight: 'bold',
            color: '#6c6d6d',
            backgroundColor: 'transparent',
            paddingTop: 10,
          }}
          imageStyle={{
            padding: 8, width: 36, height: 36, alignSelf: 'center'
          }}
          cancelBtnImageStyle={{
            padding: 8, width: 36, height: 36, alignSelf: 'center',
            backgroundColor: '#a4d227', borderRadius: 18,
          }}
          successColor={'#fff'}
          successImageSrc={null}
        //imageSrc={'https://facebook.github.io/react-native/docs/assets/favicon.png'}
        // renderImage={(props) => this.renderImage(props)}
        //renderCancel={(props) => this.renderImage(props)}
        />
      </View >
    );
  }


  // closeAction() {
  //   this.dropdown.close();
  // }
  // handleClose(data) {
  //   console.log(data);
  // }
  // handleCancel(data) {
  //   console.log(data);
  // }


  // _maybeRenderDevelopmentModeWarning() {
  //   if (__DEV__) {
  //     const learnMoreButton = (
  //       <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
  //         Learn more
  //       </Text>
  //     );

  //     return (
  //       <Text style={styles.developmentModeText}>
  //         Development mode is enabled, your app will be slower but you can use
  //         useful development tools. {learnMoreButton}
  //       </Text>
  //     );
  //   } else {
  //     return (
  //       <Text style={styles.developmentModeText}>
  //         You are not in development mode, your app will run at full speed.
  //       </Text>
  //     );
  //   }
  // }

  // _handleLearnMorePress = () => {
  //   WebBrowser.openBrowserAsync(
  //     'https://docs.expo.io/versions/latest/guides/development-mode'
  //   );
  // };

  // _handleHelpPress = () => {
  //   WebBrowser.openBrowserAsync(
  //     'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
  //   );
  // };
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
  // cardAvatarName: {
  //   fontSize: responsiveFontSize(2),
  // },
  cardAvatarPhoneBox: {
    //flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
  },
  cardAvatarPhoneIcon: {
    color: '#7E7E7E',
    fontSize: 15,
  },
  // cardAvatarPhone: {
  //   color: '#7E7E7E',
  //   fontSize: 13,
  //   paddingLeft: 8,
  // },
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