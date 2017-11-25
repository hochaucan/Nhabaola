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

} from 'react-native';
//import { ExpoLinksView } from '@expo/samples';
import { Constants, Location, Permissions } from 'expo';
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

var { height, width } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;
let id = 0;

const customStyle = [
    {
        elementType: 'geometry',
        stylers: [
            {
                color: '#242f3e',
            },
        ],
    },
    {
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#746855',
            },
        ],
    },
    {
        elementType: 'labels.text.stroke',
        stylers: [
            {
                color: '#242f3e',
            },
        ],
    },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#d59563',
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#d59563',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
            {
                color: '#263c3f',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#6b9a76',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
            {
                color: '#38414e',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#212a37',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#9ca5b3',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
            {
                color: '#746855',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#1f2835',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#f3d19c',
            },
        ],
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [
            {
                color: '#2f3948',
            },
        ],
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#d59563',
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
            {
                color: '#17263c',
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#515c6d',
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [
            {
                color: '#17263c',
            },
        ],
    },
];

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


const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };
const roomBox = [];

export default class SearchScreen extends React.Component {

    static navigationOptions = {
        tabBarLabel: 'Tìm kiếm',
        // title: 'Links',
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            mapRegion: null,//{ latitude: LATITUDE, longitude: LONGITUDE, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA },
            //searchResultData: users,
            modalSearchFilterVisible: false,
            age: 18,
            hackHeight: height,
            radius: '2',
            modalRadius: false,
            errorMessage: null,
            markers: [],
            findingHouseMakers: [],
            initialRenderCurrentMaker: true,
            initialRenderCurrenHouse: true,

            // Searching Filter
            //selectedUnitPrice: '',
            // selectedUnitAcreage: '',
            minPrice: '0',
            maxPrice: '999999999999',
            unitPrice: '000000',
            minAcreage: '0',
            maxAcreage: '500000',
            unitAcreage: '0',
            multiSliderPriceValue: [0, 10],
            multiSliderAreaValue: [0, 10],
            txtFilterResult: null,
            selectedBDS: 'Tất cả BĐS',

            // Searhing address
            searchingMaker: null,
            watchLocation: null,

            refreshFlatlist: false,
            roomPageIndex: 5,
            roomPageCount: 5,
            roomCategory: [],
            selectedCategory: '',
            countMapLoad: 0,
            houseCoords: {
                latitude: null,
                longitude: null,
            },
            isSearching: false,
            isFocusSearchTextInput: false,
            houseListHeigh: new Animated.Value(responsiveHeight(28)),
            isHouseList: false,

        }
    }

    _multiSliderPriceValuesChange = async (values) => {
        await this.setState({
            multiSliderPriceValue: values,
        });



        if (this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] == 10) {
            this.setState({
                minPrice: '0',
                maxPrice: '999999999999'
            })
        }
        else if (this.state.multiSliderPriceValue[0] > 0 && this.state.multiSliderPriceValue[1] == 10) {
            this.setState({
                minPrice: this.state.multiSliderPriceValue[0] + this.state.unitPrice,
                maxPrice: '999999999999'
            })
        }
        else if (this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] < 10) {
            this.setState({
                minPrice: '0',
                maxPrice: this.state.multiSliderPriceValue[1] + this.state.unitPrice,
            })
        }
        else {
            this.setState({
                minPrice: this.state.multiSliderPriceValue[0] + this.state.unitPrice,
                maxPrice: this.state.multiSliderPriceValue[1] + this.state.unitPrice,
            })
        }
    }

    _multiSliderAreaValuesChange = async (values) => {
        await this.setState({
            multiSliderAreaValue: values,
        });


        if (this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] == 10) {
            this.setState({
                minAcreage: '0',
                maxAcreage: '500000'
            })
        }
        else if (this.state.multiSliderAreaValue[0] > 0 && this.state.multiSliderAreaValue[1] == 10) {
            this.setState({
                minAcreage: this.state.multiSliderAreaValue[0] + this.state.unitAcreage,
                maxAcreage: '500000'
            })
        }
        else if (this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] < 10) {
            this.setState({
                minAcreage: '0',
                maxAcreage: this.state.multiSliderAreaValue[1] + this.state.unitAcreage,
            })
        }
        else {
            this.setState({
                minAcreage: this.state.multiSliderAreaValue[0] + this.state.unitAcreage,
                maxAcreage: this.state.multiSliderAreaValue[1] + this.state.unitAcreage,
            })
        }
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
                top: responsiveWidth(60),
                bottom: responsiveHeight(100),
                right: responsiveWidth(100),
                left: responsiveWidth(100)
            },//DEFAULT_PADDING,
            animated: true,
        });
        // this.map.fitToCoordinates(MARKERS, {
        //     edgePadding: {
        //         top: responsiveHeight(10),
        //         bottom: responsiveHeight(50),
        //         right: responsiveHeight(50),
        //         left: responsiveHeight(50)
        //     },//DEFAULT_PADDING,
        //     animated: true,
        // });
    }

    // _fitAllFindingHouseMakers() {
    //     this.map.fitToCoordinates(this.state.findingHouseMakers, {
    //         edgePadding: DEFAULT_PADDING,
    //         animated: true,
    //     });
    // }

    _createTempMarker(modifier = 1, lat, long) {
        return {
            latitude: lat - (SPACE * modifier),
            longitude: long - (SPACE * modifier),
        };
    }

    _setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    _handleMapRegionChange = mapRegion => {
        this.setState({ mapRegion });
        //this.fitAllMarkers();

        //alert(JSON.stringify(this.state.mapRegion))
        //  this.setState({ countMapLoad: this.state.countMapLoad + 1 })
        //alert(this.state.countMapLoad)

        // if (this.state.countMapLoad > 4) {
        //     this._getRoomByFilter();
        // }

    };

    // _moveToRoomDetail = (user) => {
    //     this.props.navigation.navigate('RoomDetailScreen', { ...user });
    // };


    _dropdown_onSelect(idx, value) {
        // BUG: alert in a modal will auto dismiss and causes crash after reload and touch. @sohobloo 2016-12-1
        //alert(`idx=${idx}, value='${value}'`);
        //console.debug(`idx=${idx}, value='${value}'`);

    }


    getVal(val) {
        // console.warn(val);
    }
    componentWillMount() {
        this._getLocationAsync();
        this._getCategoryFromStorageAsync();

        // if (Platform.OS === 'android' && !Constants.isDevice) {
        //     this.setState({
        //         errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
        //     });
        // } else {
        //     this._getLocationAsync();
        // }

        // setTimeout(() => this.setState({ hackHeight: height + 1 }), 500);
        // setTimeout(() => this.setState({ hackHeight: height * 0.5 }), 1000);
    }

    componentDidMount() {

    }

    _getLocationAsync = async () => {

        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let provider = await Location.getProviderStatusAsync()
        // console.log(provider.locationServicesEnabled)

        if (provider.locationServicesEnabled === false) {
            Alert.alert(
                'Thông báo',
                'Bạn vui lòng kích hoạt Location Service',
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
        this._getRoomByFilter();

        // Save current location to global variable
        globalVariable.LOCATION.LATITUDE = location.coords.latitude;
        globalVariable.LOCATION.LONGITUDE = location.coords.longitude;
    };

    _getCurrentPositionAsync() {
        //  this.refs.map.animateToRegion(this.region, 1000);

    }

    _dropdownFilter_onSelect(idx, value) {
        // BUG: alert in a modal will auto dismiss and causes crash after reload and touch. @sohobloo 2016-12-1
        //alert(`idx=${idx}, value='${value}'`);
        //console.debug(`idx=${idx}, value='${value}'`);
        this.setState({
            selectedBDS: value,
        })
    }

    _getRoomByFilter = async () => {
        await this.setState({ refreshFlatlist: true })
        this.popupLoadingIndicator.show()

        roomBox = await [];
        MARKERS = await [];

        if (this.state.isSearching) {
            await this.setState({
                houseCoords: {
                    latitude: parseFloat(this.state.searchingMaker.latitude),
                    longitude: parseFloat(this.state.searchingMaker.longitude),
                }
            })

        }
        else {

            await this.setState({
                houseCoords: {
                    latitude: parseFloat(this.state.location.coords.latitude),
                    longitude: parseFloat(this.state.location.coords.longitude),
                }
            })
        }

        // Unit Price
        // let unitPrice = '';
        // if (this.state.selectedUnitPrice == 'ptr') {
        //     unitPrice = '000000'
        // }
        // else if (this.state.selectedUnitPrice == 'pctr') {
        //     unitPrice = '0000000'
        // }
        // else if (this.state.selectedUnitPrice == 'pttr') {
        //     unitPrice = '00000000'
        // }
        // else if (this.state.selectedUnitPrice == 'pt') {
        //     unitPrice = '000000000'
        // }
        // else if (this.state.selectedUnitPrice == 'pct') {
        //     unitPrice = '0000000000'
        // }
        // else if (this.state.selectedUnitPrice == 'ptt') {
        //     unitPrice = '00000000000'
        // }
        // else {
        //     unitPrice = '000000'
        // }

        // // Unit Acreage
        // let unitAcreage = '0';
        // if (this.state.selectedUnitAcreage == 'acmv') {
        //     unitAcreage = '0'
        // }
        // else if (this.state.selectedUnitAcreage == 'atmv') {
        //     unitAcreage = '00'
        // }
        // else if (this.state.selectedUnitAcreage == 'anmv') {
        //     unitAcreage = '000'
        // } else {
        //     unitAcreage: '0000'
        // }
        alert(this.state.minPrice + '  ' + this.state.maxPrice + '  ' + this.state.minAcreage + '  ' + this.state.maxAcreage)

        //Add current location to fix maker
        MARKERS.push(this.state.houseCoords);

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
                    "RoomPriceMin": this.state.minPrice, //this.state.txtFilterResult != null ? this.state.multiSliderPriceValue[0] + this.state.unitPrice : '0',
                    "RoomPriceMax": this.state.maxPrice,//this.state.txtFilterResult != null ? this.state.multiSliderPriceValue[1] + this.state.unitPrice : '999999999999',
                    "AcreageMin": this.state.minAcreage,//this.state.txtFilterResult != null ? this.state.multiSliderAreaValue[0] + this.state.unitAcreage : '0',
                    "AcreageMax": this.state.maxAcreage, //this.state.txtFilterResult != null ? this.state.multiSliderAreaValue[1] + this.state.unitAcreage : '500000',
                    "SortOptionKey": "SortDistance",
                    "PageIndex": "0",
                    "PageCount": "100"
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    responseJson.obj.map((y) => {
                        roomBox.push(y);

                        this.setState({
                            houseCoords: {
                                latitude: parseFloat(y.Latitude),
                                longitude: parseFloat(y.Longitude),
                            }
                        })

                        MARKERS.push(this.state.houseCoords)
                    })

                    this.popupLoadingIndicator.dismiss();
                    this.setState({ refresh: false })

                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

        if (MARKERS.length > 1) {
            setTimeout(() => { this.fitAllMarkers() }, 500)
        } else {
            // this._getLocationAsync();
        }

        // Set isHouseList to false
        if (this.state.isHouseList) {
            Animated.timing(
                this.state.houseListHeigh,
                {
                    toValue: responsiveHeight(28),
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

    _shouldItemUpdate = (prev, next) => {
        return prev.item !== next.item;
    }

    render() {

        let currentMaker = null;
        if (this.state.errorMessage) {
            text = this.state.errorMessage;
        } else if (this.state.location) {
            text = JSON.stringify(this.state.location.coords);
            currentMaker = {
                latitude: this.state.location.coords.latitude,
                longitude: this.state.location.coords.longitude
            }
        }

        return (
            <View style={{
                flex: 1,
            }}>

                {this.state.txtFilterResult &&
                    <Text style={{
                        //color: '#73aa2a',
                        width: responsiveWidth(80),
                        position: 'absolute',
                        top: 10,
                        zIndex: 10,
                        backgroundColor: '#fff',
                        padding: 5,
                        fontSize: responsiveFontSize(1.6),
                        elevation: 2,
                        borderRadius: 10,
                    }}>{this.state.txtFilterResult}</Text>

                }

                {/* Radius */}
                <View style={{
                    flexDirection: 'row',
                    position: 'absolute',
                    backgroundColor: '#fff',
                    zIndex: 10,
                    top: 45,
                    paddingLeft: 10,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 2,
                    //opacity: 0.8,
                    width: 130,//responsiveWidth(40)
                }}>
                    <Text style={{ width: 30, paddingLeft: 5 }}>BK: </Text>
                    {Platform.OS === 'ios' ?

                        <TouchableOpacity
                            onPress={() => {
                                this.setState({
                                    modalRadius: true
                                })
                            }}
                        >

                            <Text style={{}}>{this.state.radius} km</Text>
                        </TouchableOpacity>
                        :
                        <Picker
                            style={{
                                //flex: 2,
                                width: 110,
                            }}
                            mode='dropdown'
                            selectedValue={this.state.radius}
                            onValueChange={async (itemValue, itemIndex) => {
                                await this.setState({ radius: itemValue })
                                this._getRoomByFilter();
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
                        </Picker>
                    }

                </View>


                {/* Filter */}
                {/* <View style={{
                    flexDirection: 'row',
                    position: 'absolute',
                    top: 70,
                    zIndex: 10,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    padding: 10,
                    width: this.state.txtFilterResult !== null ? width * 0.8 : width * 0.3,
                }}>
                    <Text >Bộ lọc: </Text>
                    <TouchableOpacity
                        style={{}}
                        onPress={() => this.setState({ modalSearchFilterVisible: true })}
                    >
                        {this.state.txtFilterResult
                            ? <Text style={{ color: '#73aa2a', width: width * 0.8 }}>{this.state.txtFilterResult}</Text>
                            : <Ionicons style={styles.searchFilterIcon} name='ios-funnel'></Ionicons>
                        }

                    </TouchableOpacity>

                </View> */}


                {/* Search location  */}


                {/* 
                <SocialIcon
                    style={{
                       position: 'absolute', top: 100, zIndex: 10, right: 15,
                    }}
                    button
                    light
                    type='instagram'
                /> */}


                {/* Filter */}
                <TouchableOpacity
                    style={{
                        height: 40, position: 'absolute', top: responsiveHeight(30), zIndex: 10, right: 15,
                    }}
                    onPress={() => {
                        this.setState({ modalSearchFilterVisible: true })
                    }}
                >
                    <View style={{
                        backgroundColor: '#a4d227', padding: 5, borderRadius: 10, width: 32,
                        height: 32, justifyContent: 'center',
                        alignItems: 'center', elevation: 2
                    }}>
                        <Ionicons style={{ fontSize: 25, color: '#fff', textAlign: 'center' }} name='ios-funnel-outline' />
                    </View>
                </TouchableOpacity>

                {/* Search location */}
                <TouchableOpacity
                    style={{
                        height: 40, position: 'absolute', top: responsiveHeight(40), zIndex: 10, right: 15,
                    }}
                    onPress={() => {
                        this.popupSearching.show();
                    }}
                >
                    <View style={{
                        backgroundColor: '#8fb722', padding: 5, borderRadius: 10, width: 32,
                        height: 32, justifyContent: 'center',
                        alignItems: 'center', elevation: 2
                    }}>
                        <Ionicons style={{ fontSize: 25, color: '#fff', textAlign: 'center' }} name='ios-search-outline' />
                    </View>
                </TouchableOpacity>

                {/* Get current location */}
                <TouchableOpacity
                    style={{ height: 40, position: 'absolute', top: responsiveHeight(50), zIndex: 10, right: 15, backgroundColor: 'transparent' }}
                    onPress={async () => {
                        await this.setState({ isSearching: false, searchingMaker: null, })
                        this._getLocationAsync();
                    }}
                >
                    <View style={{
                        backgroundColor: '#73aa2a', padding: 5, borderRadius: 10,
                        width: 32, height: 32, justifyContent: 'center', alignItems: 'center', elevation: 2
                    }}>
                        <Ionicons style={{ fontSize: 25, color: '#fff', textAlign: 'center' }} name='ios-locate-outline' />
                    </View>
                </TouchableOpacity>

                {
                    this.state.mapRegion &&
                    <MapView
                        ref={ref => { this.map = ref; }}

                        /* style={{ paddingBottom: this.state.hackHeight, alignSelf: 'stretch', }} */
                        style={{ alignSelf: 'stretch', height: responsiveHeight(100) }}

                        region={this.state.mapRegion}
                        // onRegionChange={this._handleMapRegionChange}
                        onRegionChangeComplete={(mapRegion) => {
                            this.setState({ mapRegion })
                        }}
                        provider='google'
                        showsUserLocation={false}
                        showsMyLocationButton={false}
                        followsUserLocation={false}
                        loadingEnabled={true}
                        onPress={(e) => this.onMapPress(e)}
                    /* customMapStyle={customStyle} */
                    >
                        {this.state.location
                            ?

                            <MapView.Marker
                                coordinate={currentMaker}
                                title='Vị trí của tôi'
                            //description='Home'
                            /* image={require('../images/nbl-here-icon.png')} */

                            >
                                <Image
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

                                    {/* <Text style={{ width: 0, height: 0 }}>{Math.random()}</Text> */}
                                </Image>
                            </MapView.Marker>
                            :
                            null}

                        {this.state.searchingMaker
                            ?
                            <MapView.Marker
                                coordinate={this.state.searchingMaker}
                                title='Vị trí tìm kiếm'
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
                            // title='Im here'
                            // description='Home'

                            /* image={require('../images/nbl-house_icon.png')} */
                            >
                                <View style={{
                                    justifyContent: 'center', alignItems: 'center',
                                }}>
                                    <Text style={{
                                        backgroundColor: item.IsHighlight ? 'red' : '#6c6d6d',
                                        color: '#fff',
                                        padding: 5,
                                        fontSize: responsiveFontSize(1.2),
                                        borderRadius: 5,
                                        borderWidth: 1,
                                        borderColor: '#fff'
                                        //opacity: 0.8,

                                    }}>{convertAmountToWording(item.Price)}</Text>
                                    {/* {
                                        this.state.roomCategory.map((y, i) => {
                                            return (
                                                y.ID == item.CategoryID &&
                                                <Text
                                                    style={{
                                                        fontSize: responsiveFontSize(1.5),
                                                        color: item.IsHighlight ? 'red' : '#515151'
                                                    }}
                                                    key={i}>{y.CatName}</Text>
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
                                                                    key={i}>{y.CatName}</Text>
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

                {
                    roomBox.length >= 1 &&
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
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    elevation: 5,
                                }}
                                onPress={async () => {
                                    // this.fitAllMarkers();
                                    this.map.fitToCoordinates(MARKERS, {
                                        edgePadding: {
                                            top: this.state.isHouseList ? responsiveHeight(60) : responsiveWidth(100),
                                            bottom: this.state.isHouseList ? responsiveHeight(65) : responsiveHeight(300),//900,
                                            right: this.state.isHouseList ? responsiveHeight(65) : responsiveWidth(300),
                                            left: this.state.isHouseList ? responsiveHeight(65) : responsiveWidth(300)
                                        },//DEFAULT_PADDING,
                                        animated: true,
                                    });

                                    Animated.timing(                  // Animate over time
                                        this.state.houseListHeigh,            // The animated value to drive
                                        {
                                            toValue: this.state.isHouseList ? responsiveHeight(28) : responsiveHeight(60),
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
                                    fontSize: responsiveFontSize(3),
                                    //marginTop: -3,

                                }} name={this.state.isHouseList ? 'ios-arrow-dropdown-circle-outline' : 'ios-arrow-dropup-circle-outline'} />
                            </TouchableOpacity>
                            <Text style={{
                                color: '#73aa2a', paddingBottom: 4,
                                fontSize: responsiveFontSize(2)
                            }}>Tìm được {roomBox.length} Nhà</Text>
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
                                                                    style={{ flex: 3, color: '#73aa2a', fontSize: responsiveFontSize(1.8) }}
                                                                    key={i}>{y.CatName}</Text>
                                                            )
                                                        })
                                                    }

                                                    {/* Location Direction */}
                                                    <TouchableOpacity
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
                                                            marginTop: 3, marginBottom: 2, elevation: 2,

                                                        }} name='md-return-right' >  Đi</Ionicons>
                                                        {/* <Text style={{ color: '#fff', fontSize: responsiveFontSize(1.5) }}>Tìm đường</Text> */}
                                                    </TouchableOpacity>


                                                </View>

                                                <View style={styles.searchCardPriceBox}>
                                                    {/* <TextMask
                                                        style={{ flex: 2, }}
                                                        value={item.Price}
                                                        type={'money'}
                                                        options={{ suffixUnit: ' đ', precision: 0, unit: ' ', separator: ' ' }}
                                                    /> */}

                                                    <Text style={{ flex: 1 }}>{convertAmountToWording(item.Price)}</Text>
                                                    <View style={{ flex: 1, flexDirection: 'row', }}>
                                                        <Text>{item.Acreage} m</Text>
                                                        <Text style={{ fontSize: 8, marginBottom: 5 }}>2</Text>
                                                    </View>
                                                    <Ionicons style={styles.searCardDistanceIcon} name='md-pin' >  {item.Distance} km</Ionicons>
                                                </View>






                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                }
                                keyExtractor={item => item.ID}
                            />

                        </View>

                    </ Animated.View>
                }



                <View style={{
                    height: height * 0.5,
                    backgroundColor: '#fff',
                    marginTop: -25,
                }}>



                    {/* Modal Filter Searching */}
                    <Modal
                        animationType={"slide"}
                        transparent={false}
                        visible={this.state.modalSearchFilterVisible}
                        onRequestClose={() => { alert("Modal has been closed.") }}
                    >
                        <View style={{ flex: 1, marginTop: 30, padding: 10, }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', marginBottom: 30, }}>
                                    <FormLabel>Loại bất động sản:</FormLabel>


                                    <Picker // Android
                                        style={{ flex: 1, marginTop: -4, }}
                                        mode='dropdown'
                                        selectedValue={this.state.selectedCategory}
                                        onValueChange={(itemValue, itemIndex) => {
                                            this.setState({ selectedCategory: itemValue })
                                        }}>
                                        <Picker.Item label='-- Chọn loại BĐS --' value='0' />


                                        {this.state.roomCategory.map((y, i) => {
                                            return (
                                                <Picker.Item key={i} label={y.CatName} value={y.ID} />
                                            )
                                        })}

                                    </Picker>



                                </View>

                                {/* Price */}
                                <View
                                    style={{
                                        //flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        //paddingLeft: 25,
                                    }}
                                >
                                    <FormLabel style={{ marginBottom: 13 }}>Giá: </FormLabel>
                                    {
                                        this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] == 10
                                            ?
                                            <Text style={{ flex: 2 }}>Tất cả </Text>
                                            : this.state.multiSliderPriceValue[0] > 0 && this.state.multiSliderPriceValue[1] == 10
                                                ? <Text style={{ flex: 2 }}>Lớn hơn  {this.state.multiSliderPriceValue[0]}</Text>
                                                : this.state.multiSliderPriceValue[0] == 0 && this.state.multiSliderPriceValue[1] < 10
                                                    ? <Text style={{ flex: 2 }}>Nhỏ hơn  {this.state.multiSliderPriceValue[1]}</Text>
                                                    : <Text style={{ flex: 2 }}>{this.state.multiSliderPriceValue[0]} đến {this.state.multiSliderPriceValue[1]}</Text>
                                    }

                                    <Picker
                                        style={{ flex: 5, marginBottom: 2 }}
                                        mode='dropdown'
                                        selectedValue={this.state.selectedUnitPrice}
                                        onValueChange={(itemValue, itemIndex) => {
                                            // this.setState({ selectedUnitPrice: itemValue })


                                            // Unit Price
                                            if (itemValue == 'ptr') {
                                                this.setState({ unitPrice: '000000' })
                                            }
                                            else if (itemValue == 'pctr') {
                                                this.setState({ unitPrice: '0000000' })
                                            }
                                            else if (itemValue == 'pttr') {
                                                this.setState({ unitPrice: '00000000' })
                                            }
                                            else if (itemValue == 'pt') {
                                                this.setState({ unitPrice: '000000000' })
                                            }
                                            else if (itemValue == 'pct') {
                                                this.setState({ unitPrice: '0000000000' })
                                            }
                                            else if (itemValue == 'ptt') {
                                                this.setState({ unitPrice: '00000000000' })
                                            }
                                            else {
                                                this.setState({ unitPrice: '000000' })
                                            }

                                        }}>
                                        <Picker.Item label='triệu' value='ptr' />
                                        <Picker.Item label='chục triệu' value='pctr' />
                                        <Picker.Item label='trăm triệu' value='pttr' />
                                        <Picker.Item label='tỷ' value='pt' />
                                        <Picker.Item label='chục tỷ' value='pct' />
                                        <Picker.Item label='trăm tỷ' value='ptt' />
                                    </Picker>
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

                                {/* Acreage */}

                                <View
                                    style={{
                                        //flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        //paddingLeft: 25,
                                    }}
                                >
                                    <FormLabel style={{ marginBottom: 13 }}>Diện tích: </FormLabel>

                                    {
                                        this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] == 10
                                            ?
                                            <Text style={{ flex: 2 }}>Tất cả </Text>
                                            : this.state.multiSliderAreaValue[0] > 0 && this.state.multiSliderAreaValue[1] == 10
                                                ? <Text style={{ flex: 2 }}>Lớn hơn  {this.state.multiSliderAreaValue[0]}</Text>
                                                : this.state.multiSliderAreaValue[0] == 0 && this.state.multiSliderAreaValue[1] < 10
                                                    ? <Text style={{ flex: 2 }}>Nhỏ hơn  {this.state.multiSliderAreaValue[1]}</Text>
                                                    : <Text style={{ flex: 2 }}>{this.state.multiSliderAreaValue[0]} đến {this.state.multiSliderAreaValue[1]}</Text>
                                    }

                                    <Picker // Android
                                        style={{ flex: 5, marginBottom: 3 }}
                                        mode='dropdown'
                                        selectedValue={this.state.selectedUnitAcreage}
                                        onValueChange={(itemValue, itemIndex) => {
                                            //this.setState({ selectedUnitAcreage: itemValue })

                                            // // Unit Acreage
                                            if (itemValue == 'acmv') {
                                                this.setState({ unitAcreage: '0' })
                                            }
                                            else if (itemValue == 'atmv') {
                                                this.setState({ unitAcreage: '00' })
                                            }
                                            else if (itemValue == 'anmv') {
                                                this.setState({ unitAcreage: '000' })
                                            } else {
                                                this.setState({ unitAcreage: '0000' })
                                            }

                                        }}>
                                        <Picker.Item label='chục mét vuông' value='acmv' />
                                        <Picker.Item label='trăm mét vuông' value='atmv' />
                                        <Picker.Item label='nghìn mét vuông' value='anmv' />
                                    </Picker>
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

                                {/* <Slider
                                    style={{ width: 300 }}
                                    step={1}
                                    minimumValue={18}
                                    maximumValue={71}
                                    value={this.state.age}
                                    onValueChange={val => this.setState({ age: val })}
                                    onSlidingComplete={val => this.getVal(val)}
                                /> */}


                            </View>

                            <View style={{ marginTop: 140, }}>
                                <View style={{ height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 50, }}>

                                    {this.state.txtFilterResult
                                        ?
                                        <Button
                                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                                            title='Xóa lọc'
                                            onPress={async () => {
                                                this.setState({
                                                    txtFilterResult: null,
                                                    multiSliderPriceValue: [1, 10],
                                                    multiSliderAreaValue: [20, 200],
                                                    selectedCategory: '',
                                                    selectedBDS: 'Tất cả BĐS',
                                                })
                                                this.setState({ modalSearchFilterVisible: false });
                                                this._getRoomByFilter();
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
                                            title='Hủy' />
                                    }
                                    <Button
                                        buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                                        icon={{ name: 'md-checkmark', type: 'ionicon' }}
                                        title='Lọc'
                                        onPress={async () => {

                                            await this.state.roomCategory.map((y, i) => {

                                                if (y.ID == this.state.selectedCategory) {
                                                    this.setState({
                                                        selectedBDS: y.CatName
                                                    })
                                                }

                                            })


                                            this.setState({
                                                txtFilterResult: this.state.selectedBDS + ', ' + this.state.multiSliderPriceValue[0] + '-' + this.state.multiSliderPriceValue[1] + ' triệu đồng, '
                                                    + this.state.multiSliderAreaValue[0] + '-' + this.state.multiSliderAreaValue[1] + ' mét vuông',

                                            })

                                            this._getRoomByFilter();

                                            this.setState({ modalSearchFilterVisible: false })
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
                            this._getRoomByFilter()

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

                {/* Modal Radius Ios*/}
                <Modal
                    style={{}}
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.modalRadius}
                    onRequestClose={() => {
                        //alert("Modal has been closed.")
                    }}
                >

                    {/* <TouchableOpacity
                        style={{ backgroundColor: '#fff', paddingTop: height * 0.4 }}
                        onPress={() => { this.setState({ modalRadius: false }) }}
                    >
                        <Text style={{ textAlign: 'right' }}>Chọn</Text>
                    </TouchableOpacity> */}
                    <Picker
                        style={{
                            flex: 1,
                            marginTop: height * 0.59,
                            backgroundColor: '#fff',
                        }}
                        itemStyle={{ color: '#73aa2a' }}
                        mode='dropdown'
                        selectedValue={this.state.radius}
                        onValueChange={(itemValue, itemIndex) => {
                            this.setState({
                                radius: itemValue,
                                modalRadius: false,
                            })
                        }}>
                        <Picker.Item label="2 km" value="2" />
                        <Picker.Item label="4 km" value="4" />
                        <Picker.Item label="6 km" value="6" />
                        <Picker.Item label="8 km" value="8" />
                        <Picker.Item label="10 km" value="10" />
                    </Picker>

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