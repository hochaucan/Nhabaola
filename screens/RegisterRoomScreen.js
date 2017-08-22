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
import { Constants, MapView } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { users } from '../components/examples/data';
import ModalDropdown from 'react-native-modal-dropdown';

var { height, width } = Dimensions.get('window');

export default class SearchScreen extends React.Component {

    static navigationOptions = {
        // title: 'Links',
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            mapRegion: { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 },
            searchResultData: users,
            modalVisible: false,
            age: 18,

        }
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

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.registerRoomFilterBox}>
                    <View style={styles.searchRadiusBox}>
                        <Text style={styles.registerRoomTitleText}>Bạn đã đắng ký vùng này</Text>
                    </View>
                    <View style={styles.searchFilterBox}>
                        <Text style={styles.registerRoomFilterText}>Bán kính 4 km. Giá từ 2 triệu đến 5 triệu. Diện tích từ 60m2 đến 100m2</Text>
                    </View>
                </View>
                <ScrollView style={styles.container}>

                    <MapView
                        style={styles.searchMapView}

                        region={this.state.mapRegion}
                        onRegionChange={this._handleMapRegionChange}
                    />
                    <View style={styles.searchRoolResultBox}>

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
            </View>
        );
    }
}

const styles = StyleSheet.create({
    registerRoomFilterText: {
        width: width,
        textAlign: 'center',
        fontSize: 13,
    },
    registerRoomTitleText: {
        fontSize: 17,
        width: width,
        textAlign: 'center',
        color: '#73aa2a',
    },
    registerRoomFilterBox: {
        // padding: 10,
        position: 'absolute',
        zIndex: 15,
        backgroundColor: '#fff',
        opacity: 0.7,
        width: width,
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
        padding: 10,
        paddingBottom: 0,
    },
    searchFilterBox: {
        padding: 10,
    },
    searchRoolResultBox: {
        flex: 1,
        // height: 400,
        backgroundColor: '#fff',
        // position: 'absolute',
        opacity: 0.8,
        marginTop: -70,
        padding: 10,
        borderTopWidth: 2,
        borderColor: 'white',
    },
    searchMapView: {
        alignSelf: 'stretch',
        height: height * 0.6,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
