import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Image,
    Platform,
    AsyncStorage,
    ScrollView,
    Picker,
    ActivityIndicator,
    ToastAndroid,
    Alert,
    Modal,
    Switch,
    Keyboard,
}
    from 'react-native';
import { Constants, Location, Permissions, ImagePicker } from 'expo';
import MapView from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'; // 1.2.12
import { TextInputMask } from 'react-native-masked-text';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import uploadImageAsync from '../api/uploadImageAsync'
import HomeScreen from './HomeScreen';
import DatePicker from 'react-native-datepicker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

var { height, width } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// var today = new Date();
// var dd = today.getDate();
// var mm = today.getMonth() + 1;
// var yyyy = today.getFullYear();
// var minDate = dd + '/' + mm + '/' + yyyy //yyyy + '-' + mm + '-' + dd

// var newdate = new Date(today);
// newdate.setDate(newdate.getDate() + 1);
// var dd2 = newdate.getDate();
// var mm2 = newdate.getMonth() + 1;
// var yyyy2 = newdate.getFullYear();
// var topDate = dd2 + '/' + mm2 + '/' + yyyy2// yyyy2 + '-' + mm2 + '-' + dd2

// function funcAdd1Day(_date) {
//     var _newdate = new Date(_date);
//     _newdate.setDate(_newdate.getDate() + 1);
//     var _dd = _newdate.getDate();
//     var _mm = _newdate.getMonth() + 1;
//     var _yyyy = _newdate.getFullYear();
//     var _topDate = _dd + '/' + _mm + '/' + _yyyy//_yyyy2 + '-' + _mm2 + '-' + _dd2
//     return _topDate;
// }

var today = new Date();
var dd = today.getDate() == 1 ? '01' : today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
var minDate = yyyy + '-' + mm + '-' + dd //== '1' ? '01' : dd

var newdate = new Date(today);
newdate.setDate(newdate.getDate() + 1);
var dd2 = newdate.getDate();
var mm2 = newdate.getMonth() + 1;
var yyyy2 = newdate.getFullYear();
var topDate = yyyy2 + '-' + mm2 + '-' + dd2

// function funcAdd1Day(_date) {
//     var _newdate = new Date(_date);
//     _newdate.setDate(_newdate.getDate() + 1);
//     var _dd2 = _newdate.getDate();
//     var _mm2 = _newdate.getMonth() + 1;
//     var _yyyy2 = _newdate.getFullYear();
//     var _topDate = _yyyy2 + '-' + _mm2 + '-' + _dd2
//     return _topDate;
// }

export default class UpdateRoomScreen extends React.Component {
    static navigationOptions = {
        // title: 'app.json',
        header: null,
    };

    constructor(props) {
        super(props)
        this.state = {
            mapRegion: { latitude: LATITUDE, longitude: LONGITUDE, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA },
            roomCategory: [],
            selectedCategory: '0',
            postRoomImage1: null,
            postRoomImage2: null,
            postRoomImage3: null,
            postRoomImage4: null,
            postRoomImage5: null,
            postRoomImage6: null,
            imageUrl: '',
            postRoomAddressMaker: {
                latitude: null,
                longitude: null,
            },
            selectedImages: '0',
            selectedAddress: 'Vui lòng nhập địa chỉ',
            searchingMaker: {
                latitude: null,
                longitude: null,
            },
            initialRenderCurrentMaker: true,
            acreage: '',
            price: '',
            detailInfo: '',
            modalBDS: false,
            SessionKey: null,
            profile: null,
            fromDate: minDate,
            toDate: topDate,
            fromDateHighLight: minDate,
            toDateHighLight: topDate,
            isHighlight: false,
            roomBox: null,
        }
    }

    componentWillMount() {
        this._getRoomBoxDetailAsync();
        this._getSessionKeyFromStorageAsync();
        this._getProfileFromStorageAsync();
        this._getCategoryFromStorageAsync();
    }

    componentDidMount() {
        //alert(topDate)
    }

