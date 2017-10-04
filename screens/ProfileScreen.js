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

} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants, ImagePicker } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import { users } from '../components/examples/data';
import Accordion from 'react-native-collapsible/Accordion';
import saveStorageAsync from '../components/saveStorageAsync';


var { height, width } = Dimensions.get('window');

const SECTIONS = [
    {
        title: 'First',
        content: 'Lorem ipsum...',
    },
    {
        title: 'Second',
        content: 'Lorem ipsum...',
    },
    {
        title: 'Third',
        content: 'BACON_IPSUM',
    },
    {
        title: 'Fourth',
        content: 'BACON_IPSUM',
    },
    {
        title: 'Fifth',
        content: 'BACON_IPSUM',
    },
];

//const profile = null;

export default class ProfileScreen extends React.Component {

    static navigationOptions = {
        // title: 'Links',
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

            // Posted Room History
            postedRoomHistoryData: users,

            // Update Account
            updateAccountImage: null,
            profile: null,
        }


    }


    componentWillMount() {
        this._getProfileFromStorageAsync();

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
    componentWillUpdate() {
        //this._getProfileFromStorageAsync();
    }

    static _updateProfileAfterLogin(_profile) {

        //alert(_profile)
        //profile = _profile;
    }

    _getProfileFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('FO_Account_Login');

            if (value !== null) {
                this.setState({
                    profile: JSON.parse(value)
                })
            }
            else {
                this.setState({
                    profile: null
                })
            }

        } catch (e) {
            console.log(e);
        }

        //alert(JSON.stringify(profile))
        //alert(profile)
    }


    _handleMapRegionChange = mapRegion => {
        this.setState({ mapRegion });
    };

    _updateAccount = () => {

    }

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

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
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
                                    : <Image source={{ uri: this.state.profile.Avarta }} style={{ width: 60, height: 60, borderRadius: 100, }} />
                                }

                            </TouchableOpacity>
                        </View>
                        {this.state.profile
                            ?
                            <View style={{ flex: 4, paddingLeft: 20, marginTop: 10 }}>
                                <Text style={styles.cardAvatarName}>{this.state.profile.FullName}</Text>
                                <Text style={styles.cardAvatarAddress}>{this.state.profile.RegistryDate}</Text>
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
                                    <Text style={styles.cardAvatarName}>Đăng nhập</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </View>
                <ScrollView style={styles.profileMenuBox}>
                    <TouchableOpacity style={styles.profileMenuItem}>
                        <Ionicons style={styles.profileMenuItemText} name='md-cloud-upload'>
                            <Text>  Đăng tin</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {
                            {/* this.setState({ modalPostedRoomHistory: true }) */ }
                            this.props.navigation.navigate('PostedRoomHIstoryScreen');
                        }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='md-folder'>
                            <Text>  Tin đã đăng</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}>
                        <Ionicons style={styles.profileMenuItemText} name='logo-usd'>
                            <Text>  Ví tiền:  500.000.000 đ</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <View style={styles.profileMenuItemSeparator}></View>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {
                            this.setState({
                                modalUpdateAccount: true,
                            })
                        }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='md-information-circle'>
                            <Text>  Thông tin cá nhân</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => {
                            this.popupChangePassword.show();
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
                            <Text>  Đổi mật khẩu</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}
                        onPress={() => { this.setState({ modalHelp: true }) }}
                    >
                        <Ionicons style={styles.profileMenuItemText} name='md-help'>
                            <Text>  Giúp đỡ</Text>
                        </Ionicons>
                    </TouchableOpacity>

                    {this.state.profile ?
                        <TouchableOpacity style={styles.profileMenuItem}
                            onPress={() => {
                                Alert.alert(
                                    'Thông báo',
                                    'Bạn chắc chắn Đăng xuất?',
                                    [
                                        {
                                            text: 'OK', onPress: () => {
                                                //BackHandler.exitApp()
                                                saveStorageAsync('FO_Account_Login', '')
                                                saveStorageAsync('SessionKey', '')
                                                saveStorageAsync('loginUsername', '')
                                                saveStorageAsync('loginPassword', '')
                                                this.setState({ profile: null })
                                                // this.props.navigation.navigate('HomeScreen')
                                                this.props.navigation.goBack();
                                            }
                                        },
                                    ]
                                );

                            }}
                        >
                            <Ionicons style={styles.profileMenuItemText} name='md-exit'>
                                <Text>  Đăng xuất</Text>
                            </Ionicons>
                        </TouchableOpacity>
                        : null}
                </ScrollView>



                {/* Popup Change Password*/}
                <PopupDialog
                    ref={(popupChangePassword) => { this.popupChangePassword = popupChangePassword; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogTitle={<DialogTitle title="Đổi mật khẩu" titleStyle={{}} titleTextStyle={{ color: '#73aa2a' }} />}
                    dismissOnTouchOutside={false}
                    dialogStyle={{ marginBottom: 150, width: width * 0.9, height: height * 0.5, }}


                >

                    <View>
                        <Animated.View style={{ position: 'relative', left: this.state.animation.usernamePostionLeft, flexDirection: 'row', padding: 10, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock-outline' />
                            <FormInput
                                containerStyle={{ flex: 15, paddingLeft: 5, }}
                                placeholder='Mật khẩu củ'
                                autoCapitalize='sentences'
                                keyboardType='phone-pad'
                                underlineColorAndroid={'#fff'}
                                onChangeText={(text) => this.setState({ text })}
                                value={this.state.text}
                            />


                        </Animated.View>
                        <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock-outline' />
                            <FormInput
                                containerStyle={{ flex: 15 }}
                                placeholder='Mật khẩu mới'
                                secureTextEntry={true}
                                underlineColorAndroid={'#fff'}
                            />
                        </Animated.View>
                        <Animated.View style={{ position: 'relative', left: this.state.animation.passwordPositionLeft, flexDirection: 'row', padding: 10, paddingTop: 0, }}>
                            <Ionicons style={{ flex: 1, fontSize: 22, paddingTop: 12, textAlign: 'center', }} name='ios-lock-outline' />
                            <FormInput
                                containerStyle={{ flex: 15 }}
                                placeholder='Xác nhận mật khẩu mới'
                                secureTextEntry={true}
                                underlineColorAndroid={'#fff'}
                            />
                        </Animated.View>

                    </View>


                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
                        <Button
                            buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                            raised={false}
                            icon={{ name: 'ios-backspace', type: 'ionicon' }}
                            title='Hủy'
                            onPress={() => { this.popupChangePassword.dismiss() }}
                        />

                        <Button
                            buttonStyle={{ backgroundColor: '#73aa2a', padding: 10, borderRadius: 5, }}
                            raised={false}
                            icon={{ name: 'md-checkmark', type: 'ionicon' }}
                            title='Đồng ý' />
                    </View>
                </PopupDialog>

                {/* Modal Update Account*/}
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalUpdateAccount}
                    onRequestClose={() => { alert("Modal has been closed.") }}
                >
                    <ScrollView>
                        <View style={{ flexDirection: 'row', padding: 20, marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                style={{}}
                                onPress={() => this._pickPostRoomImage('updateAccountImage')}
                            >
                                <Ionicons style={{ opacity: 0.7, fontSize: 100, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-contact' />
                                {this.state.updateAccountImage && <Image source={{ uri: this.state.updateAccountImage }} style={{ width: 80, height: 80, borderRadius: 100, marginTop: -90, marginLeft: 17, marginBottom: 10, }} />}
                                <Text style={{}}>Đổi hình đại diện</Text>
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
                                    /* keyboardType='phone-pad' */
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
                                    /* keyboardType='email-address' */
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
                </Modal>

                {/* Modal Help*/}
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalHelp}
                    onRequestClose={() => { alert("Modal has been closed.") }}
                >
                    <View style={{ flexDirection: 'row', padding: 20, marginTop: Platform.OS === 'ios' ? 20 : 0, }}>
                        <TouchableOpacity
                            style={{}}
                            onPress={() => this.setState({ modalHelp: false })}>
                            <Ionicons style={{ fontSize: 28, color: '#a4d227', }} name='md-arrow-back'></Ionicons>
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 20, color: '#73aa2a', fontSize: 20, justifyContent: 'center' }}>Câu hỏi phổ biến</Text>
                    </View>
                    <ScrollView>
                        <View style={{ padding: 20, }}>
                            <Accordion
                                sections={SECTIONS}
                                renderHeader={this._renderHeader}
                                renderContent={this._renderContent}
                                easing='bounce'
                            />
                        </View>

                        {/* <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
                            <Button
                                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 10, borderRadius: 5, }}
                                raised={false}
                                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                                title='Hủy'
                                onPress={() => { this.setState({ modalHelp: false }) }}
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
                </Modal>

                {/* Modal Posted Room History*/}
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalPostedRoomHistory}
                    onRequestClose={() => { alert("Modal has been closed.") }}
                >
                    <View style={{ flexDirection: 'row', padding: 20, }}>
                        <TouchableOpacity
                            style={{}}
                            onPress={() => this.setState({ modalPostedRoomHistory: false, })}>
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
                </Modal>
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
