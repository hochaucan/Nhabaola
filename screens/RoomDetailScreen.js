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


var { height, width } = Dimensions.get('window');
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

    state = {
        mapRegion: { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 },

    };


    constructor(props) {
        super(props);
        this.state = {
            starCount: 3.5,
        }
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

    render() {
        //const { picture, name, email, phone, login, dob, location } = this.props.navigation.state.params;
        const { item } = this.props.navigation.state.params;
        var images = item.Images.replace('|', '').split('|');
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



                                {/* <Image
                                    style={styles.cardImage}
                                    source={{ uri: item.Title }} />
                                <Image
                                    style={styles.cardImage}
                                    source={{ uri: item.Title }} />

                                <Image
                                    style={styles.cardImage}
                                    source={{ uri: item.Title }} /> */}


                            </Swiper>




                        </View>
                        <View style={styles.cardDesBox}>
                            <Text style={styles.cardDesText}>
                                {/* Although dimensions are available immediately, they may change (e.g due to device rotation) so any rendering logic or styles that depend on these constants should try to */}
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
                                            message: 'Ho Chau Can',
                                            url: 'http://bam.tech',
                                            title: 'Wow, did you see that?'
                                        }, {
                                                // Android only:
                                                dialogTitle: 'Share BAM goodness',
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



                    {/* <View style={styles.cardMapBar}>
                    <Text style={styles.cardMapBarText} >Bản đồ</Text>
                </View> */}
                    <View style={styles.cardMapViewBox}>
                        <MapView
                            style={styles.CardMapView}
                            region={this.state.mapRegion}
                            onRegionChange={this._handleMapRegionChange}
                        />
                    </View>

                    {/* <View style={styles.cardCommentBar}>
                    <Text style={styles.cardCommentBarText}>Bình luận</Text>
                </View> */}
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        //height: 300,
                        padding: 20,
                        //marginTop: 5,
                    }}>
                        <TextInput
                            style={{
                                flex: 3,
                                borderWidth: 1,
                                borderColor: '#9B9D9D',
                                height: 40,
                                padding: 5,
                                borderRadius: 5,
                            }}
                            placeholder='Bình luận'
                            underlineColorAndroid='transparent'
                        ></TextInput>
                        <TouchableOpacity style={styles.cardCommentSubmit}

                        >
                            <Text style={styles.cardCommentSubmitText}>Gửi</Text>
                        </TouchableOpacity>
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
