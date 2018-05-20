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
    Alert,
    BackHandler,
    AsyncStorage,
    ToastAndroid,
    Keyboard,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, ImagePicker, BarCodeScanner } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import Accordion from 'react-native-collapsible/Accordion';
import saveStorageAsync from '../components/saveStorageAsync';
import HomeScreen from './HomeScreen';
import { TextInputMask, TextMask } from 'react-native-masked-text';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import enTranslation from '../components/en.json';
import zhTranslation from '../components/zh.json';
import viTranslation from '../components/vi.json';
import { setLocalization, translate, Translate } from 'react-native-translate';


var { height, width } = Dimensions.get('window');
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
// const SECTIONS = [
//     {
//         title: 'Đăng tin',
//         content: 'Đang cập nhật...',
//     },
//     {
//         title: 'Cập nhật tin',
//         content: 'Đang cập nhật...',
//     },
//     {
//         title: 'Nạp ví tiền',
//         content: 'Đang cập nhật...',
//     },
//     {
//         title: 'Đổi mật khẩu',
//         content: 'Đang cập nhật...',
//     },
//     {
//         title: 'Đổi thông tin cá nhân',
//         content: 'Đang cập nhật...',
//     },
//     {
//         title: 'Quên mật khẩu',
//         content: 'Đang cập nhật...',
//     },
// ];

const isScanQR = false;

function funcformatDateDDMMYYYY(_date) {
    var _newdate = new Date(_date);
    _newdate.setDate(_newdate.getDate() + 1);
    var _dd2 = _newdate.getDate();
    var _mm2 = _newdate.getMonth() + 1;
    var _yyyy2 = _newdate.getFullYear();
    var _topDate = _dd2 + '-' + _mm2 + '-' + _yyyy2
    // alert(_topDate)
    return _topDate;
}

export default class ProfileScreen extends React.Component {

