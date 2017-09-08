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

} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, Location, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons'; import ModalDropdown from 'react-native-modal-dropdown';
import { users } from '../components/examples/data';

import MapView from 'react-native-maps';

var { height, width } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.05;
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

function createMarker(modifier = 1) {
    return {
        latitude: LATITUDE - (SPACE * modifier),
        longitude: LONGITUDE - (SPACE * modifier),
    };
}

const MARKERS = [
    createMarker(),
    createMarker(2),
    createMarker(3),
    createMarker(4),
    createMarker(5),
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
            modalVisible: false,
            age: 18,
            hackHeight: height,
            location: null,
            errorMessage: null,
            markers: [],
            findingHouseMakers: [],

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
            edgePadding: DEFAULT_PADDING,
            animated: true,
        });
    }

    // _fitAllFindingHouseMakers = () => {
    //     this.map.fitToCoordinates(findingHouseMakers, {
    //         edgePadding: DEFAULT_PADDING,
    //         animated: true,
    //     });
    // }

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

    _getCurrentPosition() {
        //  this.refs.map.animateToRegion(this.region, 1000);
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

            // this.setState({
            //     findingHouseMakers: [
            //         currentMaker,
            //         _createTempMarker(1, this.state.location.coords.latitude, this.state.location.coords.longitude),
            //         _createTempMarker(2, this.state.location.coords.latitude, this.state.location.coords.longitude),
            //         _createTempMarker(3, this.state.location.coords.latitude, this.state.location.coords.longitude),

            //     ]
            // })
        }

        return (
            <View>
                <View style={{ height: height * 0.4, }}>

                    {/* <View><Text>{text}</Text></View> */}

                    {this.state.location ?
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

                            <MapView.Marker
                                coordinate={currentMaker}
                                title='Im here'
                                description='Home'
                            /* image={require('../images/nbl-here-icon.png')} */

                            >
                                <Image
                                    source={require('../images/nbl-here-icon.png')}
                                    style={{ height: height * 0.07, width: width * 0.07 }}
                                />
                            </MapView.Marker>

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
                                        source={require('../images/nbl-house_icon3.png')}
                                        style={{ height: height * 0.05, width: width * 0.08 }}
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

                        : null
                    }
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
                        <View style={styles.searchFilterBox}>
                            <Text >Bộ lọc: </Text>
                            <TouchableOpacity
                                onPress={() => this._setModalVisible(true)}
                            >
                                <Ionicons style={styles.searchFilterIcon} name='ios-funnel'></Ionicons>
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
                    <Modal
                        animationType={"slide"}
                        transparent={false}
                        visible={this.state.modalVisible}
                        onRequestClose={() => { alert("Modal has been closed.") }}
                    >
                        <View style={styles.searchFilterModalBox}>
                            <View style={styles.searhFilterSliderBox}>
                                <Text>Giá: </Text>
                                <Slider
                                    step={1}
                                    minimumValue={18}
                                    maximumValue={71}
                                    value={this.state.age}
                                    onValueChange={val => this.setState({ age: val })}
                                    onSlidingComplete={val => this.getVal(val)}
                                />
                                <Text>{this.state.age}</Text>
                                <Text style={{ marginTop: 20, }}>Diện tích: </Text>
                                <Slider

                                    step={2}
                                    minimumValue={18}
                                    maximumValue={71}
                                    value={this.state.age}
                                    onValueChange={val => this.setState({ age: val })}
                                    onSlidingComplete={val => this.getVal(val)}
                                />
                                <Text>{this.state.age}</Text>
                            </View>
                            <View style={styles.searchFilterButtonBox} >

                                <TouchableOpacity
                                    style={styles.searchFilterButtonCancel}
                                    onPress={() => {
                                        this._setModalVisible(!this.state.modalVisible)
                                    }}>
                                    <Text style={styles.searchFilterButtonText}>Hủy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.searchFilterButtonSubmit}
                                    onPress={() => {
                                        this._setModalVisible(!this.state.modalVisible)
                                    }}>
                                    <Text style={styles.searchFilterButtonText}>Áp dụng</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </Modal>
                </ScrollView>
            </View >
        );
    }
}

const styles = StyleSheet.create({
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
    searchFilterModalBox: {
        flex: 1,
        paddingTop: 30,
    },
    searhFilterSliderBox: {
        flex: 1,
        padding: 10,
    },
    searchFilterButtonBox: {
        flex: 1,
        flexDirection: 'row',
        borderColor: 'black',
        justifyContent: 'flex-start',
    },
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
    searchFilterBox: {
        flexDirection: 'row',
        // marginBottom: 10,
        marginTop: 10,
        borderBottomWidth: 0.3,
        paddingBottom: 10,
        borderColor: '#9B9D9D',
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
        // paddingTop: 15,
        backgroundColor: '#fff',
    },
});
