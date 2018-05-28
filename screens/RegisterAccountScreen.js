import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TouchableNativeFeedback,
    View,
    FlatList,
    Dimensions,
    LayoutAnimation,
    Modal,
    Share,
    Alert,
    Animated,
    AsyncStorage,
    ToastAndroid,
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
} from 'react-native';
import { WebBrowser, ImagePicker, Facebook } from 'expo';
import { MonoText } from '../components/StyledText';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import uploadImageAsync from '../api/uploadImageAsync';
import globalVariable from '../components/Global'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import notifyNBLAsync from '../api/notifyNBLAsync';
import enTranslation from '../components/en.json';
import zhTranslation from '../components/zh.json';
import viTranslation from '../components/vi.json';
import { setLocalization, translate, Translate } from 'react-native-translate';

var { height, width } = Dimensions.get('window');

export default class RegisterAccountScreen extends React.Component {

    static navigationOptions = {
        // title: 'app.json',
        header: null,
    };

    constructor(props) {
        super(props)
        this.state = {
            registerCellPhone: '',
            registerPassword: '',
            registerConfirmPassword: '',
            registerConfirmCellPhone: '',
            registerAccountImage: null,
            registerFullName: '',
            registerEmail: '',
            registerFacebookMessanger: '',
            registerZalo: '',
            registerWhatapps: '',
        }
    }

    componentWillMount() {

    }

    componentDidMount() {
        //alert(JSON.stringify(this.props.navigation.state))
    }

