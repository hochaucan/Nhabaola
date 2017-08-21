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
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, MapView } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { users } from '../components/examples/data';


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
        }
    }

    // state = {
    //     mapRegion: { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }
    // };

    _handleMapRegionChange = mapRegion => {
        this.setState({ mapRegion });
    };

    _moveToRoomDetail = (user) => {
        this.props.navigation.navigate('RoomDetailScreen', { ...user });
    };

    _moveToFilterScreen() {
        alert("can");
    }

    render() {
        return (
            
            <ScrollView style={styles.container}>
                <MapView
                    style={styles.searchMapView}

                    region={this.state.mapRegion}
                    onRegionChange={this._handleMapRegionChange}
                />
                <View style={styles.searchRoolResultBox}>
                    <View style={styles.searchRadiusBox}>
                        <Text >Bán kính: </Text>
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
                        <TouchableOpacity>
                            <Text style={{ flex: 3, textAlign: 'right', color: '#73aa2a' }}>Đăng ký vùng này</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.searchFilterBox}>
                        <Text >Bộ lọc: </Text>
                        <TouchableOpacity
                            onPress={() => this._moveToFilterScreen()}
                        >
                            <Ionicons style={styles.searchFilterIcon} name='ios-funnel'></Ionicons>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        //onScroll={this._onScroll}
                        ref='searchresult'
                        data={this.state.searchResultData}
                        renderItem={({ item }) =>

                            <View style={styles.searchCard}>
                                <TouchableOpacity
                                    style={styles.searchCardImage}
                                    onPress={() => this._moveToRoomDetail(item)}
                                >
                                    <Image
                                        style={styles.searchCardImage}
                                        source={{ uri: item.picture.large }} />
                                </TouchableOpacity>
                                <Text style={styles.searchCardText}>{item.phone}</Text>
                            </View>

                        }
                        keyExtractor={item => item.email}
                    />

                </View>



            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    searchCardImage: {
        flex: 3
    },
    searchCardText: {
        flex: 9,
        paddingLeft: 10,
    },
    searchCard: {
        flex: 1,
        flexDirection: 'row',
        height: 100,
        // borderWidth: 1,
        paddingTop: 10,
    },

    searchFilterIcon: {
        paddingTop: 5,
        paddingLeft: 25,
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
        marginBottom: 10,
    },
    searchRoolResultBox: {
        flex: 1,
        // height: 400,
        backgroundColor: '#fff',
        // position: 'absolute',
        opacity: 0.9,
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
        paddingTop: 15,
        backgroundColor: '#fff',
    },
});