    _getRoomBoxDetailAsync = async () => {

        await this.setState({
            roomBox: this.props.navigation.state.params.item
        })

        //alert(JSON.stringify(this.state.roomBox))
        var images = this.state.roomBox.Images.replace('|', '').split('|');
        var _latitude = parseFloat(this.state.roomBox.Latitude)
        var _longitude = parseFloat(this.state.roomBox.Longitude)
        //  alert(images[3] == null ? images[3] : "khac")
        await this.setState({
            detailInfo: this.state.roomBox.Description,
            price: this.state.roomBox.Price,
            acreage: this.state.roomBox.Acreage,
            selectedCategory: this.state.roomBox.CategoryID,
            selectedAddress: this.state.roomBox.Address,
            // fromDate: this.state.roomBox.FromDate,
            toDate: new Date(this.state.roomBox.ToDate) < today ? topDate : this.state.roomBox.ToDate,
            isHighlight: this.state.roomBox.IsHighlight,
            toDateHighLight: new Date(this.state.roomBox.HighlightToDate) < today ? topDate : this.state.roomBox.HighlightToDate,
            postRoomImage1: images[0],
            postRoomImage2: images[1],
            postRoomImage3: images[2],
            postRoomImage4: images[3],
            postRoomImage5: images[4],
            postRoomImage6: images[5],
            searchingMaker: {
                latitude: _latitude,
                longitude: _longitude,
            },
            mapRegion: {
                latitude: _latitude, longitude: _longitude, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA
            },
        })

        // alert(this.state.selectedCategory)

    }

    _getSessionKeyFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('SessionKey');

