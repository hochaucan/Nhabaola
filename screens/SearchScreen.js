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

} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, Location, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { users } from '../components/examples/data';
import { Button, FormLabel, FormInput, SocialIcon, } from 'react-native-elements'
import MapView from 'react-native-maps';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { GooglePlacesAutocomplete, } from 'react-native-google-places-autocomplete'; // 1.2.12
import { TextInputMask, TextMask } from 'react-native-masked-text';

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
        // title: 'Links',
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            mapRegion: { latitude: LATITUDE, longitude: LONGITUDE, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA },
            searchResultData: users,
            modalSearchFilterVisible: false,
            age: 18,
            hackHeight: height,
            radius: '2',
            modalRadius: false,
            errorMessage: null,
            markers: [],
            findingHouseMakers: [],
            initialRenderCurrentMaker: true,

            // Searching Filter
            multiSliderPriceValue: [1, 10],
            multiSliderAreaValue: [20, 200],
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
        }
    }

    _multiSliderPriceValuesChange = (values) => {
        this.setState({
            multiSliderPriceValue: values,
        });
    }
    _multiSliderAreaValuesChange = (values) => {
        this.setState({
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
            edgePadding: DEFAULT_PADDING,
            animated: true,
        });
    }

    _fitAllFindingHouseMakers() {
        this.map.fitToCoordinates(this.state.findingHouseMakers, {
            edgePadding: DEFAULT_PADDING,
            animated: true,
        });
    }

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
        // this._getRoomByFilter();
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

        //mapRegion: { latitude: LATITUDE, longitude: LONGITUDE, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA },
        // let mapRegion = {
        //     latitude: this.state.location.coords.latitude,
        //     longitude: this.state.location.coords.longitude,
        //     latitudeDelta: LATITUDE_DELTA,
        //     longitudeDelta: LONGITUDE_DELTA
        // }
        // this.setState({ mapRegion });
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

        if (MARKERS != "") {
            this.fitAllMarkers();
        }
        // alert(MARKERS)
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

        // alert(JSON.stringify(this.state.mapRegion))

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
                    "RoomPriceMin": this.state.multiSliderPriceValue[0] + '000000',
                    "RoomPriceMax": this.state.multiSliderPriceValue[1] + '000000',
                    "AcreageMin": this.state.multiSliderAreaValue[0],
                    "AcreageMax": this.state.multiSliderAreaValue[1],
                    "SortOptionKey": "SortDistance",
                    "PageIndex": "0",
                    "PageCount": "100"
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    //alert(JSON.stringify(responseJson.obj))

                    //this._saveStorageAsync('FO_RoomBox_GetAllData', JSON.stringify(responseJson.obj))
                    // responseJson.obj.map((y) => { return y.CatName })

                    //alert(JSON.stringify(responseJson.obj))

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

                    // this.fitAllMarkers()

                    //alert(JSON.stringify(MARKERS))
                    this.setState({ refresh: false })

                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
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

    render() {
        let text = 'Waiting..';
        let currentMaker = null;
        if (this.state.errorMessage) {
            text = this.state.errorMessage;
        } else if (this.state.location) {
            text = JSON.stringify(this.state.location.coords);
            currentMaker = {
                latitude: this.state.location.coords.latitude,
                longitude: this.state.location.coords.longitude
            }
            // let test = []

            // roomBox.map((y) => {
            //     test.push(y.Latitude)
            // })

            // alert(JSON.stringify(test))

            // MARKERS = [

            //     // roomBox.map((y) => {
            //     //     return {
            //     //         latitude: y.Latitude,
            //     //         longitude: y.Longitude,
            //     //         //createMarker(-4, y.Latitude, y.Longitude),
            //     //     }
            //     // })

            //     createMarker(-4, this.state.location.coords.latitude, this.state.location.coords.longitude),
            //     //currentMaker,
            //     createMarker(1, this.state.location.coords.latitude, this.state.location.coords.longitude),
            //     createMarker(2, this.state.location.coords.latitude, this.state.location.coords.longitude),
            //     createMarker(5, this.state.location.coords.latitude, this.state.location.coords.longitude),

            // ]

            //alert(JSON.stringify(MARKERS))

            // this.setState({
            //     findingHouseMakers: [
            //         currentMaker,
            //         this._createTempMarker(1, this.state.location.coords.latitude, this.state.location.coords.longitude),
            //         this._createTempMarker(2, this.state.location.coords.latitude, this.state.location.coords.longitude),
            //         this._createTempMarker(3, this.state.location.coords.latitude, this.state.location.coords.longitude),

            //     ]
            // })
        }

        return (
            <View>
                <View style={{ height: height * 0.4, }}>

                    {/* <View><Text>{text}</Text></View> */}
                    {/* <View><Text>{this.state.watchLocation}</Text></View> */}


                    {/* {this.state.location ? */}
                    <View>
                        <TouchableOpacity
                            style={{ height: 40, position: 'absolute', top: height * 0.20, zIndex: 10, right: 15, backgroundColor: 'transparent' }}
                            onPress={() => {
                                this.popupSearching.show();
                            }}
                        >
                            <View style={{
                                backgroundColor: '#a4d227', padding: 5, borderRadius: 10, width: 32,
                                height: 32, justifyContent: 'center',
                                alignItems: 'center', shadowColor: "#000000",
                            }}>
                                <Ionicons style={{ fontSize: 25, color: '#fff', textAlign: 'center' }} name='ios-search-outline' />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ height: 40, position: 'absolute', top: height * 0.28, zIndex: 10, right: 15, backgroundColor: 'transparent' }}
                            onPress={async () => {

                                await this.setState({ isSearching: false })
                                this._getLocationAsync();
                                //this.fitAllMarkers();
                                //this.map.animateToCoordinate(currentMaker, 1000);
                            }}
                        >
                            <View style={{ backgroundColor: '#a4d227', padding: 5, borderRadius: 10, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons style={{ fontSize: 25, color: '#fff', textAlign: 'center' }} name='ios-locate-outline' />
                            </View>
                        </TouchableOpacity>


                        <MapView
                            ref={ref => { this.map = ref; }}

                            /* style={{ paddingBottom: this.state.hackHeight, alignSelf: 'stretch', }} */
                            style={{ alignSelf: 'stretch', height: height * 0.4, }}

                            region={this.state.mapRegion}
                            //onRegionChange={this._handleMapRegionChange}
                            onRegionChangeComplete={(mapRegion) => { this.setState({ mapRegion }) }}
                            provider='google'
                            showsUserLocation={false}
                            showsMyLocationButton={false}
                            followsUserLocation={false}
                            loadingEnabled={true}
                            onPress={(e) => this.onMapPress(e)}
                        /* customMapStyle={customStyle} */
                        >

                            {/* <MapView.Marker
                        coordinate={{
                            latitude: (this.state.lastLat + 0.00050) || -36.82339,
                            longitude: (this.state.lastLong + 0.00050) || -73.03569,
                        }}>
                        <View>
                            <Text style={{ color: '#000' }}>
                                {this.state.lastLong} / {this.state.lastLat}
                            </Text>
                        </View>
                    </MapView.Marker> */}

                            {this.state.location
                                ?

                                <MapView.Marker
                                    coordinate={currentMaker}
                                    title='Im here'
                                    description='Home'
                                /* image={require('../images/nbl-here-icon.png')} */

                                >
                                    <Image
                                        source={require('../assets/images/nbl-here-icon.png')}
                                        style={{ height: height * 0.07, width: width * 0.07 }}
                                        onLoad={() => {
                                            this.forceUpdate()
                                        }}
                                    //  onLayout={() => {
                                    //    this.setState({ initialRenderCurrentMaker: false })
                                    // }}
                                    //key={`${this.state.initialRenderCurrentMaker}`}
                                    />
                                </MapView.Marker>
                                :
                                null}

                            {this.state.searchingMaker
                                ?
                                <MapView.Marker
                                    coordinate={this.state.searchingMaker}
                                    title='Im here'
                                    description='Home'
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
                            {MARKERS.slice(1).map((marker, i) => (
                                <MapView.Marker
                                    key={i}
                                    coordinate={marker}
                                // title='Im here'
                                // description='Home'

                                /* image={require('../images/nbl-house_icon.png')} */
                                >
                                    <Image
                                        source={require('../assets/images/nbl-house_icon.png')}
                                        style={{ height: height * 0.05, width: width * 0.08 }}
                                        onLoad={() => {
                                            this.forceUpdate()
                                        }}

                                    //onLayout={() => {
                                    //   this.setState({ initialRenderCurrentMaker: false })
                                    // }}
                                    //key={`${this.state.initialRenderCurrentMaker}`}
                                    />

                                    <MapView.Callout style={{}}>
                                        <View>
                                            <Text>This is a plain view</Text>
                                        </View>
                                    </MapView.Callout>
                                </MapView.Marker>
                            ))}

                            {/* Fix all finding house makers on Map */}
                            {/* {findingHouseMakers.map((marker, i) => (
                                <MapView.Marker
                                    key={i}
                                    coordinate={marker}
                                    image={require('../images/nbl-house_icon.png')}
                                />
                            ))} */}

                        </MapView>
                    </View>
                    {/* : null
                    } */}


                </View>

                <ScrollView style={styles.container}>

                    <View style={styles.searchRoolResultBox}>
                        <View style={styles.searchRadiusBox}>
                            <Text >Bán kính: </Text>
                            {Platform.OS === 'ios' ?

                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({
                                            modalRadius: true
                                        })
                                    }}
                                >

                                    <Text>{this.state.radius} km</Text>
                                </TouchableOpacity>


                                :
                                <Picker
                                    style={styles.searchRadiusPicker}
                                    mode='dropdown'
                                    selectedValue={this.state.radius}
                                    onValueChange={async (itemValue, itemIndex) => {
                                        await this.setState({ radius: itemValue })
                                        //alert(this.state.radius)
                                        await this._getRoomByFilter();
                                        this.fitAllMarkers()
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
                            <TouchableOpacity
                                style={{ flex: 1, }}
                                onPress={() => {
                                    this.fitAllMarkers()
                                    //this._fitAllFindingHouseMakers();
                                    //this.map.animateToCoordinate(currentMaker, 1000);
                                }}
                            >
                                <Text style={{ flex: 3, textAlign: 'right', color: '#73aa2a' }}>Đăng ký vùng này</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            marginTop: 12,
                            borderBottomWidth: 0.3,
                            paddingBottom: 10,
                            borderColor: '#9B9D9D',
                        }}>
                            <Text >Bộ lọc: </Text>
                            <TouchableOpacity
                                style={{}}
                                onPress={() => this.setState({ modalSearchFilterVisible: true })}
                            >
                                {this.state.txtFilterResult
                                    ? <Text style={{ color: '#9B9D9D', width: width * 0.8 }}>{this.state.txtFilterResult}</Text>
                                    : <Ionicons style={styles.searchFilterIcon} name='ios-funnel'></Ionicons>
                                }

                            </TouchableOpacity>

                        </View>

                        <FlatList
                            //onScroll={this._onScroll}
                            ref='searchresult'

                            refreshing={this.state.refreshFlatlist}
                            // onRefresh={() => { this._refreshRoomBox() }}

                            onEndReachedThreshold={0.2}
                            onEndReached={() => {
                                //alert("refreshing")
                                // this._getRoomByFilter(false);

                            }}


                            data={roomBox}
                            renderItem={({ item }) =>
                                <TouchableOpacity
                                    style={styles.searchCardImage}
                                    onPress={() => {
                                        this.props.navigation.navigate('RoomDetailScreen', { item });
                                    }}
                                >
                                    <View style={styles.searchCard}>
                                        <Image
                                            style={styles.searchCardImage}
                                            source={{ uri: item.Title }} />

                                        <View style={styles.searchCardTextBox}>
                                            <Text style={styles.searchCardAddress}>{item.Address}</Text>
                                            <Text style={styles.searchCardPostDate}>Ngày đăng: {item.UpdatedDate}</Text>
                                            <View style={styles.searchCardPriceBox}>
                                                {/* <Text style={styles.searchCardPrice}>Giá: {item.Price} đ</Text> */}
                                                <TextMask
                                                    style={{ flex: 1, }}
                                                    value={item.Price}
                                                    type={'money'}
                                                    options={{ suffixUnit: ' đ', precision: 0, unit: ' ', separator: ' ' }}
                                                />
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                                                    {/* {

                                                        this.state.roomCategory.map((y, i) => {
                                                            return (
                                                                y.ID == item.CategoryID &&
                                                                <Text
                                                                    style={{}}
                                                                    key={i}>{y.CatName}:  {item.Acreage} m</Text>
                                                                // : null
                                                            )
                                                        })
                                                    } */}
                                                    <Text>{item.Acreage} m</Text>
                                                    <Text style={{ fontSize: 8, marginBottom: 5 }}>2</Text>
                                                </View>
                                                <Ionicons style={styles.searCardDistanceIcon} name='md-pin' >  {item.Distance} km</Ionicons>
                                                {/* <Text>3 km</Text> */}
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            }
                            keyExtractor={item => item.ID}
                        />

                    </View>

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

                                <FormLabel style={{ marginBottom: 20 }}>Giá: {this.state.multiSliderPriceValue[0]} - {this.state.multiSliderPriceValue[1]} triệu đồng</FormLabel>
                                <MultiSlider
                                    values={[this.state.multiSliderPriceValue[0], this.state.multiSliderPriceValue[1]]}
                                    // sliderLength={250}
                                    onValuesChange={this._multiSliderPriceValuesChange}
                                    min={1}
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

                                <FormLabel style={{ marginBottom: 20, marginTop: 10, }}>Diện tích: {this.state.multiSliderAreaValue[0]} - {this.state.multiSliderAreaValue[1]} mét vuông</FormLabel>
                                <MultiSlider
                                    values={[this.state.multiSliderAreaValue[0], this.state.multiSliderAreaValue[1]]}
                                    //  sliderLength={250}
                                    onValuesChange={this._multiSliderAreaValuesChange}
                                    min={20}
                                    max={200}
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
                                                })
                                                this.setState({ modalSearchFilterVisible: false });
                                                await this._getRoomByFilter();
                                                this.fitAllMarkers();
                                            }}
                                        />
                                        :
                                        <Button
                                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                                            onPress={() => {
                                                this.setState({ modalSearchFilterVisible: false })
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
                                            this.fitAllMarkers();
                                        }}
                                    />


                                </View>
                            </View>

                        </View>
                    </Modal>


                </ScrollView>

                {/* Popup Searching */}
                <PopupDialog
                    ref={(popupSearching) => { this.popupSearching = popupSearching; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogStyle={{ marginBottom: 100, width: width * 0.9, height: height * 0.6, justifyContent: 'center', padding: 20 }}
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

                            this.setState({
                                searchingMaker: {
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                },
                                isSearching: true,
                            })

                            {/* currentMaker = {
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                            } */}
                            this.map.animateToCoordinate(this.state.searchingMaker, 1000)
                            this._getRoomByFilter()
                            this.popupSearching.dismiss();
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
    searchCardImage: {
        flex: 3,
        borderRadius: 5,
    },
    searchCardAddress: {
        flex: 2,
        fontSize: 15,
    },
    searchCard: {
        flex: 1,
        flexDirection: 'row',
        height: 100,
        // borderWidth: 1,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 0.3,
        borderColor: '#9B9D9D',
    },

    searchFilterIcon: {
        paddingTop: 5,
        paddingLeft: 22,
        textAlign: 'center',
    },
    searchRadiusPicker: {
        flex: 1,
        marginTop: -16
    },
    searchRadiusBox: {
        flexDirection: 'row',
    },

    searchRoolResultBox: {
        flex: 1,
        // height: 400,
        backgroundColor: '#fff',
        // position: 'absolute',
        opacity: 0.8,
        // marginTop: -70,
        padding: 10,
        borderTopWidth: 2,
        borderColor: 'white',
    },
    searchMapView: {
        alignSelf: 'stretch',
        // height: height * 0.3,
        height: 100,
    },
    container: {
        height: height * 0.5,
        backgroundColor: '#fff',
        marginTop: -25,
    },
});