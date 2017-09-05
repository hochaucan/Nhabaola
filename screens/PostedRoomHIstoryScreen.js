import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
    Animated,
    Modal,
    FlatList,
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import { users } from '../components/examples/data';

var { height, width } = Dimensions.get('window');
export default class PostedRoomHIstoryScreen extends React.Component {
    static navigationOptions = {
        // title: 'Links',
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            // Posted Room History
            postedRoomHistoryData: users,
        }
    }
    _moveToRoomDetail = (user) => {
        this.props.navigation.navigate('RoomDetailScreen', { ...user });
    };
    render() {
        return (
            <View style={styles.container}>

                <View style={{ flexDirection: 'row', padding: 20, }}>
                    <TouchableOpacity
                        style={{}}
                        onPress={() => this.props.navigation.goBack()}>
                        <Ionicons style={{ fontSize: 28, color: '#a4d227', }} name='md-arrow-back'></Ionicons>
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 20, color: '#73aa2a', fontSize: 20, justifyContent: 'center' }}>Tin Bạn Đã Đăng</Text>
                </View>
                <ScrollView>
                    <View style={styles.searchRoolResultBox}>
                        <FlatList
                            //onScroll={this._onScroll}
                            ref='refPostedRoomHistory'
                            data={this.state.postedRoomHistoryData}
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
                    {/* <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
                            <Button
                                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                                raised={false}
                                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                                title='Hủy'
                                onPress={() => { this.setState({ modalPostedRoomHistory: false }) }}
                            />

                            <Button
                                buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                                raised={false}
                                icon={{ name: 'md-checkmark', type: 'ionicon' }}
                                title='Đồng ý'
                                onPress={() => {
                                    this._updateAccount();
                                }}
                            />
                        </View> */}
                </ScrollView>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    searchCardImage: {
        flex: 3
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
    searchCardAddress: {
        flex: 2,
        fontSize: 15,
    },
    searchCardPriceBox: {
        flexDirection: 'row',
    },
    searchCardPrice: {
        flex: 2,
        color: '#7E7E7E',
    },

    searCardDistanceIcon: {
        flex: 1,
        // fontSize: 14,
        paddingTop: 3,
    },




    profileMenuItemText: {
        fontSize: 16,
        height: 20,
    },
    profileMenuItem: {
        paddingBottom: 20,
        padding: 10,
        paddingLeft: 15,

    },
    profileMenuItemSeparator: {
        height: 0.7,
        // width: width,
        backgroundColor: '#a4d227',
        marginBottom: 10,
    },
    profileMenuBox: {
        flex: 1,
        marginTop: 25,
    },
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
    backScreenBox: {
        justifyContent: 'center',
        marginRight: 10,
    },

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
    cardCommentInput: {
        flex: 3,
        borderWidth: 1,
        borderColor: '#8B8E8E',
        height: 40,
        padding: 5,
        borderRadius: 5,
    },
    cardMapViewBox: {
        padding: 20,
    },
    CardMapView: {
        alignSelf: 'stretch',
        height: 170,
        // marginTop: 20
    },
    cardCommentBox: {
        flex: 1,
        flexDirection: 'row',
        height: 300,
        padding: 20,
        marginTop: 5,
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
        height: 80,
        // borderBottomWidth: 0.5,
        borderColor: '#d6d7da',
        padding: 0,
        flexDirection: 'column',
    },
    cardHeader: {
        // flex: 2,
        flexDirection: 'row',
        padding: 10,
        // borderBottomWidth: 0.7,
        // borderColor: '#a4d227',
    },
    cardAvatarBox: {
        // flex: 1
    },
    cardAvatarImage: {
        borderRadius: Platform.OS === 'ios' ? 23 : 50,
        height: 60,
        width: 60,
    },
    cardAvatarTextBox: {
        flex: 4,
        paddingLeft: 20,
    },
    cardAvatarName: {
        fontSize: 15,
    },
    cardAvatarAddress: {
        color: '#7E7E7E',
        fontSize: 10,
        paddingTop: 3,
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
        paddingLeft: 20,
        paddingRight: 20,
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