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
    AsyncStorage,
    ToastAndroid,
    Alert,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
// import { users } from '../components/examples/data';
import { TextInputMask, TextMask } from 'react-native-masked-text';
import DatePicker from 'react-native-datepicker'
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import deleteImageAsync from '../api/deleteImageAsync'
import convertAmountToWording from '../api/convertAmountToWording'
import globalVariable from '../components/Global'
import enTranslation from '../components/en.json';
import zhTranslation from '../components/zh.json';
import viTranslation from '../components/vi.json';
import { setLocalization, translate, Translate } from 'react-native-translate';

var { height, width } = Dimensions.get('window');

var today = new Date();
var dd = today.getDate() == 1 ? '01' : today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
var minDate = yyyy + '-' + mm + '-' + dd //== '1' ? '01' : dd

// var newdate = new Date(today);
// newdate.setDate(newdate.getDate() + 1);
// var dd2 = newdate.getDate();
// var mm2 = newdate.getMonth() + 1;
// var yyyy2 = newdate.getFullYear();
// var topDate = yyyy2 + '-' + mm2 + '-' + dd2

const roomBox = [];
export default class PinnedRoomScreen extends React.Component {
    static navigationOptions = {
        title: 'Tin đánh dấu',
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            // Posted Room History
            postedRoomHistoryData: [],//users,
            refresh: false,
            page: 1,
            roomPageIndex: 0,
            roomPageCount: 10,
            profile: null,
            roomCategory: [],
            refreshScreen: false,
            // fromDate: minDate,
            // toDate: topDate,
            searchFlatlistKey: '',
            flatListIsEnd: false,
            isVietnamease: false,
            isEnglish: false,
            isChinease: false,
        }
    }

    componentWillMount() {
        this._getLanguageFromStorageAsync();
        roomBox = [];
        this._getProfileFromStorageAsync();
        this._getCategoryFromStorageAsync();

    }



    componentWillUnmount() {

    }

    componentDidMount() {
        //alert(JSON.stringify(this.props.navigation.state))
    }

    // _moveToRoomDetail = (user) => {
    //     this.props.navigation.navigate('RoomDetailScreen', { ...user });
    // };

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

        } catch (e) {
            console.log(e);
        }
    }

    onRefreshScreen = data => {
        this.setState(data);
        this._getRoomBoxByUserAsync(true)
    }

    _getProfileFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('FO_Account_Login');

            if (value !== null) {
                this.setState({
                    profile: JSON.parse(value)
                })
                this._getRoomBoxByUserAsync(true);
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

    _getRoomBoxByUserAsync = async (isNew) => {
        await this.setState({ refresh: true })

        if (!isNew) { // Loading more page 
            this.setState((prevState, props) => ({
                page: prevState.page + 1,
            }));
        }
        else { // Refresh page
            roomBox = [];
            this.setState({ page: 1, flatListIsEnd: false })
        }

        this.setState({ // Calculate page index
            roomPageIndex: (this.state.page - 1) * this.state.roomPageCount
        })

        try {
            await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_GetAllDataByPinned", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "UserName": this.state.profile.ID,
                    "SessionKey": this.state.profile.UpdatedBy,
                    "PageIndex": this.state.roomPageIndex,
                    "PageCount": this.state.roomPageCount
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    responseJson.obj.map((y) => {
                        roomBox.push(y);

                    })
                    this.setState({ refresh: false })

                    // End Flatlist
                    if (JSON.stringify(responseJson.obj.length) == '0') {
                        this.setState({ flatListIsEnd: true, })
                    }
                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }


    _deletePinnedByUserAsync = async (pinnedID) => {

        // alert(pinnedID + '  '+ this.state.profile.ID)
        // return;

        this.popupLoadingIndicator.show();

        try {
            await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_Pinned_Del", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({

                    "ID": pinnedID,
                    "CreatedBy": this.state.profile.ID,
                    "UpdatedBy": this.state.profile.UpdatedBy,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    this.popupLoadingIndicator.dismiss();

                    if (JSON.stringify(responseJson.ErrorCode) === "0") { // Delete successful
                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity(translate("Delete successfully"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert(translate("Delete successfully"));
                        }

                        this._getRoomBoxByUserAsync(true);


                    } else { // Delete Error
                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
                        }
                    }

                    // responseJson.obj.map((y) => {
                    //     roomBox.push(y);

                    // })
                    // this.setState({ refresh: false })

                    // // End Flatlist
                    // if (JSON.stringify(responseJson.obj.length) == '0') {
                    //     this.setState({ flatListIsEnd: true, })
                    // }
                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }


    _refreshRoomBox() {
        this._getRoomBoxByUserAsync(true);
    }

    _shouldItemUpdate = (prev, next) => {
        return prev.item !== next.item;
    }

    // _updateRoomAsync = async (room) => {
    //     // // Calculate Images fields
    //     // var isNotify = !room.Images.split('|')[1]
    //     // var images = globalVariable.PHONE_TOKEN + '|' + isNotify + room.Images.substring(room.Images.indexOf("http") - 1)

    //     //this._getRoomBoxByUserAsync(true)
    //     //alert(images)
    //     // return;

    //     //Loading
    //     // this.popupLoadingIndicator.show();

    //     // Calculate Images fields
    //     var isNotify = room.Images.split('|')[1] == 'true' ? 'false' : 'true';
    //     var images = globalVariable.PHONE_TOKEN + '|' + isNotify + room.Images.substring(room.Images.indexOf("http") - 1)
    //     // alert(images)
    //     try {
    //         await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_Edit", {
    //             method: 'POST',
    //             headers: {
    //                 Accept: 'application/json',
    //                 'Content-Type': 'application/json',
    //             },

    //             body: JSON.stringify({
    //                 "ID": room.ID,
    //                 "Title": room.Title,
    //                 "Images": images,
    //                 "CategoryID": room.CategoryID,
    //                 "Address": room.Address,
    //                 "Longitude": room.Longitude,
    //                 "Latitude": room.Latitude,
    //                 "Description": room.Description,
    //                 "Price": room.Price.replace('.', '').replace('.', '').replace('.', '').replace('.', ''),
    //                 "Acreage": room.Acreage,
    //                 "Toilet": "",
    //                 "Bedroom": "",
    //                 "AirConditioner": "",
    //                 "ContactPhone": room.ContactPhone,
    //                 "FromDate": minDate,//room.FromDate,
    //                 "ToDate": room.ToDate,
    //                 "IsTop": "true",
    //                 "IsPinned": "false",
    //                 "IsHighlight": room.IsHighlight,
    //                 "HighlightFromDate": minDate,//room.HighlightFromDate,
    //                 "HighlightToDate": room.HighlightToDate,
    //                 "IsActive": "true",
    //                 "CreatedBy": this.state.profile.ID,
    //                 "UpdatedBy": this.state.profile.UpdatedBy,
    //             }),
    //         })
    //             .then((response) => response.json())
    //             .then((responseJson) => {

    //                 //alert(JSON.stringify(responseJson))

    //                 if (JSON.stringify(responseJson.ErrorCode) === "11") {//Update successful

    //                     //Refresh Room
    //                     this._getRoomBoxByUserAsync(true)

    //                     // if (Platform.OS === 'android') {
    //                     //     ToastAndroid.showWithGravity('Đăng ký nhận thông báo thành công!', ToastAndroid.SHORT, ToastAndroid.TOP);
    //                     // }
    //                     // else {
    //                     //     Alert.alert('Đăng ký nhận thông báo thành công!');
    //                     // }

    //                 } else { // Lỗi

    //                     if (Platform.OS === 'android') {
    //                         ToastAndroid.showWithGravity('Lỗi, vui lòng liên hệ Admin trong mục Giúp Đỡ!', ToastAndroid.SHORT, ToastAndroid.TOP);
    //                     }
    //                     else {
    //                         Alert.alert('Thông báo', 'Lỗi, vui lòng liên hệ Admin trong mục Giúp Đỡ!');
    //                     }
    //                 }
    //                 // if (JSON.stringify(responseJson.ErrorCode) === "3") {

    //                 //     if (Platform.OS === 'android') {
    //                 //         ToastAndroid.showWithGravity('Ngày bắt đầu hiệu lực phải lớn hơn ngày hiện tại', ToastAndroid.SHORT, ToastAndroid.CENTER);
    //                 //     }
    //                 //     else {
    //                 //         Alert.alert('Ngày bắt đầu hiệu lực phải lớn hơn ngày hiện tại');
    //                 //     }
    //                 //     //this._getRoomBoxByUserAsync(true);
    //                 // }


    //                 //alert(JSON.stringify(responseJson))

    //                 //this.props.navigation.navigate('Home');
    //                 // HomeScreen.refreshRoomBoxAfterPost();
    //                 //this.props.navigation.state.params.onSelect({ selected: true });
    //                 //this.props.navigation.goBack();
    //                 //  this.props.navigation.state.params._getWalletAsync();
    //                 // this.props.navigation.state.params.onRefreshScreen({ refreshScreen: true });


    //                 this.popupLoadingIndicator.dismiss();

    //             }).
    //             catch((error) => { console.log(error) });
    //     } catch (error) {
    //         console.log(error)
    //     }


    // }


    render() {
        return (
            <View style={styles.container}>


                <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#a4d227', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => {
                            this.props.navigation.goBack()
                            this.props.navigation.state.params.onRefreshScreen();
                        }}>
                        <Ionicons style={{ fontSize: 28, color: '#fff', paddingTop: 2 }} name='ios-arrow-back'></Ionicons>

                        <Text style={{
                            marginLeft: 10, color: '#fff',
                            fontSize: responsiveFontSize(2), //justifyContent: 'center'
                        }}>{translate("Pinned")}</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={{}}
                        onPress={() => {
                            this.props.navigation.goBack()
                            this.props.navigation.state.params.onRefreshScreen();
                            // this.props.navigation.state.params.onRefreshScreen({ refreshScreen: true });
                            //this.props.navigation.state.params._getWalletAsync();

                        }}>
                        <Ionicons style={{ fontSize: 28, color: '#fff', }} name='md-arrow-back'></Ionicons>
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 20, color: '#fff', fontSize: responsiveFontSize(2.2), justifyContent: 'center' }}>{translate("Pinned")}</Text> */}
                </View>

                <View style={styles.searchRoolResultBox}>

                    {/* Search Flatlist */}
                    <View style={{
                        paddingBottom: 5, flexDirection: 'row',
                        alignItems: 'center',
                        //justifyContent: 'space-between'
                    }}>
                        <Ionicons style={{ flex: 1, fontSize: 32, color: '#73aa2a' }} name='ios-search-outline' />
                        <FormInput
                            ref='searchFlatlistInput'
                            returnKeyType={"done"}
                            onSubmitEditing={(event) => {
                                //this._postRoomAsync();
                                Keyboard.dismiss();
                            }}
                            onFocus={(event) => {
                                //this._scrollToInput(event.target)
                            }}
                            containerStyle={{
                                flex: 12,
                                borderWidth: 0.5, borderColor: '#73aa2a', borderRadius: 10,
                                marginBottom: 10,
                                height: 35,

                            }}
                            inputStyle={{
                                paddingLeft: 10,
                                paddingTop: Platform.OS == 'ios' ? 5 : 0,
                                paddingBottom: Platform.OS == 'ios' ? 5 : 10,
                                height: 30,
                                // paddingRight: Platform.OS == 'ios' ? 50 : 0
                            }}
                            placeholder='Tìm kiếm...'
                            //multiline={false}
                            //numberOfLines={5}
                            //keyboardType='default'
                            autoCapitalize='sentences'
                            //maxLength={300}
                            clearButtonMode='always'
                            underlineColorAndroid='#fff'
                            blurOnSubmit={false}
                            value={this.state.searchFlatlistKey}
                            onChangeText={(searchFlatlistKey) => this.setState({ searchFlatlistKey })}
                        />
                    </View>
                    <FlatList
                        //onScroll={this._onScroll}
                        //ref='refPostedRoomHistory'
                        refreshing={this.state.refresh}
                        onRefresh={() => { this._refreshRoomBox() }}
                        keyboardShouldPersistTaps="always"
                        removeClippedSubviews={true}
                        initialNumToRender={2}
                        shouldItemUpdate={this._shouldItemUpdate}
                        onEndReachedThreshold={0.2}
                        onEndReached={() => {
                            if (this.state.flatListIsEnd == false) {
                                this._getRoomBoxByUserAsync(false);
                            }
                        }}
                        data={roomBox.filter(item => item.Address.includes(this.state.searchFlatlistKey))}
                        renderItem={({ item }) =>
                            <View style={{
                                borderBottomWidth: 0.3,
                                borderColor: '#9B9D9D',
                            }}>


                                <TouchableOpacity
                                    style={styles.searchCardImage}
                                    onPress={() => this.props.navigation.navigate('RoomDetailScreen', { item })}
                                >
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        height: 100,
                                        // borderWidth: 1,
                                        paddingTop: 10,
                                        paddingBottom: 10,
                                        // borderBottomWidth: 0.3,
                                        //borderColor: '#9B9D9D',
                                    }}>
                                        <Image
                                            style={{ flex: 3, borderRadius: 5 }}
                                            source={{ uri: item.Title }} />

                                        <View style={styles.searchCardTextBox}>
                                            <Text style={{
                                                flex: 2,
                                                fontSize: responsiveFontSize(1.8),
                                            }}>{item.Address}</Text>
                                            {/* {
                                                this.state.roomCategory.map((y, i) => {
                                                    return (
                                                        y.ID == item.CategoryID &&
                                                        <Text
                                                            style={{ flex: 1, fontSize: 15, textAlign: 'right', color: '#fff', }}
                                                            key={i}>{y.CatName}:  {item.Acreage} m</Text>
                                                        // : null
                                                    )
                                                })
                                            } */}
                                            <Text style={styles.searchCardPostDate}>{translate("Registered Date")}: {item.UpdatedDate}</Text>
                                            <View style={styles.searchCardPriceBox}>


                                                <Text style={{ flex: 1, fontSize: responsiveFontSize(1.8) }}>{convertAmountToWording(item.Price)}</Text>

                                                {/* Category */}
                                                {

                                                    this.state.roomCategory.map((y, i) => {
                                                        return (
                                                            // <Text>{y.ID} {item.CategoryID}</Text>
                                                            y.ID == item.CategoryID &&
                                                            <Text
                                                                style={{ flex: 1, fontSize: responsiveFontSize(1.8), textAlign: 'center', color: '#73aa2a' }}
                                                                key={i}>{this.state.isVietnamease ? y.CatName : this.state.isEnglish ? y.CatImg.split('|')[0] : y.CatImg.split('|')[1]}</Text>
                                                        )
                                                    })
                                                }

                                                {!item.IsActive &&
                                                    <Text style={{
                                                        flex: 1, fontSize: responsiveFontSize(1.8),
                                                        color: 'red', textAlign: 'center'
                                                    }}>{translate("Expired")}</Text>
                                                }

                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* Register Comment Notification */}
                                {/* {item.IsActive &&
                                    <TouchableOpacity
                                        style={{ marginBottom: 3, marginTop: 3, paddingRight: 5, flexDirection: 'row', alignItems: "center", justifyContent: 'space-between' }}
                                        onPress={() => {
                                            if (item.Images.split('|')[1] == 'true') {

                                                Alert.alert(
                                                    'Thông báo',
                                                    'Bạn muốn TẮT thông báo Bình Luận cho Tin này?',
                                                    [
                                                        {
                                                            text: 'Hủy', onPress: () => {
                                                                // this._deleteRoomBoxAsync(item);
                                                            }
                                                        },
                                                        {
                                                            text: 'Đồng ý', onPress: () => {
                                                                this._updateRoomAsync(item)
                                                            }
                                                        },
                                                    ]
                                                );


                                            } else {
                                                Alert.alert(
                                                    'Thông báo',
                                                    'Bạn muốn NHẬN thông báo Bình Luận cho Tin này?',
                                                    [
                                                        {
                                                            text: 'Hủy', onPress: () => {
                                                                // this._deleteRoomBoxAsync(item);
                                                            }
                                                        },
                                                        {
                                                            text: 'Đồng ý', onPress: () => {
                                                                this._updateRoomAsync(item)
                                                            }
                                                        },
                                                    ]
                                                );

                                            }

                                        }}
                                    >
                                        <Text style={{ textAlign: "right", fontSize: responsiveFontSize(1.8), color: '#9B9D9D' }}>  Nhận thông báo Bình Luận</Text>
                                        {item.Images.split('|')[1] == 'true' ?
                                            <Ionicons style={{ fontSize: responsiveFontSize(4), textAlign: "right", color: "#a4d227" }} name="ios-notifications" />
                                            :
                                            <Ionicons style={{ fontSize: responsiveFontSize(4), textAlign: "right", color: "#6c6d6d" }} name="ios-notifications-off" />
                                        }

                                    </TouchableOpacity>
                                } */}

                                {/* Effected Date */}
                                <View style={{ marginBottom: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View
                                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                    >
                                        <Ionicons style={{ fontSize: 12, marginRight: 5 }} name="md-timer" />
                                        <Text style={{ fontSize: responsiveFontSize(1.8), }}>{translate("Effective date")}</Text>
                                    </View>
                                    <Text style={{ flex: 1, fontSize: responsiveFontSize(1.8), textAlign: 'center', color: '#9B9D9D' }}>{item.FromDate}</Text>
                                    <Text style={{ color: '#9B9D9D' }}> - </Text>
                                    <Text style={{ flex: 1, fontSize: responsiveFontSize(1.8), textAlign: 'center', color: '#9B9D9D' }}>{item.ToDate}</Text>
                                </View>

                                {/* Highlight Date */}
                                {item.IsHighlight &&
                                    <View style={{ marginBottom: 5, marginTop: 2, flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View
                                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                        >
                                            <Ionicons style={{ fontSize: 12, marginRight: 5 }} name="md-sunny" />
                                            <Text style={{ fontSize: responsiveFontSize(1.8), }}>{translate("Highlight date")}</Text>
                                        </View>
                                        <Text style={{ flex: 1, fontSize: responsiveFontSize(1.8), textAlign: 'center', color: '#9B9D9D' }}>{item.HighlightFromDate}</Text>
                                        <Text style={{ color: '#9B9D9D' }}> - </Text>
                                        <Text style={{ flex: 1, fontSize: responsiveFontSize(1.8), textAlign: 'center', color: '#9B9D9D' }}>{item.HighlightToDate}</Text>
                                    </View>
                                }



                                <View style={{ marginBottom: 2, flexDirection: 'row', paddingTop: 10, paddingBottom: 10, justifyContent: 'space-between' }}>
                                    {/* {item.IsActive &&
                                        <TouchableOpacity
                                            style={{
                                                flexDirection: 'row', justifyContent: 'center',
                                                alignItems: 'center',
                                                borderWidth: 0.8, borderColor: '#a4d227', padding: 10, borderRadius: 5,
                                            }}
                                            onPress={() => {
                                                Alert.alert(
                                                    'Thông báo',
                                                    'Bạn muốn đưa Tin lên đầu trang?',
                                                    [
                                                        {
                                                            text: 'Hủy', onPress: () => {
                                                                // this._deleteRoomBoxAsync(item);
                                                            }
                                                        },
                                                        {
                                                            text: 'Đồng ý', onPress: () => {
                                                                this._setTopAsync(item.ID)
                                                            }
                                                        },
                                                    ]
                                                );




                                            }}
                                        >
                                            <Ionicons style={{ fontSize: 12, marginRight: 5 }} name="md-arrow-round-up" />
                                            <Text>Lên đầu</Text>
                                        </TouchableOpacity>
                                    } */}
                                    {/* Update Room */}
                                    {/* <TouchableOpacity
                                        style={{
                                            flexDirection: 'row', justifyContent: 'center',
                                            alignItems: 'center',
                                            borderWidth: 0.8, borderColor: '#a4d227', padding: 10, borderRadius: 5,
                                        }}
                                        onPress={() => {
                                            this.props.navigation.navigate('UpdateRoomScreen', {
                                                onRefreshScreen: this.onRefreshScreen,
                                                item: item,
                                            })
                                        }}
                                    >
                                        <Ionicons style={{ fontSize: 12, marginRight: 5 }} name="md-build" />
                                        <Text>Cập nhật</Text>
                                    </TouchableOpacity> */}

                                    {/* Delete Room */}
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row', justifyContent: 'center',
                                            alignItems: 'center', marginLeft: 10,
                                            borderWidth: 0.8, borderColor: '#a4d227', padding: 10, borderRadius: 5,
                                        }}
                                        onPress={() => {


                                            Alert.alert(
                                                translate("Notice"),
                                                translate("Are you sure to delete"),
                                                [
                                                    {
                                                        text: translate("Cancel"), onPress: () => {
                                                            // this._deleteRoomBoxAsync(item);
                                                        }
                                                    },
                                                    {
                                                        text: translate("Agree"), onPress: () => {
                                                           this._deletePinnedByUserAsync(item.ID)
                                                        }
                                                    },
                                                ]
                                            );



                                        }}
                                    >
                                        <Ionicons style={{ fontSize: 12, marginRight: 5 }} name="md-trash" />
                                        <Text>{translate("Delete")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                        keyExtractor={item => item.ID}
                    />
                </View>

                {/* Popup Loading Indicator */}
                < PopupDialog
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
                </PopupDialog >


            </View >
        );
    }
}

const styles = StyleSheet.create({




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