    _registerAccountAsync = async () => {

        // await this.props.navigation.state.params.onRefreshScreen({ loginUsername: '0973730111', loginPassword: '123' });
        // this.props.navigation.state.params.login();
        // this.props.navigation.goBack();
        // return;

        let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let cellPhoneVN = /(09|01[2|6|8|9])+([0-9]{8})\b/;

        //Form validation
        if (Platform.OS === 'android') {
            if (this.state.registerAccountImage === null) {
                ToastAndroid.showWithGravity(translate("Please select a avatar"), ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.registerCellPhone === '') {
                ToastAndroid.showWithGravity(translate("Please enter the cellphone"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.phoneInput.focus();
                return;
            }
            if (cellPhoneVN.test(this.state.registerCellPhone) === false) {
                ToastAndroid.showWithGravity(translate("Invalid cellphone number of Vietnam Mobile Phone"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.phoneInput.focus();
                return;
            }
            if (this.state.registerPassword === '') {
                ToastAndroid.showWithGravity(translate("Please enter a password"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.passwordInput.focus();
                return;
            }
            if (this.state.registerPassword != this.state.registerConfirmPassword) {
                ToastAndroid.showWithGravity(translate("Confirm password is incorrect"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.confirmPasswordInput.focus();
                return;
            }
            if (this.state.registerFullName === '') {
                ToastAndroid.showWithGravity(translate("Please enter fullname"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.fullNameInput.focus();
                return;
            }
            // if (this.state.registerConfirmCellPhone === '') {
            //     ToastAndroid.showWithGravity('Vui lòng nhập mã xác nhận Số Điện Thoại', ToastAndroid.SHORT, ToastAndroid.TOP);
            //     return;
            // }
            if (this.state.registerEmail === '') {
                ToastAndroid.showWithGravity(translate("Please enter Email"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.emailInput.focus();
                return;
            }
            if (emailReg.test(this.state.registerEmail) === false) {
                ToastAndroid.showWithGravity(translate("The email is incorrect"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.emailInput.focus();
                return;
            }

        }
        else { //IOS
            if (this.state.registerAccountImage === null) {
                Alert.alert(translate("Notice"), translate("Please select a avatar"));
                return;
            }
            if (this.state.registerCellPhone === '') {
                Alert.alert(translate("Notice"), translate("Please enter the cellphone"));
                //this.refs.phoneInput.focus();
                return;
            }
            if (cellPhoneVN.test(this.state.registerCellPhone) === false) {
                Alert.alert(translate("Notice"), translate("Invalid cellphone number of Vietnam Mobile Phone"));
                //this.refs.phoneInput.focus();
                return;
            }
            if (this.state.registerPassword === '') {
                Alert.alert(translate("Notice"), translate("Please enter a password"));
                //this.refs.passwordInput.focus();
                return;
            }
            if (this.state.registerPassword != this.state.registerConfirmPassword) {
                Alert.alert(translate("Notice"), translate("Confirm password is incorrect"));
                //this.refs.confirmPasswordInput.focus();
                return;
            }
            if (this.state.registerFullName === '') {
                Alert.alert(translate("Notice"), translate("Please enter fullname"));
                //this.refs.fullNameInput.focus();
                return;
            }
            if (this.state.registerEmail === '') {
                Alert.alert(translate("Notice"), translate("Please enter Email"));
                // this.refs.emailInput.focus();
                return;
            }

            if (emailReg.test(this.state.registerEmail) === false) {
                Alert.alert(translate("Notice"), translate("The email is incorrect"));
                //this.refs.emailInput.focus();
                return;
            }

        }

        this.popupLoadingIndicator.show();

        // Register Chat account
        let _fullName = this.state.registerFullName
        if (this.state.registerFacebookMessanger != '') { _fullName = _fullName + '|http://m.me/' + this.state.registerFacebookMessanger }
        if (this.state.registerZalo != '') { _fullName = _fullName + '|http://zalo.me/' + this.state.registerZalo }
        if (this.state.registerWhatapps != '') { _fullName = _fullName + '|https://api.whatsapp.com/send?phone=' + this.state.registerWhatapps }
        if (_fullName.indexOf('|') > -1) { _fullName = _fullName + '|' }


        // Upload avatar
        let uploadResponse = await uploadImageAsync(this.state.registerAccountImage);
        let uploadResult = await uploadResponse.json();

        // Set Username and Password to login after register account successful
        await this.props.navigation.state.params.onRefreshScreen({ loginUsername: this.state.registerCellPhone, loginPassword: this.state.registerPassword });


        //Post to register account
        try {
            await fetch("http://nhabaola.vn/api/Account/FO_Account_Add", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                //body: JSON.stringify(this.state.objectRegisterAccount)


                body: JSON.stringify({
                    "Avarta": uploadResult.ImagePath.match("http") ? uploadResult.ImagePath.replace('|', '') : "",
                    "UserName": this.state.registerCellPhone,
                    "FullName": _fullName,//this.state.registerFullName,
                    "Email": this.state.registerEmail,
                    "Sex": Platform.OS == 'ios' ? '0' : '1',
                    //"YearOfBirth": "2017-10-09",
                    "Address": globalVariable.PHONE_TOKEN,
                    "ContactPhone": this.state.registerCellPhone,
                    "Password": this.state.registerPassword,
                    "IsActive": "true",
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.popupLoadingIndicator.dismiss();

                    if (JSON.stringify(responseJson.ErrorCode) === "0") { // Account registered successful


                        // Login after register account
                        this.props.navigation.state.params.login();
                        this.props.navigation.goBack();

                        // Notify Admin 
                        notifyNBLAsync(globalVariable.ADMIN_PUSH_TOKEN
                            , { "screen": "HomeScreen", "params": { "roomBoxID": 'DKTK' } }
                            , "default"
                            , this.state.registerFullName + " " + translate("New Account Registration")
                            , this.state.registerCellPhone + ' - ' + this.state.registerEmail
                        ); //pushToken, data, sound, title, body

                        this.setState({
                            registerCellPhone: '',
                            registerPassword: '',
                            registerConfirmPassword: '',
                            registerAccountImage: null,
                            registerFullName: '',
                            registerConfirmCellPhone: '',
                            registerEmail: '',
                        })
                    }

                    if (JSON.stringify(responseJson.ErrorCode) === "20") { // Account is existing
                        if (Platform.OS == 'ios') {
                            Alert.alert(translate("Notice"), translate("This account has already existed"));
                        } else {
                            ToastAndroid.showWithGravity(translate("This account has already existed"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        return;
                    }



                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }


    }

    _pickImageAsync = async (source) => {
        let result = null;

        // Get image from Library
        if (source === 'library') {
            result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.3,
            });
        }
        else { // Get image from Camera
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.3,
            });
        }
        if (!result.cancelled) {
            this.setState({ registerAccountImage: result.uri })
        }
        this.refs.phoneInput.focus();
    };

    _scrollToInput(reactNode) {
        // Add a 'scroll' ref to your ScrollView
        this.scroll.props.scrollToFocusedInput(reactNode)
        //this.scroll.props.scrollToPosition(0, 20)
        //alert(reactNode)
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', paddingBottom: 20, }}>
                <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#a4d227', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => {
                            this.props.navigation.goBack()
                        }}>
                        <Ionicons style={{ fontSize: 28, color: '#fff', paddingTop: 2 }} name='ios-arrow-back'></Ionicons>

                        <Text style={{
                            marginLeft: 10, color: '#fff',
                            fontSize: responsiveFontSize(2), //justifyContent: 'center'
                        }}>{translate("Open account")}</Text>
                    </TouchableOpacity>
                </View>
                <KeyboardAwareScrollView
                    innerRef={ref => { this.scroll = ref }}
                >

                    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'height' : 'padding'}>
                        <View style={{
                            flexDirection: 'row',
                            padding: 20, justifyContent: 'center', alignItems: 'center', alignContent: 'center',
                        }}>
                            <TouchableOpacity
                                style={{ justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}
                                onPress={async () => {
                                    this.popupSelectedImage.show()

                                }
                                }
                            >
                                {/* {this.state.registerAccountImage == null &&
                                    <Ionicons style={{ opacity: 0.7, fontSize: 100, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-contact' />
                                } */}
                                {this.state.registerAccountImage
                                    ? <Image source={{ uri: this.state.registerAccountImage }}
                                        style={{
                                            width: 80, height: 80,
                                            borderRadius: Platform.OS === 'ios' ? 40 : 100,
                                            marginBottom: 10,
                                            // marginTop: Platform.OS === 'ios' ? -99 : -90,
                                            // marginLeft: Platform.OS === 'ios' ? 7 : 1, marginBottom: 10,
                                        }}
                                    />
                                    :
                                    <Ionicons style={{ opacity: 0.7, fontSize: 100, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-contact' />

                                }
                                <Text style={{}}>{translate("Avatar")}</Text>
                            </TouchableOpacity>

                        </View>
                        <View>
                            {/* Cellphone */}
                            <View style={{ position: 'relative', flexDirection: 'row', padding: 10, }}>
                                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-call' />
                                <FormInput
                                    ref='phoneInput'
                                    containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 20 : 10 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={translate("Contact cellphone")}
                                    autoCapitalize='sentences'
                                    keyboardType='numeric'
                                    returnKeyType={Platform.OS == 'ios' ? "done" : "next"}
                                    underlineColorAndroid={'#73aa2a'}
                                    onChangeText={(registerCellPhone) => this.setState({ registerCellPhone })}
                                    value={this.state.registerCellPhone}
                                    onSubmitEditing={(event) => {
                                        this.refs.passwordInput.focus();
                                    }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)
                                    }}
                                />
                                {/* <TouchableOpacity>
                                <FormLabel
                                    containerStyle={{
                                        alignItems: 'center', justifyContent: 'center',

                                    }}
                                >
                                    (Xác nhận ĐT)
                            </FormLabel>
                            </TouchableOpacity> */}
                            </View>
                            {/* Password */}
                            <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock' />
                                <FormInput
                                    ref='passwordInput'
                                    returnKeyType={"next"}
                                    onSubmitEditing={(event) => {
                                        this.refs.confirmPasswordInput.focus();
                                    }}
                                    containerStyle={{ flex: 15 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={translate("Password")}
                                    secureTextEntry={true}
                                    underlineColorAndroid={'#73aa2a'}
                                    value={this.state.registerPassword}
                                    onChangeText={(registerPassword) => { this.setState({ registerPassword }) }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)
                                    }}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                                <FormInput
                                    ref='confirmPasswordInput'
                                    returnKeyType={"next"}
                                    onSubmitEditing={(event) => {
                                        this.refs.fullNameInput.focus();
                                    }}
                                    containerStyle={{ flex: 15, marginLeft: 36 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={translate("Confirm password")}
                                    secureTextEntry={true}
                                    underlineColorAndroid={'#73aa2a'}
                                    value={this.state.registerConfirmPassword}
                                    onChangeText={(registerConfirmPassword) => { this.setState({ registerConfirmPassword }) }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)
                                    }}
                                />
                            </View>
                            {/* Fulllname */}
                            <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person' />
                                <FormInput
                                    ref='fullNameInput'
                                    returnKeyType={"next"}
                                    onSubmitEditing={(event) => {
                                        this.refs.emailInput.focus();
                                    }}
                                    containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={translate("Name")}
                                    underlineColorAndroid={'#73aa2a'}
                                    value={this.state.registerFullName}
                                    onChangeText={(registerFullName) => { this.setState({ registerFullName }) }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)
                                    }}
                                />

                            </View>
                            {/* Email */}
                            <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-mail' />
                                <FormInput
                                    ref='emailInput'
                                    returnKeyType={"next"}
                                    //returnKeyType={"done"}
                                    onSubmitEditing={(event) => {
                                        //Keyboard.dismiss()
                                        //this._registerAccountAsync();
                                        this.refs.fmInput.focus();
                                    }}
                                    containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={translate("Email (to retrieve password)")}
                                    keyboardType='email-address'
                                    underlineColorAndroid={'#73aa2a'}
                                    value={this.state.registerEmail}
                                    onChangeText={(registerEmail) => {
                                        this.setState({ registerEmail })
                                    }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)

                                    }}
                                />

                            </View>

                            {/* Facebook Messenger */}
                            <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, alignItems: 'center' }}>
                                {/* <Ionicons style={{ flex: 1, fontSize: 20, paddingTop: 12, textAlign: 'center', }} name='ios-chatbubbles' /> */}
                                <Image style={{ flex: 1, paddingTop: 12, width: 25, height: 25 }} source={require('../assets/icons/chat_fm.png')} />
                                <FormInput
                                    ref='fmInput'
                                    returnKeyType={"next"}
                                    onSubmitEditing={(event) => {
                                        // Keyboard.dismiss()
                                        //this._registerAccountAsync();
                                        this.refs.zaloInput.focus();
                                    }}
                                    containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={'F Messenger (thomas.ho.5492216)'}
                                    // keyboardType='email-address'
                                    underlineColorAndroid={'#73aa2a'}
                                    value={this.state.registerFacebookMessanger}
                                    onChangeText={(registerFacebookMessanger) => {
                                        this.setState({ registerFacebookMessanger })
                                    }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)

                                    }}
                                />

                            </View>

                            {/* Zalo Messenger */}
                            <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, alignItems: 'center' }}>
                                {/* <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', color: '#fff' }} name='ios-chatbubbles' /> */}
                                <Image style={{ flex: 1, paddingTop: 12, width: 25, height: 25 }} source={require('../assets/icons/chat_zalo.png')} />
                                <FormInput
                                    ref='zaloInput'
                                    returnKeyType={"next"}
                                    onSubmitEditing={(event) => {
                                        //Keyboard.dismiss()
                                        //this._registerAccountAsync();
                                        this.refs.whatappsInput.focus();
                                    }}
                                    containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={'Zalo (0963988367)'}
                                    // keyboardType='email-address'
                                    underlineColorAndroid={'#73aa2a'}
                                    value={this.state.registerZalo}
                                    onChangeText={(registerZalo) => {
                                        this.setState({ registerZalo })
                                    }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)

                                    }}
                                />

                            </View>

                            {/* Whatapps Messenger */}
                            <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, alignItems: 'center' }}>
                                {/* <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', color: '#fff' }} name='ios-chatbubbles' /> */}
                                <Image style={{ flex: 1, paddingTop: 12, width: 30, height: 22 }} source={require('../assets/icons/chat_whatapps.png')} />
                                <FormInput
                                    ref='whatappsInput'
                                    // returnKeyType={"next"}
                                    returnKeyType={"done"}
                                    onSubmitEditing={(event) => {
                                        Keyboard.dismiss()
                                        //this._registerAccountAsync();
                                    }}
                                    containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={'Whatapps (+84963988367)'}
                                    // keyboardType='email-address'
                                    underlineColorAndroid={'#73aa2a'}
                                    value={this.state.registerWhatapps}
                                    onChangeText={(registerWhatapps) => {
                                        this.setState({ registerWhatapps })
                                    }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)

                                    }}
                                />

