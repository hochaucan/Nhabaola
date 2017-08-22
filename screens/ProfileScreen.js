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
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';

var { height, width } = Dimensions.get('window');
export default class ProfileScreen extends React.Component {

    static navigationOptions = {
        // title: 'Links',
        header: null,
    };



    _handleMapRegionChange = mapRegion => {
        this.setState({ mapRegion });
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>

                        <View style={styles.cardAvatarBox}>
                            <TouchableOpacity
                                onPress={() => {
                                    this.props.navigation.navigate('ProfileScreen');
                                }}
                            >
                                <Image
                                    style={styles.cardAvatarImage}
                                    source={require('../images/nha-bao-la.jpg')} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.cardAvatarTextBox}>
                            <Text style={styles.cardAvatarName}>Nguyễn Văn Bảo</Text>
                            <Text style={styles.cardAvatarAddress}>Đăng ký ngày 23 tháng 8 năm 2017</Text>
                            <TouchableOpacity style={styles.cardAvatarPhoneBox}>
                                <Ionicons style={styles.cardAvatarPhoneIcon} name='logo-whatsapp' />
                                <Text style={styles.cardAvatarPhone}>: 0973730111</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <ScrollView style={styles.profileMenuBox}>
                    <TouchableOpacity style={styles.profileMenuItem}>
                        <Ionicons style={styles.profileMenuItemText} name='md-cloud-upload'>
                            <Text>  Đăng tin</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}>
                        <Ionicons style={styles.profileMenuItemText} name='md-folder'>
                            <Text>  Tin đã đăng</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}>
                        <Ionicons style={styles.profileMenuItemText} name='logo-usd'>
                            <Text>  Nạp ví tiền</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <View style={styles.profileMenuItemSeparator}></View>
                    <TouchableOpacity style={styles.profileMenuItem}>
                        <Ionicons style={styles.profileMenuItemText} name='md-information-circle'>
                            <Text>  Thông tin cá nhân</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}>
                        <Ionicons style={styles.profileMenuItemText} name='md-lock'>
                            <Text>  Đổi mật khẩu</Text>
                        </Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileMenuItem}>
                        <Ionicons style={styles.profileMenuItemText} name='md-help'>
                            <Text>  Giúp đỡ</Text>
                        </Ionicons>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    profileMenuItemText: {
        fontSize: 18,
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
        marginBottom: 5
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
    backScreenIcon: {
        fontSize: 28,
        color: '#a4d227',
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
        height: 60,
        // borderBottomWidth: 0.5,
        borderColor: '#d6d7da',
        padding: 0,
        flexDirection: 'column',
    },
    cardHeader: {
        // flex: 2,
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 0.7,
        borderColor: '#a4d227',
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
