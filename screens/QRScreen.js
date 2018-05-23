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
import { Constants, Permissions, BarCodeScanner, } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import globalVariable from '../components/Global'
import notifyNBLAsync from '../api/notifyNBLAsync';
import enTranslation from '../components/en.json';
import zhTranslation from '../components/zh.json';
import viTranslation from '../components/vi.json';
import { setLocalization, translate, Translate } from 'react-native-translate';
import saveStorageAsync from '../components/saveStorageAsync';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

var { height, width } = Dimensions.get('window');
const isScanQR = false;

export default class QRScreen extends React.Component {

    static navigationOptions = {
        // title: 'Links',
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {

            profile: null,
            isVietnamease: false,
            isEnglish: false,
            isChinease: false,
        }
    }

    componentWillMount() {

        this._getLanguageFromStorageAsync();
        this._getProfileFromStorageAsync();
        isScanQR = true
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

    _handleBarCodeRead = async (data) => {
        // Alert.alert(
        //   'Scan successful!',
        //   JSON.stringify(data.data)
        // );


        if (isScanQR) {
            isScanQR = await false

            if (data.data.indexOf("nbl") <= -1) {

                //this.popupQRPay.dismiss();

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

                        // this.popupQRPay.dismiss();
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
            <View style={{
                flex: 1,
            }}>
                <BarCodeScanner
                    onBarCodeRead={
                        this._handleBarCodeRead
                    }
                    style={{
                        width: responsiveWidth(80),
                        height: responsiveHeight(60)
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
