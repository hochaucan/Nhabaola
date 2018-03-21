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
} from 'react-native';
import { WebBrowser, ImagePicker, Facebook } from 'expo';
import { MonoText } from '../components/StyledText';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import uploadImageAsync from '../api/uploadImageAsync';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

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

        //Form validation
        if (Platform.OS === 'android') {
            if (this.state.registerAccountImage === null) {
                ToastAndroid.showWithGravity('Vui lòng chọn hình đại diện', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.registerCellPhone === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập Số Điện Thoại', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.registerPassword === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập mật khẩu', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.registerPassword != this.state.registerConfirmPassword) {
                ToastAndroid.showWithGravity('Xác nhận mật khẩu không đúng', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            if (this.state.registerFullName === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập Họ Tên', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
            // if (this.state.registerConfirmCellPhone === '') {
            //     ToastAndroid.showWithGravity('Vui lòng nhập mã xác nhận Số Điện Thoại', ToastAndroid.SHORT, ToastAndroid.TOP);
            //     return;
            // }
            if (this.state.registerEmail === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập Email', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
        }
        else {
            if (this.state.registerAccountImage === null) {
                Alert.alert('Thông báo', 'Vui lòng chọn hình đại diện');
                return;
            }
            if (this.state.registerCellPhone === '') {
                Alert.alert('Thông báo', 'Vui lòng nhập Số Điện Thoại');
                return;
            }
            if (this.state.registerPassword === '') {
                Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu');
                return;
            }
            if (this.state.registerPassword != this.state.registerConfirmPassword) {
                Alert.alert('Thông báo', 'Xác nhận mật khẩu không đúng');
                return;
            }
            if (this.state.registerFullName === '') {
                Alert.alert('Thông báo', 'Vui lòng nhập Họ Tên');
                return;
            }
            if (this.state.registerEmail === '') {
                Alert.alert('Thông báo', 'Vui lòng nhập Email');
                return;
            }
            // if (this.state.registerConfirmCellPhone === '') {
            //     Alert.alert('Thông báo', 'Vui lòng nhập mã xác nhận Số Điện Thoại');
            //     return;
            // }
        }

        this.popupLoadingIndicator.show();

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
                    "FullName": this.state.registerFullName,
                    "Email": this.state.registerEmail,
                    "Sex": "",
                    //"YearOfBirth": "2017-10-09",
                    "Address": "",
                    "ContactPhone": this.state.registerCellPhone,
                    "Password": this.state.registerPassword,
                    "IsActive": "true",
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.popupLoadingIndicator.dismiss();

                    if (JSON.stringify(responseJson.ErrorCode) === "0") { // Account registered successful
                        //ToastAndroid.showWithGravity('Đăng nhập thành công!', ToastAndroid.SHORT, ToastAndroid.TOP);

                        // Login after register account
                        this.props.navigation.state.params.login();
                        this.props.navigation.goBack();

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
                        ToastAndroid.showWithGravity('Tài khoản này đã tồn tại', ToastAndroid.SHORT, ToastAndroid.TOP);
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
                        style={{}}
                        onPress={() => {
                            this.props.navigation.goBack()
                        }}>
                        <Ionicons style={{ fontSize: 28, color: '#fff', }} name='md-arrow-back'></Ionicons>
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 20, color: '#fff', fontSize: responsiveFontSize(2), justifyContent: 'center' }}>ĐK Tài khoản</Text>
                </View>

                <KeyboardAwareScrollView
                    innerRef={ref => { this.scroll = ref }}
                >
                    <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                this.popupSelectedImage.show()
                            }
                            }
                        >
                            <Ionicons style={{ opacity: 0.7, fontSize: 100, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-contact' />
                            {this.state.registerAccountImage
                                && <Image source={{ uri: this.state.registerAccountImage }}
                                    style={{ width: 80, height: 80, borderRadius: Platform.OS === 'ios' ? 25 : 100, marginTop: Platform.OS === 'ios' ? -99 : -90, marginLeft: Platform.OS === 'ios' ? 7 : 1, marginBottom: 10, }}
                                />
                            }
                            <Text style={{}}>Hình đại diện</Text>
                        </TouchableOpacity>

                    </View>
                    <View>
                        {/* Cellphone */}
                        <View style={{ position: 'relative', flexDirection: 'row', padding: 10, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='md-call' />
                            <FormInput
                                containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 20 : 10 }}
                                inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                placeholder='Số điện thoại liên hệ'
                                autoCapitalize='sentences'
                                keyboardType='numeric'
                                returnKeyType={"next"}
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
                                placeholder='Mật khẩu'
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
                                placeholder='Xác nhận mật khẩu'
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
                                placeholder='Họ và tên'
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
                                // returnKeyType={"next"}
                                returnKeyType={"done"}
                                onSubmitEditing={(event) => {
                                    //this.refs.verifyCellPhoneInput.focus();
                                    this._registerAccountAsync();
                                }}
                                containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                                inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                placeholder='Email (để lấy lại mật khẩu)'
                                keyboardType='email-address'
                                underlineColorAndroid={'#73aa2a'}
                                value={this.state.registerEmail}
                                onChangeText={(registerEmail) => { this.setState({ registerEmail }) }}
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

                    {/* Form Button */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
                        <Button
                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                            raised={false}
                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                            title='Hủy'
                            onPress={() => {
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
                            title='Đăng ký'
                            onPress={() => {
                                this._registerAccountAsync();
                            }}
                        />
                    </View>

                    {/* The view that will animate to match the keyboards height */}
                    <KeyboardSpacer />
                </KeyboardAwareScrollView>



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
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>Thư viện ảnh</Text>
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
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>Camera</Text>
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