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
import { TextInputMask, TextMask } from 'react-native-masked-text';
import { GooglePlacesAutocomplete, } from 'react-native-google-places-autocomplete'; // 1.2.12
import Swiper from 'react-native-swiper';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import uploadImageAsync from '../api/uploadImageAsync';
import saveStorageAsync from '../components/saveStorageAsync';
import ProfileScreen from './ProfileScreen';


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

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      sessionKey: null,
      dataUsers: users,
      refresh: false,
      txt: 'test threshole',
      isActionButtonVisible: true, // 1. Define a state variable for showing/hiding the action-button 
      modalVisible: false,
      reportCheck: false,
      starCount: 3.5,
      mapRegion: { latitude: 10.7777935, longitude: 106.7068674, latitudeDelta: 0.03, longitudeDelta: 0.03 },
      roomCategory: [],
      //roomBox: [],
      loadingIndicator: false,

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
      roomPageIndex: 5,
      roomPageCount: 5,

      // Login
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
      objectRegisterAccount: {
        Avarta: "",
        UserName: "UserName",
        FullName: "Nguyen Van A",
        Email: "Email@gmail.com",
        Sex: "Nam",
        YearOfBirth: "2017-10-09",
        Address: "5 Hello 10 Hi 15 Hehe",
        ContactPhone: "0919999888",
        Password: "Passwordvinaphuc",
        RegistryDate: "2017-10-09",
        IsActive: "true",
        CreatedDate: "2017-10-09",
        CreatedBy: "10",
        UpdatedBy: "Olala_SessionKey",
        UpdatedDate: "2017-10-09"
      },
      registerCellPhone: null,
      registerPassword: null,
      registerConfirmPassword: null,
      registerConfirmCellPhone: null,
      registerAccountImage: null,
      registerFullName: null,
      wallet: '0',
    }

  }
  // 2. Define a variable that will keep track of the current scroll position
  _listViewOffset = 0



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
          "SessionKey": "Olala_SessionKey",
          "UserLogon": "100"
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
  }

  componentDidMount() {


  }
  // componentWillReceiveProps() {
  //   // alert("can")
  // }
  // componentDidUpdate() {
  //   this._getProfileFromStorageAsync();
  //   //this._getRoomBoxAsync();
  // }

  componentWillMount() {
    this._getCategoryAsync();
    this._getRoomBoxAsync(true);
    this._getProfileFromStorageAsync();
    this._getSessionKeyFromStorageAsync();
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
              ToastAndroid.showWithGravity('Tài khoản hoặc mật khẩu đã thay đổi', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            }
            else {
              Alert.alert('Oops!', 'Tài khoản hoặc mật khẩu đã thay đổi');
            }

            saveStorageAsync('FO_Account_Login', '')
            saveStorageAsync('SessionKey', '')
            this.setState({ profile: null, sessionKey: null })
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
        ToastAndroid.showWithGravity('Vui lòng nhập tài khoản', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        return;
      }
      if (this.state.loginPassword === '') {
        ToastAndroid.showWithGravity('Vui lòng nhập mật khẩu', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
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

    this.popupLoadingIndicator.show()

    try {
      await fetch("http://nhabaola.vn/api/Account/FO_Account_Login", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        //body: JSON.stringify(this.state.objectRegisterAccount)


        body: JSON.stringify({
          "UserName": this.state.loginUsername,
          "Password": this.state.loginPassword
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {

          //alert(JSON.stringify(responseJson.obj.UpdatedBy))

          if (responseJson.obj.UpdatedBy != "") {
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

            ProfileScreen._updateProfileAfterLogin(responseJson.obj);

          }
          else { // Login False
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity('Tài khoản hoặc mật khẩu không đúng', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
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

          //this._getStorageAsync('SessionKey')
          // var tmp = getStorageAsync('SessionKey')
          // alert(JSON.stringify(tmp))

          this.popupLoadingIndicator.dismiss();
        }).
        catch((error) => { console.log(error) });
    } catch (error) {
      console.log(error)
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

  _registerAccountAsync = async () => {

    //Form validation
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
      if (this.state.registerFullName === null) {
        ToastAndroid.showWithGravity('Vui lòng nhập Họ Tên', ToastAndroid.SHORT, ToastAndroid.CENTER);
        return;
      }
      if (this.state.registerConfirmCellPhone === null) {
        ToastAndroid.showWithGravity('Vui lòng nhập mã xác nhận Số Điện Thoại', ToastAndroid.SHORT, ToastAndroid.CENTER);
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

  _postImage = async () => {
    var can = 'http://uploads.im/api?upload=http://www.google.com/images/srpr/nav_logo66.png'
    // console.log(JSON.stringify(this.state.objectRegisterAccount))
    //Post to register account
    try {
      await fetch(can)
        .then((response) => response.json())
        .then((responseJson) => {

          //alert(JSON.stringify(responseJson))
          console.log(responseJson)

        })
        .catch((e) => { console.log(e) });
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
          "PageCount": "5",
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

  _getRoomBoxAsync = async (isNew) => {
    await this.setState({ refresh: true })

    if (!isNew) {
      this.setState({
        roomPageIndex: this.state.roomPageIndex + this.state.roomPageCount,
      })
    }
    else {
      roomBox = [];
      this.setState({ roomPageIndex: 5 })
    }

    try {
      await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_GetAllData", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "PageIndex": isNew ? "0" : this.state.roomPageIndex,
          "PageCount": this.state.roomPageCount

        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {
          //alert(JSON.stringify(responseJson.obj))

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

          this.setState({ refresh: false })

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
          "UpdatedBy": "d2c15b360fdec844db460521d22fdc38"
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {
          // alert(JSON.stringify(responseJson.obj))

          if (responseJson.obj !== null) {
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


  _sendProps() {
    // this.props.navigator.push({
    //   name: 'ProfileScreen'
    // })

    this.props.navigation.navigate('ProfileScreen', {
      passProfile: {
        name: 'Can HO',
        age: '16'
      }
    });
  }


  render() {
    let { image } = this.state;
    return (
      <View style={styles.container}>

        <FlatList
          //onScroll={this._onScroll}
          // ref='homepage'
          refreshing={this.state.refresh}
          onRefresh={() => { this._refreshRoomBox() }}

          onEndReachedThreshold={0.2}
          onEndReached={() => {
            //alert("refreshing")

            this._getRoomBoxAsync(false);
            {/* this.setState({
              refresh: true
            }); */}
          }}

          data={roomBox}//{this.state.dataUsers}
          extraData={this.state}
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
                      source={{ uri: item.AccountAvarta }} />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardAvatarTextBox}>
                  <Text style={styles.cardAvatarName}>{item.AccountName}</Text>
                  <TouchableOpacity style={styles.cardAvatarPhoneBox}
                    onPress={() => { Communications.phonecall(item.AccountPhone, true) }}
                  >
                    <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />
                    <Text style={styles.cardAvatarPhone}>: {item.AccountPhone}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableWithoutFeedback
                style={styles.cardImageBox}
                onPress={() => {
                  //this._sendProps();
                  //this._moveToRoomDetail(item)
                  this.props.navigation.navigate('RoomDetailScreen', { item });
                }
                }
              >

                <Image
                  style={styles.cardImage}
                  //source={require('../images/1.jpg')}
                  source={{ uri: item.Title }}
                />
              </TouchableWithoutFeedback>
              <View style={{ flexDirection: 'row', paddingLeft: 20, paddingRight: 20, paddingTop: 5, paddingBottom: 5, marginTop: -50, backgroundColor: '#000', opacity: 0.5 }}>
                <TextMask
                  style={{ flex: 1, color: '#fff' }}
                  value={item.Price}
                  type={'money'}
                  options={{ suffixUnit: ' đ', precision: 0, unit: 'Giá:   ', separator: ' ' }}
                />
                <Text style={{ flex: 1, textAlign: 'right', color: '#fff' }}>Diện tích:   {item.Acreage} m</Text><Text style={{ fontSize: 8, marginBottom: 5, color: '#fff' }}>2</Text>

              </View>
              <View style={styles.cardDesBox}>



                <Text style={{}}>Địa chỉ:   {item.Address}</Text>
                <Text style={{ marginTop: 10, color: '#9B9D9D' }}>{item.Description}</Text>

                {/* <Text style={styles.cardDesText}>
                  {item.Description}
                </Text> */}
                {/* <Text>{item.Images.split('|')[2]}</Text> */}
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
                        message: item.AccountName,
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
          keyExtractor={item => item.ID}

        /* horizontal={false}
        numColumns={3} */
        />

        {/* Action Button */}
        {this.state.isActionButtonVisible ?
          <ActionButton buttonColor="#73aa2a">

            {this.state.profile === null &&
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
            }
            <ActionButton.Item buttonColor='#a4d227' title="Đăng tin" onPress={() => {
              this.state.profile
                ?
                this.props.navigation.navigate('PostRoomScreen', { key: 'CanHo' })
                :
                Platform.OS === 'android'
                  ? ToastAndroid.showWithGravity('Vui lòng đăng nhập', ToastAndroid.SHORT, ToastAndroid.CENTER)
                  : Alert.alert("Vui lòng đăng nhập")


              //this.popupLogin.show();
            }}>
              <Icon name="md-cloud-upload" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item buttonColor='#a4d227' title={this.state.wallet + " đ"} onPress={() => {

            }}>
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
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person' />
              <FormInput
                containerStyle={{ flex: 15 }}
                placeholder='Số điện thoại'
                autoCapitalize='sentences'
                keyboardType='phone-pad'
                value={this.state.loginUsername}
                onChangeText={(loginUsername) => this.setState({ loginUsername })}
              />
            </Animated.View>
            <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
              <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock' />
              <FormInput
                containerStyle={{ flex: 15 }}
                placeholder='Mật khẩu'
                secureTextEntry={true}
                value={this.state.loginPassword}
                onChangeText={(loginPassword) => this.setState({ loginPassword })}
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
          onRequestClose={() => {
            //alert("Modal has been closed.")
          }}
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
              {Platform.OS === 'ios' ? <KeyboardSpacer /> : null}
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

        {/* Modal Post Room */}
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => { }}
        >
          <ScrollView style={{ paddingTop: 10, marginTop: 20, }}>
            <FormLabel>Hình ảnh</FormLabel>
            <View style={{
              height: 120, paddingRight: 20,
              paddingLeft: 20, flexDirection: 'row', justifyContent: 'space-between',

            }}>

              <TouchableOpacity
                style={{}}
                onPress={() => this._pickImageAsync('1')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage1 && <Image source={{ uri: this.state.postRoomImage1 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={{}}
                onPress={() => this._pickImageAsync('2')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage2 && <Image source={{ uri: this.state.postRoomImage2 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={{}}
                onPress={() => this._pickImageAsync('3')}
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
                onPress={() => this._pickImageAsync('4')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage4 && <Image source={{ uri: this.state.postRoomImage4 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={{}}
                onPress={() => this._pickImageAsync('5')}
              >
                <Ionicons style={{ opacity: 0.5, fontSize: 133, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                {this.state.postRoomImage5 && <Image source={{ uri: this.state.postRoomImage5 }} style={{ width: 100, height: 100 }} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={{}}
                onPress={() => this._pickImageAsync('6')}
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
                  underlineColorAndroid='#73aa2a'
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
                  underlineColorAndroid='#73aa2a'
                />

                <FormLabel>(mét vuông)</FormLabel>
              </View>
              <View style={{ flexDirection: 'row', }}>
                <FormLabel style={{}}>Loại BĐS:</FormLabel>

                <Picker
                  style={{ flex: 1, marginTop: -4 }}
                  mode='dropdown'
                  selectedValue={this.state.selectedCategory}
                  onValueChange={(itemValue, itemIndex) => this.setState({ selectedCategory: itemValue })}>
                  <Picker.Item label='-- Chọn loại BĐS --' value='0' />
                  {this.state.roomCategory.map((y, i) => {
                    return (
                      <Picker.Item key={i} label={y.CatName} value={y.ID} />
                    )
                  })}
                </Picker>

              </View>
              <FormLabel style={{ marginTop: 10, }}>Chi tiết:</FormLabel>
              <FormInput
                containerStyle={{ paddingLeft: 8, borderWidth: 0.5, borderColor: '#73aa2a', borderRadius: 10, height: 140, }}
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
                    alert(this.state.roomCategory)
                  }}
                />
              </View>
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