    static navigationOptions = {
        title: 'Trang cá nhân',
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            // Login
            username: '',
            password: '',
            animation: {
                usernamePostionLeft: new Animated.Value(795),
                passwordPositionLeft: new Animated.Value(905),
                loginPositionTop: new Animated.Value(1402),
                statusPositionTop: new Animated.Value(1542)
            },

            modalUpdateAccount: false,
            modalHelp: false,
            modalPostedRoomHistory: false,
            modalChangePassword: false,

            // Posted Room History
            postedRoomHistoryData: '',

            // Update Account
            updateAccountImage: null,
            profile: null,
            wallet: '0',
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            modalLoading: false,
        }


    }


    componentWillMount() {
        this._getProfileFromStorageAsync();
        //this._getWalletFromStorageAsync();

    }

    componentDidMount() {
        //alert(JSON.stringify(this.props.navigation.state))
    }

    // componentDidUpdate() {
    //     //this._getProfileFromStorageAsync();
    //     //alert("can")
    // }

    // shouldComponentUpdate() {

    //     alert("can")
    //     return true
    // }
    // componentWillUpdate() {
    //     //this._getProfileFromStorageAsync();
    // }


    onRefreshScreen = data => {
        this.setState(data);
        saveStorageAsync('FO_Account_Login', JSON.stringify(this.state.profile))
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

    _getWalletFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('FO_Wallet_GetDataByUserID');

            if (value !== null) {
                this.setState({
                    wallet: value
                })
            }
            else {
                this.setState({
                    wallet: '0'
                })
            }

        } catch (e) {
            console.log(e);
        }
    }

    _getWalletAsync = async () => {
        //  await this.setState({ refresh: true })  

        // alert(this.state.wallet)

        try {
            await fetch("http://nhabaola.vn/api/Wallet/FO_Wallet_GetDataByUserID", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "UserID": this.state.profile.ID,
                    "CreatedBy": this.state.profile.ID,
                    "UpdatedBy": this.state.profile.UpdatedBy,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    // alert(JSON.stringify(responseJson.obj))

                    if (responseJson.obj !== null) {
                        saveStorageAsync('FO_Wallet_GetDataByUserID', JSON.stringify(responseJson.obj[0].CurrentAmount))
                        this.setState({
                            wallet: responseJson.obj[0].CurrentAmount,
                        })
                    }

                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }

    _changePassword = async () => {


        //Form validation
        if (Platform.OS === 'android') {
            if (this.state.oldPassword === '') {
                ToastAndroid.showWithGravity(translate("Please enter old password"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.popupOldPasswordInput.focus()
                return;
            }
            if (this.state.newPassword === '') {
                ToastAndroid.showWithGravity(translate("Please enter a new password"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.popupNewPasswordInput.focus()
                return;
            }
            if (this.state.newPassword !== this.state.confirmNewPassword) {
                ToastAndroid.showWithGravity(translate("Confirm new password is incorrect"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.popupConfirmNewPasswordInput.focus()
                return;
            }

        }
        else { // iOS
            if (this.state.oldPassword === '') {
                Alert.alert(translate("Please enter a new password"));
                return;
            }
            if (this.state.newPassword === '') {
                Alert.alert(translate("Please enter a new password"));
                return;
            }
            if (this.state.newPassword !== this.state.confirmNewPassword) {
                //Alert.alert('Xác nhận mật khẩu không đúng');

                this.setState({ modalChangePassword: false })
                Alert.alert(translate("Notice"), translate("Confirm new password is incorrect"),
                    [
                        {
                            text: translate("Cancel"),
                            onPress: () => {
                                this.setState({
                                    confirmNewPassword: '',
                                    newPassword: '',
                                    oldPassword: ''
                                })
                            }
                        },
                        {
                            text: translate("Retype"),
                            onPress: () => {
                                this.setState({ modalChangePassword: true, modalLoading: false })
                                setTimeout(() => {
                                    this.refs.newConfirmPasswordInput.focus()
                                }, 1000);

                            }
                        }
                    ]);

                return;
            }
        }

        //Loading
        if (Platform.OS == 'ios') {
            this.setState({ modalLoading: true })
        } else {
            this.popupLoadingIndicator.show()
            //this.setState({ modalLoading: true })
        }


        try {
            await fetch("http://nhabaola.vn/api/Account/FO_Account_ChangePassword", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "UserId": this.state.profile.ID,
                    "NewPassword": this.state.newPassword,
                    "OldPassword": this.state.oldPassword,
                    "SessionKey": this.state.profile.UpdatedBy,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    //alert(JSON.stringify(responseJson))

                    if (JSON.stringify(responseJson.ErrorCode) === "0") { // Change Password successful
                        this.popupChangePassword.dismiss();

                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity(translate("Change password successfully"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            this.setState({ modalChangePassword: false })
                            Alert.alert(translate("Notice"), translate("Change password successfully"));
                        }

                        this.setState({
                            oldPassword: '',
                            newPassword: '',
                            confirmNewPassword: '',
                        })
                    }
                    if (JSON.stringify(responseJson.ErrorCode) === "15") { // Change Password un-successful

                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity(translate("Old password is incorrect"), ToastAndroid.SHORT, ToastAndroid.TOP);
                            this.refs.popupOldPasswordInput.focus()
                        }
                        else {
                            this.setState({ modalChangePassword: false })
                            Alert.alert(translate("Notice"), translate("Old password is incorrect"),
                                [
                                    {
                                        text: translate("Cancel"),
                                        onPress: () => {
                                            this.setState({
                                                confirmNewPassword: '',
                                                newPassword: '',
                                                oldPassword: ''
                                            })
                                        }
                                    },
                                    {
                                        text: translate("Retype"),
                                        onPress: () => {
                                            this.setState({ modalChangePassword: true, modalLoading: false })
                                            this.refs.oldPasswordInput.focus()
                                        }
                                    }
                                ]);
                        }


                    }

                    //Loading
                    if (Platform.OS == 'ios') {
                        this.setState({ modalLoading: false })
                    } else {
                        this.popupLoadingIndicator.dismiss()
                    }

                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }

    }



    _handleMapRegionChange = mapRegion => {
        this.setState({ mapRegion });
    };

    // _updateAccount = () => {

    // }

    _moveToRoomDetail = (user) => {
        this.props.navigation.navigate('RoomDetailScreen', { ...user });
    };

    _renderHeader(section) {
        return (
            <View style={{ borderWidth: 0.6, borderColor: '#73aa2a', borderRadius: 10, padding: 10, }}>
                <Text style={{}}>{section.title}</Text>
            </View>
        );
    }

    _renderContent(section) {
        return (
            <View style={{ padding: 20, }}>
                <Text>{section.content}</Text>
            </View>
        );
    }

    _pickPostRoomImage = async (imageNo) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
        });

        // console.log(result);
        if (!result.cancelled) {
            switch (imageNo) {
                case 'updateAccountImage':
                    console.log(result);
                    this.setState({ updateAccountImage: result.uri });
                    break;
                default:

            }
        }

    };

    // componentWillReceiveProps(nextProps) {
    //     alert("nextProps.items")
    // }

    _handleBarCodeRead = async (data) => {
        // Alert.alert(
        //   'Scan successful!',
        //   JSON.stringify(data.data)
        // );


        if (isScanQR) {
            isScanQR = await false

            if (data.data.indexOf("nbl") <= -1) {

                this.popupQRPay.dismiss();

                if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(translate("QR is invalid"), ToastAndroid.SHORT, ToastAndroid.TOP);
                }
                else {
                    Alert.alert(translate("Notice"), translate("QR is invalid"));
                }
                return;
            }

            try {
                await fetch("http://nhabaola.vn/api/Wallet/FO_Wallet_TopUp", {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "UserID": this.state.profile.ID,
                        "Code": data.data,
                        "CreatedBy": this.state.profile.ID,
                        "UpdatedBy": this.state.profile.UpdatedBy,


                        // "UserID": "10",
                        // "Code": "ntp-1905-1985-HCM-DN",
                        // "CreatedBy": "10",
                        // "UpdatedBy": "b2650091aaffa1da86dae09963d52649"
                    }),
                })
                    .then((response) => response.json())
                    .then((responseJson) => {

                        //alert(JSON.stringify(responseJson))

                        if (JSON.stringify(responseJson.ErrorCode) === "22") {
                            //isScanQR = ''
                            if (Platform.OS === 'android') {
                                ToastAndroid.showWithGravity(translate("Top up successfully") + '\n'
                                    + JSON.stringify(responseJson.obj.Description) + '\n'
                                    + translate("Wallet available") + ': ' + JSON.stringify(responseJson.obj.CurrentAmount), ToastAndroid.SHORT, ToastAndroid.TOP);
                            }
                            else {
                                Alert.alert(translate("Notice"), translate("Top up successfully") + '\n'
                                    + JSON.stringify(responseJson.obj.Description) + '\n'
                                    + translate("Wallet available") + ': ' + JSON.stringify(responseJson.obj.CurrentAmount)
                                );
                            }
                        }
                        else if (JSON.stringify(responseJson.ErrorCode) === "21") {
                            // isScanQR = ''
                            if (Platform.OS === 'android') {
                                ToastAndroid.showWithGravity(translate("QR has been used"), ToastAndroid.SHORT, ToastAndroid.TOP);
                            }
                            else {
                                Alert.alert(translate("Notice"), translate("QR has been used"));
                            }
                        }
                        else {
                            //isScanQR = ''
                            if (Platform.OS === 'android') {
                                ToastAndroid.showWithGravity(translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"), ToastAndroid.SHORT, ToastAndroid.TOP);
                            }
                            else {
                                Alert.alert(translate("Notice"), translate("Error") + JSON.stringify(responseJson) + translate("Please contact Admin in the Help menu"));
                            }
                        }

                        // this._saveStorageAsync('FO_Category_GetAllData', JSON.stringify(responseJson.obj))

                        this.popupQRPay.dismiss();
                        //this.setState({

                        // })
                    }).
                    catch((error) => { console.log(error) });
            } catch (error) {
                console.log(error)
            }

            // alert(isScanQR)
            //isScanQR = await false
        }



    };

    render() {
        return (
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#a4d227', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{}}
                        onPress={() => {
                            this.props.navigation.goBack()
                            this.props.navigation.state.params.onRefreshScreen({ refreshScreen: true });
                            this.props.navigation.state.params._getWalletAsync();

                        }}>
                        <Ionicons style={{ fontSize: 28, color: '#fff', }} name='md-arrow-back'></Ionicons>
                    </TouchableOpacity>
                    <Text style={{
                        marginLeft: 20, color: '#fff',
                        fontSize: responsiveFontSize(2.2), justifyContent: 'center'
                    }}>{translate("Personal page")}</Text>
                </View>
                <View style={{
                    //height: 80,
                    borderColor: '#d6d7da',
                    padding: 0,
                    flexDirection: 'column',
                }}>
                    {/* <Text>{JSON.stringify(this.props.navigation.state.params)}</Text> */}

                    <View style={styles.cardHeader}>

                        <View style={{ marginTop: 10, }}>
                            <TouchableOpacity
                                onPress={() => {
                                    {/* this.props.navigation.navigate('ProfileScreen'); */ }


                                }}
                            >
                                {this.state.profile === null
                                    ? <Image style={{ borderRadius: Platform.OS === 'ios' ? 23 : 50, height: 60, width: 60, }} source={require('../images/nha-bao-la.jpg')} />
                                    : <Image source={{ uri: this.state.profile.Avarta }} style={{ width: 60, height: 60, borderRadius: Platform.OS === 'ios' ? 30 : 100, }} />
                                }

                            </TouchableOpacity>
                        </View>
                        {this.state.profile
                            ?
                            <View style={{ flex: 4, paddingLeft: 20, marginTop: 10 }}>
                                <Text style={styles.cardAvatarName}>{this.state.profile.FullName}</Text>
                                <Text style={styles.cardAvatarAddress}>{translate("Registered Date")}: {funcformatDateDDMMYYYY(this.state.profile.RegistryDate)}</Text>
                                <TouchableOpacity style={styles.cardAvatarPhoneBox}>
                                    <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />
                                    <Text style={styles.cardAvatarPhone}>: {this.state.profile.ContactPhone}</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            <View style={{ flex: 4, paddingLeft: 20, marginTop: 10 }}>

                                <TouchableOpacity
                                    style={{}}
                                    onPress={() => {

                                    }}
                                >
                                    <Text style={styles.cardAvatarName}>{translate("Login")}</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </View>
                <ScrollView style={{
                    flex: 1,
                    marginTop: 25,

                }}>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {
                            // this.props.navigation.navigate('PostRoomScreen')
                            this.props.navigation.navigate('PostRoomScreen', {
                                onRefreshScreen: this.onRefreshScreen,
                                _getWalletAsync: this._getWalletAsync,
                            })
                        }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='md-cloud-upload'>
                            <Text>  {translate("Post")}</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {

                            this.props.navigation.navigate('PostedRoomHIstoryScreen', { onRefreshScreen: this._getWalletAsync });
                        }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='md-folder'>
                            <Text>  {translate("Posted history")}</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {

                            this.props.navigation.navigate('PinnedRoomScreen', { onRefreshScreen: this._getWalletAsync });
                        }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='md-heart-outline'>
                            <Text>  {translate("Pinned")}</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {
                            if (Platform.OS == 'ios') {
                                this.popupSelectedImage.show()
                            }
                        }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='logo-usd'>
                            <Text style={{}}>  {translate("Wallet")}:  </Text>
                            <Text style={{ color: '#73aa2a' }}>{numberWithCommas(this.state.wallet)} đ</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <View style={styles.profileMenuItemSeparator}></View>

                    {/* Like Fanpage Facebook */}
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {
                            const FANPAGE_ID = '1750146621679564'
                            const FANPAGE_URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                            const FANPAGE_URL_FOR_BROWSER = `https://fb.com/${FANPAGE_ID}`
                            Linking.canOpenURL(FANPAGE_URL_FOR_APP)
                                .then((supported) => {
                                    if (!supported) {
                                        Linking.openURL(FANPAGE_URL_FOR_BROWSER)
                                    } else {
                                        Linking.openURL(FANPAGE_URL_FOR_APP)
                                    }
                                })
                                .catch(err => console.error('An error occurred', err))

                        }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='logo-facebook'>
                            <Text>  Fanpage Facebook</Text>
                        </Ionicons>
                    </TouchableOpacity>

                    {/* Update Profile */}
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {

                            this.props.navigation.navigate('UpdateAccountScreen', {
                                onRefreshScreen: this.onRefreshScreen,
                                item: this.state.profile,
                            })

                            {/* this.setState({
                                modalUpdateAccount: true,
                            }) */}
                        }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='md-information-circle'>
                            <Text>  {translate("Personal information")}</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {

                            if (Platform.OS == 'ios') {
                                this.setState({ modalChangePassword: true })
                            } else {
                                this.popupChangePassword.show();
                            }
                            const timing = Animated.timing;
                            Animated.parallel([
                                timing(this.state.animation.usernamePostionLeft, {
                                    toValue: 0,
                                    duration: 900
                                }),
                                timing(this.state.animation.passwordPositionLeft, {
                                    toValue: 0,
                                    duration: 1100
                                }),
                                timing(this.state.animation.loginPositionTop, {
                                    toValue: 0,
                                    duration: 700
                                }),
                                timing(this.state.animation.statusPositionTop, {
                                    toValue: 0,
                                    duration: 700
                                })

                            ]).start()

                        }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='md-lock'>
                            <Text>  {translate("Change password")}</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => { this.setState({ modalHelp: true }) }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='md-help'>
                            <Text>  {translate("Contact help")}</Text>
                        </Ionicons>
                    </TouchableOpacity>

                    {this.state.profile ?
                        <TouchableOpacity style={styles.profileMenuItem}
                            onPress={() => {
                                Alert.alert(
                                    translate("Notice"),
                                    translate("Are you sure to logout"),
                                    [
                                        {
                                            text: translate("Cancel"), onPress: () => {

                                            }
                                        },
                                        {
                                            text: translate("Agree"), onPress: () => {
                                                //BackHandler.exitApp()
                                                saveStorageAsync('FO_Account_Login', '')
                                                saveStorageAsync('SessionKey', '')
                                                saveStorageAsync('loginUsername', '')
                                                saveStorageAsync('loginPassword', '')
                                                saveStorageAsync('FO_Wallet_GetDataByUserID', '')

                                                this.setState({ profile: null })
                                                //HomeScreen._onRefreshScreen({ refreshScreen: true })
                                                this.props.navigation.state.params.onRefreshScreen({
                                                    refreshScreen: true,
                                                    profile: null,
                                                    sessionKey: null,
                                                    loginUsername: '',
                                                    loginPassword: '',
                                                    wallet: '0',
                                                });
                                                this.props.navigation.goBack();
                                                //this.props.navigation.navigate("Home")
                                            }
                                        },
                                    ]
                                );

                            }}
                        >
                            <Ionicons style={styles.profileMenuItemText} name='md-exit'>
                                <Text>  {translate("Sign out")}</Text>
                            </Ionicons>
                        </TouchableOpacity>
                        : null}
                </ScrollView>


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


                {/* Popup Change Password*/}
                <PopupDialog
                    ref={(popupChangePassword) => { this.popupChangePassword = popupChangePassword; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogTitle={<DialogTitle title={translate("Change password")} titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
                    dismissOnTouchOutside={false}
                    dialogStyle={{ marginBottom: 150, width: width * 0.9, height: height * 0.5, }}
                    onShown={() => {
                        this.refs.popupOldPasswordInput.focus()
                    }}

                >

                    {this.state.modalLoading &&

                        <ActivityIndicator
                            style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
                            animating={true}
                            size="large"
                            color="#73aa2a"
                        />}

                    <View>
                        <Animated.View style={{ position: 'relative', left: this.state.animation.usernamePostionLeft, flexDirection: 'row', padding: 10, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock-outline' />
                            <FormInput
                                ref='popupOldPasswordInput'
                                returnKeyType={"next"}
                                onSubmitEditing={(event) => {
                                    this.refs.popupNewPasswordInput.focus();
                                }}
                                containerStyle={{ flex: 15, }}
                                placeholder={translate("Old password")}
                                // autoCapitalize='sentences'
                                secureTextEntry={true}
                                //keyboardType='phone-pad'
                                underlineColorAndroid={'#73aa2a'}
                                onChangeText={(oldPassword) => this.setState({ oldPassword })}
                                value={this.state.oldPassword}
                            />


                        </Animated.View>
                        <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-lock' />
                            <FormInput
                                ref='popupNewPasswordInput'
                                returnKeyType={"next"}
                                onSubmitEditing={(event) => {
                                    this.refs.popupConfirmNewPasswordInput.focus();
                                }}
                                containerStyle={{ flex: 15 }}
                                placeholder={translate("New password")}
                                secureTextEntry={true}
                                underlineColorAndroid={'#73aa2a'}
                                onChangeText={(newPassword) => this.setState({ newPassword })}
                                value={this.state.newPassword}
                            />
                        </Animated.View>
                        <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-checkmark' />
                            <FormInput
                                ref='popupConfirmNewPasswordInput'
                                returnKeyType={"done"}
                                onSubmitEditing={(event) => {
                                    Keyboard.dismiss();
                                    this._changePassword();
                                }}
                                containerStyle={{ flex: 15 }}
                                placeholder={translate("Confirm new password")}
                                secureTextEntry={true}
                                underlineColorAndroid={'#73aa2a'}
                                onChangeText={(confirmNewPassword) => this.setState({ confirmNewPassword })}
                                value={this.state.confirmNewPassword}
                            />
                        </Animated.View>

                    </View>


                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
                        <Button
                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                            raised={false}
                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                            title={translate("Cancel")}
                            onPress={() => {
                                Keyboard.dismiss()
                                this.popupChangePassword.dismiss()

                            }}
                        />

                        <Button
                            buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                            raised={false}
                            icon={{ name: 'md-checkmark', type: 'ionicon' }}
                            title={translate("Agree")}
                            onPress={() => {
                                Keyboard.dismiss();
                                this._changePassword();
                            }}
                        />
                    </View>
                </PopupDialog>

                {/* Modal Change Password */}
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalChangePassword}
                    // onRequestClose={() => {
                    //     //alert("Modal has been closed.")
                    // }}
                    onShow={() => {
                        this.refs.oldPasswordInput.focus()
                    }}
                >

                    {this.state.modalLoading &&

                        <ActivityIndicator
                            style={{ position: 'absolute', left: responsiveWidth(45), top: 30 }}
                            animating={true}
                            size="large"
                            color="#73aa2a"
                        />}

                    <View style={{ marginTop: 50 }}>
                        <Animated.View style={{ position: 'relative', left: this.state.animation.usernamePostionLeft, flexDirection: 'row', padding: 10, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock-outline' />
                            <FormInput
                                ref='oldPasswordInput'
                                returnKeyType={"next"}
                                onSubmitEditing={(event) => {
                                    this.refs.newPasswordInput.focus()
                                }}
                                containerStyle={{ flex: 15, }}
                                placeholder={translate("Old password")}
                                // autoCapitalize='sentences'
                                secureTextEntry={true}
                                //keyboardType='phone-pad'
                                underlineColorAndroid={'#73aa2a'}
                                onChangeText={(oldPassword) => this.setState({ oldPassword })}
                                value={this.state.oldPassword}
                            />


                        </Animated.View>
                        <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-lock' />
                            <FormInput
                                ref='newPasswordInput'
                                returnKeyType={"next"}
                                onSubmitEditing={(event) => {
                                    this.refs.newConfirmPasswordInput.focus()
                                }}
                                containerStyle={{ flex: 15 }}
                                placeholder={translate("New password")}
                                secureTextEntry={true}
                                underlineColorAndroid={'#73aa2a'}
                                onChangeText={(newPassword) => this.setState({ newPassword })}
                                value={this.state.newPassword}
                            />
                        </Animated.View>
                        <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-checkmark' />
                            <FormInput
                                ref='newConfirmPasswordInput'
                                returnKeyType={'done'}
                                onSubmitEditing={(event) => {
                                    this._changePassword();
                                }}
                                containerStyle={{ flex: 15 }}
                                placeholder={translate("Confirm new password")}
                                secureTextEntry={true}
                                underlineColorAndroid={'#73aa2a'}
                                onChangeText={(confirmNewPassword) => this.setState({ confirmNewPassword })}
                                value={this.state.confirmNewPassword}
                            />
                        </Animated.View>

                    </View>


                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
                        <Button
                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                            raised={false}
                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                            title={translate("Cancel")}
                            onPress={() => {
                                this.setState({
                                    modalChangePassword: false,
                                    modalLoading: false,
                                    confirmNewPassword: '',
                                    newPassword: '',
                                    oldPassword: ''
                                })
                            }}
                        />

                        <Button
                            buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                            raised={false}
                            icon={{ name: 'md-checkmark', type: 'ionicon' }}
                            title={translate("Agree")}
                            onPress={() => {
                                Keyboard.dismiss();
                                this._changePassword();
                            }}
                        />
                    </View>

                </Modal>

                {/* Modal Update Account*/}
                {/* <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalUpdateAccount}
                    onRequestClose={() => {
                        this.setState({ modalUpdateAccount: false })
                    }}
                >
                    <ScrollView>
                        <View style={{ flexDirection: 'row', padding: 20, marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                style={{}}
                                onPress={() => this._pickPostRoomImage('updateAccountImage')}
                            >
                                <Ionicons style={{ opacity: 0.7, fontSize: 100, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-contact' />
                                {this.state.updateAccountImage && <Image source={{ uri: this.state.updateAccountImage }} style={{
                                    width: 80, height: 80,
                                    borderRadius: 100, marginTop: -90, marginLeft: 17, marginBottom: 10,
                                }} />}
                                <Text style={{}}>{translate("Change avatar")}</Text>
                            </TouchableOpacity>

                        </View>
                        <View>
                            <View style={{ flexDirection: 'row', padding: 10, }}>
                                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-call-outline' />
                                <FormLabel containerStyle={{ flex: 15, marginLeft: -5, }}>(+84) 973730111</FormLabel>

                            </View>
                            <View style={{ position: 'relative', flexDirection: 'row', padding: 10, }}>
                                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person-outline' />
                                <FormInput
                                    containerStyle={{ flex: 15, paddingLeft: 5, }}
                                    placeholder='Họ và Tên'
                                    autoCapitalize='sentences'
                                   
                                    underlineColorAndroid={'#fff'}
                                    onChangeText={(text) => this.setState({ text })}
                                    value={this.state.text}
                                />

                            </View>
                            <View style={{ position: 'relative', flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-mail-outline' />
                                <FormInput
                                    containerStyle={{ flex: 15, paddingLeft: 5, }}
                                    placeholder='Email'
                                 
                                    underlineColorAndroid={'#fff'}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
                            <Button
                                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                                raised={false}
                                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                                title='Hủy'
                                onPress={() => { this.setState({ modalUpdateAccount: false }) }}
                            />

                            <Button
                                buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                                raised={false}
                                icon={{ name: 'md-checkmark', type: 'ionicon' }}
                                title='Cập nhật'
                                onPress={() => {
                                    this._updateAccount();
                                }}
                            />
                        </View>
                    </ScrollView>
                </Modal> */}

                {/* Modal Help*/}
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalHelp}
                    onRequestClose={() => {
                        this.setState({ modalHelp: false })
                    }}
                >
                    <View style={{ flexDirection: 'row', padding: 20, marginTop: Platform.OS === 'ios' ? 20 : 0, alignItems: 'center' }}>
                        <TouchableOpacity
                            style={{}}
                            onPress={() => this.setState({ modalHelp: false })}>
                            <Ionicons style={{ fontSize: 28, color: '#a4d227', }} name='md-arrow-back'></Ionicons>
                        </TouchableOpacity>
                        <Text style={{
                            marginLeft: 20, color: '#73aa2a',
                            fontSize: responsiveFontSize(2.2), justifyContent: 'center'
                        }}>{translate("Contact help")}</Text>
                    </View>
                    <ScrollView style={{ flex: 1, paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>

                        <Text style={{
                            fontSize: responsiveFontSize(2),
                            color: '#73aa2a'
                        }} >{translate("Contact")}</Text>
                        <View style={{ marginTop: 5, flexDirection: 'row' }}>
                            <Text style={{
                                fontSize: responsiveFontSize(2),
                                flex: 2, color: '#000'
                            }} >{translate("Hotline")}:</Text>
                            <Text style={{
                                fontSize: responsiveFontSize(2),
                                flex: 4, color: '#9B9D9D'
                            }} >0973730111, 0905588639, 0907028003</Text>
                        </View>
                        <View style={{ marginTop: 5, flexDirection: 'row' }}>
                            <Text style={{
                                fontSize: responsiveFontSize(2),
                                flex: 2, color: '#000'
                            }} >Email:</Text>
                            <Text style={{
                                fontSize: responsiveFontSize(2),
                                flex: 4, color: '#9B9D9D'
                            }} >hochaucan@gmail.com</Text>
                        </View>

                        <View style={{ marginTop: 5, flexDirection: 'row' }}>
                            <Text style={{
                                fontSize: responsiveFontSize(2), flex: 2,
                                color: '#000'
                            }} >Facebook:</Text>
                            <Text style={{
                                fontSize: responsiveFontSize(2), flex: 4,
                                color: '#9B9D9D'
                            }} > https://www.facebook.com/nhabaola/</Text>
                        </View>
                        <View style={{
                            marginTop: 10, flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={{
                                fontSize: responsiveFontSize(2),
                                flex: 2,
                                color: '#000'
                            }} >{translate("Chat now")}:</Text>

                            <View
                                style={{ flex: 4, flexDirection: 'row' }}
                            >
                                <TouchableOpacity
                                    style={{
                                        // lexDirection: 'row',
                                        //flex: 2,
                                        //alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        //const FANPAGE_ID = '1750146621679564'
                                        //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                                        const URL_FOR_BROWSER = 'http://m.me/thomas.ho.5492216'//ho.can.7'
                                        Linking.canOpenURL(URL_FOR_BROWSER)
                                            .then((supported) => {
                                                if (!supported) {
                                                    Linking.openURL(URL_FOR_BROWSER)
                                                } else {
                                                    Linking.openURL(URL_FOR_BROWSER)
                                                }
                                            })
                                            .catch(err => console.error('An error occurred', err))
                                    }}
                                >

                                    <Image
                                        style={{}}
                                        source={require('../assets/icons/chat_fm.png')} />


                                    {/* <Text style={{
                                    fontSize: responsiveFontSize(2),
                                    //flex: 4, 
                                    color: '#9B9D9D'
                                }} > <Ionicons style={{ fontSize: responsiveFontSize(2.5) }} name="ios-chatbubbles" /> Admin</Text> */}
                                </TouchableOpacity>


                                <TouchableOpacity
                                    style={{
                                        // lexDirection: 'row',
                                        //flex: 1,
                                        marginLeft: 20,
                                        //alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        //const FANPAGE_ID = '1750146621679564'
                                        //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                                        const URL_FOR_BROWSER = 'http://zalo.me/0963988367'//'http://m.me/ho.can.7'
                                        Linking.canOpenURL(URL_FOR_BROWSER)
                                            .then((supported) => {
                                                if (!supported) {
                                                    Linking.openURL(URL_FOR_BROWSER)
                                                } else {
                                                    Linking.openURL(URL_FOR_BROWSER)
                                                }
                                            })
                                            .catch(err => console.error('An error occurred', err))
                                    }}
                                >

                                    <Image
                                        style={{}}
                                        source={require('../assets/icons/chat_zalo.png')} />


                                    {/* <Text style={{
                                    fontSize: responsiveFontSize(2),
                                    //flex: 4, 
                                    color: '#9B9D9D'
                                }} > <Ionicons style={{ fontSize: responsiveFontSize(2.5) }} name="ios-chatbubbles" /> Admin</Text> */}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        // lexDirection: 'row',
                                        //flex: 1,
                                        marginLeft: 20,
                                        //alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        //const FANPAGE_ID = '1750146621679564'
                                        //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                                        const URL_FOR_BROWSER = 'https://api.whatsapp.com/send?phone=+84963988367'//'http://zalo.me/0963988367'//'http://m.me/ho.can.7'
                                        Linking.canOpenURL(URL_FOR_BROWSER)
                                            .then((supported) => {
                                                if (!supported) {
                                                    Linking.openURL(URL_FOR_BROWSER)
                                                } else {
                                                    Linking.openURL(URL_FOR_BROWSER)
                                                }
                                            })
                                            .catch(err => console.error('An error occurred', err))
                                    }}
                                >

                                    <Image
                                        style={{}}
                                        source={require('../assets/icons/chat_whatapps.png')} />


                                    {/* <Text style={{
                                    fontSize: responsiveFontSize(2),
                                    //flex: 4, 
                                    color: '#9B9D9D'
                                }} > <Ionicons style={{ fontSize: responsiveFontSize(2.5) }} name="ios-chatbubbles" /> Admin</Text> */}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={{
                            fontSize: responsiveFontSize(2), color: '#73aa2a',
                            marginTop: 25, marginBottom: 5
                        }} >{translate("User manual")}</Text>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => {
                                //const FANPAGE_ID = '1750146621679564'
                                //const URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                                const URL_FOR_BROWSER = 'https://www.youtube.com/watch?v=KqEJ4m3OylQ'//'https://docs.google.com/document/d/1AJZpbCWJNlba-jgOmq00-iwhF0-l1Z0_XxfW9JafAqk/edit'
                                Linking.canOpenURL(URL_FOR_BROWSER)
                                    .then((supported) => {
                                        if (!supported) {
                                            Linking.openURL(URL_FOR_BROWSER)
                                        } else {
                                            Linking.openURL(URL_FOR_BROWSER)
                                        }
                                    })
                                    .catch(err => console.error('An error occurred', err))
                            }}
                        >
                            {/* <Text style={{ alignItems: 'center', fontSize: responsiveFontSize(2) }}>https://docs.google.com/document/d/1AJZpbCWJNlba-jgOmq00-iwhF0-l1Z0_XxfW9JafAqk</Text> */}
                            <Ionicons style={{
                                color: '#6c6d6d',
                                fontSize: responsiveFontSize(2.5),
                                marginLeft: 5,
                                marginRight: 5,
                            }} name='ios-arrow-dropright-outline' />
                            <Text
                                style={{ alignItems: 'center', fontSize: responsiveFontSize(2) }}
                            > {translate("Post")}</Text>
                        </TouchableOpacity>

                        {/* <Accordion
                            sections={

                                [
                                    {
                                        title: 'Đăng tin',
                                        content: 'Đang cập nhật...',
                                    },
                                    {
                                        title: 'Cập nhật tin',
                                        content: 'Đang cập nhật...',
                                    },
                                    {
                                        title: 'Nạp ví tiền',
                                        content: 'Đang cập nhật...',
                                    },
                                    {
                                        title: 'Đổi mật khẩu',
                                        content: 'Đang cập nhật...',
                                    },
                                    {
                                        title: 'Đổi thông tin cá nhân',
                                        content: 'Đang cập nhật...',
                                    },
                                    {
                                        title: 'Quên mật khẩu',
                                        content: 'Đang cập nhật...',
                                    },
                                ]
                            }
                            renderHeader={this._renderHeader}
                            renderContent={this._renderContent}
                            easing='bounce'
                        /> */}

                    </ScrollView>
                </Modal>

                {/* Popup QR scanner */}
                <PopupDialog
                    ref={(popupSelectedImage) => { this.popupSelectedImage = popupSelectedImage; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogStyle={{ marginBottom: 10, width: width * 0.9, height: 130, justifyContent: 'center', padding: 20 }}
                    dismissOnTouchOutside={true}
                //onShown={() => { this.setState({ isScanQR: true }) }}
                >
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
                        <TouchableOpacity
                            style={{ flex: 2, justifyContent: 'center', alignContent: 'center' }}
                            onPress={async () => {
                                this.popupSelectedImage.dismiss();
                                //this._pickImageAsync('library', this.state.selectedImages)
                            }}
                        >
                            <Ionicons style={{
                                fontSize: 40, borderRadius: 10,
                                //backgroundColor: '#a4d227',
                                color: '#a4d227', textAlign: 'center', padding: 10
                            }} name='ios-qr-scanner' >
                            </Ionicons>
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>{translate("QR Pay")}</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}></View>
                        <TouchableOpacity
                            style={{ flex: 2, justifyContent: 'center', alignContent: 'center', }}
                            onPress={async () => {
                                this.popupSelectedImage.dismiss();
                                this.popupQRPay.show()
                                //this._pickImageAsync('camera', this.state.selectedImages)
                            }}
                        >

                            <Ionicons style={{
                                fontSize: 40, borderRadius: 10,
                                // backgroundColor: '#a4d227', 
                                color: '#a4d227', textAlign: 'center', padding: 10
                            }} name='md-qr-scanner' />
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>{translate("QR Top Up")}</Text>
                        </TouchableOpacity>
                    </View>
                </PopupDialog>



                {/* Popup QR Pay */}
                {Platform.OS == 'ios' &&
                    <PopupDialog
                        ref={(popupQRPay) => { this.popupQRPay = popupQRPay; }}
                        dialogAnimation={new ScaleAnimation()}
                        dialogStyle={{
                            marginBottom: 10,
                            width: responsiveWidth(90),
                            height: responsiveHeight(80),
                            justifyContent: 'center', padding: 20,
                        }}
                        //dialogTitle={<DialogTitle title={translate("QR Top Up")} />}
                        dismissOnTouchOutside={false}
                        // onDismissed={() => { this.setState({ isScanQR: false }) }}
                        // actions={<DialogButton text={translate("Cancel")} align="center" onPress={() => this.popupQRPay.dismiss()} />}
                        onShown={() => { isScanQR = true }}
                    >
                        <View style={{
                            flex: 1,
                            //flexDirection: 'row',
                            justifyContent: 'center', alignContent: 'center'
                        }}>

                            <Text style={{
                                textAlign: 'center', marginTop: 5,
                                marginBottom: 10, color: '#73aa2a',
                                textAlign: 'center',
                                fontSize: responsiveFontSize(2.2)
                            }}>{translate("QR Top Up")}</Text>
                            <BarCodeScanner
                                onBarCodeRead={
                                    this._handleBarCodeRead
                                }
                                style={{
                                    width: responsiveWidth(80),
                                    height: responsiveHeight(60)
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    this.popupQRPay.dismiss()
                                }}
                            >

                                <Text style={{
                                    textAlign: 'center',
                                    paddingTop: 15,
                                    //marginBottom: 10,
                                    color: '#6c6d6d',
                                    textAlign: 'center',
                                    fontSize: responsiveFontSize(2),
                                }}>{translate("Cancel")}</Text>
                            </TouchableOpacity>

                        </View>
                    </PopupDialog>
                }

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

    // card: {
    //     height: 80,
    //     // borderBottomWidth: 0.5,
    //     borderColor: '#d6d7da',
    //     padding: 0,
    //     flexDirection: 'column',
    // },
    cardHeader: {
        // flex: 2,
        flexDirection: 'row',
        padding: 10,
        // borderBottomWidth: 0.7,
        // borderColor: '#a4d227',
        alignItems: 'center'
    },



    cardAvatarName: {
        fontSize: 15,
        color: '#73aa2a'
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
        alignItems: 'center',
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
