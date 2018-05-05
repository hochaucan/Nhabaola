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
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants } from 'expo';
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
        }
    }

    componentWillMount() {
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

        // alert(JSON.stringify(this.state.roomBox))
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

        // alert(JSON.stringify(this.state.profile))
        //alert(profile)
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

        //alert(JSON.stringify(this.state.roomCategory))
        //alert(profile)
    }



    _handleMapRegionChange = mapRegion => {
        this.setState({ mapRegion });
    };

    _starRatingPress(rating) {
        this.popupRating.dismiss();
        this.setState({
            starCount: rating
        });

        // console.log(rating);
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
                ToastAndroid.showWithGravity('Vui lòng nhập nội dung Bình Luận', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
        }
        else { // iOS

            if (this.state.commentContent == '') {
                Alert.alert('Vui lòng nhập nội dung Bình Luận');
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
                            ToastAndroid.showWithGravity('Bình luận thành công!', ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert('Thông báo', 'Bình luận thành công!');
                        }

                        if (this.state.isPushNotification == 'true') {
                            // notifyNBLAsync("ExponentPushToken[X44MIVEIOHZdIZMVverA9J]");
                            notifyNBLAsync(this.state.pushToken
                                , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.roomBox.ID } } //{ ...roombox }
                                , "default"
                                , this.state.profile.FullName + " Bình Luận:"
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
                            ToastAndroid.showWithGravity('Lỗi ' + JSON.stringify(responseJson.ErrorCode) + ', vui lòng liên hệ Admin trong mục Giúp Đỡ!', ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert('Thông báo', 'Lỗi ' + JSON.stringify(responseJson.ErrorCode) + ', vui lòng liên hệ Admin trong mục Giúp Đỡ!');
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

                    //this._saveStorageAsync('FO_Category_GetAllData', JSON.stringify(responseJson.obj))
                    this.setState({
                        comments: responseJson.obj
                    })
                    //alert(JSON.stringify(responseJson.obj))

                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }

    _postRatingByRoom = async (_rate, _roomId) => {

        // alert(_roomId + "  " + _rate + "  " + this.state.profile.ID + "  " + this.state.profile.UpdatedBy)
        // return;

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
                            ToastAndroid.showWithGravity('Cảm ơn bạn đã đánh giá!', ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert('Thông báo', 'Cảm ơn bạn đã đánh giá!');
                        }
                    }
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
                    "UpdatedBy": this.state.profile.UpdatedBy,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    if (JSON.stringify(responseJson.ErrorCode) === "0") { // Rating successful
                        this.popupReportNBL.dismiss();

                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity('Cảm ơn bạn đã báo cáo chúng tôi!', ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            this.setState({ modalReport: false })

                            // Alert.alert('Thông báo', 'Cảm ơn bạn đã báo cáo chúng tôi!');
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
                    <Text style={{ marginLeft: 20, color: '#fff', fontSize: responsiveFontSize(2.2), justifyContent: 'center' }}>Chi tiết</Text>

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
                                    Alert.alert('Thông Báo', 'Bạn vui lòng đăng nhập')
                                } else {
                                    ToastAndroid.showWithGravity("Bạn vui lòng đăng nhập!", ToastAndroid.SHORT, ToastAndroid.TOP)
                                }

                            } else {
                                Alert.alert(
                                    'Thông báo',
                                    'Bạn muốn gửi thông báo đến người Đăng Tin này?',
                                    [
                                        {
                                            text: 'Hủy', onPress: () => {

                                            }
                                        },
                                        {
                                            text: 'Đồng ý', onPress: () => {
                                                //  roomBox.map((y) => {
                                                // Notify Landlord 
                                                if (this.state.roomBox.Images.split('|')[1] == 'true') {
                                                    notifyNBLAsync(this.state.roomBox.Images.split('|')[0]//globalVariable.ADMIN_PUSH_TOKEN
                                                        , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.roomBox.ID } } //{ ...roombox }
                                                        , "default"
                                                        , this.state.profile.FullName + "-" + this.state.profile.UserName + " tìm kiếm:"
                                                        , "Tin Đăng của bạn ở địa chỉ: " + this.state.roomBox.Address

                                                    ); //pushToken, data, sound, title, body
                                                }
                                                // })

                                                if (Platform.OS === 'android') {
                                                    ToastAndroid.showWithGravity('Gửi thông báo thành công!', ToastAndroid.SHORT, ToastAndroid.TOP);
                                                }
                                                else {
                                                    Alert.alert('Thông báo', 'Gửi thông báo thành công!');
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
                                //alert("item.title")
                                {/* this.props.navigation.navigate('ProfileScreen'); */ }
                            }}
                        >
                            <Image
                                style={styles.cardAvatarImage}
                                source={{ uri: this.state.roomBox.AccountAvarta }} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardAvatarTextBox}>
                        <Text style={styles.cardAvatarName}>{this.state.roomBox.AccountName}</Text>
                        <TouchableOpacity style={styles.cardAvatarPhoneBox}
                            onPress={() => {
                                Communications.phonecall(
                                    this.state.roomBox.ContactPhone.indexOf("|") > -1 ? this.state.roomBox.ContactPhone.split('|')[0]
                                        : this.state.roomBox.ContactPhone
                                    , true)
                            }}
                        >
                            <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />
                            {/* <Text style={{
                                color: '#7E7E7E',
                                fontSize: responsiveFontSize(1.8),//13,
                                paddingLeft: 8,
                            }}>: {this.state.roomBox.ContactPhone}</Text> */}

                            <Text style={{
                                color: '#7E7E7E',
                                fontSize: responsiveFontSize(1.8),//13,
                                paddingLeft: 8,
                            }}>: {this.state.roomBox.ContactPhone.indexOf("|") > -1 ? this.state.roomBox.ContactPhone.split('|')[0] + '. LH: ' + this.state.roomBox.ContactPhone.split('|')[1]
                                : this.state.roomBox.ContactPhone}</Text>
                        </TouchableOpacity>
                    </View>

                    {this.state.roomBox.IsHighlight &&
                        <Image
                            style={{
                                position: 'absolute', right: 15, zIndex: 10,
                                width: responsiveWidth(25),
                                height: responsiveWidth(25), top: 5
                            }}
                            source={require('../assets/images/nbl-highlight.gif')}
                        />
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
                                    position: 'absolute', bottom: 50, right: 15, zIndex: 10, opacity: 0.5,
                                    width: responsiveWidth(15),
                                    height: responsiveWidth(15), borderRadius: 100,
                                }}
                                source={require('../images/app-icon.png')}
                            />


                            <View style={{ flexDirection: 'row', paddingLeft: 20, paddingRight: 20, paddingTop: 5, paddingBottom: 5, marginTop: -50, backgroundColor: '#000', opacity: 0.6 }}>
                                {/* <TextMask
                                    style={{ flex: 1, color: '#fff', fontSize: 15 }}
                                    value={this.state.roomBox.Price}
                                    type={'money'}
                                    options={{ suffixUnit: ' đ', precision: 0, unit: 'Giá:   ', separator: ' ' }}
                                /> */}
                                <Text
                                    style={{
                                        flex: 1, color: '#fff', fontWeight: '300',
                                        fontSize: responsiveFontSize(1.7)
                                    }}>
                                    Giá: {convertAmountToWording(numberWithCommas(this.state.roomBox.Price))}
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
                                                key={i}>{y.CatName}:  {this.state.roomBox.Acreage} m</Text>
                                            // : null
                                        )
                                    })
                                }

                                {/* <Text style={{ flex: 1, textAlign: 'right', color: '#fff' }}>Diện tích:   {this.state.roomBox.Acreage} m</Text> */}
                                <Text style={{ fontSize: 8, marginBottom: 5, color: '#fff' }}>2</Text>

                            </View>
                        </View>
                        <View style={styles.cardDesBox}>


                            <Text style={styles.cardDesText}>

                                {this.state.roomBox.Description}
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
                                                Alert.alert('Thông Báo', 'Bạn vui lòng đăng nhập')
                                            } else {
                                                ToastAndroid.showWithGravity("Bạn vui lòng đăng nhập!", ToastAndroid.SHORT, ToastAndroid.TOP)
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
                                        color: this.state.isRating ? '#a4d227' : '#8B8E8E',
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
                            </View>
                            <View style={styles.cardBottomRight}>
                                {/* <TouchableOpacity >
                                    <Ionicons style={styles.cardBottomIcon} name='ios-thumbs-up' />
                                </TouchableOpacity> */}
                                <TouchableOpacity
                                    onPress={async () => {
                                        let loadBDS = '';
                                        await this.state.roomCategory.map((y, i) => {
                                            if (y.ID == this.state.roomBox.CategoryID) {
                                                loadBDS = y.CatName
                                            }



                                        })

                                        const _contactName = this.state.roomBox.ContactPhone.indexOf('|') > -1 ? this.state.roomBox.ContactPhone.split('|')[1] : this.state.roomBox.AccountName
                                        const _contactPhone = this.state.roomBox.ContactPhone.indexOf('|') > -1 ? this.state.roomBox.ContactPhone.split('|')[0] : this.state.roomBox.ContactPhone


                                        if (Platform.OS == 'ios') {
                                            Share.share({
                                                message: "*Chia Sẻ từ Ứng Dụng Nhà Bao La*"
                                                    + "\n\nLiên hệ: " + _contactName
                                                    + "\nĐiện thoại: " + _contactPhone
                                                    + "\n\nLoại bất động sản: " + loadBDS
                                                    + "\nGiá: " + this.state.roomBox.Price + " đồng"
                                                    + "\nDiện tích: " + this.state.roomBox.Acreage + " mét vuông"
                                                    + "\nĐịa chỉ: " + this.state.roomBox.Address + "\n\nMô tả:\n" + this.state.roomBox.Description
                                                    + "\n\nCài đặt: "
                                                    + "\nAndroid: \nhttps://play.google.com/store/apps/details?id=vn.nhabaola.nhabaola"
                                                    + "\n\niOS: \nhttps://itunes.apple.com/vn/app/nhabaola/id1287451307?mt=8",
                                                //url: 'https://itunes.apple.com/vn/app/nhabaola/id1287451307?mt=8',
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
                                        else { //Android
                                            Share.share({
                                                message: "*Chia Sẻ từ Ứng Dụng Nhà Bao La*"
                                                    + "\n\nLiên hệ: " + _contactName
                                                    + "\nĐiện thoại: " + _contactPhone
                                                    + "\n\nLoại bất động sản: " + loadBDS
                                                    + "\nGiá: " + this.state.roomBox.Price + " đồng"
                                                    + "\nDiện tích: " + this.state.roomBox.Acreage + " mét vuông"
                                                    + "\nĐịa chỉ: " + this.state.roomBox.Address + "\n\nMô tả:\n" + this.state.roomBox.Description
                                                    + "\n\nCài đặt: "
                                                    + "\niOS: \nhttps://itunes.apple.com/vn/app/nhabaola/id1287451307?mt=8"
                                                    + "\n\nAndroid: \nhttps://play.google.com/store/apps/details?id=vn.nhabaola.nhabaola",
                                                url: 'https://play.google.com/store/apps/details?id=vn.nhabaola.nhabaola',
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
                                    }}
                                >
                                    <Ionicons style={styles.cardBottomIcon} name='md-share' />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={async () => {
                                        if (this.state.profile === null) {
                                            if (Platform.OS == 'ios') {
                                                Alert.alert('Thông Báo', 'Bạn vui lòng đăng nhập')
                                            } else {
                                                ToastAndroid.showWithGravity("Bạn vui lòng đăng nhập!", ToastAndroid.SHORT, ToastAndroid.TOP)
                                            }
                                        } else {
                                            {/* await this.setState({
                                                reportRoomId: item.ID,
                                            }) */}

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
                        <Text style={{ marginBottom: 5 }}>Địa chỉ:  {this.state.roomBox.Address}</Text>
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
                            <Ionicons style={{ color: '#fff', fontSize: responsiveFontSize(1.5) }} name='md-return-right' > Tìm đường</Ionicons>
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

                    {/* <View style={styles.cardCommentBar}>
                    <Text style={styles.cardCommentBarText}>Bình luận</Text>
                </View> */}

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

                                placeholder='Bình luận'
                                underlineColorAndroid='transparent'
                                value={this.state.commentContent}
                                onChangeText={(commentContent) => this.setState({ commentContent })}
                            ></TextInput>
                            <TouchableOpacity style={styles.cardCommentSubmit}
                                onPress={async () => {
                                    this._postCommentsAsync();
                                }}
                            >
                                <Text style={styles.cardCommentSubmitText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                        {/* {Platform.OS == 'android' &&
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                height: 0,
                                paddingTop: 20, paddingRight: 20, paddingLeft: 20,
                                marginTop: 50,
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
                                    ref='commentInput2'
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

                                    placeholder='Bình luận'
                                    underlineColorAndroid='transparent'
                                    value={this.state.commentContent}
                                    onChangeText={(commentContent) => this.setState({ commentContent })}
                                ></TextInput>
                                <TouchableOpacity style={styles.cardCommentSubmit}
                                    onPress={async () => {
                                        this._postCommentsAsync();
                                    }}
                                >
                                    <Text style={styles.cardCommentSubmitText}>Gửi</Text>
                                </TouchableOpacity>
                            </View>
                        } */}
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
                        starColor={'#a4d227'}
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
                                    // Notify Admin 
                                    notifyNBLAsync('ExponentPushToken[ycjiZbIzuZuk5oS0EhzWTB]'
                                        , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.roomBox.ID } } //{ ...roombox }
                                        , "default"
                                        , this.state.profile.FullName + " phàn nàn:"
                                        , "Không đúng địa chỉ hoặc Không gọi được hoặc Nhà đã cho thuê"
                                    ); //pushToken, data, sound, title, body

                                    if (this.state.reportAddress) {
                                        this._reportNBLAsync(2, this.state.roomBox.ID)
                                    }
                                    if (this.state.reportCall) {
                                        this._reportNBLAsync(3, this.state.roomBox.ID)
                                    }
                                    if (this.state.reportHouse) {
                                        this._reportNBLAsync(5, this.state.roomBox.ID)
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

                                    // Notify Admin 
                                    notifyNBLAsync('ExponentPushToken[ycjiZbIzuZuk5oS0EhzWTB]'
                                        , { "screen": "RoomDetailScreen", "params": { "roomBoxID": this.state.roomBox.ID } } //{ ...roombox }
                                        , "default"
                                        , this.state.profile.FullName + " phàn nàn:"
                                        , "Không đúng địa chỉ hoặc Không gọi được hoặc Nhà đã cho thuê"
                                    ); //pushToken, data, sound, title, body

                                    if (this.state.reportAddress) {
                                        this._reportNBLAsync(2, this.state.roomBox.ID)
                                    }
                                    if (this.state.reportCall) {
                                        this._reportNBLAsync(3, this.state.roomBox.ID)
                                    }
                                    if (this.state.reportHouse) {
                                        this._reportNBLAsync(5, this.state.roomBox.ID)
                                    }

                                }}
                            />
                        </View>
                    </View>

                </Modal>
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
