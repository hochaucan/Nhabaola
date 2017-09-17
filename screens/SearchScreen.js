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

} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, Location, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons'; import ModalDropdown from 'react-native-modal-dropdown';
import { users } from '../components/examples/data';
import { Button, FormLabel, FormInput, SocialIcon, } from 'react-native-elements'
import MapView from 'react-native-maps';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { GooglePlacesAutocomplete, } from 'react-native-google-places-autocomplete'; // 1.2.12


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
            location: null,
            errorMessage: null,
            markers: [],
            findingHouseMakers: [],
            initialRenderCurrentMaker: true,

            // Searching Filter
            multiSliderPriceValue: [0, 10],
            multiSliderAreaValue: [0, 200],
            txtFilterResult: null,
            selectedBDS: 'Tất cả',

            // Searhing address
            searchingMaker: null,

            watchLocation: null,
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
    };

    _moveToRoomDetail = (user) => {
        this.props.navigation.navigate('RoomDetailScreen', { ...user });
    };


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

        // if (Platform.OS === 'android' && !Constants.isDevice) {
        //     this.setState({
        //         errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
        //     });
        // } else {
        //     this._getLocationAsync();
        // }

        setTimeout(() => this.setState({ hackHeight: height + 1 }), 500);
        setTimeout(() => this.setState({ hackHeight: height * 0.5 }), 1000);
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
        this.setState({ mapRegion: region });

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

            MARKERS = [
                createMarker(-4, this.state.location.coords.latitude, this.state.location.coords.longitude),
                //currentMaker,
                createMarker(1, this.state.location.coords.latitude, this.state.location.coords.longitude),
                createMarker(2, this.state.location.coords.latitude, this.state.location.coords.longitude),
                createMarker(5, this.state.location.coords.latitude, this.state.location.coords.longitude),

            ]

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
                                backgroundColor: '#a4d227', padding: 6, borderRadius: 10, width: 32,
                                height: 32, justifyContent: 'center',
                                alignItems: 'center', shadowColor: "#000000",
                            }}>
                                <Ionicons style={{ fontSize: 25, color: '#fff', textAlign: 'center' }} name='ios-search-outline' />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ height: 40, position: 'absolute', top: height * 0.28, zIndex: 10, right: 15, backgroundColor: 'transparent' }}
                            onPress={() => {
                                this._getLocationAsync();
                                //this.map.animateToCoordinate(currentMaker, 1000);
                            }}
                        >
                            <View style={{ backgroundColor: '#a4d227', padding: 6, borderRadius: 10, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons style={{ fontSize: 25, color: '#fff', textAlign: 'center' }} name='ios-locate-outline' />
                            </View>
                        </TouchableOpacity>


                        <MapView
                            ref={ref => { this.map = ref; }}

                            /* style={{ paddingBottom: this.state.hackHeight, alignSelf: 'stretch', }} */
                            style={{ alignSelf: 'stretch', height: height * 0.4, }}

                            region={this.state.mapRegion}
                            onRegionChange={this._handleMapRegionChange}
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
                                        source={require('../images/nbl-here-icon.png')}
                                        style={{ height: height * 0.07, width: width * 0.07 }}
                                        onLayout={() => {
                                            this.setState({ initialRenderCurrentMaker: false })
                                        }}
                                        key={`${this.state.initialRenderCurrentMaker}`}
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
                            {MARKERS.map((marker, i) => (
                                <MapView.Marker
                                    key={i}
                                    coordinate={marker}
                                /* image={require('../images/nbl-house_icon.png')} */
                                >
                                    <Image
                                        source={require('../assets/images/nbl-house_icon.png')}
                                        style={{ height: height * 0.05, width: width * 0.08 }}
                                        onLayout={() => {
                                            this.setState({ initialRenderCurrentMaker: false })
                                        }}
                                        key={`${this.state.initialRenderCurrentMaker}`}
                                    />
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
                    {/* <Text style={styles.paragraph}>{text}</Text> */}


                    <View style={styles.searchRoolResultBox}>
                        <View style={styles.searchRadiusBox}>
                            <Text >Bán kính: </Text>
                            {Platform.OS === 'ios' ?
                                <ModalDropdown
                                    style={styles.ModalDropdown}
                                    dropdownStyle={styles.dropdownStyle}
                                    textStyle={styles.dropdowntextStyle}
                                    options={['2 km', '4 km', '6 km', '8 km', '10 km']}
                                    defaultIndex={0}
                                    defaultValue='2 km'
                                    onSelect={(idx, value) => this._dropdown_onSelect(idx, value)}
                                >
                                </ModalDropdown>
                                :
                                <Picker
                                    style={styles.searchRadiusPicker}
                                    mode='dropdown'
                                    selectedValue={this.state.language}
                                    onValueChange={(itemValue, itemIndex) => this.setState({ language: itemValue })}>
                                    <Picker.Item label="2 km" value="2" />
                                    <Picker.Item label="4 km" value="4" />
                                    <Picker.Item label="6 km" value="6" />
                                    <Picker.Item label="8 km" value="8" />
                                    <Picker.Item label="10 km" value="10" />
                                </Picker>
                            }
                            <TouchableOpacity
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
                            data={this.state.searchResultData}
                            renderItem={({ item }) =>
                                <TouchableOpacity
                                    style={styles.searchCardImage}
                                    onPress={() => this._moveToRoomDetail(item)}
                                >
                                    <View style={styles.searchCard}>
                                        <Image
                                            style={styles.searchCardImage}
                                            source={{ uri: item.picture.large }} />

                                        <View style={styles.searchCardTextBox}>
                                            <Text style={styles.searchCardAddress}>{item.location.street} {item.location.city}</Text>
                                            <Text style={styles.searchCardPostDate}>Ngày đăng: {item.registered}</Text>
                                            <View style={styles.searchCardPriceBox}>
                                                <Text style={styles.searchCardPrice}>Giá: 2.000.000 đ</Text>
                                                <Ionicons style={styles.searCardDistanceIcon} name='md-pin' >  3 km</Ionicons>
                                                {/* <Text>3 km</Text> */}
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            }
                            keyExtractor={item => item.email}
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
                                <View style={{ flexDirection: 'row', marginBottom: 30, marginLeft: 30, }}>
                                    <FormLabel>Loại bất động sản:</FormLabel>
                                    <ModalDropdown
                                        ref={el => this._dropdownFilter = el}
                                        style={{ paddingTop: 15, width: 100 }}
                                        dropdownStyle={{ padding: 10, }}
                                        textStyle={{}}
                                        options={['Tất cả', 'Nhà trọ', 'Khách sạn', 'Biệt thự', 'Vila', 'Đất thổ cư']}
                                        defaultIndex={0}
                                        defaultValue='Tất cả'
                                        onSelect={(idx, value) => this._dropdownFilter_onSelect(idx, value)}
                                    >
                                    </ModalDropdown>
                                </View>

                                <FormLabel style={{ marginBottom: 20 }}>Giá: {this.state.multiSliderPriceValue[0]} - {this.state.multiSliderPriceValue[1]} triệu đồng</FormLabel>
                                <MultiSlider
                                    values={[this.state.multiSliderPriceValue[0], this.state.multiSliderPriceValue[1]]}
                                    sliderLength={250}
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

                                <FormLabel style={{ marginBottom: 20, marginTop: 10, }}>Diện tích: {this.state.multiSliderAreaValue[0]} - {this.state.multiSliderAreaValue[1]} mét vuông</FormLabel>
                                <MultiSlider
                                    values={[this.state.multiSliderAreaValue[0], this.state.multiSliderAreaValue[1]]}
                                    sliderLength={250}
                                    onValuesChange={this._multiSliderAreaValuesChange}
                                    min={0}
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





                            </View>

                            <View style={{ marginTop: 140, }}>
                                <View style={{ height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 50, }}>

                                    {this.state.txtFilterResult
                                        ?
                                        <Button
                                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                                            title='Xóa lọc'
                                            onPress={() => {
                                                this.setState({
                                                    txtFilterResult: null,
                                                    multiSliderPriceValue: [0, 10],
                                                    multiSliderAreaValue: [0, 200],
                                                })

                                                this.setState({ modalSearchFilterVisible: false })
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
                                        onPress={() => {
                                            this.setState({
                                                txtFilterResult: this.state.selectedBDS + ', ' + this.state.multiSliderPriceValue[0] + '-' + this.state.multiSliderPriceValue[1] + ' triệu đồng, '
                                                + this.state.multiSliderAreaValue[0] + '-' + this.state.multiSliderAreaValue[1] + ' mét vuông',

                                            })

                                            this.setState({ modalSearchFilterVisible: false })
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
                                }
                            })

                            {/* currentMaker = {
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                            } */}
                            this.map.animateToCoordinate(this.state.searchingMaker, 1000)
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
        paddingTop: 3,
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
        flex: 3
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