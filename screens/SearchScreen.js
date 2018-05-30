import React from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Picker,
    FlatList,
    Image,
    Platform,
    Modal,
    Slider,
    SliderIOS,
    Alert,
    ActivityIndicator,
    AsyncStorage,
    Keyboard,
    Animated,
    Easing,
    ToastAndroid,

} from 'react-native';
//import { ExpoLinksView } from '@expo/samples';
import { Constants, Location, Permissions, Notifications } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { Button, FormLabel, FormInput, SocialIcon, Icon } from 'react-native-elements'
import MapView from 'react-native-maps';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { GooglePlacesAutocomplete, } from 'react-native-google-places-autocomplete'; // 1.2.12
import { TextInputMask, TextMask } from 'react-native-masked-text';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import convertAmountToWording from '../api/convertAmountToWording'
import getDirections from 'react-native-google-maps-directions'
import globalVariable from '../components/Global'
import SimplePicker from 'react-native-simple-picker';
import notifyNBLAsync from '../api/notifyNBLAsync';
import saveStorageAsync from '../components/saveStorageAsync';
import enTranslation from '../components/en.json';
import zhTranslation from '../components/zh.json';
import viTranslation from '../components/vi.json';
import { setLocalization, translate, Translate } from 'react-native-translate';
import ModalDropdown from 'react-native-modal-dropdown';

var { height, width } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;
let id = 0;




// const customStyle = [
//     {
//         elementType: 'geometry',
//         stylers: [
//             {
//                 color: '#242f3e',
//             },
//         ],
//     },
//     {
//         elementType: 'labels.text.fill',
//         stylers: [
//             {
//                 color: '#746855',
//             },
//         ],
//     },
//     {
//         elementType: 'labels.text.stroke',
//         stylers: [
//             {
//                 color: '#242f3e',
//             },
//         ],
//     },
//     {
//         featureType: 'administrative.locality',
//         elementType: 'labels.text.fill',
//         stylers: [
//             {
//                 color: '#d59563',
//             },
//         ],
//     },
//     {
//         featureType: 'poi',
//         elementType: 'labels.text.fill',
//         stylers: [
//             {
//                 color: '#d59563',
//             },
//         ],
//     },
//     {
//         featureType: 'poi.park',
//         elementType: 'geometry',
//         stylers: [
//             {
//                 color: '#263c3f',
//             },
//         ],
//     },
//     {
//         featureType: 'poi.park',
//         elementType: 'labels.text.fill',
//         stylers: [
//             {
//                 color: '#6b9a76',
//             },
//         ],
//     },
//     {
//         featureType: 'road',
//         elementType: 'geometry',
//         stylers: [
//             {
//                 color: '#38414e',
//             },
//         ],
//     },
//     {
//         featureType: 'road',
//         elementType: 'geometry.stroke',
//         stylers: [
//             {
//                 color: '#212a37',
//             },
//         ],
//     },
//     {
//         featureType: 'road',
//         elementType: 'labels.text.fill',
//         stylers: [
//             {
//                 color: '#9ca5b3',
//             },
//         ],
//     },
//     {
//         featureType: 'road.highway',
//         elementType: 'geometry',
//         stylers: [
//             {
//                 color: '#746855',
//             },
//         ],
//     },
//     {
//         featureType: 'road.highway',
//         elementType: 'geometry.stroke',
//         stylers: [
//             {
//                 color: '#1f2835',
//             },
//         ],
//     },
//     {
//         featureType: 'road.highway',
//         elementType: 'labels.text.fill',
//         stylers: [
//             {
//                 color: '#f3d19c',
//             },
//         ],
//     },
//     {
//         featureType: 'transit',
//         elementType: 'geometry',
//         stylers: [
//             {
//                 color: '#2f3948',
//             },
//         ],
//     },
//     {
//         featureType: 'transit.station',
//         elementType: 'labels.text.fill',
//         stylers: [
//             {
//                 color: '#d59563',
//             },
//         ],
//     },
//     {
//         featureType: 'water',
//         elementType: 'geometry',
//         stylers: [
//             {
//                 color: '#17263c',
//             },
//         ],
//     },
//     {
//         featureType: 'water',
//         elementType: 'labels.text.fill',
//         stylers: [
//             {
//                 color: '#515c6d',
//             },
//         ],
//     },
//     {
//         featureType: 'water',
//         elementType: 'labels.text.stroke',
//         stylers: [
//             {
//                 color: '#17263c',
//             },
//         ],
//     },
// ];

function randomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function createMarker(modifier = 1, lat = LATITUDE, long = LONGITUDE) {
    return {
        latitude: lat - (SPACE * modifier),
        longitude: long - (SPACE * modifier),
    };
}

const MARKERS = [
    // createMarker(),
    // createMarker(2, LATITUDE, LONGITUDE),
    // createMarker(3),
    // createMarker(4),
    // createMarker(5),
];

const roomCords = {
    latitude: null,
    longitude: null,
}


const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };
const roomBox = [];
const pageSize = [];

export default class SearchScreen extends React.Component {

    static navigationOptions = {
        tabBarLabel: 'Tìm kiếm',
        // title: 'Links',
        header: null,
    };

    // static navigationOptions= () => ({
    //     tabBarOnPress: alert("can")
    // })

    constructor(props) {
        super(props);

        this.state = {
            mapRegion: null,//{ latitude: LATITUDE, longitude: LONGITUDE, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA },

            modalSearchFilterVisible: false,
            age: 18,
            hackHeight: height,
            radius: '2',
            // modalRadius: false,
            errorMessage: null,
            markers: [],
            findingHouseMakers: [],
            initialRenderCurrentMaker: true,
            initialRenderCurrenHouse: true,

            // Searching Filter
            selectedUnitPrice: '',
            selectedUnitAcreage: '',
            minPrice: '0',
            maxPrice: '999999999999',
            unitPrice: '000000',
            unitPriceLable: '',
            unitPriceSuffixLable: translate("million"),
            minAcreage: '0',
            maxAcreage: '500000',
            unitAcreage: '0',
            unitAcreageLable: '',
            unitAcreageSuffixLable: translate("Tens of square meters"),
            multiSliderPriceValue: [0, 10],
            multiSliderAreaValue: [0, 10],
            txtFilterResult: null,
            selectedBDS: translate("All real estate"),
            iosSelectedCategory: translate("All real estate"),

            // Searhing address
            searchingMaker: null,
            watchLocation: null,

            refreshFlatlist: false,
            page: 1,
            roomPageIndex: 0,
            roomPageCount: 50,
            roomCategory: [],
            selectedCategory: '',
            countMapLoad: 0,
            // houseCoords: {
            //     latitude: null,
            //     longitude: null,
            // },
            isSearching: false,
            isFocusSearchTextInput: false,
            houseListHeigh: new Animated.Value(responsiveHeight(13)),
            isHouseList: false,
            searchLoading: false,
            profile: null,
            isVietnamease: false,
            isEnglish: false,
            isChinease: false,
            pageEnd: 0,
            roomCount: 0,
            // isSearchNotify: false,
            registerLocation: null,
        }
    }

    static setLanguage = () => {


    }


    _multiSliderPriceValuesChange = async (values) => {
        await this.setState({
            multiSliderPriceValue: values,
        });

    }

    _multiSliderAreaValuesChange = async (values) => {
        await this.setState({
            multiSliderAreaValue: values,
        });
    }

    onMapPress(e) {
        this.setState({
            markers: [
                ...this.state.markers,
                {
                    coordinate: e.nativeEvent.coordinate,
                    key: id++,
                    color: randomColor(),
                },
            ],
        });
    }


    fitAllMarkers() {
        this.map.fitToCoordinates(MARKERS, {
            edgePadding: {
                top: Platform.OS == 'ios' ? responsiveHeight(10) : responsiveHeight(40),
                bottom: Platform.OS == 'ios' ? responsiveHeight(10) : responsiveHeight(40),
                right: Platform.OS == 'ios' ? responsiveHeight(10) : responsiveHeight(40),
                left: Platform.OS == 'ios' ? responsiveHeight(10) : responsiveHeight(40)
            },//DEFAULT_PADDING,
            animated: true,
        });
    }


    // _createTempMarker(modifier = 1, lat, long) {
    //     return {
    //         latitude: lat - (SPACE * modifier),
    //         longitude: long - (SPACE * modifier),
    //     };
    // }

    _setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    _handleMapRegionChange = mapRegion => {
        this.setState({ mapRegion });
    };


    _dropdown_onSelect(idx, value) {
        // BUG: alert in a modal will auto dismiss and causes crash after reload and touch. @sohobloo 2016-12-1
        //alert(`idx=${idx}, value='${value}'`);
        //console.debug(`idx=${idx}, value='${value}'`);

    }


    getVal(val) {
        // console.warn(val);
    }
    componentWillMount = async () => {
        await this._getPermissionLOCATION();
        await this._getPermissionCAMERA();
        await this._getPermissionCAMERA_ROLL();
        await this._getPermissionNOTIFICATIONS();

        this._getLanguageFromStorageAsync();
        this._getLocationAsync();
        this._getCategoryFromStorageAsync();
        this._getRegisterLocationFromStorageAsync()
    }