                            </View>
                            {/* Verify Cellphone */}
                            {/* <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                            <FormInput
                                ref='verifyCellPhoneInput'
                                returnKeyType={"done"}
                                onSubmitEditing={(event) => {
                                    this._registerAccountAsync();
                                }}
                                containerStyle={{ flex: 1, borderWidth: 0.6, borderColor: '#9B9D9D', borderRadius: 10, padding: 5, marginTop: 10, }}
                                inputStyle={{}}
                                placeholder='Mã xác nhận số điện thoại (4 số)'
                                secureTextEntry={true}
                                underlineColorAndroid={'#fff'}
                                keyboardType='numeric'
                                value={this.state.registerConfirmCellPhone}
                                onChangeText={(registerConfirmCellPhone) => { this.setState({ registerConfirmCellPhone }) }}
                                onFocus={(event) => {
                                    this._scrollToInput(event.target)
                                }}

                            />
                        </View> */}

                        </View>


                        {/* The view that will animate to match the keyboards height */}
                        {/* <KeyboardSpacer /> */}
                    </KeyboardAvoidingView>
                </KeyboardAwareScrollView>

                {/* Form Button */}
                <View style={{
                    height: 80, flexDirection: 'row',
                    alignItems: 'center', justifyContent: 'center',
                    // paddingBottom: 10,
                    // shadowColor: '#000',
                    // shadowOffset: { width: 0, height: 2 },
                    // shadowOpacity: 0.2,
                    // shadowRadius: 2,
                    // elevation: 2,
                }}>
                    <Button
                        buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                        raised={false}
                        icon={{ name: 'ios-backspace', type: 'ionicon' }}
                        title={translate("Cancel")}
                        onPress={() => {
                            Keyboard.dismiss()
                            this.setState({
                                registerCellPhone: '',
                                registerPassword: '',
                                registerConfirmPassword: '',
                                registerAccountImage: null,
                                registerFullName: '',
                                registerConfirmCellPhone: '',
                                registerEmail: '',
                            })

                            this.props.navigation.goBack();
                        }}
                    />