            if (value !== null) {
                this.setState({
                    SessionKey: JSON.parse(value)
                })
            }
            else {
                this.setState({
                    SessionKey: null,
                })
            }

        } catch (e) {
            console.log(e);
        }
    }

    _getProfileFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('FO_Account_Login');

            if (value !== null) {
                this.setState({
                    profile: JSON.parse(value)
                })
            }
            else {
                this.setState({
                    profile: null,
                })
            }

        } catch (e) {
            console.log(e);
        }
    }

    _getCategoryFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('FO_Category_GetAllData');

            if (value !== null) {
                this.setState({
                    roomCategory: JSON.parse(value)
                })
            }

        } catch (e) {
            console.log(e);
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
                case '4':
                    this.setState({ postRoomImage4: result.uri });
                    break;
                case '5':
                    this.setState({ postRoomImage5: result.uri });
                    break;
                case '6':
                    this.setState({ postRoomImage6: result.uri });
                    break;
                default:

            }
        }

    };

    _updateRoomAsync = async () => {
        //alert(new Date(this.state.toDate) + " " + new Date(this.state.fromDate))
        // alert(this.state.toDate + " " + minDate)
        //return

        //Form validation
        if (Platform.OS === 'android') {
            if (this.state.postRoomImage1 === null
                // && this.state.postRoomImage2 === null
                // && this.state.postRoomImage3 === null
                // && this.state.postRoomImage4 === null
                // && this.state.postRoomImage5 === null
                // && this.state.postRoomImage6 === null
            ) {
                ToastAndroid.showWithGravity('Vui lòng chọn hình đại diện', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.searchingMaker.latitude === null) {
                ToastAndroid.showWithGravity('Vui lòng nhập địa chỉ', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.price === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập giá', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.acreage === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập diện tích', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.selectedCategory === '0') {
                ToastAndroid.showWithGravity('Vui lòng chọn loại BĐS', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.toDate < this.state.fromDate) {
                ToastAndroid.showWithGravity('Ngày kết thúc hiệu lực không được nhỏ hơn ngày bắt đầu', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.isHighlight && this.state.toDateHighLight < this.state.fromDateHighLight) {
                ToastAndroid.showWithGravity('Ngày kết thúc nổi bật không được nhỏ hơn ngày bắt đầu', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.detailInfo === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập thông tin chi tiết', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
        }
        else { // iOS
            if (this.state.postRoomImage1 === null
                // && this.state.postRoomImage2 === null
                // && this.state.postRoomImage3 === null
                // && this.state.postRoomImage4 === null
                // && this.state.postRoomImage5 === null
                // && this.state.postRoomImage6 === null
            ) {
                Alert.alert('Vui lòng chọn hình đại diện');
                return;
            }
            if (this.state.searchingMaker.latitude === null) {
                Alert.alert('Vui lòng nhập địa chỉ');
                return;
            }
            if (this.state.price === '') {
                Alert.alert('Vui lòng nhập giá');
                return;
            }
            if (this.state.acreage === '') {
                Alert.alert('Vui lòng nhập diện tích');
                return;
            }
            if (this.state.selectedCategory === '0') {
                Alert.alert('Vui lòng chọn loại BĐS');
                return;
            }
            if (this.state.toDate < this.state.fromDate) {
                Alert.alert('Ngày kết thúc hiệu lực không được nhỏ hơn ngày bắt đầu');
                return;
            }
            if (this.state.isHighlight && this.state.toDateHighLight < this.state.fromDateHighLight) {
                Alert.alert('Ngày kết thúc nổi bật không được nhỏ hơn ngày bắt đầu');
                return;
            }
            if (this.state.detailInfo === '') {
                Alert.alert('Vui lòng nhập thông tin chi tiết');
                return;
            }
        }

        //Loading
        this.popupLoadingIndicator.show();

        if (this.state.postRoomImage1 != null) {
            if (!this.state.postRoomImage1.match("http")) {
                let uploadResponse = await uploadImageAsync(this.state.postRoomImage1);
                let uploadResult = await uploadResponse.json();
                this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.data.img_url })
            } else {
                await this.setState({ imageUrl: this.state.imageUrl + '|' + this.state.postRoomImage1 })

                // this.setState((prevState) => {
                //     return { imageUrl: prevState.imageUrl + '|' + this.state.postRoomImage1 };
                // })

                // alert(this.state.imageUrl)
                // return
            }

        }
        if (this.state.postRoomImage2 != null) {
            if (!this.state.postRoomImage2.match("http")) {
                let uploadResponse = await uploadImageAsync(this.state.postRoomImage2);
                let uploadResult = await uploadResponse.json();
                this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.data.img_url })
            } else {
                this.setState({ imageUrl: this.state.imageUrl + '|' + this.state.postRoomImage2 })
            }
        }
        if (this.state.postRoomImage3 != null) {
            if (!this.state.postRoomImage3.match("http")) {
                let uploadResponse = await uploadImageAsync(this.state.postRoomImage3);
                let uploadResult = await uploadResponse.json();
                this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.data.img_url })
            } else {
                this.setState({ imageUrl: this.state.imageUrl + '|' + this.state.postRoomImage3 })
            }
        }

        if (this.state.postRoomImage4 != null) {
            if (!this.state.postRoomImage4.match("http")) {
                let uploadResponse = await uploadImageAsync(this.state.postRoomImage4);
                let uploadResult = await uploadResponse.json();
                this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.data.img_url })
            } else {
                this.setState({ imageUrl: this.state.imageUrl + '|' + this.state.postRoomImage4 })
            }
        }
        if (this.state.postRoomImage5 != null) {
            if (!this.state.postRoomImage5.match("http")) {
                let uploadResponse = await uploadImageAsync(this.state.postRoomImage5);
                let uploadResult = await uploadResponse.json();
                this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.data.img_url })
            } else {
                this.setState({ imageUrl: this.state.imageUrl + '|' + this.state.postRoomImage5 })
            }
        }
        if (this.state.postRoomImage6 != null) {
            if (!this.state.postRoomImage6.match("http")) {
                let uploadResponse = await uploadImageAsync(this.state.postRoomImage6);
                let uploadResult = await uploadResponse.json();
                this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.data.img_url })
            } else {
                this.setState({ imageUrl: this.state.imageUrl + '|' + this.state.postRoomImage6 })
            }
        }

        // if (!this.state.isHighlight) {
        //     this.setState({
        //         fromDateHighLight: minDate,
        //         toDateHighLight: funcAdd1Day(minDate)
        //     })
        // }

        // alert(this.state.imageUrl + "   " + this.state.postRoomImage1)
        // return

        try {
            await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_Edit", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    "ID": this.state.roomBox.ID,
                    "Title": this.state.imageUrl.split('|')[1],
                    "Images": this.state.imageUrl,
                    "CategoryID": this.state.selectedCategory,
                    "Address": this.state.selectedAddress,
                    "Longitude": this.state.searchingMaker.longitude,
                    "Latitude": this.state.searchingMaker.latitude,
                    "Description": this.state.detailInfo,
                    "Price": this.state.price.replace('.', '').replace('.', '').replace('.', '').replace('.', ''),
                    "Acreage": this.state.acreage,
                    "Toilet": "",
                    "Bedroom": "",
                    "AirConditioner": "",
                    "ContactPhone": "",
                    "FromDate": this.state.fromDate,
                    "ToDate": this.state.toDate,
                    "IsTop": "true",
                    "IsPinned": "false",
                    "IsHighlight": this.state.isHighlight,
                    "HighlightFromDate": this.state.fromDateHighLight,
                    "HighlightToDate": this.state.toDateHighLight,
                    "IsActive": "true",
                    "CreatedBy": this.state.profile.ID,
                    "UpdatedBy": this.state.SessionKey,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {



                    if (JSON.stringify(responseJson.ErrorCode) === "11") {
                        this.props.navigation.state.params.onRefreshScreen({ refreshScreen: true, });
                        this.props.navigation.goBack();

                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity('Cập nhật tin thành công!', ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert('Cập nhật tin thành công!');
                        }
                        //this._getRoomBoxByUserAsync(true);
                    } else {

                        alert(responseJson.ErrorCode)
                    }
                    // if (JSON.stringify(responseJson.ErrorCode) === "3") {

                    //     if (Platform.OS === 'android') {
                    //         ToastAndroid.showWithGravity('Ngày bắt đầu hiệu lực phải lớn hơn ngày hiện tại', ToastAndroid.SHORT, ToastAndroid.CENTER);
                    //     }
                    //     else {
                    //         Alert.alert('Ngày bắt đầu hiệu lực phải lớn hơn ngày hiện tại');
                    //     }
                    //     //this._getRoomBoxByUserAsync(true);
                    // }


                    //alert(JSON.stringify(responseJson))

                    //this.props.navigation.navigate('Home');
                    // HomeScreen.refreshRoomBoxAfterPost();
                    //this.props.navigation.state.params.onSelect({ selected: true });
                    //this.props.navigation.goBack();
                    //  this.props.navigation.state.params._getWalletAsync();
                    // this.props.navigation.state.params.onRefreshScreen({ refreshScreen: true });


                    this.popupLoadingIndicator.dismiss();

                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }


    }



    _postImage = async (file) => {
        // var tmp = file.replace('file://', '');
        var postLink = 'http://uploads.im/api?upload=' + file
        //console.log(postLink)


        //Post to register account
        try {
            await fetch(postLink)
                .then((response) => response.json())
                .then((responseJson) => {

                    this.setState({ imageUrl1: responseJson.data.img_url })
                    console.log(responseJson.data.img_url)

                })
                .catch((e) => { console.log(e) });
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

    render() {

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <KeyboardAwareScrollView
                    innerRef={ref => { this.scroll = ref }}
                    style={{ paddingTop: 10, marginTop: 20, }}
                >
                    <FormLabel>Hình ảnh</FormLabel>
                    <View style={{
                        height: 120, paddingRight: 20,
                        paddingLeft: 20, flexDirection: 'row', justifyContent: 'space-between',

                    }}>
                        {/* <Ionicons style={{ opacity: 0.7, fontSize: 20, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-close-circle-outline' /> */}
                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '1' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.7, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage1 && <Image source={{ uri: this.state.postRoomImage1 }} style={{ width: 90, height: 90 }} />}
                            <Text style={{ color: '#73aa2a', fontSize: 12, textAlign: 'center', paddingTop: 5, }}>Hình đại diện</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '2' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage2 && <Image source={{ uri: this.state.postRoomImage2 }} style={{ width: 90, height: 90, marginBottom: 21 }} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '3' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage3 && <Image source={{ uri: this.state.postRoomImage3 }} style={{ width: 90, height: 90, marginBottom: 21 }} />}
                        </TouchableOpacity>

                    </View>
                    <View style={{
                        height: 120, paddingRight: 20,
                        paddingLeft: 20, flexDirection: 'row', justifyContent: 'space-between',

                    }}>

                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '4' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage4 && <Image source={{ uri: this.state.postRoomImage4 }} style={{ width: 90, height: 90, marginBottom: 21 }} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '5' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage5 && <Image source={{ uri: this.state.postRoomImage5 }} style={{ width: 90, height: 90, marginBottom: 21 }} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '6' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage6 && <Image source={{ uri: this.state.postRoomImage6 }} style={{ width: 90, height: 90, marginBottom: 21 }} />}
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
                        <TouchableOpacity
                            style={{
                                marginBottom: 10,
                                borderWidth: 0.5,
                                padding: 10,
                                borderRadius: 10,
                                borderColor: '#73aa2a'
                            }}
                            onPress={() => { this.popupSearching.show() }}
                        >
                            <Text>{this.state.selectedAddress}</Text>
                        </TouchableOpacity>



                        <MapView
                            style={{ height: 150, alignSelf: 'stretch' }}
                            ref={ref => { this.map = ref; }}
                            region={this.state.mapRegion}
                            provider='google'
                            showsUserLocation={false}
                            showsMyLocationButton={false}
                            followsUserLocation={false}
                        >

                            {this.state.searchingMaker.latitude ?
                                <MapView.Marker
                                    coordinate={this.state.searchingMaker}
                                    title=''
                                    description=''
                                >

                                    <Image
                                        source={require('../assets/images/nbl-here-icon.png')}
                                        style={{ height: height * 0.07, width: width * 0.07 }}
                                        onLayout={() => {
                                            this.setState({ initialRenderCurrentMaker: false })
                                        }}
                                        key={`${this.state.initialRenderCurrentMaker}`}
                                    />

                                </MapView.Marker>
                                : null}


                        </MapView>


                    </View>
                    <View style={{ paddingBottom: 20 }}>

                        {/* Price */}
                        <View style={{ flexDirection: 'row', }}>
                            <FormLabel style={{}}>Giá:</FormLabel>
                            <TextInputMask
                                ref='priceInput'
                                returnKeyType={"next"}
                                onSubmitEditing={(event) => {
                                    this.refs['acreageInput'].getElement().focus();
                                }}
                                onFocus={(event) => {
                                    this._scrollToInput(event.target)
                                }}
                                type={'money'}
                                options={{ suffixUnit: '', precision: 0, unit: '', separator: ' ' }}
                                style={{ flex: 1, padding: 5, marginLeft: 30, borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 0, borderColor: '#73aa2a' }}
                                placeholder=''
                                underlineColorAndroid='#73aa2a'
                                value={this.state.price}
                                onChangeText={(price) => this.setState({ price })}
                                blurOnSubmit={true}
                            />
                            <FormLabel>(đồng)</FormLabel>
                        </View>
                        {/* Acreage */}
                        <View style={{ flexDirection: 'row', }}>
                            <FormLabel style={{}}>Diện tích:</FormLabel>
                            <TextInputMask
                                ref='acreageInput'
                                returnKeyType={"next"}
                                //onSubmitEditing={(event) => {
                                //  this.refs.emailInput.focus();
                                //}}
                                onFocus={(event) => {
                                    this._scrollToInput(event.target)
                                }}
                                type={'only-numbers'}
                                style={{ flex: 1, padding: 5, borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 0, borderColor: '#73aa2a' }}
                                placeholder=''
                                underlineColorAndroid='#73aa2a'
                                blurOnSubmit={true}
                                value={this.state.acreage}
                                onChangeText={(acreage) => this.setState({ acreage })}
                            />

                            <FormLabel>(mét vuông)</FormLabel>
                        </View>
                        {/* Room Type */}
                        <View style={{ flexDirection: 'row', }}>
                            <FormLabel style={{}}>Loại BĐS:</FormLabel>
                            {Platform.OS === 'ios' ?
                                <TouchableOpacity
                                    style={{ marginTop: 12 }}
                                    onPress={() => {
                                        this.setState({
                                            modalBDS: true
                                        })
                                    }}
                                >
                                    {this.state.selectedCategory === '0'
                                        ?
                                        <Text> -- Chọn loại BĐS --</Text>
                                        :
                                        this.state.roomCategory.map((y, i) => {
                                            return (
                                                y.ID === this.state.selectedCategory ?
                                                    <Text key={i}> {y.CatName}</Text>
                                                    : null

                                                //<Picker.Item key={i} label={y.CatName} value={y.ID} />
                                            )
                                        })

                                    }
                                </TouchableOpacity>
                                :
                                <Picker // Android
                                    style={{ flex: 1, marginTop: -4 }}
                                    mode='dropdown'
                                    selectedValue={parseInt(this.state.selectedCategory)}
                                    onValueChange={(itemValue, itemIndex) => this.setState({ selectedCategory: itemValue })}>
                                    <Picker.Item label='-- Chọn loại BĐS --' value='0' />



                                    {this.state.roomCategory.map((y, i) => {
                                        return (
                                            <Picker.Item key={i} label={y.CatName} value={y.ID} />
                                        )
                                    })}

                                </Picker>
                            }
                        </View>

                        {/* From Effected Date */}
                        <FormLabel labelStyle={{}}>Hiệu lực (5K/ngày):</FormLabel>
                        <View style={{ flexDirection: 'row', marginTop: 8 }}>
                            <FormLabel labelStyle={{ color: '#fff' }}>Hiệu lực:</FormLabel>
                            <Text style={{ paddingTop: 10 }}>Từ</Text>
                            <DatePicker
                                style={{ marginLeft: 8 }}
                                date={this.state.fromDate}
                                mode="date"
                                placeholder="select date"
                                format="YYYY-MM-DD"
                                minDate={minDate}
                                //maxDate="2016-06-01"
                                confirmBtnText="Chọn"
                                cancelBtnText="Hủy"
                                showIcon={true}
                                customStyles={{
                                    dateIcon: {
                                        position: 'absolute',
                                        left: 0,
                                        top: 4,
                                        marginLeft: 0,
                                    },
                                    dateInput: {
                                        marginLeft: 36
                                    },
                                    //dateText:{
                                    //  color:'red'
                                    //}
                                    // ... You can check the source to find the other keys.
                                }}
                                onDateChange={(fromDate) => {
                                    this.setState({
                                        fromDate,
                                        //toDate: funcAdd1Day(fromDate),
                                        fromDateHighLight: fromDate,
                                        //toDateHighLight: funcAdd1Day(fromDate)
                                    })
                                }}
                            />

                        </View>

                        {/* To Effected Date */}
                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <FormLabel labelStyle={{ color: '#fff' }}>Hiệu lực:</FormLabel>

                            <Text style={{ paddingTop: 10 }}>Đến</Text>
                            <DatePicker
                                style={{}}
                                date={this.state.toDate}
                                mode="date"
                                placeholder="select date"
                                format="YYYY-MM-DD"
                                minDate={this.state.fromDate}
                                //maxDate="2016-06-01"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={true}
                                customStyles={{
                                    dateIcon: {
                                        position: 'absolute',
                                        left: 0,
                                        top: 4,
                                        marginLeft: 0
                                    },
                                    dateInput: {
                                        marginLeft: 36
                                    }
                                    // ... You can check the source to find the other keys.
                                }}
                                onDateChange={(toDate) => {
                                    this.setState({ toDate })
                                    this.refs.roomInfoInput.focus();

                                    //let _toDate = new Date(this.state.toDate);
                                    // alert(_toDate > today)
                                }}
                            />
                            {/* {new Date(this.state.toDate) < today &&
                                <Text style={{ marginLeft: 10, marginTop: 12, color: 'red' }}>*</Text>
                            } */}
                        </View>

                        {/* Highlight Date */}
                        <View
                            style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}
                        >
                            <FormLabel style={{}}>Làm nổi bật (2K/ngày):</FormLabel>
                            <Switch
                                style={{ marginTop: 12 }}
                                onValueChange={() => {
                                    this.setState({ isHighlight: !this.state.isHighlight })
                                }}
                                value={this.state.isHighlight}
                            />
                        </View>

                        {/* fromDateHighLight */}
                        {this.state.isHighlight &&
                            <View>
                                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                    <FormLabel labelStyle={{ color: '#fff' }}>Hiệu lực:</FormLabel>
                                    <Text style={{ paddingTop: 10 }}>Từ</Text>
                                    <DatePicker
                                        style={{ marginLeft: 8 }}
                                        date={this.state.fromDateHighLight}
                                        mode="date"
                                        placeholder="select date"
                                        format="YYYY-MM-DD"
                                        minDate={this.state.fromDate}
                                        maxDate={this.state.toDate}
                                        confirmBtnText="Chọn"
                                        cancelBtnText="Hủy"
                                        showIcon={true}
                                        customStyles={{
                                            dateIcon: {
                                                position: 'absolute',
                                                left: 0,
                                                top: 4,
                                                marginLeft: 0,
                                            },
                                            dateInput: {
                                                marginLeft: 36
                                            },
                                            //dateText:{
                                            //  color:'red'
                                            //}
                                            // ... You can check the source to find the other keys.
                                        }}
                                        onDateChange={(fromDateHighLight) => { this.setState({ fromDateHighLight }) }}
                                    />

                                </View>

                                {/* toDateHighLight */}
                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                    <FormLabel labelStyle={{ color: '#fff' }}>Hiệu lực:</FormLabel>

                                    <Text style={{ paddingTop: 10 }}>Đến</Text>
                                    <DatePicker
                                        style={{}}
                                        date={this.state.toDateHighLight}
                                        mode="date"
                                        placeholder="select date"
                                        format="YYYY-MM-DD"
                                        minDate={this.state.fromDate}
                                        maxDate={this.state.toDate}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        showIcon={true}
                                        customStyles={{
                                            dateIcon: {
                                                position: 'absolute',
                                                left: 0,
                                                top: 4,
                                                marginLeft: 0
                                            },
                                            dateInput: {
                                                marginLeft: 36
                                            }
                                            // ... You can check the source to find the other keys.
                                        }}
                                        onDateChange={(toDateHighLight) => {
                                            this.setState({ toDateHighLight })
                                            this.refs.roomInfoInput.focus();
                                        }}
                                    />
                                    {this.state.toDateHighLight < this.state.fromDateHighLight &&
                                        <Text style={{ marginLeft: 10, marginTop: 12, color: 'red' }}>*</Text>
                                    }
                                </View>
                            </View>
                        }

                        {/* Detail Room Information */}
                        <FormLabel style={{ marginTop: 10, }}>Chi tiết:</FormLabel>
                        <FormInput
                            ref='roomInfoInput'
                            returnKeyType={"done"}
                            onSubmitEditing={(event) => {
                                this._updateRoomAsync();
                            }}
                            onFocus={(event) => {
                                this._scrollToInput(event.target)
                            }}
                            containerStyle={{ borderWidth: 0.5, borderColor: '#73aa2a', borderRadius: 10, }}
                            inputStyle={{ padding: 10, height: 140 }}
                            placeholder='Vui lòng nhập thông tin chi tiết'
                            multiline={true}
                            autoCapitalize='sentences'
                            //maxLength={300}
                            clearButtonMode='always'
                            underlineColorAndroid='#fff'
                            //blurOnSubmit={true}
                            value={this.state.detailInfo}
                            onChangeText={(detailInfo) => this.setState({ detailInfo })}
                        />
                    </View>
                    <KeyboardSpacer />
                </KeyboardAwareScrollView>
                {/* Button */}
                <View style={{ marginTop: 20, }}>
                    <View style={{ height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 20, }}>
                        <Button
                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                            onPress={() => {
                                //HomeScreen.refreshRoomBoxAfterPost();

                                this.props.navigation.goBack();
                                // this.props.navigation.state.params.onRefreshScreen({ refreshScreen: true, profile: null });
                                //this.props.navigation.state.params.onSelect({ selected: true });

                                //this.props.navigation.state.params.onSelect({ _refreshRoomBox });
                            }}
                            title='Hủy' />
                        <Button
                            buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                            icon={{ name: 'md-cloud-upload', type: 'ionicon' }}
                            title='Cập nhật'
                            onPress={() => {
                                Keyboard.dismiss();
                                this._updateRoomAsync();
                            }}
                        />
                    </View>
                </View>
                {/* <KeyboardSpacer /> */}



                {/* MODAL AND POPUP AREA */}

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

                {/* Popup Searching */}
                <PopupDialog
                    ref={(popupSearching) => { this.popupSearching = popupSearching; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogStyle={{ marginBottom: 100, width: width * 0.9, height: height * 0.6, justifyContent: 'center', padding: 20 }}
                >
                    <GooglePlacesAutocomplete
                        placeholder="Tìm kiếm địa chỉ"
                        minLength={1} // minimum length of text to search
                        autoFocus={false}
                        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                        listViewDisplayed="auto" // true/false/undefined
                        fetchDetails={true}
                        renderDescription={row => row.description} // custom description render
                        onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                            {/* console.log(data); */ }
                            //console.log(details.geometry.location);
                            const address = details.name + ", " + details.formatted_address;
                            this.setState({ selectedAddress: address })
                            // console.log(details.name + ", " + details.formatted_address)

                            this.setState({
                                searchingMaker: {
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                },
                                mapRegion: {
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                    latitudeDelta: LATITUDE_DELTA,
                                    longitudeDelta: LONGITUDE_DELTA,
                                }
                            })


                            this.map.animateToCoordinate(this.state.searchingMaker, 1000)
                            this.popupSearching.dismiss();
                            this.refs['priceInput'].getElement().focus();

                            {/* 
                            let currentMaker = {
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA,
                            }
                            this.map.animateToRegion(currentMaker, 1000); */}

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

                </PopupDialog>



                {/* Popup select image library or camera */}
                <PopupDialog
                    ref={(popupSelectedImage) => { this.popupSelectedImage = popupSelectedImage; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogStyle={{ marginBottom: 10, width: width * 0.9, height: 130, justifyContent: 'center', padding: 20 }}
                    dismissOnTouchOutside={true}
                >
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
                        <TouchableOpacity
                            style={{ flex: 2, justifyContent: 'center', alignContent: 'center' }}
                            onPress={async () => {
                                this.popupSelectedImage.dismiss();
                                this._pickImageAsync('library', this.state.selectedImages)
                            }}
                        >
                            <Ionicons style={{ fontSize: 40, borderRadius: 10, backgroundColor: '#a4d227', color: '#fff', textAlign: 'center', padding: 10 }} name='ios-folder-open' >
                            </Ionicons>
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>Thư viện ảnh</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}></View>
                        <TouchableOpacity
                            style={{ flex: 2, justifyContent: 'center', alignContent: 'center', }}
                            onPress={async () => {
                                this.popupSelectedImage.dismiss();
                                this._pickImageAsync('camera', this.state.selectedImages)
                            }}
                        >
                            <Ionicons style={{ fontSize: 40, borderRadius: 10, backgroundColor: '#a4d227', color: '#fff', textAlign: 'center', padding: 10 }} name='md-camera' />
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>Camera</Text>
                        </TouchableOpacity>
                    </View>
                </PopupDialog>

                {/* Modal BDS Ios*/}
                <Modal
                    style={{}}
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.modalBDS}
                    onRequestClose={() => {
                        //alert("Modal has been closed.")
                    }}
                >

                    <Picker // Android
                        style={{
                            flex: 1,
                            marginTop: height * 0.58,
                            backgroundColor: '#fff',
                        }}
                        mode='dropdown'
                        selectedValue={this.state.selectedCategory}
                        onValueChange={(itemValue, itemIndex) =>
                            this.setState({
                                selectedCategory: itemValue,
                                modalBDS: false,
                            })}>
                        {/* <Picker.Item label='-- Chọn loại BĐS --' value='0' /> */}
                        {this.state.roomCategory.map((y, i) => {
                            return (
                                <Picker.Item key={i} label={y.CatName} value={y.ID} />
                            )
                        })}

                    </Picker>
                </Modal>

            </View>

        );

    }
}


const styles = StyleSheet.create({

});
