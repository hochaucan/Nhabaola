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
import saveStorageAsync from '../components/saveStorageAsync';
import { TextInputMask, TextMask } from 'react-native-masked-text';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import enTranslation from '../components/en.json';
import zhTranslation from '../components/zh.json';
import viTranslation from '../components/vi.json';
import { setLocalization, translate, Translate } from 'react-native-translate';
import KeyboardSpacer from 'react-native-keyboard-spacer';

var { height, width } = Dimensions.get('window');

export default class UpdateAccountScreen extends React.Component {

    static navigationOptions = {
        // title: 'app.json',
        header: null,
    };

    constructor(props) {
        super(props)
        this.state = {
            profile: null,
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
        this._getAccountDetailAsync();
    }

    componentDidMount() {

    }

    _getAccountDetailAsync = async () => {
        await this.setState({
            profile: this.props.navigation.state.params.item
        })


        this.setState({
            registerFullName: this.state.profile.FullName.indexOf('|') > -1 ? this.state.profile.FullName.split('|')[0] : this.state.profile.FullName,

            registerFacebookMessanger: this.state.profile.FullName.indexOf('http://m.me/') > -1
                ?
                (this.state.profile.FullName.slice(this.state.profile.FullName.indexOf('http://m.me/'),
                    this.state.profile.FullName.indexOf('|', this.state.profile.FullName.indexOf('http://m.me/'))).replace('http://m.me/', ''))
                : '',

            registerZalo: this.state.profile.FullName.indexOf('http://zalo.me/') > -1
                ?
                (this.state.profile.FullName.slice(this.state.profile.FullName.indexOf('http://zalo.me/'),
                    this.state.profile.FullName.indexOf('|', this.state.profile.FullName.indexOf('http://zalo.me/'))).replace('http://zalo.me/', ''))
                : '',

            registerWhatapps: this.state.profile.FullName.indexOf('https://api.whatsapp.com/') > -1
                ?
                (this.state.profile.FullName.slice(this.state.profile.FullName.indexOf('https://api.whatsapp.com/'),
                    this.state.profile.FullName.indexOf('|', this.state.profile.FullName.indexOf('https://api.whatsapp.com/'))).replace('https://api.whatsapp.com/send?phone=', ''))
                : '',

            registerAccountImage: this.state.profile.Avarta,
            registerEmail: this.state.profile.Email,
            registerCellPhone: this.state.profile.UserName,
        })

    }


    _updateAccountAsync = async () => {
        let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        //Form validation
        if (Platform.OS === 'android') {
            if (this.state.registerAccountImage === null) {
                ToastAndroid.showWithGravity(translate("Please select a avatar"), ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }

            if (this.state.registerFullName === '') {
                ToastAndroid.showWithGravity(translate("Please enter fullname"), ToastAndroid.SHORT, ToastAndroid.TOP);
                this.refs.fullNameInput.focus();
                return;
            }

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
        else {
            if (this.state.registerAccountImage === null) {
                Alert.alert(translate("Notice"), translate("Please select a avatar"));
                return;
            }

            if (this.state.registerFullName === '') {
                Alert.alert(translate("Notice"), translate("Please enter fullname"));
                return;
            }
            if (this.state.registerEmail === '') {
                Alert.alert(translate("Notice"), translate("Please enter Email"));
                return;
            }
            if (emailReg.test(this.state.registerEmail) === false) {
                Alert.alert(translate("Notice"), translate("The email is incorrect"));
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

        //alert(_fullName)
        //return

        // Upload Avatar
        if (this.state.registerAccountImage != null) {
            if (!this.state.registerAccountImage.match("http")) {
                let uploadResponse = await uploadImageAsync(this.state.registerAccountImage);
                let uploadResult = await uploadResponse.json();
                this.setState({
                    registerAccountImage: uploadResult.ImagePath.match("http") ? uploadResult.ImagePath.replace('|', '') : ""
                })
            }
        }


        //Post to register account
        try {
            await fetch("http://nhabaola.vn/api/Account/FO_Account_Edit", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                //body: JSON.stringify(this.state.objectRegisterAccount)


                body: JSON.stringify({

                    "ID": this.state.profile.ID,
                    "FullName": _fullName,//this.state.registerFullName,
                    "Email": this.state.registerEmail,
                    "Sex": Platform.OS == 'ios' ? '0' : '1',
                    "Avarta": this.state.registerAccountImage, //uploadResult.location,
                    //"YearOfBirth": "1985-05-19",
                    "Address": globalVariable.PHONE_TOKEN,
                    "ContactPhone": this.state.registerCellPhone,
                    "CreatedBy": this.state.profile.ID,
                    "UpdatedBy": this.state.profile.UpdatedBy,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    //alert(JSON.stringify(responseJson))

                    if (JSON.stringify(responseJson.ErrorCode) === "0") { // Update Account successful
                        this.popupLoadingIndicator.dismiss();
                        //alert(JSON.stringify(this.state.profile))
                        this.props.navigation.state.params.onRefreshScreen({
                            profile: {
                                ID: this.state.profile.ID,
                                UserName: this.state.profile.UserName,
                                FullName: _fullName,//this.state.registerFullName,
                                Email: this.state.registerEmail,
                                Avarta: this.state.registerAccountImage,
                                YearOfBirth: this.state.profile.YearOfBirth,
                                Address: this.state.profile.Address,
                                ContactPhone: this.state.profile.ContactPhone,
                                Password: this.state.profile.Password,
                                RegistryDate: this.state.profile.RegistryDate,
                                AccountType: this.state.profile.AccountType,
                                IsActive: this.state.profile.IsActive,
                                CreatedBy: this.state.profile.CreatedBy,
                                CreatedDate: this.state.profile.CreatedDate,
                                UpdatedBy: this.state.profile.UpdatedBy,
                                UpdatedDate: this.state.profile.UpdatedDate,
                            }
                        });


                        this.props.navigation.goBack();

                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity(translate("Your information is updated successfully"), ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert(translate("Notice"), translate("Your information is updated successfully"));
                        }
                    }
                    else { alert(responseJson.ErrorCode) }

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
                        }}>{translate("Personal information")}</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={{}}
                        onPress={() => {
                            this.props.navigation.goBack()

                        }}>
                        <Ionicons style={{ fontSize: 28, color: '#fff', }} name='ios-arrow-back'></Ionicons>
                    </TouchableOpacity>
                    <Text style={{
                        marginLeft: 20, color: '#fff',
                        fontSize: responsiveFontSize(2), justifyContent: 'center'
                    }}>{translate("Personal information")}</Text> */}
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


                                {/* <Ionicons style={{ opacity: 0.7, fontSize: 100, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-contact' />
                                {this.state.registerAccountImage
                                    && <Image source={{ uri: this.state.registerAccountImage }}
                                        style={{ width: 80, height: 80, borderRadius: Platform.OS === 'ios' ? 40 : 100, marginTop: Platform.OS === 'ios' ? -99 : -90, marginLeft: Platform.OS === 'ios' ? 7 : 1, marginBottom: 10, }}
                                    />
                                } */}


                                <Text style={{}}>{translate("Avatar")}</Text>
                            </TouchableOpacity>

                        </View>
                        <View>
                            {/* Cellphone */}
                            <View style={{ position: 'relative', flexDirection: 'row', }}>
                                <Ionicons style={{ flex: 2, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-call' />
                                <Text style={{ flex: 15, marginLeft: 10, color: '#73aa2a', marginTop: 10, }}>{this.state.registerCellPhone}</Text>

                                {/* <FormInput
                                containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 20 : 10 }}
                                inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                placeholder='Số điện thoại'
                                autoCapitalize='sentences'
                                keyboardType='numeric'
                                underlineColorAndroid={'#73aa2a'}
                                onChangeText={(registerCellPhone) => this.setState({ registerCellPhone })}
                                value={this.state.registerCellPhone}
                            /> */}
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

                            {/* Fulllname */}
                            <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-person' />
                                <FormInput
                                    ref='fullNameInput'
                                    returnKeyType={"next"}
                                    onSubmitEditing={(event) => {
                                        this.refs.emailInput.focus();
                                    }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)
                                    }}
                                    containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={translate("Name")}
                                    underlineColorAndroid={'#73aa2a'}
                                    value={this.state.registerFullName}
                                    onChangeText={(registerFullName) => { this.setState({ registerFullName }) }}
                                />

                            </View>
                            {/* Email */}
                            <View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                                <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-mail' />
                                <FormInput
                                    ref='emailInput'
                                    returnKeyType={"next"}
                                    onSubmitEditing={(event) => {
                                        // Keyboard.dismiss();
                                        //this._updateAccountAsync();
                                        this.refs.fmInput.focus();
                                    }}
                                    onFocus={(event) => {
                                        this._scrollToInput(event.target)
                                    }}
                                    containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                                    inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                    placeholder={translate("Email (to retrieve password)")}
                                    keyboardType='email-address'
                                    underlineColorAndroid={'#73aa2a'}
                                    value={this.state.registerEmail}
                                    onChangeText={(registerEmail) => { this.setState({ registerEmail }) }}
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
                        </View>
                        {/* The view that will animate to match the keyboards height */}
                        <KeyboardSpacer />
                    </KeyboardAvoidingView>
                </KeyboardAwareScrollView>

                {/* Form Button */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
                    <Button
                        buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                        raised={false}
                        icon={{ name: 'ios-backspace', type: 'ionicon' }}
                        title={translate("Cancel")}
                        onPress={() => {
                            this.setState({
                                registerCellPhone: '',
                                //  registerPassword: '',
                                // registerConfirmPassword: '',
                                registerAccountImage: null,
                                registerFullName: '',
                                // registerConfirmCellPhone: '',
                                registerEmail: '',
                            })

                            this.props.navigation.goBack();
                        }}
                    />

                    <Button
                        buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                        raised={false}
                        icon={{ name: 'md-checkmark', type: 'ionicon' }}
                        title={translate("Updates")}
                        onPress={() => {
                            this._updateAccountAsync();
                        }}
                    />
                </View>
                {/* The view that will animate to match the keyboards height */}
                {/* <KeyboardSpacer /> */}




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