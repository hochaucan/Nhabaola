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
    Keyboard,
    ToastAndroid,
    Alert,
    ActivityIndicator,
    AsyncStorage,
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, Permissions, } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import globalVariable from '../components/Global'
import notifyNBLAsync from '../api/notifyNBLAsync';
import enTranslation from '../components/en.json';
import zhTranslation from '../components/zh.json';
import viTranslation from '../components/vi.json';
import { setLocalization, translate, Translate } from 'react-native-translate';
import saveStorageAsync from '../components/saveStorageAsync';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';

const Mailbox = [];
const roomBoxByID = null;

export default class MailboxScreen extends React.Component {

    static navigationOptions = {
        // title: 'Links',
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            refresh: false,
            profile: null,
            isVietnamease: false,
            isEnglish: false,
            isChinease: false,
            page: 1,
            roomPageIndex: 0,
            roomPageCount: 500,
            flatListIsEnd: false,
            searchFlatlistKey: '',
        }
    }

    componentWillMount() {

        this._getLanguageFromStorageAsync();
        this._getProfileFromStorageAsync();
        this._getMailboxAsync(true)

    }

    componentDidMount() {
        //alert(JSON.stringify(this.props.navigation.state))
    }

    _getProfileFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('FO_Account_Login');

            if (value !== null) {
                this.setState({
                    profile: JSON.parse(value)
                })

                this._getWalletAsync();
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

    _getRoomByIDAsync = async (roomID) => {
        try {
            await fetch("http://nhabaola.vn//api/RoomBox/FO_RoomBox_Get/" + roomID, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                // body: JSON.stringify({
                //   "PageIndex": "0",
                //   "PageCount": "100",
                //   "SessionKey": "Olala_SessionKey",
                //   "UserLogon": "100"
                // }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    // alert(JSON.stringify(responseJson))
                    roomBoxByID = responseJson.obj;
                    //this.setState({ roomBoxByID: responseJson.obj })

                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }

    _getMailboxAsync = async (isNew) => {

        await this.setState({ refresh: true })

        if (!isNew) { // Loading more page 
            this.setState((prevState, props) => ({
                page: prevState.page + 1,
            }));
        }
        else { // Refresh page
            Mailbox = await [];
            this.setState({ page: 1, flatListIsEnd: false })
        }

        this.setState({ // Calculate page index
            roomPageIndex: (this.state.page - 1) * this.state.roomPageCount
        })

        try {
            await fetch("http://nhabaola.vn/api/Notification/FO_Notification_GetAllData", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "PageIndex": this.state.roomPageIndex,
                    "PageCount": this.state.roomPageCount
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    if (JSON.stringify(responseJson.ErrorCode) === "0") { //  Successful

                        responseJson.obj.map((y) => {

                            if (y.UserId === this.state.profile.ID) {
                                Mailbox.push(y);
                            }
                        })
                        this.setState({ refresh: false })

                        // End Flatlist
                        if (JSON.stringify(responseJson.obj.length) == '0') {
                            this.setState({ flatListIsEnd: true, })
                        }
                    }
                    else { // Error
                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
                        }
                    }
                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }
    }


    render() {
        return (
            <View style={{
                flex: 1,
                //paddingTop: 15,
                //backgroundColor: '#fff',
            }}>
                <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#a4d227', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => {
                            this.props.navigation.goBack()
                            //this.props.navigation.state.params.onRefreshScreen({ refreshScreen: true });
                            // this.props.navigation.state.params._getWalletAsync();
                        }}>
                        <Ionicons style={{ fontSize: 28, color: '#fff', paddingTop: 2 }} name='ios-arrow-back'></Ionicons>

                        <Text style={{
                            marginLeft: 10, color: '#fff',
                            fontSize: responsiveFontSize(2), //justifyContent: 'center'
                        }}>{translate("Mailbox")}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    flex: 1,
                    // height: 400,
                    backgroundColor: '#fff',
                    // position: 'absolute',
                    opacity: 0.8,
                    // marginTop: -70,
                    padding: 10,
                    borderTopWidth: 2,
                    borderColor: 'white',
                }}>

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
                        onRefresh={() => { this._getMailboxAsync(true); }}
                        keyboardShouldPersistTaps="always"
                        removeClippedSubviews={true}
                        initialNumToRender={2}
                        shouldItemUpdate={this._shouldItemUpdate}
                        onEndReachedThreshold={0.2}
                        onEndReached={() => {
                            if (this.state.flatListIsEnd == false) {
                                this._getMailboxAsync(false);
                            }
                        }}
                        data={Mailbox.filter(item => item.AlertInfo.includes(this.state.searchFlatlistKey))}
                        renderItem={({ item }) =>
                            <View style={{
                                borderBottomWidth: 0.3,
                                borderColor: '#9B9D9D',
                            }}>


                                <TouchableOpacity
                                    style={styles.searchCardImage}
                                    onPress={async () => {
                                        await this._getRoomByIDAsync(item.AlertOption)
                                        // const item2 = await roomBoxByID
                                        // this.props.navigation.navigate(data.screen, { item });

                                        this.props.navigation.navigate('RoomDetailScreen', { item: roomBoxByID })
                                    }}
                                >
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        // height: 100,
                                        // borderWidth: 1,
                                        paddingTop: 15,
                                        paddingBottom: 15,
                                        // borderBottomWidth: 0.3,
                                        //borderColor: '#9B9D9D',
                                    }}>
                                        {/* <Image
                                            style={{ flex: 3, borderRadius: 5 }}
                                            source={{ uri: item.Title }} /> */}

                                        <View style={{
                                            flex: 9,
                                            paddingLeft: 10,
                                        }}>
                                            {/* <Text style={{
                                                flex: 2,
                                                fontSize: responsiveFontSize(1.8),
                                            }}>{item.UserId}</Text> */}
                                            <Text style={{
                                                color: '#73aa2a',
                                                fontSize: responsiveFontSize(1.8),
                                            }}>{item.ID} - {translate("RoomId")}: {item.AlertOption}</Text>
                                            <Text style={{
                                                paddingTop: 5,
                                                fontSize: responsiveFontSize(1.8),
                                            }}>{item.AlertInfo}</Text>
                                            <Text style={{
                                                paddingTop: 5,
                                                color: '#9B9D9D',
                                                fontSize: responsiveFontSize(1.5),
                                            }}>{item.CreatedDate}</Text>

                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* <View style={{ marginBottom: 2, flexDirection: 'row', paddingTop: 10, paddingBottom: 10, justifyContent: 'space-between' }}>



                                </View> */}
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

});
