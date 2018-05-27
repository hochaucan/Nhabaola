import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
    View,
    TextInput,
    Share,
    FlatList,
    AsyncStorage,
    ToastAndroid,
    Modal,
    KeyboardAvoidingView,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, Facebook } from 'expo';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import Communications from 'react-native-communications';
import StarRating from 'react-native-star-rating';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import { TextInputMask, TextMask } from 'react-native-masked-text';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import getDirections from 'react-native-google-maps-directions'
import globalVariable from '../components/Global'
import convertAmountToWording from '../api/convertAmountToWording'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import notifyNBLAsync from '../api/notifyNBLAsync';
import enTranslation from '../components/en.json';
import zhTranslation from '../components/zh.json';
import viTranslation from '../components/vi.json';
import { setLocalization, translate, Translate } from 'react-native-translate';
import DropdownAlert from 'react-native-dropdownalert';

var { height, width } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default class RoomDetailScreen extends React.Component {
    // static navigationOptions = ({ navigation }) => ({

    //     title: `Chat with ${navigation.state.params.name}`,
    //     header: () => (

    //         <View style={{ height: 50, backgroundColor: '#fff' }}>
    //             <TouchableOpacity onPress={() => navigation.goBack()}>
    //                 <Text> BACK </Text>
    //             </TouchableOpacity>

    //         </View>)
    //     // headerRight: <Button title="Info" />,
    // });
    static navigationOptions = {
        title: 'Chi tiết',
        header: null,

    };

    constructor(props) {
        super(props);
        this.state = {
            mapRegion: { latitude: LATITUDE, longitude: LONGITUDE, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA },
            starCount: 5,
            starView: 0,
            isRating: false,
            comments: [],
            roomBox: null,
            profile: null,
            commentContent: '',
            roomCategory: [],

            reportAddress: false,
            reportCall: false,
            reportHouse: false,
            isComment: false,
            modalReport: false,
            modalLoading: false,
            pushToken: '',
            isPushNotification: 'true',
            //translateDescription: '',
            isVietnamease: false,
            isEnglish: false,
            isChinease: false,
        }
    }

    componentWillMount() {
        this._getLanguageFromStorageAsync();
        this._getRoomBoxDetailAsync();
    }

    componentDidMount() {

        if (this.state.isComment) {
            //setTimeout(() => this.scrollView.scrollTo({ x: 0, y: 500 }), 10);
            this.refs.commentInput.focus();
            // if (Platform.OS == 'ios') {
            //     this.refs.commentInput.focus();
            // } else {
            //     this.refs.commentInput2.focus();
            // }

        }
    }

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

    _getRoomBoxDetailAsync = async () => {
        // alert(numberWithCommas(JSON.stringify(this.props.navigation.state.params.item.Price)))
        await this.setState({
            roomBox: this.props.navigation.state.params.item,
            starView: this.props.navigation.state.params.item.Point,
            isComment: this.props.navigation.state.params.isComment,
            pushToken: this.props.navigation.state.params.item.Images.split('|')[0],
            isPushNotification: this.props.navigation.state.params.item.Images.split('|')[1],
        })
        await this._getRoomCategoryFromStorageAsync();
        await this._getProfileFromStorageAsync();

        this._getCommentsAsync();
    }


    _getProfileFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('FO_Account_Login');
            //alert(value)
            if (value !== null) {
                this.setState({
                    profile: JSON.parse(value)
                })
            }
            else {
                this.setState({
                    profile: null
                })
            }

        } catch (e) {
            console.log(e);
        }

    }

    _getRoomCategoryFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('FO_Category_GetAllData');
            //alert(value)
            if (value !== null) {
                this.setState({
                    roomCategory: JSON.parse(value)
                })
            }
            else {
                this.setState({
                    roomCategory: []
                })
            }

        } catch (e) {
            console.log(e);
        }

    }



    _handleMapRegionChange = mapRegion => {
        this.setState({ mapRegion });
    };

    _starRatingPress(rating) {
        this.popupRating.dismiss();
        this.setState({
            starCount: rating
        });

    }


    // _notifyCommentAsync = async () => {

    //     //Loading
    //     this.popupLoadingIndicator.show();



    //     try {
    //         await fetch("https://exp.host/--/api/v2/push/send", {
    //             method: 'POST',
    //             headers: {
    //                 Accept: 'application/json',
    //                 'Content-Type': 'application/json',
    //             },

    //             body: JSON.stringify({
    //                 "to": "ExponentPushToken[X44MIVEIOHZdIZMVverA9J]",
    //                 "data": { "screen": "ProfileScreen", "params": { "name": "can", "age": "35" } },
    //                 "sound": "default",
    //                 "title": "Nhabaola",
    //                 "body": "HO CHAU CAN"
    //             }),
    //         })
    //             .then((response) => response.json())
    //             .then((responseJson) => {



    //             }).
    //             catch((error) => { console.log(error) });
    //     } catch (error) {
    //         console.log(error)
    //     }


    // }


    _postCommentsAsync = async () => {

        // alert(this.state.pushToken + "   " + this.state.isPushNotification)
        // return;

        //Form validation
        if (Platform.OS === 'android') {

            if (this.state.commentContent == '') {
                ToastAndroid.showWithGravity(translate("Please enter a comment"), ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
        }
        else { // iOS

            if (this.state.commentContent == '') {
                Alert.alert(translate("Please enter a comment"));
                return;
            }
        }

        //Loading
        this.popupLoadingIndicator.show();



        try {
            await fetch("http://nhabaola.vn/api/Comment/FO_Comment_Add", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    "Content": this.state.commentContent,
                    "RoomBoxID": this.state.roomBox.ID,
                    "UserID": this.state.profile.ID,
                    "CreatedBy": this.state.profile.ID,
                    "UpdatedBy": this.state.profile.UpdatedBy,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    //alert(JSON.stringify(responseJson))
                    if (JSON.stringify(responseJson.ErrorCode) === "0") { //Post comment successful

                        this._getCommentsAsync();
                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity(translate("Comment successfully"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert(translate("Notice"), translate("Comment successfully"));
                        }

                        if (this.state.isPushNotification == 'true') {
                            // notifyNBLAsync("ExponentPushToken[X44MIVEIOHZdIZMVverA9J]");
                            notifyNBLAsync(this.state.pushToken
                                , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.roomBox.ID } } //{ ...roombox }
                                , "default"
                                , this.state.profile.FullName + " " + translate("Comment") + ":"
                                , this.state.commentContent
                            ); //pushToken, data, sound, title, body
                        }

                        this.setState({
                            comments: [],
                            commentContent: ''
                        })
                    }
                    else { //Post Error
                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
                        }
                    }

                    //Loading
                    this.popupLoadingIndicator.dismiss();

                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }


    }


    _postTranslator = async (lang, textAPI, langAPI) => {

        this.popupLoadingIndicator.show();

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
                //alert(res)
                var json = JSON.parse(res);
                if (json.code == 200) {
                    //RoomDetailScreen.popupLoadingIndicator.dismiss();
                    Alert.alert(lang, json.text[0])
                    //this.setState({ translateDescription: json.text[0] })
                    //translateDescription = json.text[0]
                }
                else {
                    //document.querySelector('#output').innerHTML = "Error Code: " + json.code;
                    alert(json.code)
                }
            }
        }
        // }, false);

        setTimeout(() => {
            this.popupLoadingIndicator.dismiss();
        }, 2500)

        // this.popupLoadingIndicator.dismiss();
        //this.setState({ translateDescription: json.text[0] })

    }


    _getCommentsAsync = async () => {
        //alert(JSON.stringify(this.state.profile))
        try {
            await fetch("http://nhabaola.vn//api/Comment/FO_Comment_GetAllData", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "RoomBoxId": this.state.roomBox.ID,
                    "CreatedBy": this.state.profile.ID,
                    "UpdatedBy": this.state.profile.UpdatedBy,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {


                    this.setState({
                        comments: responseJson.obj
                    })


                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }

    _postRatingByRoom = async (_rate, _roomId) => {

        // alert(_roomId + "  " + _rate + "  " + this.state.profile.ID + "  " + this.state.profile.UpdatedBy)
        // return;

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
                    "UpdatedBy": this.state.profile.UpdatedBy,
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
                    } else {
                        if (Platform.OS === 'android') {
                            //ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            //Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
                        }
                    }

                    this.popupLoadingIndicator.dismiss()
                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }

    _scrollToInput(reactNode) {
        // Add a 'scroll' ref to your ScrollView
        this.scroll.props.scrollToFocusedInput(reactNode)
        //this.scroll.props.scrollToPosition(0, 20)
        //alert(reactNode)
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

                    if (JSON.stringify(responseJson.ErrorCode) === "0") { // Pinned successful


                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity(translate("Mark successful"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert(translate("Notice"), translate("Mark successful"));
                        }

                    }
                    else {// Error
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

    _reportNBLAsync = async (_reportTypeId, _roomId) => {

        // alert(_roomId + "  " + _rate + "  " + this.state.profile.ID + "  " + this.state.sessionKey)
        if (Platform.OS == 'ios') {
            this.setState({ modalReport: false })
            //this.setState({ modalLoading: true })
        }
        else {
            // this.popupLoadingIndicator.show()
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
                    "UpdatedBy": this.state.profile.UpdatedBy,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    if (JSON.stringify(responseJson.ErrorCode) === "0") { // Report successful
                        //this.popupReportNBL.dismiss();

                        if (Platform.OS === 'android') {
                            //ToastAndroid.showWithGravity('Cảm ơn bạn đã báo cáo chúng tôi!', ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            //this.setState({ modalReport: false })
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
                            //ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            //Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
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

    }

    // _handleGetDirections = (sourceLat, sourceLong, desLat, desLong) => {
    //     const data = {
    //         source: {
    //             latitude: sourceLat,// -33.8356372,
    //             longitude: sourceLong,//18.6947617
    //         },
    //         destination: {
    //             latitude: desLat,//-33.8600024,
    //             longitude: desLong//18.697459
    //         },
    //         params: [
    //             {
    //                 key: "dirflg",
    //                 value: "d"
    //             }
    //         ]
    //     }

    //     getDirections(data)
    // }

    onRefreshScreen = data => {
        this.setState(data);

    }

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


                    try {
                        //await fetch('https://graph.facebook.com/v2.11/100025728168189/friends?access_token=EAAG587OfErUBAEQp8GmJKVDGB26X0xvxgQboR04gtHsKc5j75V9ZCxyoyhtr3yujILGZBWhIGSZCywdRkfT7iNjFvJOHnfagH5kKjubl5m9cZB2NnLjm09jXtUWALXtcnZAXqAJaXZC3fTHFqDcKLX3z9En8OORpFVNZB41CvL0RYkCfpg6opdekgaBzoqksuOlZBwQpXrGwZAb2iDlKfCLlRsEgZCIDaWlPmr3occd7d68RetiVDlhVEt', {
                        await fetch('https://graph.facebook.com/v2.12/' + profile.id + '/feed?link=' + image + '&message=' + message + '&access_token=' + token, { // Post officialy
                            //await fetch('https://graph.facebook.com/v2.11/oauth/access_token?client_id=485931318448821&client_secret=9435b271a288d4f99f5280e20f18ec1f&grant_type=client_credentials', { //Get App Token
                            //await fetch('https://graph.facebook.com/v2.11/485931318448821/accounts?name=Nick HO&installed=true&permissions=publish_actions,user_posts&access_token=485931318448821|9435b271a288d4f99f5280e20f18ec1f', { //Create Test User
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

    render() {
        //const { picture, name, email, phone, login, dob, location } = this.props.navigation.state.params;
        //const { item } = this.props.navigation.state.params;
        //var images = this.state.roomBox.Images.replace('|', '').split('|');
        var images = this.state.roomBox.Images.split('|').splice(2);
        // alert(JSON.stringify(this.state.roomBox.Images.split('|').slice(1)))
        // alert(JSON.stringify(images))

        const roomLocation = {
            latitude: parseFloat(this.state.roomBox.Latitude),
            longitude: parseFloat(this.state.roomBox.Longitude),
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }


        let roomMaker = {
            latitude: parseFloat(this.state.roomBox.Latitude),
            longitude: parseFloat(this.state.roomBox.Longitude),
        }

        //alert(JSON.stringify(parseFloat(item.Longitude)))

        return (
            <View style={{ flex: 1 }}>

                {/* Header */}
                <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#a4d227', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{}}
                        onPress={() => {
                            this.props.navigation.goBack()
                            // this.props.navigation.state.params.onRefreshScreen({ refreshScreen: true });
                            //this.props.navigation.state.params._getWalletAsync();

                        }}>
                        <Ionicons style={{ fontSize: 28, color: '#fff', }} name='md-arrow-back'></Ionicons>
                    </TouchableOpacity>
                    <Text style={{
                        marginLeft: 20, color: '#fff',
                        fontSize: responsiveFontSize(2.2), justifyContent: 'center'
                    }}>{translate("Details")}</Text>

                    {/* Update in Room Detail */}
                    {/* {this.state.roomBox.CreatedBy == this.state.profile.ID &&
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                right: 15, top: 15,
                            }}

                            onPress={() => {
                                this.props.navigation.navigate('UpdateRoomScreen', {
                                    onRefreshScreen: this.onRefreshScreen,
                                    item: this.state.roomBox,
                                })
                            }}
                        >
                            <Ionicons style={{
                                color: '#fff', fontSize: responsiveFontSize(3.5)
                            }} name='md-settings' />
                        </TouchableOpacity>
                    } */}


                    {/* Notify to Landlord */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            right: 15, top: 15,
                        }}

                        onPress={async () => {

                            await this._getProfileFromStorageAsync();

                            if (this.state.profile == null) {
                                if (Platform.OS == 'ios') {
                                    Alert.alert(translate("Notice"), translate("Please login"))
                                } else {
                                    ToastAndroid.showWithGravity(translate("Please login"), ToastAndroid.SHORT, ToastAndroid.TOP)
                                }

                            } else {
                                Alert.alert(
                                    translate("Notice"),
                                    translate("Do you want to send a message to this poster"),
                                    [
                                        {
                                            text: translate("Cancel"), onPress: () => {

                                            }
                                        },
                                        {
                                            text: translate("Agree"), onPress: () => {
                                                //  roomBox.map((y) => {
                                                // Notify Landlord 
                                                if (this.state.roomBox.Images.split('|')[1] == 'true') {
                                                    notifyNBLAsync(this.state.roomBox.Images.split('|')[0]//globalVariable.ADMIN_PUSH_TOKEN
                                                        , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.roomBox.ID } } //{ ...roombox }
                                                        , "default"
                                                        , this.state.profile.FullName + "-" + this.state.profile.UserName + " " + translate("Search") + ":"
                                                        , translate("Your post at the address") + ": " + this.state.roomBox.Address

                                                    ); //pushToken, data, sound, title, body
                                                }
                                                // })

                                                if (Platform.OS === 'android') {
                                                    ToastAndroid.showWithGravity(translate("Send message successfully"), ToastAndroid.SHORT, ToastAndroid.TOP);
                                                }
                                                else {
                                                    Alert.alert(translate("Notice"), translate("Send message successfully"));
                                                }
                                            }
                                        },
                                    ]
                                );
                            }


                        }}
                    >
                        <Ionicons style={{
                            color: '#fff', fontSize: responsiveFontSize(3.5)
                        }} name='md-megaphone' />
                    </TouchableOpacity>

                </View>

                {/* Avatar */}
                <View style={{
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    paddingTop: 20,
                    paddingLeft: 20,
                    paddingBottom: 20,
                }}>

                    <View style={styles.cardAvatarBox}>
                        <TouchableOpacity
                            onPress={() => {

                            }}
                        >
                            <Image
                                style={styles.cardAvatarImage}
                                source={{ uri: this.state.roomBox.AccountAvarta }} />
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

                            <Text style={styles.cardAvatarName}>
                                {this.state.roomBox.AccountName.indexOf('|') > -1 ? this.state.roomBox.AccountName.split('|')[0] : this.state.roomBox.AccountName}

                                {/* {
                                this.state.roomBox.AccountName.indexOf('http://m.me/') > -1
                                    ?
                                    this.state.roomBox.AccountName.slice(this.state.roomBox.AccountName.indexOf('http://m.me/'),
                                        this.state.roomBox.AccountName.indexOf('|', this.state.roomBox.AccountName.indexOf('http://m.me/')))

                                    :
                                    this.state.roomBox.AccountName
                            } */}
                            </Text>

                            {/* Facebook Messenger */}
                            {
                                this.state.roomBox.AccountName.indexOf('http://m.me/') > -1 &&
                                <TouchableOpacity
                                    style={{
                                        // lexDirection: 'row',
                                        //flex: 2,
                                        //alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        //const FANPAGE_ID = '1750146621679564'
                                        //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                                        const URL_FOR_BROWSER = this.state.roomBox.AccountName.slice(this.state.roomBox.AccountName.indexOf('http://m.me/'),
                                            this.state.roomBox.AccountName.indexOf('|', this.state.roomBox.AccountName.indexOf('http://m.me/')))//'http://m.me/thomas.ho.5492216'//ho.can.7'

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
                                    <Image style={{ width: 20, height: 30, marginLeft: 15, }} source={require('../assets/icons/chat_fm.png')} />
                                </TouchableOpacity>
                            }

                            {/* Zalo Messenger */}
                            {
                                this.state.roomBox.AccountName.indexOf('http://zalo.me/') > -1 &&
                                <TouchableOpacity
                                    style={{
                                        // lexDirection: 'row',
                                        //flex: 2,
                                        //alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        //const FANPAGE_ID = '1750146621679564'
                                        //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                                        const URL_FOR_BROWSER = this.state.roomBox.AccountName.slice(this.state.roomBox.AccountName.indexOf('http://zalo.me/'),
                                            this.state.roomBox.AccountName.indexOf('|', this.state.roomBox.AccountName.indexOf('http://zalo.me/')))//'http://m.me/thomas.ho.5492216'//ho.can.7'

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
                                    <Image style={{ width: 18, height: 28, marginLeft: 20, }} source={require('../assets/icons/chat_zalo.png')} />
                                </TouchableOpacity>
                            }

                            {/* Whatapps Messenger */}
                            {
                                this.state.roomBox.AccountName.indexOf('https://api.whatsapp.com/') > -1 &&
                                <TouchableOpacity
                                    style={{
                                        // lexDirection: 'row',
                                        //flex: 2,
                                        //alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        //const FANPAGE_ID = '1750146621679564'
                                        //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                                        const URL_FOR_BROWSER = this.state.roomBox.AccountName.slice(this.state.roomBox.AccountName.indexOf('https://api.whatsapp.com/'),
                                            this.state.roomBox.AccountName.indexOf('|', this.state.roomBox.AccountName.indexOf('https://api.whatsapp.com/')))//'http://m.me/thomas.ho.5492216'//ho.can.7'

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
                                    <Image style={{ width: 20, height: 25, marginLeft: 20, }} source={require('../assets/icons/chat_whatapps.png')} />
                                </TouchableOpacity>
                            }



                        </View>
                        <TouchableOpacity style={styles.cardAvatarPhoneBox}
                            onPress={() => {
                                Communications.phonecall(
                                    this.state.roomBox.ContactPhone.indexOf("|") > -1 ? this.state.roomBox.ContactPhone.split('|')[0]
                                        : this.state.roomBox.ContactPhone
                                    , true)
                            }}
                        >
                            <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />


                            <Text style={{
                                color: '#7E7E7E',
                                fontSize: responsiveFontSize(1.8),//13,
                                paddingLeft: 8,
                            }}>: {this.state.roomBox.ContactPhone.indexOf("|") > -1 ? this.state.roomBox.ContactPhone.split('|')[0] + '. LH: ' + this.state.roomBox.ContactPhone.split('|')[1]
                                : this.state.roomBox.ContactPhone}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* highlight */}
                    {this.state.roomBox.IsHighlight &&

                        <Ionicons style={{
                            position: 'absolute', right: 15, top: 50, zIndex: 10,
                            fontSize: responsiveFontSize(6),
                            color: '#73aa2a'
                        }} name="ios-flame" />

                        // <Image
                        //     style={{
                        //         position: 'absolute', right: 15, zIndex: 10,
                        //         width: responsiveWidth(25),
                        //         height: responsiveWidth(25), top: 5
                        //     }}
                        //     source={require('../assets/images/nbl-highlight.gif')}
                        // />
                    }

                </View>
                {/* <ScrollView
                    ref={scrollView => this.scrollView = scrollView}
                    style={styles.container}> */}
                <KeyboardAwareScrollView
                    innerRef={ref => { this.scroll = ref }}
                    style={{
                        paddingTop: 10,
                        // marginTop: 20,
                        flex: 1,
                        backgroundColor: '#fff',
                    }}
                >

                    {/* Posting Date */}
                    <View style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                        marginBottom: 5,
                        alignItems: 'center',

                    }}

                    >
                        {/* <Ionicons style={{
                            color: '#7E7E7E',
                            fontSize: responsiveFontSize(1.8),
                        }} name='md-time' />
                        <Text style={{
                            color: '#7E7E7E',
                            fontSize: responsiveFontSize(1.4),//13,
                            paddingLeft: 2,
                        }}>: {this.state.roomBox.UpdatedDate}</Text> */}


                        {/* Language English*/}
                        {/* <TouchableOpacity style={{

                            marginLeft: 10,
                            marginBottom: 2,

                        }}
                            onPress={() => {
                                this._postTranslator('English', this.state.roomBox.Description, 'en')
                            }}
                        >
                        
                            <Text style={{
                                color: '#73aa2a',
                                fontSize: responsiveFontSize(1.8),//13,
                                paddingLeft: 2,
                                ///marginBottom: 5,
                            }}>English</Text>
                        </TouchableOpacity> */}

                        {/* Language Chinese*/}
                        {/* <TouchableOpacity style={{

                            marginLeft: 10,
                            marginBottom: 2,

                        }}
                            onPress={() => {
                                this._postTranslator('Chinese', this.state.roomBox.Description, 'zh')
                            }}
                        >

                            <Text style={{
                                color: '#73aa2a',
                                fontSize: responsiveFontSize(1.8),//13,
                                paddingLeft: 2,

                            }}>Chinese</Text>
                        </TouchableOpacity> */}
                    </View>



                    <View style={{

                        flex: 1,
                        //height: height * 0.6, //500,
                        // borderBottomWidth: 0.5,
                        borderColor: '#d6d7da',
                        padding: 0,
                        flexDirection: 'column',
                    }}>



                        <View
                            style={{ flex: 1, height: responsiveHeight(50) }}
                        >

                            <Swiper
                                horizontal={true}
                                autoplay
                                loop={false}
                                dotColor='#9B9D9D'
                                activeDotColor='#a4d227'
                            >

                                {
                                    this.state.roomBox.Images !== "" ?

                                        images.map((y, i) => {
                                            return (
                                                <Image
                                                    key={i}
                                                    style={styles.cardImage}
                                                    source={{ uri: y }} />
                                            )

                                        })
                                        :
                                        <Image source={require("../images/nha-bao-la.jpg")} />
                                }
                            </Swiper>

                            {/* Wartermark */}
                            <Image
                                style={{
                                    position: 'absolute', top: 20, right: 15, zIndex: 10, opacity: 0.3,
                                    width: responsiveWidth(15),
                                    height: responsiveWidth(15),
                                    //borderRadius: 100,
                                }}
                                source={require('../images/app-icon.png')}
                            />


                            <View style={{
                                flexDirection: 'row', paddingLeft: 20, paddingRight: 20,
                                paddingTop: 5, paddingBottom: 5, marginTop: -50, backgroundColor: '#000', opacity: 0.6
                            }}>

                                <Text
                                    style={{
                                        flex: 1, color: '#fff', fontWeight: '300',
                                        fontSize: responsiveFontSize(1.7)
                                    }}>
                                    {translate("Price")}: {convertAmountToWording(numberWithCommas(this.state.roomBox.Price))}
                                </Text>

                                {

                                    this.state.roomCategory.map((y, i) => {
                                        return (
                                            y.ID == this.state.roomBox.CategoryID &&
                                            <Text
                                                style={{
                                                    flex: 2, color: '#fff', fontWeight: '300',
                                                    fontSize: responsiveFontSize(1.7), textAlign: 'right'
                                                }}
                                                key={i}>{this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]}:  {this.state.roomBox.Acreage} m</Text>
                                            // : null
                                        )
                                    })
                                }

                                {/* <Text style={{ flex: 1, textAlign: 'right', color: '#fff' }}>Diện tích:   {this.state.roomBox.Acreage} m</Text> */}
                                <Text style={{ fontSize: 8, marginBottom: 5, color: '#fff' }}>2</Text>

                            </View>
                        </View>
                        <View style={styles.cardDesBox}>

                            {/* Posting Date and RoomID */}
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
                                    }}>: {this.state.roomBox.UpdatedDate}</Text>
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
                                    }}>{translate("RoomId")}: {this.state.roomBox.ID}</Text>
                                </View>
                            </View>

                            <Text style={styles.cardDesText}>
                                {this.state.roomBox.Description.indexOf("###") > -1 ? (this.state.isVietnamease ? this.state.roomBox.Description.split('###')[0] : this.state.isEnglish ? this.state.roomBox.Description.split('###')[1] : this.state.roomBox.Description.split('###')[2]) : this.state.roomBox.Description}
                            </Text>
                        </View>
                        <View style={styles.cardBottom}>
                            <View style={styles.cardBottomLeft}>
                                {/* Rating */}
                                <Text style={styles.cardBottomIconText}>{this.state.starView}</Text>
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
                                                //ratingRoomId: item.ID,
                                                starCount: parseFloat(this.state.roomBox.Point)
                                            })
                                            this.popupRating.show();
                                        }
                                    }}
                                >
                                    <Ionicons style={{
                                        fontSize: 20,
                                        paddingRight: 20,
                                        paddingLeft: 5,
                                        color: this.state.isRating ? '#a4d227' : this.state.roomBox.Point == 5 ? '#a4d227' : '#8B8E8E',
                                    }} name='ios-star' />
                                </TouchableOpacity>
                                <Text style={styles.cardBottomIconText}>{this.state.comments.length}</Text>

                                {/* Comment */}
                                <TouchableOpacity
                                    onPress={(event) => {
                                        // this.scrollView.scrollTo({ x: 0, y: 200 })
                                        // this._scrollToInput(event.target)

                                        this.refs.commentInput.focus();
                                        // if (Platform.OS == 'ios') {
                                        //     this.refs.commentInput.focus();
                                        // } else {
                                        //     this.refs.commentInput2.focus();
                                        // }
                                        // this.scroll.props.scrollToPosition(0, -50)
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

                                            this._postPinnedByRoom("true", this.state.roomBox.ID)
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

                            {/* Room Icon Right */}
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
                                                        this._handleFacebookLogin(this.state.roomBox.Title, this.state.roomBox.Description.indexOf("###") > -1 ? (this.state.isVietnamease ? this.state.roomBox.Description.split('###')[0] : this.state.isEnglish ? this.state.roomBox.Description.split('###')[1] : this.state.roomBox.Description.split('###')[2]) : this.state.roomBox.Description
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
                                            if (y.ID == this.state.roomBox.CategoryID) {
                                                loadBDS = this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]
                                            }



                                        })

                                        const _contactName = this.state.roomBox.ContactPhone.indexOf('|') > -1 ? this.state.roomBox.ContactPhone.split('|')[1] : this.state.roomBox.AccountName.indexOf('|') > -1 ? this.state.roomBox.AccountName.split('|')[0] : this.state.roomBox.AccountName
                                        const _contactPhone = this.state.roomBox.ContactPhone.indexOf('|') > -1 ? this.state.roomBox.ContactPhone.split('|')[0] : this.state.roomBox.ContactPhone
                                        const _description = this.state.roomBox.Description.indexOf("###") > -1 ? (this.state.isVietnamease ? this.state.roomBox.Description.split('###')[0] : this.state.isEnglish ? this.state.roomBox.Description.split('###')[1] : this.state.roomBox.Description.split('###')[2]) : this.state.roomBox.Description

                                        if (Platform.OS == 'ios') {
                                            Share.share({
                                                message: translate("Share from Nhabaola application")
                                                    + "\n\n" + translate("Contact") + ": " + _contactName
                                                    + "\n" + translate("Cellphone") + ": " + _contactPhone
                                                    + "\n\n" + translate("Type of real estate") + ": " + loadBDS
                                                    + "\n" + translate("Price") + ": " + this.state.roomBox.Price + " đồng"
                                                    + "\n" + translate("Area") + ": " + this.state.roomBox.Acreage + " " + translate("Square meters")
                                                    + "\n" + translate("Address") + ": " + this.state.roomBox.Address + "\n\n" + translate("Description") + ":\n" + _description
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
                                                    + "\n" + translate("Price") + ": " + this.state.roomBox.Price + " đồng"
                                                    + "\n" + translate("Area") + ": " + this.state.roomBox.Acreage + " " + translate("Square meters")
                                                    + "\n" + translate("Address") + ": " + this.state.roomBox.Address + "\n\n" + translate("Description") + ":\n" + _description
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
                                    }}
                                >
                                    <Ionicons style={styles.cardBottomIcon} name='md-share' />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={async () => {
                                        if (this.state.profile === null) {
                                            if (Platform.OS == 'ios') {
                                                Alert.alert(translate("Notice"), translate("Please login"))
                                            } else {
                                                ToastAndroid.showWithGravity(translate("Please login"), ToastAndroid.SHORT, ToastAndroid.TOP)
                                            }
                                        } else {


                                            if (Platform.OS == 'ios') {
                                                this.setState({ modalReport: true })
                                            }
                                            else {
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



                    <View style={styles.cardMapViewBox}>
                        <Text style={{ marginBottom: 5 }}>{translate("Address")}:  {this.state.roomBox.Address}</Text>
                        <TouchableOpacity
                            style={{
                                position: 'absolute', bottom: 25, left: 25, zIndex: 10,
                                padding: 6, borderRadius: 5, backgroundColor: '#73aa2a',
                                elevation: 2, opacity: 0.9,
                            }}
                            onPress={() => {
                                const data = {
                                    source: {
                                        latitude: globalVariable.LOCATION.LATITUDE,//10.714326,//globalVariable.LOCATION.LATITUDE,
                                        longitude: globalVariable.LOCATION.LONGITUDE, //106.610448,//globalVariable.LOCATION.LONGITUDE, 
                                    },
                                    destination: {
                                        latitude: parseFloat(this.state.roomBox.Latitude),
                                        longitude: parseFloat(this.state.roomBox.Longitude),
                                    },
                                    params: [
                                        {
                                            key: "dirflg",
                                            value: "d"
                                        }
                                    ]
                                }

                                getDirections(data)
                            }}
                        >
                            <Ionicons style={{
                                color: '#fff',
                                fontSize: responsiveFontSize(1.5)
                            }} name='md-return-right' > {translate("Find the way")}</Ionicons>
                        </TouchableOpacity>

                        <MapView
                            // provider='google'
                            style={{
                                alignSelf: 'stretch',
                                height: 170,
                            }}
                            region={roomLocation}
                            onRegionChange={this._handleMapRegionChange}
                        >

                            <MapView.Marker
                                coordinate={roomMaker}
                            //title='Vị trí nhà'
                            // description='Home'
                            >

                            </MapView.Marker>
                        </MapView>
                    </View>



                    {/* COMMENTS */}
                    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'height' : 'padding'} >
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            //height: 300,
                            paddingTop: 20, paddingRight: 20, paddingLeft: 20,
                            //marginTop: 5,
                        }}>
                            <TextInput
                                style={{
                                    flex: 3,
                                    borderWidth: 0.8,
                                    borderColor: '#a4d227',
                                    height: 40,
                                    padding: 5,
                                    borderRadius: 5,
                                }}
                                ref='commentInput'
                                returnKeyType={"done"}
                                onFocus={(event) => {
                                    this._scrollToInput(event.target)

                                    // if (Platform.OS == 'ios') {
                                    //     this._scrollToInput(event.target)
                                    // }
                                    // else {
                                    //     this.scroll.props.scrollToEnd()
                                    // }

                                    //this.scroll.props.scrollToPosition(20, 20)
                                    // this._scrollToInput(event.target)

                                }}
                                onSubmitEditing={(event) => {
                                    this._postCommentsAsync();
                                }}

                                placeholder={translate("Comment")}
                                underlineColorAndroid='transparent'
                                value={this.state.commentContent}
                                onChangeText={(commentContent) => this.setState({ commentContent })}
                            ></TextInput>
                            <TouchableOpacity style={styles.cardCommentSubmit}
                                onPress={async () => {
                                    this._postCommentsAsync();
                                }}
                            >
                                <Text style={styles.cardCommentSubmitText}>{translate("Send")}</Text>
                            </TouchableOpacity>
                        </View>

                    </KeyboardAvoidingView>


                    <View style={{ marginBottom: 20, marginTop: 20 }}>

                        <FlatList
                            style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, }}
                            //onScroll={this._onScroll}
                            ref='comments'

                            // refreshing={this.state.refreshFlatlist}
                            // onRefresh={() => { this._refreshRoomBox() }}

                            //onEndReachedThreshold={0.2}
                            //onEndReached={() => {
                            //alert("refreshing")
                            // this._getRoomByFilter(false);

                            //}}


                            data={this.state.comments}
                            renderItem={({ item }) =>
                                <View style={{
                                    flexDirection: 'row',
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    borderBottomWidth: 0.3,
                                    borderColor: '#9B9D9D',
                                }}>
                                    <View style={{ flex: 2 }}>
                                        <Image
                                            style={{ width: 40, height: 40, borderRadius: Platform.OS == 'ios' ? 20 : 100, }}
                                            source={{ uri: item.Avarta }}
                                        //source={require('../images/app-icon.png')}
                                        />
                                    </View>
                                    <View style={{ flex: 8 }}>
                                        <Text style={{ color: '#73aa2a', fontSize: responsiveFontSize(1.6), marginLeft: -3 }} > {item.FullName}</Text>
                                        <Text style={{ color: '#9B9D9D', fontSize: 10 }}>{item.UpdatedDate}</Text>
                                        <Text>{item.Content}</Text>
                                    </View>

                                </View>
                            }
                            keyExtractor={item => item.Content + item.UpdatedDate}
                        />

                    </View>

                </KeyboardAwareScrollView>
                {/* </ScrollView> */}
                {/* The view that will animate to match the keyboards height */}
                {/* <KeyboardSpacer /> */}

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
                            this.setState({
                                isRating: true,
                                starView: (parseInt(this.state.starView) + rating) / 2
                            })
                            this._postRatingByRoom(rating, this.state.roomBox.ID)
                        }}
                    />
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

                {/* Popup Report */}
                <PopupDialog
                    ref={(popupReportNBL) => { this.popupReportNBL = popupReportNBL; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogTitle={<DialogTitle title={translate("Violation report")} titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
                    dismissOnTouchOutside={false}
                    dialogStyle={{ marginBottom: 100, width: width * 0.9 }}

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
                                title={translate("Notice")} />

                            <Button
                                buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                                icon={{ name: 'md-cloud-upload', type: 'ionicon' }}
                                title={translate("Send")}
                                onPress={() => {


                                    if (this.state.reportAddress) {
                                        this._reportNBLAsync(2, this.state.roomBox.ID)
                                    }
                                    if (this.state.reportCall) {
                                        this._reportNBLAsync(3, this.state.roomBox.ID)
                                    }
                                    if (this.state.reportHouse) {
                                        this._reportNBLAsync(5, this.state.roomBox.ID)
                                    }

                                    ToastAndroid.showWithGravity(translate("Thanks your for reporting to Nhabaola"), ToastAndroid.SHORT, ToastAndroid.TOP);

                                    // Notify Admin 
                                    notifyNBLAsync(globalVariable.ADMIN_PUSH_TOKEN
                                        , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.roomBox.ID } } //{ ...roombox }
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
                                        this._reportNBLAsync(2, this.state.roomBox.ID)
                                    }
                                    if (this.state.reportCall) {
                                        this._reportNBLAsync(3, this.state.roomBox.ID)
                                    }
                                    if (this.state.reportHouse) {
                                        this._reportNBLAsync(5, this.state.roomBox.ID)
                                    }

                                    this.dropdown.alertWithType('success', translate("Notice"), translate("Thanks your for reporting to Nhabaola"));
                                    //Alert.alert(translate("Notice"), translate("Thanks your for reporting to Nhabaola"));

                                    // Notify Admin 
                                    notifyNBLAsync(globalVariable.ADMIN_PUSH_TOKEN
                                        , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.roomBox.ID } } //{ ...roombox }
                                        , "default"
                                        , this.state.profile.FullName + " " + translate("Complaint") + ":"
                                        , translate("Inaccurate Address or Not Called or Leased House")
                                    ); //pushToken, data, sound, title, body

                                }}
                            />
                        </View>
                    </View>

                </Modal>

                {/* DropdownAlert - https://github.com/testshallpass/react-native-dropdownalert */}
                <DropdownAlert
                    ref={ref => this.dropdown = ref}
                    containerStyle={{}}
                    defaultContainer={{
                        opacity: 0.9,
                        padding: 5,
                        paddingTop: Platform.OS == 'ios' ? 20 : 0,
                        flexDirection: 'row'
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
            </View>
        );
    }
}

const styles = StyleSheet.create({


    cardCommentSubmitText: {
        color: '#fff',
    },
    cardCommentSubmit: {
        flex: 1,
        height: 40,
        backgroundColor: '#73aa2a',
        marginLeft: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    cardMapViewBox: {
        padding: 20,
    },


    cardMapBar: {
        height: 35,
        // backgroundColor: '#F2F2F2',
        // borderBottomWidth: 0.5,
        // borderColor: '#F2F2F2',
        justifyContent: 'center',
        paddingLeft: 20,
        marginTop: 20,
    },
    cardMapBarText: {


    },
    cardCommentBar: {
        height: 35,
        marginTop: 20,
        justifyContent: 'center',
        backgroundColor: '#F2F2F2',
        paddingLeft: 20,
    },
    cardCommentBarText: {

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
        // flex: 4,
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
    // cardAvatarPhone: {
    //     color: '#7E7E7E',
    //     fontSize: 13,
    //     paddingLeft: 8,
    // },
    // cardImageBox: {
    //     flex: 6,
    //     // paddingLeft: 20,
    //     // paddingRight: 20,
    //     // borderWidth: 1,
    //     // borderColor: 'blue',
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
});