                    <Button
                        buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                        raised={false}
                        icon={{ name: 'md-checkmark', type: 'ionicon' }}
                        title={translate("Agree")}
                        onPress={() => {
                            Keyboard.dismiss()
                            this._registerAccountAsync();
                        }}
                    />
                </View>





                {/* Popup select image library or camera */}
                <PopupDialog
                    ref={(popupSelectedImage) => { this.popupSelectedImage = popupSelectedImage; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogStyle={{ marginBottom: 0, width: width * 0.9, height: 130, justifyContent: 'center', padding: 20 }}
                    dismissOnTouchOutside={true}
                >
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
                        <TouchableOpacity
                            style={{ flex: 2, justifyContent: 'center', alignContent: 'center' }}
                            onPress={async () => {
                                this.popupSelectedImage.dismiss();
                                this._pickImageAsync('library')
                            }}
                        >
                            <Ionicons style={{ fontSize: 40, borderRadius: 10, backgroundColor: '#a4d227', color: '#fff', textAlign: 'center', padding: 10 }} name='ios-folder-open' >
                            </Ionicons>
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>{translate("Image library")}</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}></View>
                        <TouchableOpacity
                            style={{ flex: 2, justifyContent: 'center', alignContent: 'center', }}
                            onPress={async () => {
                                this.popupSelectedImage.dismiss();
                                this._pickImageAsync('camera')
                            }}
                        >
                            <Ionicons style={{ fontSize: 40, borderRadius: 10, backgroundColor: '#a4d227', color: '#fff', textAlign: 'center', padding: 10 }} name='md-camera' />
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>{translate("Camera")}</Text>
                        </TouchableOpacity>
                    </View>
                </PopupDialog>

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

            </View>
        )
    }
}