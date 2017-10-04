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
    Button,
    Share,
    FlatList,
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, MapView } from 'expo';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import Communications from 'react-native-communications';
import StarRating from 'react-native-star-rating';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { TextInputMask, TextMask } from 'react-native-masked-text';

var { height, width } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

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

    // state = {
    //     mapRegion: { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.0421 },

    // };


    constructor(props) {
        super(props);
        this.state = {
            mapRegion: { latitude: LATITUDE, longitude: LONGITUDE, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA },
            starCount: 3.5,
            comments: [],
        }
    }

    componentWillMount() {
        this._getCommentsAsync();
    }

    componentDidMount() {

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

    _getCommentsAsync = async () => {
        try {
            await fetch("http://nhabaola.vn//api/Comment/FO_Comment_GetAllData", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "PageIndex": "0",
                    "PageCount": "200",
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    //this._saveStorageAsync('FO_Category_GetAllData', JSON.stringify(responseJson.obj))
                    this.setState({
                        comments: responseJson.obj
                    })

                    // {
                    //   this.state.response.map((y) => {
                    //     return (<Text>{y.prnt_usernamez}</Text>);
                    //   })
                    // }
                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }

    render() {
        //const { picture, name, email, phone, login, dob, location } = this.props.navigation.state.params;
        const { item } = this.props.navigation.state.params;
        var images = item.Images.replace('|', '').split('|');


        const roomLocation = {
            latitude: parseFloat(item.Latitude),
            longitude: parseFloat(item.Longitude),
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }


        let roomMaker = {
            latitude: parseFloat(item.Latitude),
            longitude: parseFloat(item.Longitude),
        }

        //alert(JSON.stringify(parseFloat(item.Longitude)))

        return (
            <View style={{ flex: 1 }}>


                <View style={{
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    paddingTop: 20,
                    paddingLeft: 5,
                    paddingBottom: 20,
                    justifyContent: 'center',
                }}>

                    <TouchableOpacity
                        style={{
                            marginRight: 8,
                            justifyContent: 'center',
                            padding: 8,
                        }}
                        onPress={() => this.props.navigation.goBack()}>
                        <Ionicons style={{
                            fontSize: 28,
                            color: '#73aa2a',
                        }}
                            name='md-arrow-back'
                        ></Ionicons>
                    </TouchableOpacity>

                    <View style={styles.cardAvatarBox}>
                        <TouchableOpacity
                            onPress={() => {
                                //alert("item.title")
                                {/* this.props.navigation.navigate('ProfileScreen'); */ }
                            }}
                        >
                            <Image
                                style={styles.cardAvatarImage}
                                source={{ uri: item.AccountAvarta }} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardAvatarTextBox}>
                        <Text style={styles.cardAvatarName}>{item.AccountName}</Text>
                        <TouchableOpacity style={styles.cardAvatarPhoneBox}
                            onPress={() => { Communications.phonecall(item.AccountPhone, true) }}
                        >
                            <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />
                            <Text style={styles.cardAvatarPhone}>: {item.AccountPhone}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView style={styles.container}>

                    <View style={styles.card}>

                        <View
                            style={styles.cardImageBox}
                        >

                            <Swiper
                                horizontal={true}
                                autoplay
                                loop={false}
                                dotColor='#9B9D9D'
                                activeDotColor='#a4d227'
                            >

                                {images.map((y, i) => {
                                    return (
                                        <Image
                                            key={i}
                                            style={styles.cardImage}
                                            source={{ uri: y }} />
                                    )

                                })}
                            </Swiper>



                            <View style={{ flexDirection: 'row', paddingLeft: 20, paddingRight: 20, paddingTop: 5, paddingBottom: 5, marginTop: -50, backgroundColor: '#000', opacity: 0.5 }}>
                                <TextMask
                                    style={{ flex: 1, color: '#fff' }}
                                    value={item.Price}
                                    type={'money'}
                                    options={{ suffixUnit: ' đ', precision: 0, unit: 'Giá:   ', separator: ' ' }}
                                />
                                <Text style={{ flex: 1, textAlign: 'right', color: '#fff' }}>Diện tích:   {item.Acreage} m</Text><Text style={{ fontSize: 8, marginBottom: 5, color: '#fff' }}>2</Text>

                            </View>
                        </View>
                        <View style={styles.cardDesBox}>


                            <Text style={styles.cardDesText}>

                                {item.Description}
                            </Text>
                        </View>
                        <View style={styles.cardBottom}>
                            <View style={styles.cardBottomLeft}>
                                <Text style={styles.cardBottomIconText}>5</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.popupRating.show();
                                    }}
                                >
                                    <Ionicons style={styles.cardBottomIcon} name='ios-star' />
                                </TouchableOpacity>
                                <Text style={styles.cardBottomIconText}>3</Text>
                                <TouchableOpacity >
                                    <Ionicons style={styles.cardBottomIcon} name='ios-chatbubbles' />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardBottomRight}>
                                <TouchableOpacity >
                                    <Ionicons style={styles.cardBottomIcon} name='ios-thumbs-up' />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        Share.share({
                                            message: item.Description,
                                            url: item.Title,
                                            title: 'Chia sẻ Nhà Bao La'
                                        }, {
                                                // Android only:
                                                dialogTitle: 'Nhà Bao La',
                                                // iOS only:
                                                excludedActivityTypes: [
                                                    'com.apple.UIKit.activity.PostToTwitter'
                                                ]
                                            })
                                    }}
                                >
                                    <Ionicons style={styles.cardBottomIcon} name='md-share' />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Ionicons style={styles.cardBottomIconRightEnd} name='md-flag' />
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>



                    <View style={styles.cardMapViewBox}>
                        <Text style={{ marginBottom: 5 }}>Địa chỉ:  {item.Address}</Text>

                        <MapView
                            style={styles.CardMapView}
                            region={roomLocation}
                            onRegionChange={this._handleMapRegionChange}
                        >

                            <MapView.Marker
                                coordinate={roomMaker}
                                title='Im here'
                                description='Home'
                            >

                            </MapView.Marker>
                        </MapView>
                    </View>

                    {/* <View style={styles.cardCommentBar}>
                    <Text style={styles.cardCommentBarText}>Bình luận</Text>
                </View> */}
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
                            placeholder='Bình luận'
                            underlineColorAndroid='transparent'
                        ></TextInput>
                        <TouchableOpacity style={styles.cardCommentSubmit}
                            onPress={async () => {
                                // await this._getCommentsAsync();
                                alert(JSON.stringify(this.state.comments))
                            }}
                        >
                            <Text style={styles.cardCommentSubmitText}>Gửi</Text>
                        </TouchableOpacity>
                    </View>
                    {/* COMMENTS */}
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
                                <View style={{ flexDirection: 'row', marginBottom: 13 }}>
                                    <View style={{ flex: 2 }}>
                                        <Image
                                            style={{ width: 40, height: 40, borderRadius: 100, }}
                                            //source={{ uri: item.UserID }} 
                                            source={require('../images/app-icon.png')}
                                        />
                                    </View>
                                    <View style={{ flex: 8 }}>
                                        <Text style={{}}>Tên: {item.UserID}</Text>
                                        <Text style={{ color: '#9B9D9D' }}>{item.CreatedDate}</Text>
                                        <Text>{item.Content}</Text>
                                    </View>

                                </View>
                            }
                            keyExtractor={item => item.ID}
                        />
                    </View>
                </ScrollView>
                {/* The view that will animate to match the keyboards height */}
                <KeyboardSpacer />

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
                        selectedStar={(rating) => { this._starRatingPress(rating) }}
                    />
                </PopupDialog>
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
    CardMapView: {
        alignSelf: 'stretch',
        height: 170,
        // marginTop: 20
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
    container: {
        flex: 1,
        // paddingTop: 5,
        backgroundColor: '#fff',
    },

    card: {
        flex: 1,
        height: height * 0.8, //500,
        // borderBottomWidth: 0.5,
        borderColor: '#d6d7da',
        padding: 0,
        flexDirection: 'column',
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
        flex: 4,
        paddingLeft: 20,
    },
    cardAvatarName: {
        fontSize: 17,
    },
    cardAvatarPhoneBox: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 5,
    },
    cardAvatarPhoneIcon: {
        color: '#7E7E7E',
        fontSize: 15,
    },
    cardAvatarPhone: {
        color: '#7E7E7E',
        fontSize: 13,
        paddingLeft: 8,
    },
    cardImageBox: {
        flex: 6,
        // paddingLeft: 20,
        // paddingRight: 20,
        // borderWidth: 1,
        // borderColor: 'blue',
    },
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
