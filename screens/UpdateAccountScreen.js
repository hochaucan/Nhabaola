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
import saveStorageAsync from '../components/saveStorageAsync';
import { TextInputMask, TextMask } from 'react-native-masked-text';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

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

        //alert(JSON.stringify(this.state.profile))
        this.setState({
            registerFullName: this.state.profile.FullName,
            registerAccountImage: this.state.profile.Avarta,
            registerEmail: this.state.profile.Email,
            registerCellPhone: this.state.profile.UserName,
        })

    }


    _updateAccountAsync = async () => {

        //Form validation
        if (Platform.OS === 'android') {
            if (this.state.registerAccountImage === null) {
                ToastAndroid.showWithGravity('Vui lòng chọn hình đại diện', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }

            if (this.state.registerFullName === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập Họ Tên', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }

            if (this.state.registerEmail === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập Email', ToastAndroid.SHORT, ToastAndroid.TOP);
                return;
            }
        }
        else {
            if (this.state.registerAccountImage === null) {
                Alert.alert('Vui lòng chọn hình đại diện');
                return;
            }

            if (this.state.registerFullName === null) {
                Alert.alert('Oops!', 'Vui lòng nhập Họ Tên');
                return;
            }
            if (this.state.registerEmail === null) {
                Alert.alert('Oops!', 'Vui lòng nhập Email');
                return;
            }
        }

        this.popupLoadingIndicator.show();

        if (this.state.registerAccountImage != null) {
            if (!this.state.registerAccountImage.match("http")) {
                let uploadResponse = await uploadImageAsync(this.state.registerAccountImage);
                let uploadResult = await uploadResponse.json();
                this.setState({
                    registerAccountImage: uploadResult.data.img_url.match("http") ? uploadResult.data.img_url : ""
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
                    "FullName": this.state.registerFullName,
                    "Email": this.state.registerEmail,
                    "Sex": "",
                    "Avarta": this.state.registerAccountImage, //uploadResult.location,
                    //"YearOfBirth": "1985-05-19",
                    "Address": "",
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
                                FullName: this.state.registerFullName,
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
                        //saveStorageAsync('FO_Account_Login', JSON.stringify(this.state.profile))

                        this.props.navigation.goBack();

                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity('Cập nhật thông tin thành công!', ToastAndroid.SHORT, ToastAndroid.TOP);
                        }
                        else {
                            Alert.alert('Oops!', 'Cập nhật thông tin thành công!');
                        }
                    }
                    else { alert(responseJson.ErrorCode) }

                    // this.props.navigation.state.params.onRefreshScreen({ loginUsername: registerCellPhone, loginPassword: registerPassword });
                    //this.props.navigation.state.params.login();

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
            });
        }
        else { // Get image from Camera
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
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
                <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#a4d227',alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{}}
                        onPress={() => {
                            this.props.navigation.goBack()
                            // this.props.navigation.state.params.onRefreshScreen();
                            // this.props.navigation.state.params.onRefreshScreen({ refreshScreen: true });
                            //this.props.navigation.state.params._getWalletAsync();

                        }}>
                        <Ionicons style={{ fontSize: 28, color: '#fff', }} name='md-arrow-back'></Ionicons>
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 20, color: '#fff', fontSize: responsiveFontSize(2.2), justifyContent: 'center' }}></Text>
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
                                placeholder='Họ và tên'
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
                                returnKeyType={"done"}
                                onSubmitEditing={(event) => {
                                    this._updateAccountAsync();
                                }}
                                onFocus={(event) => {
                                    this._scrollToInput(event.target)
                                }}
                                containerStyle={{ flex: 15, marginLeft: Platform.OS === 'ios' ? 22 : 18 }}
                                inputStyle={{ paddingLeft: Platform.OS === 'android' ? 4 : 0 }}
                                placeholder='Email'
                                keyboardType='email-address'
                                underlineColorAndroid={'#73aa2a'}
                                value={this.state.registerEmail}
                                onChangeText={(registerEmail) => { this.setState({ registerEmail }) }}
                            />

                        </View>
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
                            title='Cập nhật'
                            onPress={() => {
                                this._updateAccountAsync();
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