    componentDidMount() {

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

            this.setState({
                unitPriceSuffixLable: translate("million"),
                unitAcreageSuffixLable: translate("Tens of square meters"),
                selectedBDS: translate("All real estate"),
                iosSelectedCategory: translate("All real estate"),
            })

        } catch (e) {
            console.log(e);
        }
    }



    _getLocationAsync = async () => {

        // let { status } = await Permissions.askAsync(Permissions.LOCATION);
        // if (status !== 'granted') {
        //     this.setState({
        //         errorMessage: 'Quyền truy cập Vị Trí của bạn bị từ chối',
        //     });
        // }

        let provider = await Location.getProviderStatusAsync()
        // console.log(provider.locationServicesEnabled)

        if (provider.locationServicesEnabled === false) {
            Alert.alert(
                translate("Notice"),
                translate("Please enable Location Service"),
            );

            return;
        }

        // let watchLocationTmp = await Location.watchPositionAsync({})
        // this.setState({
        //     watchLocation: JSON.stringify(watchLocationTmp),
        // })

        let location = await Location.getCurrentPositionAsync({});
        this.setState({ location });

        let region = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }

        await this.setState({ mapRegion: region });

        // Fit Maker to Map for Android
        setTimeout(() => {
            this._getRoomByFilter(true);
        }, 1000);


        // Save current location to global variable
        globalVariable.LOCATION.LATITUDE = location.coords.latitude;
        globalVariable.LOCATION.LONGITUDE = location.coords.longitude;

    };

    _getPermissionLOCATION = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            Alert.alert(translate("Notice"), translate("Access to your Location is denied"))
        }

    }

    _getPermissionCAMERA = async () => {
        let { status } = await Permissions.askAsync(Permissions.CAMERA);
        if (status !== 'granted') {
            Alert.alert(translate("Notice"), translate("CAMERA access is denied"))
        }

    }

    _getPermissionCAMERA_ROLL = async () => {

        let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
            Alert.alert(translate("Notice"), translate("CAMERA_ROLL access is denied"))

        }
    }

    _getPermissionNOTIFICATIONS = async () => {

        let { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

        // Stop here if the user did not grant permissions
        if (status !== 'granted') {
            Alert.alert(translate("Notice"), translate("The right to receive notice from Nhabaola is denied"))
        } else {
            globalVariable.PHONE_TOKEN = await Notifications.getExpoPushTokenAsync();
        }

    }


    _dropdownFilter_onSelect(idx, value) {

        this.setState({
            selectedBDS: value,
        })
    }

    _getPriceByFilter = async () => {
        if (this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] == 10) {
            this.setState({
                minPrice: '0',
                maxPrice: '999999999999',
                unitPriceLable: ''
            })
        }
        else if (this.state.multiSliderPriceValue[0] > 0 && this.state.multiSliderPriceValue[1] == 10) {
            this.setState({
                minPrice: this.state.multiSliderPriceValue[0] + this.state.unitPrice,
                maxPrice: '999999999999',
                unitPriceLable: ', ' + translate("Greater than") + ' ' + this.state.multiSliderPriceValue[0] + ' ' + this.state.unitPriceSuffixLable,
            })
        }
        else if (this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] < 10) {
            this.setState({
                minPrice: '0',
                maxPrice: this.state.multiSliderPriceValue[1] + this.state.unitPrice,
                unitPriceLable: ', ' + translate("Less than") + ' ' + this.state.multiSliderPriceValue[1] + ' ' + this.state.unitPriceSuffixLable,
            })
        }
        else {
            this.setState({
                minPrice: this.state.multiSliderPriceValue[0] + this.state.unitPrice,
                maxPrice: this.state.multiSliderPriceValue[1] + this.state.unitPrice,
                unitPriceLable: ', ' + this.state.multiSliderPriceValue[0] + '-' + this.state.multiSliderPriceValue[1] + ' ' + this.state.unitPriceSuffixLable,
            })
        }
    }

    _getAcreageByFilter = () => {
        if (this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] == 10) {
            this.setState({
                minAcreage: '0',
                maxAcreage: '500000',
                unitAcreageLable: '',
            })
        }
        else if (this.state.multiSliderAreaValue[0] > 0 && this.state.multiSliderAreaValue[1] == 10) {
            this.setState({
                minAcreage: this.state.multiSliderAreaValue[0] + this.state.unitAcreage,
                maxAcreage: '500000',
                unitAcreageLable: ', ' + translate("Greater than") + ' ' + this.state.multiSliderAreaValue[0] + ' ' + this.state.unitAcreageSuffixLable,
            })
        }
        else if (this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] < 10) {
            this.setState({
                minAcreage: '0',
                maxAcreage: this.state.multiSliderAreaValue[1] + this.state.unitAcreage,
                unitAcreageLable: ', ' + translate("Less than") + ' ' + this.state.multiSliderAreaValue[1] + ' ' + this.state.unitAcreageSuffixLable,
            })
        }
        else {
            this.setState({
                minAcreage: this.state.multiSliderAreaValue[0] + this.state.unitAcreage,
                maxAcreage: this.state.multiSliderAreaValue[1] + this.state.unitAcreage,
                unitAcreageLable: ', ' + this.state.multiSliderAreaValue[0] + '-' + this.state.multiSliderAreaValue[1] + ' ' + this.state.unitAcreageSuffixLable,
            })
        }
    }

    _getRoomByFilter = async (isNew, isForward = true, _page = 0) => {
        //await this.setState({ refreshFlatlist: true })
        //this.popupLoadingIndicator.show()

        await this.setState({ searchLoading: true })



        if (!isNew && isForward) { // Loading more page 
            this.setState((prevState, props) => ({
                page: prevState.page + 1,
            }));
            //this.setState({ page: this.state.page + 1 })
        }
        else if (!isNew && !isForward) { // Back to previous page
            this.setState((prevState, props) => ({
                page: prevState.page - 1,
            }));
        }
        else { // Refresh page
            // roomBox = await [];
            // MARKERS = await [];
            this.setState({ page: 1 })
            //this.setState({ page: 1, flatListIsEnd: false })

        }

        if (_page != 0) {
            this.setState({ // Calculate page index
                //roomPageIndex: (this.state.page - 1) * this.state.roomPageCount
                roomPageIndex: (_page - 1) * this.state.roomPageCount,
                page: _page
            })
        } else {
            this.setState({ // Calculate page index
                roomPageIndex: (this.state.page - 1) * this.state.roomPageCount
                //roomPageIndex: _page != 0 ? (_page - 1) * this.state.roomPageCount : (this.state.page - 1) * this.state.roomPageCount
            })
        }




        // alert(this.state.roomPageCount + '  ' + this.state.roomPageIndex)



        roomBox = await [];
        MARKERS = await [];
        pageSize = await [];

        if (this.state.isSearching) {
            // await this.setState({
            //     houseCoords: {
            //         latitude: parseFloat(this.state.searchingMaker.latitude),
            //         longitude: parseFloat(this.state.searchingMaker.longitude),
            //     }
            // })

            roomCords = await {
                latitude: parseFloat(this.state.searchingMaker.latitude),
                longitude: parseFloat(this.state.searchingMaker.longitude),
            }

        }
        else {

            // await this.setState({
            //     houseCoords: {
            //         latitude: parseFloat(this.state.location.coords.latitude),
            //         longitude: parseFloat(this.state.location.coords.longitude),
            //     }
            // })

            roomCords = await {
                latitude: parseFloat(this.state.location.coords.latitude),
                longitude: parseFloat(this.state.location.coords.longitude),
            }
        }

        // Filter condition
        this._getPriceByFilter();
        this._getAcreageByFilter();
        this.setState({
            txtFilterResult: this.state.selectedBDS + this.state.unitPriceLable + this.state.unitAcreageLable
        })

        // alert(this.state.minPrice + '  ' + this.state.maxPrice + '  ' + this.state.minAcreage + '  ' + this.state.maxAcreage + '  ' + this.state.selectedCategory)

        //Add current location to fix maker
        //MARKERS.push(this.state.houseCoords);

        // alert(JSON.stringify(MARKERS))
        MARKERS.push(roomCords);

        try {
            await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_GetDataByFindingBox", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "CategoryID": this.state.selectedCategory,
                    "Latitude": this.state.isSearching === true ? this.state.searchingMaker.latitude : this.state.location.coords.latitude, //"10.7143264",
                    "Longitude": this.state.isSearching === true ? this.state.searchingMaker.longitude : this.state.location.coords.longitude,//"106.6104477",
                    "Radius": this.state.radius,
                    "RoomPriceMin": this.state.minPrice,
                    "RoomPriceMax": this.state.maxPrice,//"9999999999",//this.state.maxPrice,
                    "AcreageMin": this.state.minAcreage,
                    "AcreageMax": this.state.maxAcreage,
                    "SortOptionKey": "SortDistance",
                    "PageIndex": this.state.roomPageIndex,
                    "PageCount": this.state.roomPageCount
                    // "PageIndex": "0",
                    // "PageCount": "50"



                    // "CategoryID": "",
                    // "Longitude": "106.76549699999998",
                    // "Latitude": "10.79129",
                    // "Radius": "900",
                    // "RoomPriceMin": "0",
                    // "RoomPriceMax": "2800000000",
                    // "AcreageMin": "0",
                    // "AcreageMax": "1000",
                    // "SortOptionKey": "SortDistance",
                    // "PageIndex": "0",
                    // "PageCount": "50"
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    //alert(JSON.stringify(responseJson))

                    //roomBox = responseJson.obj
                    //alert(this.state.roomPageCount + '  ' + this.state.roomPageIndex)
                    responseJson.obj.map((y) => {
                        roomBox.push(y);

                        // this.setState({
                        //     houseCoords: {
                        //         latitude: parseFloat(y.Latitude),
                        //         longitude: parseFloat(y.Longitude),
                        //     }
                        // })

                        roomCords = {
                            latitude: parseFloat(y.Latitude),
                            longitude: parseFloat(y.Longitude),
                        }

                        MARKERS.push(roomCords)
                    })

                    this.setState({
                        roomCount: roomBox.length > 0 ? roomBox[0].Toilet : 0,
                        pageEnd: roomBox.length > 0 ? (roomBox[0].Toilet / this.state.roomPageCount) : 0
                    })

                    // Calculate PageSize
                    for (let i = 1; i < this.state.pageEnd + 1; i++) {
                        pageSize.push(i)
                    }

                    this.setState({ searchLoading: false })

                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

        if (MARKERS.length > 1) {
            this.fitAllMarkers() // Fix Maker fit window for iOS
            setTimeout(() => { this.fitAllMarkers() }, 700)
        } else {
            // this._getLocationAsync();
        }

        // Set isHouseList to false
        if (this.state.isHouseList) {
            Animated.timing(
                this.state.houseListHeigh,
                {
                    toValue: responsiveHeight(13),
                    easing: Easing.bounce,
                    duration: 1200,
                }
            ).start();

            this.setState({ isHouseList: false })
        }
    }

    _postFindingBoxAsync = async () => {
        this.popupLoadingIndicator.show()

        // Filter condition
        this._getPriceByFilter();
        this._getAcreageByFilter();
        this.setState({
            txtFilterResult: this.state.selectedBDS + this.state.unitPriceLable + this.state.unitAcreageLable
        })

        try {
            await fetch("http://nhabaola.vn/api/FindingBox/FO_FindingBox_Add", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "UserName": this.state.profile.ID,
                    "CategoryId": this.state.selectedCategory,
                    "Longitude": this.state.isSearching === true ? this.state.searchingMaker.longitude : this.state.location.coords.longitude,//"106.6104477",
                    "Latitude": this.state.isSearching === true ? this.state.searchingMaker.latitude : this.state.location.coords.latitude, //"10.7143264",
                    "Radius": this.state.radius,
                    "RoomPriceMin": this.state.minPrice,
                    "RoomPriceMax": this.state.maxPrice,
                    "AcreageMin": this.state.minAcreage,
                    "AcreageMax": this.state.maxAcreage,
                    "SortOptionKey": "SortDistance",
                    "SessionKey": this.state.profile.UpdatedBy

                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    if (JSON.stringify(responseJson.ErrorCode) === "0") { //  Successful
                        this.setState({ registerLocation: this.state.txtFilterResult })
                        saveStorageAsync('registerLocation', JSON.stringify(this.state.txtFilterResult))

                        if (Platform.OS == 'ios') {
                            Alert.alert(translate("Notice"), translate("Register notification successfully"))
                        } else {
                            ToastAndroid.showWithGravity(translate("Register notification successfully"), ToastAndroid.SHORT, ToastAndroid.TOP)
                        }

                    } else if (JSON.stringify(responseJson.ErrorCode) === "2") {
                        if (Platform.OS == 'ios') {
                            Alert.alert(translate("Notice"), translate("Please login"))
                        } else {
                            ToastAndroid.showWithGravity(translate("Please login"), ToastAndroid.SHORT, ToastAndroid.TOP)
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
                    this.popupLoadingIndicator.dismiss();
                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }

    _getFindingBoxAsync = async (isNew, isForward = true, _page = 0) => {
        this.popupLoadingIndicator.show()

        if (!isNew && isForward) { // Loading more page 
            this.setState((prevState, props) => ({
                page: prevState.page + 1,
            }));
            //this.setState({ page: this.state.page + 1 })
        }
        else if (!isNew && !isForward) { // Back to previous page
            this.setState((prevState, props) => ({
                page: prevState.page - 1,
            }));
        }
        else { // Refresh page
            // roomBox = await [];
            // MARKERS = await [];
            this.setState({ page: 1 })
            //this.setState({ page: 1, flatListIsEnd: false })

        }

        if (_page != 0) {
            this.setState({ // Calculate page index
                //roomPageIndex: (this.state.page - 1) * this.state.roomPageCount
                roomPageIndex: (_page - 1) * this.state.roomPageCount,
                page: _page
            })
        } else {
            this.setState({ // Calculate page index
                roomPageIndex: (this.state.page - 1) * this.state.roomPageCount
                //roomPageIndex: _page != 0 ? (_page - 1) * this.state.roomPageCount : (this.state.page - 1) * this.state.roomPageCount
            })
        }

        roomBox = await [];
        MARKERS = await [];
        pageSize = await [];

        // if (this.state.isSearching) {
        //     // await this.setState({
        //     //     houseCoords: {
        //     //         latitude: parseFloat(this.state.searchingMaker.latitude),
        //     //         longitude: parseFloat(this.state.searchingMaker.longitude),
        //     //     }
        //     // })

        //     roomCords = await {
        //         latitude: parseFloat(this.state.searchingMaker.latitude),
        //         longitude: parseFloat(this.state.searchingMaker.longitude),
        //     }

        // }
        // else {

        //     // await this.setState({
        //     //     houseCoords: {
        //     //         latitude: parseFloat(this.state.location.coords.latitude),
        //     //         longitude: parseFloat(this.state.location.coords.longitude),
        //     //     }
        //     // })

        //     roomCords = await {
        //         latitude: parseFloat(this.state.location.coords.latitude),
        //         longitude: parseFloat(this.state.location.coords.longitude),
        //     }
        // }

        // Filter condition
        this._getPriceByFilter();
        this._getAcreageByFilter();
        this.setState({
            txtFilterResult: this.state.selectedBDS + this.state.unitPriceLable + this.state.unitAcreageLable
        })

        // alert(this.state.minPrice + '  ' + this.state.maxPrice + '  ' + this.state.minAcreage + '  ' + this.state.maxAcreage + '  ' + this.state.selectedCategory)

        //Add current location to fix maker
        //MARKERS.push(this.state.houseCoords);

        // alert(JSON.stringify(MARKERS))
        // MARKERS.push(roomCords);

        try {
            await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_GetDataByUserId", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "PageIndex": this.state.roomPageIndex,
                    "PageCount": this.state.roomPageCount,
                    "SessionKey": this.state.profile.UpdatedBy,
                    "UserLogon": this.state.profile.ID
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {


                    if (JSON.stringify(responseJson.ErrorCode) === "0") { //  Successful

                        this.setState({
                            txtFilterResult: this.state.registerLocation,
                            selectedCategory: this.state.registerLocation,
                            unitPriceLable: this.state.registerLocation,
                            unitAcreageLable: this.state.registerLocation
                        })

                        //  this.state.selectedCategory == '' && this.state.unitPriceLable == '' && this.state.unitAcreageLable == ''
                        //alert(JSON.stringify(responseJson))


                        responseJson.roomList.map((y) => {
                            roomBox.push(y);

                            roomCords = {
                                latitude: parseFloat(y.Latitude),
                                longitude: parseFloat(y.Longitude),
                            }

                            MARKERS.push(roomCords)
                        })


                        this.setState({
                            roomCount: roomBox.length > 0 ? roomBox[0].Toilet : 0,
                            pageEnd: roomBox.length > 0 ? (roomBox[0].Toilet / this.state.roomPageCount) : 0
                        })

                        // Calculate PageSize
                        for (let i = 1; i < this.state.pageEnd + 1; i++) {
                            pageSize.push(i)
                        }

                    } else if (JSON.stringify(responseJson.ErrorCode) === "2") {
                        if (Platform.OS == 'ios') {
                            Alert.alert(translate("Notice"), translate("Please login"))
                        } else {
                            ToastAndroid.showWithGravity(translate("Please login"), ToastAndroid.SHORT, ToastAndroid.TOP)
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
                    this.popupLoadingIndicator.dismiss();
                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

        if (MARKERS.length > 1) {
            this.fitAllMarkers() // Fix Maker fit window for iOS
            setTimeout(() => { this.fitAllMarkers() }, 500)
        } else {
            // this._getLocationAsync();
        }

        // Set isHouseList to false
        if (this.state.isHouseList) {
            Animated.timing(
                this.state.houseListHeigh,
                {
                    toValue: responsiveHeight(13),
                    easing: Easing.bounce,
                    duration: 1200,
                }
            ).start();

            this.setState({ isHouseList: false })
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


    _getRegisterLocationFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('registerLocation');

            if (value !== null) {
                this.setState({
                    registerLocation: JSON.parse(value)
                })
            }

        } catch (e) {
            console.log(e);
        }
    }


    _shouldItemUpdate = (prev, next) => {
        return prev.item !== next.item;
    }


    _getProfileFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('FO_Account_Login');

            if (value !== null) {
                this.setState({
                    profile: JSON.parse(value)
                })

                this._getWalletAsync();
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

    render() {

        let currentMaker = null;
        if (this.state.errorMessage) {

        } else if (this.state.location) {

            currentMaker = {
                latitude: this.state.location.coords.latitude,
                longitude: this.state.location.coords.longitude
            }
        }

        return (
            <View style={{
                flex: 1,
            }}>

                {/* Loading Indicator */}
                {this.state.searchLoading &&
                    <ActivityIndicator
                        style={{
                            position: 'absolute',
                            top: responsiveHeight(20),
                            left: responsiveWidth(45),
                            zIndex: 10,
                        }}
                        animating={true}
                        size="large"
                        color="#73aa2a"
                    />
                }

                {/* Searching Menu */}
                <Animated.View
                    style={{
                        flexDirection: 'row',
                        width: responsiveWidth(100),
                        position: 'absolute',
                        top: 10,
                        zIndex: 10,
                        backgroundColor: '#fff',
                        paddingTop: Platform.OS == 'ios' ? 5 : 0,
                        paddingBottom: Platform.OS == 'ios' ? 5 : 0,
                        elevation: 2,
                        borderRadius: 10,
                        opacity: 0.9,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                    }}
                >
                    {/* Radius */}
                    <View
                        style={{
                            flex: 4,
                            flexDirection: 'row',
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // borderWidth: 1,
                        }}
                    >

                        <View style={{


                        }}>

                            {Platform.OS === 'ios' ?

                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                    }}
                                    onPress={() => {


                                        this.refs.pickerRadius.show();
                                    }}
                                >

                                    <Text style={{ justifyContent: 'center' }}>{translate("Radius")}: {this.state.radius} km</Text>
                                    <Ionicons style={{ fontSize: responsiveFontSize(2.5), paddingLeft: 8 }} name='ios-arrow-dropdown-outline' />
                                </TouchableOpacity>

                                : // Adnroid
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        paddingTop: 10,
                                        paddingBottom: 10,
                                    }}
                                >


                                    {/* <Text style={{ paddingLeft: 5 }}>{translate("Radius")}: </Text> */}

                                    <ModalDropdown
                                        //options={['option 1', 'option 2']}
                                        options={[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 30, 40, 50]}
                                        style={{
                                            // marginRight: 2,
                                            // marginLeft: 2,
                                            // flexDirection: 'row',
                                            // alignContent: 'center',
                                            // alignItems: 'center',
                                            // justifyContent: 'center'
                                            // paddingTop:5,
                                            // paddingBottom:5,

                                        }}
                                        dropdownStyle={{ width: 60, marginTop: -15, elevation: 2 }}
                                        dropdownTextStyle={{ textAlign: 'center' }}
                                        defaultValue='2'
                                        //  onDropdownWillShow={this._dropdown_5_willShow.bind(this)}
                                        // onDropdownWillHide={this._dropdown_5_willHide.bind(this)}
                                        onSelect={async (idx, value) => {
                                            await this.setState({ radius: value })
                                            this._getRoomByFilter(true);
                                        }}

                                    >

                                        <Text
                                            style={{
                                                marginLeft: 5,
                                                marginRight: 5,
                                                fontSize: responsiveFontSize(2),
                                                //color: '#73aa2a'
                                            }}
                                        >{translate("Radius")}: {this.state.radius} km  <Ionicons style={{ marginLeft: 2 }} name='ios-arrow-dropdown' /></Text>

                                    </ModalDropdown>



                                    {/* <Picker // Android
                                        style={{

                                            width: 110,
                                        }}
                                        mode='dropdown'
                                        selectedValue={this.state.radius}
                                        onValueChange={async (itemValue, itemIndex) => {
                                            await this.setState({ radius: itemValue })
                                            this._getRoomByFilter(true);
                                        }}>
                                        <Picker.Item label="2 km" value="2" />
                                        <Picker.Item label="4 km" value="4" />
                                        <Picker.Item label="6 km" value="6" />
                                        <Picker.Item label="8 km" value="8" />
                                        <Picker.Item label="10 km" value="10" />
                                        <Picker.Item label="12 km" value="12" />
                                        <Picker.Item label="14 km" value="14" />
                                        <Picker.Item label="16 km" value="16" />
                                        <Picker.Item label="18 km" value="18" />
                                        <Picker.Item label="20 km" value="20" />
                                        <Picker.Item label="30 km" value="30" />
                                        <Picker.Item label="40 km" value="40" />
                                        <Picker.Item label="50 km" value="50" />
                                    </Picker> */}
                                </View>
                            }

                        </View>


                        <SimplePicker
                            ref={'pickerRadius'}
                            options={['2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '30', '40', '50']}
                            labels={['2 km', '4 km', '6 km', '8 km', '10 km', '12 km', '14 km', '16 km', '18 km', '20 km', '30 km', '40 km', '50 km']}
                            confirmText={translate("Agree")}
                            cancelText={translate("Cancel")}
                            itemStyle={{
                                fontSize: 25,
                                color: '#73aa2a',
                                textAlign: 'center',
                                fontWeight: 'bold',
                            }}
                            onSubmit={async (option) => {
                                await this.setState({ radius: option, });
                                this._getRoomByFilter(true);
                            }}
                        />
                    </View>


                    {/* Filter */}
                    <TouchableOpacity
                        style={{
                            flex: 2,
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => {
                            this.setState({ modalSearchFilterVisible: true })
                        }}
                    >
                        {/* <View style={{
                            backgroundColor: '#a4d227', padding: 5, borderRadius: 10, width: 32,
                            height: 32, justifyContent: 'center',
                            alignItems: 'center', elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2,
                        }}> */}
                        <Ionicons style={{
                            fontSize: responsiveFontSize(4),
                            color: '#73aa2a',
                            //textAlign: 'center'
                        }} name='ios-funnel-outline' />
                        {/* </View> */}
                    </TouchableOpacity>


                    {/* Search location */}
                    <TouchableOpacity
                        style={{
                            flex: 2,
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => {
                            this.popupSearching.show();
                        }}
                    >
                        {/* <View style={{
                            backgroundColor: '#8fb722', padding: 5, borderRadius: 10, width: 32,
                            height: 32, justifyContent: 'center',
                            alignItems: 'center', elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2,
                        }}> */}
                        <Ionicons style={{
                            fontSize: responsiveFontSize(4),
                            color: '#73aa2a',
                        }} name='ios-search-outline' />
                        {/* </View> */}
                    </TouchableOpacity>


                    {/* Register Location */}
                    <TouchableOpacity
                        style={{
                            flex: 2,
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
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

                                if (this.state.registerLocation) {
                                    this.popupRegisterLocation.show()

                                } else {
                                    Alert.alert(
                                        translate("Notice"),
                                        translate("You want to subscribe to this Real Estate") + " \n\n" + this.state.txtFilterResult,
                                        [
                                            {
                                                text: translate("Cancel"), onPress: () => {

                                                }
                                            },
                                            {
                                                text: translate("Agree"), onPress: () => {

                                                    // this.setState({ isSearchNotify: true })

                                                    this._postFindingBoxAsync()

                                                    // roomBox.map((y) => {
                                                    //     // Notify Landlord 
                                                    //     if (y.Images.split('|')[1] == 'true') {
                                                    //         notifyNBLAsync(y.Images.split('|')[0]//globalVariable.ADMIN_PUSH_TOKEN
                                                    //             , { "screen": "RoomDetailScreen", "params": { "roomBoxID": y.ID } } //{ ...roombox }
                                                    //             , "default"
                                                    //             , this.state.profile.FullName + "-" + this.state.profile.UserName + " " + translate("Search") + ":"
                                                    //             , this.state.txtFilterResult
                                                    //             + ", " + translate("Radius within") + " " + this.state.radius + " " + translate("km from the searcher's location, including your post at the address") + ": "
                                                    //             + y.Address
                                                    //         ); //pushToken, data, sound, title, body
                                                    //     }
                                                    // })

                                                    // if (Platform.OS === 'android') {
                                                    //     ToastAndroid.showWithGravity(translate("Send message successfully"), ToastAndroid.SHORT, ToastAndroid.TOP);
                                                    // }
                                                    // else {
                                                    //     Alert.alert(translate("Notice"), translate("Send message successfully"));
                                                    // }
                                                }
                                            },
                                        ]
                                    );
                                }
                            }

                        }}
                    >

                        <Ionicons style={{
                            fontSize: responsiveFontSize(4),
                            color: this.state.registerLocation ? '#a4d227' : '#73aa2a',
                        }} name={this.state.registerLocation ? 'ios-notifications' : 'ios-notifications-off-outline'} />


                    </TouchableOpacity>

                    {/* Broachcast */}
                    <TouchableOpacity
                        style={{
                            flex: 2,
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',

                        }}
                        onPress={async () => {
                            //this.setState({ modalSearchFilterVisible: true })
                            // roomBox.map((y) => {
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
                                    translate("Do you want to send a message to all Search Posters on the Map"),
                                    [
                                        {
                                            text: translate("Cancel"), onPress: () => {

                                            }
                                        },
                                        {
                                            text: translate("Agree"), onPress: () => {
                                                roomBox.map((y) => {
                                                    // Notify Landlord 
                                                    if (y.Images.split('|')[1] == 'true') {
                                                        notifyNBLAsync(y.Images.split('|')[0]//globalVariable.ADMIN_PUSH_TOKEN
                                                            , { "screen": "RoomDetailScreen", "params": { "roomBoxID": y.ID } } //{ ...roombox }
                                                            , "default"
                                                            , this.state.profile.FullName + "-" + this.state.profile.UserName + " " + translate("Search") + ":"
                                                            , this.state.txtFilterResult
                                                            + ", " + translate("Radius within") + " " + this.state.radius + " " + translate("km from the searcher's location, including your post at the address") + ": "
                                                            + y.Address
                                                        ); //pushToken, data, sound, title, body
                                                    }
                                                })

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

                            // })


                        }}
                    >
                        {/* <View style={{
                            backgroundColor: '#a4d227', padding: 5, borderRadius: 10, width: 32,
                            height: 32, justifyContent: 'center',
                            alignItems: 'center', elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2,
                        }}> */}
                        <Ionicons style={{
                            fontSize: responsiveFontSize(4),
                            color: '#73aa2a',
                        }} name='md-megaphone' />
                        {/* </View> */}
                    </TouchableOpacity>

                </Animated.View>

                {/* Filter lable */}
                {!(this.state.selectedCategory == '' && this.state.unitPriceLable == '' && this.state.unitAcreageLable == '') &&
                    <View
                        style={{
                            flexDirection: 'row',
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            top: 55,
                            zIndex: 10,
                            backgroundColor: '#fff',
                            padding: 5,
                            //fontSize: responsiveFontSize(1.6),
                            elevation: 2,
                            borderRadius: 10,
                            opacity: 0.9,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2,

                        }}
                    >
                        <TouchableOpacity
                            style={{
                                flex: 9,
                                width: responsiveWidth(100),
                            }}
                            onPress={() => {
                                this.setState({ modalSearchFilterVisible: true })
                            }}
                        >
                            <Text style={{
                                //color: '#73aa2a',
                                //  width: responsiveWidth(100),
                                //position: 'absolute',
                                textAlign: 'center',
                                //padding: 5,
                                // flex: 9,
                                // top: 55,
                                // zIndex: 10,
                                // backgroundColor: '#fff',
                                // padding: 5,
                                fontSize: responsiveFontSize(1.6),
                                // elevation: 2,
                                // borderRadius: 10,
                                // opacity: 0.9,
                                // shadowColor: '#000',
                                // shadowOffset: { width: 0, height: 2 },
                                // shadowOpacity: 0.2,
                                // shadowRadius: 2,
                            }}>{this.state.txtFilterResult}</Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                flex: 1,
                            }}
                            onPress={() => {
                                this.setState({
                                    txtFilterResult: null,
                                    multiSliderPriceValue: [0, 10],
                                    multiSliderAreaValue: [0, 10],
                                    selectedCategory: '',
                                    selectedBDS: translate("All real estate"),
                                    selectedUnitAcreage: 'acmv',
                                    selectedUnitPrice: 'ptr',
                                    iosSelectedCategory: translate("All real estate"),
                                })
                                this.setState({ modalSearchFilterVisible: false });
                                this._getRoomByFilter(true);
                            }}
                        >
                            <Ionicons style={{ fontSize: responsiveFontSize(3), textAlign: 'center' }} name='ios-close' />
                        </TouchableOpacity>
                    </View>

                }


                {/* Get current location */}
                <TouchableOpacity
                    style={{
                        height: 50, position: 'absolute',
                        //top: responsiveHeight(18), 
                        bottom: 65,
                        zIndex: 20,
                        opacity: 0.9,
                        right: 15, backgroundColor: 'transparent'
                    }}
                    onPress={async () => {
                        await this.setState({ isSearching: false, searchingMaker: null, })
                        this._getLocationAsync();
                    }}
                >
                    <View style={{
                        backgroundColor: '#fff',//'#73aa2a', 
                        padding: 6,
                        borderRadius: 20,
                        width: 35, height: 35,
                        justifyContent: 'center',
                        alignItems: 'center', elevation: 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        borderWidth: 0.7,
                        borderColor: '#a4d227',
                    }}>
                        <Ionicons style={{
                            fontSize: 25, color: '#73aa2a',
                            textAlign: 'center',
                            marginTop: Platform.OS == 'ios' ? -1.5 : 0,
                        }} name='ios-locate-outline' />
                    </View>
                </TouchableOpacity>

                {
                    this.state.mapRegion &&
                    <MapView
                        ref={ref => { this.map = ref; }}

                        /* style={{ paddingBottom: this.state.hackHeight, alignSelf: 'stretch', }} */
                        style={{ flex: 1, alignSelf: 'stretch', }}

                        region={this.state.mapRegion}
                        // onRegionChange={this._handleMapRegionChange}
                        onRegionChangeComplete={(mapRegion) => {
                            this.setState({ mapRegion })
                        }}
                        // provider='google'
                        showsUserLocation={false}
                        showsMyLocationButton={false}
                        followsUserLocation={false}
                        loadingEnabled={true}
                        onPress={(e) => this.onMapPress(e)}
                    /* customMapStyle={customStyle} */
                    >
                        {this.state.location && this.state.searchingMaker == null
                            ?

                            <MapView.Marker
                                coordinate={currentMaker}
                                title={translate("My location")}
                            //description='Home'
                            /* image={require('../images/nbl-here-icon.png')} */

                            >
                                {/* <Image
                                    source={require('../assets/images/nbl-here-icon.png')}
                                    style={{ height: height * 0.07, width: width * 0.07 }}
                                    // onLoad={() => {
                                    //   this.forceUpdate()
                                    //}}
                                    onLayout={() => {
                                        this.setState({ initialRenderCurrentMaker: false })
                                    }}
                                    key={`${this.state.initialRenderCurrentMaker}`}
                                >

                                 
                                </Image> */}
                            </MapView.Marker>
                            :
                            null}

                        {this.state.searchingMaker
                            ?
                            <MapView.Marker
                                coordinate={this.state.searchingMaker}
                                title={translate("Search location")}
                            //description='Home'
                            >

                            </MapView.Marker>
                            : null}


                        {/* <MapView.Circle
                                center={currentMaker}
                                fillColor='#73aa2a'
                                radius={this.state.location.coords.accuracy}
                                strokeColor='#a4d227'
                                strokeWidth={2}
                            /> */}

                        {/* Tap to show maker on map */}
                        {/* {this.state.markers.map(marker => (
                                <MapView.Marker
                                    key={marker.key}
                                    coordinate={marker.coordinate}
                                    pinColor={marker.color}
                                />
                            ))} */}

                        {/* Fix all makers on Map */}
                        {/* {MARKERS.slice(1).map((marker, i) => ( */}
                        {roomBox.map((item, i) => (
                            <MapView.Marker
                                key={i}
                                //coordinate={marker}
                                coordinate={{
                                    latitude: parseFloat(item.Latitude),
                                    longitude: parseFloat(item.Longitude)
                                }}
                                onPress={() => {
                                    if (this.state.isHouseList) {
                                        Animated.timing(
                                            this.state.houseListHeigh,
                                            {
                                                toValue: responsiveHeight(13),
                                                easing: Easing.bounce,
                                                duration: 1200,
                                            }
                                        ).start();

                                        this.setState({ isHouseList: false })
                                    }
                                }}
                            // title='Im here'
                            // description='Home'

                            /* image={require('../images/nbl-house_icon.png')} */
                            >
                                <View style={{
                                    justifyContent: 'center', alignItems: 'center',
                                    backgroundColor: item.IsHighlight ? 'red' : '#5f8c23',
                                    borderRadius: 6,//Platform.OS == 'ios' ? 0 : 5,
                                    borderWidth: 1,
                                    borderColor: item.IsHighlight ? '#fff' : '#a4d227',

                                    //opacity: 0.8,
                                    zIndex: item.IsHighlight ? 30 : 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,

                                }}>
                                    <Text style={{
                                        // backgroundColor: item.IsHighlight ? 'red' : '#5f8c23',
                                        color: '#fff',
                                        padding: 5,
                                        fontSize: responsiveFontSize(1.2),
                                        // borderRadius: Platform.OS == 'ios' ? 0 : 5,
                                        // borderWidth: 1,
                                        // borderColor: item.IsHighlight ? '#fff' : '#a4d227',
                                        // //opacity: 0.8,
                                        // zIndex: item.IsHighlight ? 30 : 10

                                    }}>{convertAmountToWording(item.Price)}</Text>

                                    {/* {
                                        this.state.roomCategory.map((y, i) => {
                                            return (
                                                y.ID == item.CategoryID &&
                                                <Text
                                                    style={{ flex: 2, fontSize: responsiveFontSize(0.8), color: '#fff', }}
                                                    key={i}>{this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]}</Text>
                                            )
                                        })
                                    } */}
                                    {/* {item.IsHighlight &&
                                        <Image
                                            source={require('../assets/images/nbl-house_icon.png')}
                                            style={{ height: height * 0.045, width: width * 0.075 }}
                                            onLayout={() => {
                                                this.setState({ initialRenderCurrenHouse: false })
                                            }}
                                            key={`${this.state.initialRenderCurrenHouse}`}
                                        >
                                        </Image>
                                    } */}

                                </View>
                                <MapView.Callout style={{}}
                                    onPress={() => {
                                        this.props.navigation.navigate('RoomDetailScreen', { item });
                                    }}
                                >
                                    <View
                                        style={{
                                            width: width * 0.7
                                        }}
                                    >
                                        <View style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                        }}>
                                            <Image
                                                style={{
                                                    flex: 3,
                                                }}
                                                source={{ uri: item.Title }} />

                                            <View style={styles.searchCardTextBox}>

                                                <Text style={{
                                                    flex: 2,
                                                    fontSize: responsiveFontSize(1.3),
                                                }}>{item.Address}</Text>

                                                <View style={{ flexDirection: 'row' }}>
                                                    {
                                                        this.state.roomCategory.map((y, i) => {
                                                            return (
                                                                y.ID == item.CategoryID &&
                                                                <Text
                                                                    style={{ flex: 2, fontSize: 10, color: '#73aa2a', }}
                                                                    key={i}>{this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]}</Text>
                                                            )
                                                        })
                                                    }


                                                    {/* Location Direction */}
                                                    {/* <TouchableOpacity
                                                        style={{
                                                            flex: 1, justifyContent: 'center', alignItems: 'center',
                                                        }}
                                                        onPress={() => {
                                                            const data = {
                                                                source: {
                                                                    latitude: parseFloat(this.state.location.coords.latitude), //10.791609,//-33.8356372,
                                                                    longitude: parseFloat(this.state.location.coords.longitude), //106.702763,//18.6947617
                                                                },
                                                                destination: {
                                                                    latitude: parseFloat(item.Latitude), //-33.8600024,
                                                                    longitude: parseFloat(item.Longitude) //18.697459
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
                                                            color: '#fff', fontSize: responsiveFontSize(1.5),
                                                            padding: 4, borderRadius: 5, backgroundColor: '#73aa2a',
                                                            elevation: 2,

                                                        }} name='md-return-right' >  Đi</Ionicons>
                                                    </TouchableOpacity> */}



                                                </View>
                                                <View style={styles.searchCardPriceBox}>

                                                    {/* <TextMask
                                                        style={{ flex: 2, fontSize: 10 }}
                                                        value={item.Price}
                                                        type={'money'}
                                                        options={{ suffixUnit: ' đ', precision: 0, unit: ' ', separator: ' ' }}
                                                    /> */}
                                                    <Text style={{ flex: 1, fontSize: responsiveFontSize(1.3) }}>{convertAmountToWording(item.Price)}</Text>

                                                    <View style={{ flex: 1, flexDirection: 'row', }}>


                                                        <Text style={{ fontSize: responsiveFontSize(1.3), }} >{item.Acreage} m</Text>
                                                        <Text style={{ fontSize: 7, marginBottom: 5 }}>2</Text>
                                                    </View>
                                                    <Ionicons style={{
                                                        flex: 1,
                                                        fontSize: responsiveFontSize(1.3),
                                                        paddingTop: 2,

                                                    }} name='md-pin' >  {item.Distance} km</Ionicons>
                                                    {/* <Text>3 km</Text> */}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    {/* </View> */}
                                </MapView.Callout>
                            </MapView.Marker>
                        ))}
                    </MapView>
                }

                {/* <View
                    style={{
                        width: width,
                        height: this.state.houseListHeigh, //responsiveHeight(28),
                        backgroundColor: 'transparent',
                        zIndex: 10,
                        position: 'absolute',
                        padding: 10,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >

                </View> */}


                {/* Room List */}
                < Animated.View style={{
                    width: width,
                    height: this.state.houseListHeigh, //responsiveHeight(28),
                    backgroundColor: 'transparent',
                    zIndex: 10,
                    position: 'absolute',
                    padding: 10,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>

                    <View
                        style={{
                            flex: 1,
                            width: width * 0.9,
                            backgroundColor: 'white',
                            padding: 10,
                            elevation: 2,
                            opacity: 0.9,
                            paddingTop: 0,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2,
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                elevation: 5,
                            }}
                            onPress={async () => {
                                // this.fitAllMarkers();
                                if (Platform.OS == 'ios') {
                                    this.map.fitToCoordinates(MARKERS, {
                                        edgePadding: {
                                            top: this.state.isHouseList ? responsiveHeight(10) : responsiveHeight(10),
                                            bottom: this.state.isHouseList ? responsiveHeight(10) : responsiveHeight(60),
                                            right: this.state.isHouseList ? responsiveHeight(10) : responsiveHeight(15),
                                            left: this.state.isHouseList ? responsiveHeight(10) : responsiveHeight(15)
                                        },//DEFAULT_PADDING,
                                        animated: true,
                                    });
                                } else { // Android
                                    this.map.fitToCoordinates(MARKERS, {
                                        edgePadding: {
                                            top: this.state.isHouseList ? responsiveHeight(40) : responsiveHeight(60),
                                            bottom: this.state.isHouseList ? responsiveHeight(40) : responsiveHeight(250),
                                            right: this.state.isHouseList ? responsiveHeight(40) : responsiveHeight(230),
                                            left: this.state.isHouseList ? responsiveHeight(40) : responsiveHeight(230)
                                        },//DEFAULT_PADDING,
                                        animated: true,
                                    });
                                }
                                Animated.timing(                  // Animate over time
                                    this.state.houseListHeigh,            // The animated value to drive
                                    {
                                        toValue: this.state.isHouseList ? responsiveHeight(13) : responsiveHeight(60),
                                        easing: Easing.bounce,
                                        duration: 1200,              // Make it take a while
                                    }
                                ).start();


                                this.setState({ isHouseList: !this.state.isHouseList })
                            }}
                        >
                            {/* <Text>Keo len</Text> */}
                            <Ionicons style={{
                                color: '#9B9D9D',
                                textAlign: 'center',
                                fontSize: responsiveFontSize(4),
                                elevation: 2,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 2,
                                //marginTop: -3,

                            }} name={this.state.isHouseList ? 'ios-arrow-dropdown-circle-outline' : 'ios-arrow-dropup-circle-outline'} />
                        </TouchableOpacity>

                        <View
                            style={{
                                flexDirection: 'row',
                                alignContent: 'center',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                }}
                            >
                                <Text style={{
                                    color: '#73aa2a',
                                    //paddingBottom: 4,
                                    fontSize: responsiveFontSize(2),

                                    // }}>{translate("Finding")}  {roomBox.length}</Text>
                                }}>{translate("Finding")}  {this.state.roomCount}</Text>
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >

                                <Text
                                    style={{
                                        marginRight: 3,
                                        fontSize: responsiveFontSize(1.8),
                                        color: '#9B9D9D'
                                    }}
                                >
                                    {this.state.roomPageIndex + 1} - {(this.state.roomPageIndex + this.state.roomPageCount) > this.state.roomCount ? this.state.roomCount : (this.state.roomPageIndex + this.state.roomPageCount)}
                                </Text>
                                <TouchableOpacity
                                    style={{

                                    }}
                                    onPress={() => {

                                        if (this.state.page > 1) {
                                            this._getRoomByFilter(false, false)
                                        }
                                    }}
                                >
                                    <Ionicons style={{
                                        color: this.state.page > 1 ? '#73aa2a' : '#fff',
                                        fontSize: responsiveFontSize(4),
                                        // marginRight: 5,
                                    }}
                                        name='ios-arrow-back'
                                    />
                                </TouchableOpacity>

                                {/* <Text
                                    style={{
                                        marginLeft: 5,
                                        marginRight: 5,
                                        fontSize: responsiveFontSize(1.8),
                                        color: '#73aa2a'
                                    }}
                                >{translate("Page")} {this.state.page}</Text> */}
                                <ModalDropdown
                                    //options={['option 1', 'option 2']}
                                    options={pageSize}
                                    style={{
                                        // marginRight: 2,
                                        // marginLeft: 2,
                                        // flexDirection: 'row',
                                        // alignContent: 'center',
                                        // alignItems: 'center',
                                        // justifyContent: 'center'

                                    }}
                                    dropdownStyle={{ width: 50 }}
                                    defaultValue='0'
                                    //  onDropdownWillShow={this._dropdown_5_willShow.bind(this)}
                                    // onDropdownWillHide={this._dropdown_5_willHide.bind(this)}
                                    onSelect={(idx, value) => {
                                        // alert(value)
                                        this._getRoomByFilter(false, true, value)
                                    }}

                                >

                                    <Text
                                        style={{
                                            marginLeft: 5,
                                            marginRight: 5,
                                            fontSize: responsiveFontSize(1.8),
                                            color: '#73aa2a'
                                        }}
                                    >{translate("Page")} {this.state.page} <Ionicons style={{ marginLeft: 2 }} name='ios-arrow-dropdown' /></Text>

                                </ModalDropdown>

                                <TouchableOpacity
                                    style={{

                                    }}
                                    onPress={() => {

                                        this.setState({
                                            pageEnd: this.state.roomCount > 0 ? (this.state.roomCount / this.state.roomPageCount) : 0
                                        })

                                        //alert(this.state.pageEnd)

                                        if (this.state.page <= this.state.pageEnd) {

                                            this._getRoomByFilter(false, true)
                                        }
                                    }}
                                >
                                    <Ionicons style={{
                                        color: this.state.page <= this.state.pageEnd ? '#73aa2a' : '#fff',
                                        fontSize: responsiveFontSize(4),
                                    }}
                                        name='ios-arrow-forward'
                                    />
                                </TouchableOpacity>

                            </View>
                        </View>

                        <FlatList
                            //onScroll={this._onScroll}
                            // ref='searchresult'
                            refreshing={this.state.refreshFlatlist}
                            keyboardShouldPersistTaps="always"
                            removeClippedSubviews={true}
                            initialNumToRender={2}
                            shouldItemUpdate={this._shouldItemUpdate}

                            // onRefresh={() => { this._refreshRoomBox() }}

                            onEndReachedThreshold={0.2}
                            onEndReached={() => {
                                //alert("refreshing")
                                // this._getRoomByFilter(false);

                            }}


                            data={roomBox}
                            renderItem={({ item }) =>
                                <TouchableOpacity
                                    style={{}}
                                    onPress={() => {
                                        // this.props.navigation.navigate('RoomDetailScreen', { item });
                                    }}
                                >
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        paddingTop: 10,
                                        paddingBottom: 10,
                                        borderBottomWidth: 0.3,
                                        borderColor: '#9B9D9D',
                                    }}>
                                        <TouchableOpacity
                                            style={{
                                                flex: 3,

                                            }}
                                            onPress={() => {
                                                this.props.navigation.navigate('RoomDetailScreen', { item });
                                            }}
                                        >
                                            <Image
                                                style={{ flex: 1, borderRadius: 5, }}
                                                source={{ uri: item.Title }} />
                                        </TouchableOpacity>
                                        <View style={styles.searchCardTextBox}>
                                            <Text style={{
                                                flex: 2,
                                                fontSize: responsiveFontSize(1.5),
                                            }}>{item.Address}</Text>
                                            {/* <Text style={styles.searchCardPostDate}>Ngày đăng: {item.UpdatedDate}</Text> */}

                                            <View style={{
                                                flexDirection: 'row',
                                            }}>
                                                {
                                                    this.state.roomCategory.map((y, i) => {
                                                        return (
                                                            y.ID == item.CategoryID &&
                                                            <Text
                                                                style={{ flex: 3, color: '#73aa2a', fontSize: responsiveFontSize(1.5) }}
                                                                key={i}>{this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]}</Text>
                                                        )
                                                    })
                                                }

                                                {/* Location Direction */}
                                                <TouchableOpacity
                                                    style={{
                                                        flex: 1, justifyContent: 'center', alignItems: 'center',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowOpacity: 0.2,
                                                        shadowRadius: 2,
                                                    }}
                                                    onPress={() => {
                                                        const data = {
                                                            source: {
                                                                latitude: parseFloat(this.state.location.coords.latitude), //10.791609,//-33.8356372,
                                                                longitude: parseFloat(this.state.location.coords.longitude), //106.702763,//18.6947617
                                                            },
                                                            destination: {
                                                                latitude: parseFloat(item.Latitude), //-33.8600024,
                                                                longitude: parseFloat(item.Longitude) //18.697459
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
                                                        color: '#fff', fontSize: responsiveFontSize(1.5),
                                                        padding: 4, borderRadius: 5, backgroundColor: '#73aa2a',
                                                        marginTop: 3, marginBottom: 2, elevation: 2,

                                                    }} name='md-return-right' >  {translate("Go")}</Ionicons>

                                                </TouchableOpacity>


                                            </View>

                                            <View style={styles.searchCardPriceBox}>


                                                <Text style={{ flex: 1, fontSize: responsiveFontSize(1.8) }}>{convertAmountToWording(item.Price)}</Text>
                                                <View style={{ flex: 1, flexDirection: 'row', }}>
                                                    <Text style={{ fontSize: responsiveFontSize(1.8) }} >{item.Acreage} m</Text>
                                                    <Text style={{ fontSize: 8, marginBottom: 5 }}>2</Text>
                                                </View>
                                                <Ionicons style={styles.searCardDistanceIcon} name='md-pin' >  {item.Distance} km</Ionicons>
                                            </View>






                                        </View>
                                    </View>
                                </TouchableOpacity>
                            }
                            keyExtractor={item => item.ID + 'nhabaola'}
                        />

                    </View>

                </ Animated.View>
                {/* } */}



                <View style={{
                    // height: height * 0.5,
                    //backgroundColor: '#fff',
                    //marginTop: -25,
                }}>



                    {/* Modal Filter Searching */}
                    <Modal
                        animationType={"slide"}
                        transparent={false}
                        visible={this.state.modalSearchFilterVisible}
                        onRequestClose={() => {
                            this.setState({ modalSearchFilterVisible: false })
                        }}
                        onShow={() => {
                            this.setState({
                                //  unitPriceSuffixLable: translate("million"),
                                // unitAcreageSuffixLable: translate("Tens of square meters"),
                                //  selectedBDS: translate("All real estate"),
                                // iosSelectedCategory: translate("All real estate"),
                            })
                            // this._getLanguageFromStorageAsync()
                        }}
                    >
                        <View style={{ flex: 1, marginTop: 30, padding: 10, }}>
                            <View style={{ flex: 1, }}>

                                <FormLabel>{translate("Type of real estate")}:</FormLabel>
                                <View style={{ flexDirection: 'row', marginBottom: 30, }}>

                                    {Platform.OS == 'ios' ?

                                        <TouchableOpacity
                                            onPress={() => {


                                                this.refs.pickerCategory.show();
                                            }}
                                        >

                                            <Text style={{ marginLeft: 20, marginTop: 10 }}>{this.state.iosSelectedCategory}  <Ionicons style={{ fontSize: responsiveFontSize(2.5) }} name='ios-arrow-dropdown-outline' /> </Text>

                                        </TouchableOpacity>
                                        :

                                        <Picker // Android
                                            style={{ flex: 1, marginTop: -4, marginLeft: 18 }}
                                            mode='dropdown'
                                            selectedValue={this.state.selectedCategory}
                                            onValueChange={(itemValue, itemIndex) => {
                                                this.setState({ selectedCategory: itemValue })
                                            }}>
                                            <Picker.Item label={translate("All real estate")} value='' />


                                            {this.state.roomCategory.map((y, i) => {
                                                return (
                                                    <Picker.Item key={i} label={this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]} value={y.ID} />
                                                )
                                            })}

                                        </Picker>
                                    }

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
                                        onSubmit={async (option) => {
                                            await this.setState({ selectedCategory: option });
                                            this.state.roomCategory.map((y, i) => {
                                                if (y.ID === option) {
                                                    this.setState({ iosSelectedCategory: this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1] })
                                                }
                                            })

                                            //this._getRoomByFilter();
                                        }}
                                    />


                                </View>

                                {/* Price */}
                                <FormLabel style={{}}>{translate("Price")}: </FormLabel>
                                <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                    <View
                                        style={{
                                            //flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {
                                            this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] == 10
                                                ?
                                                <Text style={{ flex: 2, marginBottom: 15, marginTop: 20, marginLeft: 20 }}>{translate("All")} </Text>
                                                : this.state.multiSliderPriceValue[0] > 0 && this.state.multiSliderPriceValue[1] == 10
                                                    ? <Text style={{ flex: 2, marginBottom: 15, marginTop: 20, marginLeft: 20 }}>{translate("Greater than")} {this.state.multiSliderPriceValue[0]}</Text>
                                                    : this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] < 10
                                                        ? <Text style={{ flex: 2, marginBottom: 15, marginTop: 20, marginLeft: 20 }}>{translate("Less than")}  {this.state.multiSliderPriceValue[1]}</Text>
                                                        : <Text style={{ flex: 2, marginBottom: 15, marginTop: 20, marginLeft: 20 }}>{this.state.multiSliderPriceValue[0]} {translate("To")} {this.state.multiSliderPriceValue[1]}</Text>
                                        }

                                        {!(this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] == 10) && Platform.OS == 'android' &&
                                            <Picker
                                                style={{
                                                    flex: 5,
                                                    marginBottom: -2,
                                                }}
                                                mode='dropdown'
                                                selectedValue={this.state.selectedUnitPrice}
                                                onValueChange={(itemValue, itemIndex) => {
                                                    this.setState({ selectedUnitPrice: itemValue })


                                                    // // Unit Price
                                                    if (itemValue == 'ptr') {
                                                        this.setState({ unitPrice: '000000', unitPriceSuffixLable: translate("million") })
                                                    }
                                                    else if (itemValue == 'pctr') {
                                                        this.setState({ unitPrice: '0000000', unitPriceSuffixLable: translate("tens of millions") })
                                                    }
                                                    else if (itemValue == 'pttr') {
                                                        this.setState({ unitPrice: '00000000', unitPriceSuffixLable: translate("one hundred million") })
                                                    }
                                                    else if (itemValue == 'pt') {
                                                        this.setState({ unitPrice: '000000000', unitPriceSuffixLable: translate("billion") })
                                                    }
                                                    else if (itemValue == 'pct') {
                                                        this.setState({ unitPrice: '0000000000', unitPriceSuffixLable: translate("tens of billion") })
                                                    }
                                                    else if (itemValue == 'ptt') {
                                                        this.setState({ unitPrice: '00000000000', unitPriceSuffixLable: translate("hundred billion") })
                                                    }
                                                    else {
                                                        this.setState({ unitPrice: '000000' })
                                                    }

                                                }}>
                                                <Picker.Item label={translate("million")} value='ptr' />
                                                <Picker.Item label={translate("tens of millions")} value='pctr' />
                                                <Picker.Item label={translate("one hundred million")} value='pttr' />
                                                <Picker.Item label={translate("billion")} value='pt' />
                                                <Picker.Item label={translate("tens of billion")} value='pct' />
                                                <Picker.Item label={translate("hundred billion")} value='ptt' />
                                            </Picker>
                                        }

                                        {!(this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] == 10) && Platform.OS == 'ios' &&
                                            <View>
                                                <TouchableOpacity
                                                    style={{ width: responsiveWidth(50), }}
                                                    onPress={() => {
                                                        this.refs.pickerPriceUnitLable.show();
                                                    }}
                                                >
                                                    <Text style={{ marginBottom: -4 }}>{this.state.unitPriceSuffixLable + '  '}
                                                        <Ionicons style={{ fontSize: responsiveFontSize(2.5), marginLeft: 15 }} name='ios-arrow-dropdown-outline' />
                                                    </Text>
                                                </TouchableOpacity>

                                                <SimplePicker
                                                    ref={'pickerPriceUnitLable'}
                                                    options={['ptr', 'pctr', 'pttr', 'pt', 'pct', 'ptt']}
                                                    labels={[translate("million"), translate("tens of millions"), translate("one hundred million"), translate("billion"), translate("tens of billion"), translate("hundred billion")]}
                                                    confirmText={translate("Agree")}
                                                    cancelText={translate("Cancel")}
                                                    itemStyle={{
                                                        fontSize: 25,
                                                        color: '#73aa2a',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                    }}
                                                    onSubmit={(option) => {

                                                        this.setState({ selectedUnitPrice: option })

                                                        // // Unit Price
                                                        if (option == 'ptr') {
                                                            this.setState({ unitPrice: '000000', unitPriceSuffixLable: translate("million") })
                                                        }
                                                        else if (option == 'pctr') {
                                                            this.setState({ unitPrice: '0000000', unitPriceSuffixLable: translate("tens of millions") })
                                                        }
                                                        else if (option == 'pttr') {
                                                            this.setState({ unitPrice: '00000000', unitPriceSuffixLable: translate("one hundred million") })
                                                        }
                                                        else if (option == 'pt') {
                                                            this.setState({ unitPrice: '000000000', unitPriceSuffixLable: translate("billion") })
                                                        }
                                                        else if (option == 'pct') {
                                                            this.setState({ unitPrice: '0000000000', unitPriceSuffixLable: translate("tens of billion") })
                                                        }
                                                        else if (option == 'ptt') {
                                                            this.setState({ unitPrice: '00000000000', unitPriceSuffixLable: translate("hundred billion") })
                                                        }
                                                        else {
                                                            this.setState({ unitPrice: '000000' })
                                                        }
                                                    }}
                                                />
                                            </View>
                                        }
                                    </View>
                                    <MultiSlider
                                        values={[this.state.multiSliderPriceValue[0], this.state.multiSliderPriceValue[1]]}
                                        // sliderLength={250}
                                        onValuesChange={this._multiSliderPriceValuesChange}
                                        min={0}
                                        max={10}
                                        //step={1}

                                        //snapped
                                        selectedStyle={{
                                            backgroundColor: '#73aa2a',
                                        }}
                                        unselectedStyle={{
                                            backgroundColor: 'silver',
                                        }}

                                    />
                                </View>
                                {/* Acreage */}
                                <FormLabel style={{}}>{translate("Area")}: </FormLabel>
                                <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                    <View
                                        style={{
                                            //flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {
                                            this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] == 10
                                                ?
                                                <Text style={{ flex: 2, marginBottom: 15, marginTop: 20, marginLeft: 20 }}>{translate("All")} </Text>
                                                : this.state.multiSliderAreaValue[0] > 0 && this.state.multiSliderAreaValue[1] == 10
                                                    ? <Text style={{ flex: 2, marginBottom: 15, marginTop: 20, marginLeft: 20 }}>{translate("Greater than")}  {this.state.multiSliderAreaValue[0]}</Text>
                                                    : this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] < 10
                                                        ? <Text style={{ flex: 2, marginBottom: 15, marginTop: 20, marginLeft: 20 }}>{translate("Less than")}  {this.state.multiSliderAreaValue[1]}</Text>
                                                        : <Text style={{ flex: 2, marginBottom: 15, marginTop: 20, marginLeft: 20 }}>{this.state.multiSliderAreaValue[0]} {translate("To")} {this.state.multiSliderAreaValue[1]}</Text>
                                        }
                                        {!(this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] == 10) && Platform.OS == 'android' &&
                                            <Picker // Android
                                                style={{ flex: 5, marginBottom: -1 }}
                                                mode='dropdown'
                                                selectedValue={this.state.selectedUnitAcreage}
                                                onValueChange={(itemValue, itemIndex) => {
                                                    this.setState({ selectedUnitAcreage: itemValue })

                                                    // // Unit Acreage
                                                    if (itemValue == 'acmv') {
                                                        this.setState({ unitAcreage: '0', unitAcreageSuffixLable: translate("Tens of square meters") })
                                                    }
                                                    else if (itemValue == 'atmv') {
                                                        this.setState({ unitAcreage: '00', unitAcreageSuffixLable: translate("hundred square meters") })
                                                    }
                                                    else if (itemValue == 'anmv') {
                                                        this.setState({ unitAcreage: '000', unitAcreageSuffixLable: translate("thousand square meters") })
                                                    } else {
                                                        this.setState({ unitAcreage: '0000', unitAcreageSuffixLable: translate("tens of thousands of square meters") })
                                                    }

                                                }}>
                                                <Picker.Item label={translate("Tens of square meters")} value='acmv' />
                                                <Picker.Item label={translate("hundred square meters")} value='atmv' />
                                                <Picker.Item label={translate("thousand square meters")} value='anmv' />
                                            </Picker>
                                        }

                                        {!(this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] == 10) && Platform.OS == 'ios' &&
                                            <View>
                                                <TouchableOpacity
                                                    style={{ width: responsiveWidth(50), }}
                                                    onPress={() => {
                                                        this.refs.pickerAcreageUnitLable.show();
                                                    }}
                                                >
                                                    <Text style={{ marginBottom: -4 }}>{this.state.unitAcreageSuffixLable + '  '}
                                                        <Ionicons style={{ fontSize: responsiveFontSize(2.5), marginLeft: 15 }} name='ios-arrow-dropdown-outline' />
                                                    </Text>
                                                </TouchableOpacity>

                                                <SimplePicker
                                                    ref={'pickerAcreageUnitLable'}
                                                    options={['acmv', 'atmv', 'anmv']}
                                                    labels={[translate("Tens of square meters"), translate("hundred square meters"), translate("thousand square meters")]}
                                                    confirmText={translate("Agree")}
                                                    cancelText={translate("Cancel")}
                                                    itemStyle={{
                                                        fontSize: 25,
                                                        color: '#73aa2a',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                    }}
                                                    onSubmit={(option) => {

                                                        this.setState({ selectedUnitAcreage: option })

                                                        // // Unit Acreage
                                                        if (option == 'acmv') {
                                                            this.setState({ unitAcreage: '0', unitAcreageSuffixLable: translate("Tens of square meters") })
                                                        }
                                                        else if (option == 'atmv') {
                                                            this.setState({ unitAcreage: '00', unitAcreageSuffixLable: translate("hundred square meters") })
                                                        }
                                                        else if (option == 'anmv') {
                                                            this.setState({ unitAcreage: '000', unitAcreageSuffixLable: translate("thousand square meters") })
                                                        } else {
                                                            this.setState({ unitAcreage: '0000', unitAcreageSuffixLable: translate("tens of thousands of square meters") })
                                                        }
                                                    }}
                                                />
                                            </View>
                                        }
                                    </View>

                                    {/* <FormLabel style={{ marginBottom: 20, marginTop: 10, }}>Diện tích: {this.state.multiSliderAreaValue[0]} - {this.state.multiSliderAreaValue[1]} mét vuông</FormLabel> */}
                                    <MultiSlider
                                        values={[this.state.multiSliderAreaValue[0], this.state.multiSliderAreaValue[1]]}
                                        //  sliderLength={250}
                                        onValuesChange={this._multiSliderAreaValuesChange}
                                        min={0}
                                        max={10}
                                        // step={1}
                                        //allowOverlap
                                        //snapped
                                        selectedStyle={{
                                            backgroundColor: '#73aa2a',
                                        }}
                                        unselectedStyle={{
                                            backgroundColor: 'silver',
                                        }}
                                    />
                                </View>

                            </View>

                            <View style={{ marginTop: 140, }}>
                                <View style={{ height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 50, }}>

                                    {this.state.txtFilterResult
                                        ?
                                        <Button
                                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                                            title={translate("Clear filter")}
                                            onPress={async () => {
                                                this.setState({
                                                    txtFilterResult: null,
                                                    multiSliderPriceValue: [0, 10],
                                                    multiSliderAreaValue: [0, 10],
                                                    selectedCategory: '',
                                                    selectedBDS: translate("All real estate"),
                                                    selectedUnitAcreage: 'acmv',
                                                    selectedUnitPrice: 'ptr',
                                                    iosSelectedCategory: translate("All real estate"),
                                                })
                                                this.setState({ modalSearchFilterVisible: false });
                                                this._getRoomByFilter(true);
                                                // this.fitAllMarkers();
                                            }}
                                        />
                                        :
                                        <Button
                                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                                            onPress={() => {
                                                this.setState({
                                                    modalSearchFilterVisible: false,

                                                })
                                            }}
                                            title={translate("Cancel")} />
                                    }
                                    <Button
                                        buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                                        icon={{ name: 'md-checkmark', type: 'ionicon' }}
                                        disabled={
                                            (this.state.selectedCategory == '0'
                                                && this.state.multiSliderPriceValue[0] == 0
                                                && this.state.multiSliderPriceValue[1] == 10
                                                && this.state.multiSliderAreaValue[0] == 0
                                                && this.state.multiSliderAreaValue[1] == 10)
                                                ? true : false
                                        }
                                        title={translate("Filter")}
                                        onPress={async () => {
                                            this.setState({ modalSearchFilterVisible: false })
                                            await this.state.roomCategory.map((y, i) => {

                                                if (y.ID == this.state.selectedCategory) {
                                                    this.setState({
                                                        selectedBDS: this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]
                                                    })
                                                }

                                            })

                                            this._getRoomByFilter(true);


                                            // this.setState({
                                            //     txtFilterResult: this.state.selectedBDS // Loai BDS
                                            //         + ', ' + this.state.unitPriceLable
                                            //         + ', ' + this.state.unitAcreageLable

                                            // })


                                            // this.fitAllMarkers();
                                        }}
                                    />


                                </View>
                            </View>

                        </View>
                    </Modal>


                </View>

                {/* Popup Searching */}
                <PopupDialog
                    ref={(popupSearching) => { this.popupSearching = popupSearching; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogStyle={{ marginBottom: 100, width: width * 0.9, height: height * 0.6, justifyContent: 'center', padding: 20 }}
                    onDismissed={() => {
                        Keyboard.dismiss();
                    }}
                    onShown={() => {

                    }}
                >
                    <GooglePlacesAutocomplete
                        placeholder={translate("Please input address")}
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

                            this.popupSearching.dismiss();

                            this.setState({
                                searchingMaker: {
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                },
                                isSearching: true,
                            })

                            //this.map.animateToRegion(this.state.mapRegion, 1000);

                            this.map.animateToCoordinate(this.state.searchingMaker, 1000)
                            this._getRoomByFilter(true)

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
                            key: 'AIzaSyBIhOGDA4Cvocj02AYdnxYK5oGeg6VwetM',//'AIzaSyC2QhtACfVZ2cr9HVvxQuzxd3HT36NNK3Q',
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

                {/* popup Register Location */}
                <PopupDialog
                    ref={(popupRegisterLocation) => { this.popupRegisterLocation = popupRegisterLocation; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogStyle={{ marginBottom: 10, width: responsiveWidth(90), height: 150, justifyContent: 'center', padding: 20 }}
                    dismissOnTouchOutside={true}
                >
                    <View style={{
                        flex: 1, flexDirection: 'row', justifyContent: 'flex-spacing',
                         alignContent: 'center'
                    }}>
                        <TouchableOpacity
                            style={{ flex: 2, justifyContent: 'center', alignContent: 'center' }}
                            onPress={async () => {


                                Alert.alert(
                                    translate("Notice"),
                                    translate("Do you want to turn off notification from NBL"),
                                    [
                                        {
                                            text: translate("Cancel"), onPress: () => {

                                            }
                                        },
                                        {
                                            text: translate("Agree"), onPress: () => {

                                                this.popupRegisterLocation.dismiss();
                                                this.setState({ registerLocation: null })
                                                saveStorageAsync('registerLocation', '')

                                            }
                                        },
                                    ]
                                );

                            }}
                        >
                            <Ionicons style={{
                                fontSize: 50,
                                //borderRadius: 10,
                                //   backgroundColor: '#a4d227',
                                color: '#a4d227', textAlign: 'center', padding: 10
                            }} name='ios-notifications-off-outline' >
                            </Ionicons>
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>{translate("Turn off notification")}</Text>
                        </TouchableOpacity>
                        {/* <View style={{ flex: 1 }}></View> */}
                        <TouchableOpacity
                            style={{ flex: 2, justifyContent: 'center', alignContent: 'center', }}
                            onPress={async () => {
                                this.popupRegisterLocation.dismiss();
                                this._getFindingBoxAsync(true)
                            }}
                        >
                            <Ionicons style={{
                                fontSize: 50, borderRadius: 10,
                                // backgroundColor: '#a4d227',
                                color: '#a4d227', textAlign: 'center', padding: 10
                            }} name='ios-menu' />
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>{translate("List of real estate")}</Text>
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
}

const styles = StyleSheet.create({






    searchCardPriceBox: {
        flexDirection: 'row',
    },
    searCardDistanceIcon: {
        flex: 1,
        // fontSize: 14,
        paddingTop: 4,
        //textAlign: 'left',
    },
    searchCardPrice: {
        flex: 2,
        color: '#7E7E7E',
    },
    searchCardTextBox: {
        flex: 9,
        paddingLeft: 10,
    },
    searchCardPostDate: {
        flex: 1,
        color: '#9B9D9D',
        // paddingTop: 10,
        fontSize: 12,
    },
    dropdowntextStyle: {
        fontSize: 14,
    },
    ModalDropdown: {
        flex: 1,

    },
    dropdownStyle: {
        width: 100,
    },
    // searchCardImage: {
    //     flex: 3,
    //     borderRadius: 5,
    // },
    // searchCardAddress: {
    //     flex: 2,
    //     fontSize: 13,
    // },
    // searchCard: {
    //     flex: 1,
    //     flexDirection: 'row',
    //     height: 105,
    //     // borderWidth: 1,
    //     paddingTop: 10,
    //     paddingBottom: 10,
    //     borderBottomWidth: 0.3,
    //     borderColor: '#9B9D9D',
    // },

    searchFilterIcon: {
        paddingTop: 5,
        paddingLeft: 22,
        textAlign: 'center',
    },

    searchRadiusBox: {
        flexDirection: 'row',
    },


    searchMapView: {
        alignSelf: 'stretch',
        // height: height * 0.3,
        height: 100,
    },

});