import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Image,
    Platform,
    AsyncStorage,
    ScrollView,
    Picker,
    ActivityIndicator,
    ToastAndroid,
    Alert,
    Modal,
}
    from 'react-native';
import { Constants, Location, Permissions, ImagePicker } from 'expo';
import MapView from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { CheckBox, Rating, Button, FormLabel, FormInput, SocialIcon, FormValidationMessage } from 'react-native-elements'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'; // 1.2.12
import { TextInputMask } from 'react-native-masked-text';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import PopupDialog, { SlideAnimation, ScaleAnimation, DialogTitle, DialogButton } from 'react-native-popup-dialog';
import uploadImageAsync from '../api/uploadImageAsync'
import HomeScreen from './HomeScreen';

var { height, width } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


export default class PostRoomScreen extends React.Component {
    static navigationOptions = {
        // title: 'app.json',
        header: null,
    };

    constructor(props) {
        super(props)
        this.state = {
            mapRegion: { latitude: LATITUDE, longitude: LONGITUDE, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA },
            roomCategory: [],
            selectedCategory: '0',
            postRoomImage1: null,
            postRoomImage2: null,
            postRoomImage3: null,
            postRoomImage4: null,
            postRoomImage5: null,
            postRoomImage6: null,
            imageUrl: '',
            // imageUrl1: '',
            // imageUrl2: '',
            // imageUrl3: '',
            // imageUrl4: '',
            // imageUrl5: '',
            // imageUrl6: '',
            postRoomAddressMaker: {
                latitude: null,
                longitude: null,
            },
            selectedImages: '0',
            selectedAddress: 'Vui lòng nhập địa chỉ',
            searchingMaker: {
                latitude: null,
                longitude: null,
            },
            initialRenderCurrentMaker: true,
            acreage: '',
            price: '',
            detailInfo: '',
            modalBDS: false,
            SessionKey: null,
            profile: null,
        }
    }

    componentWillMount() {
        this._getSessionKeyFromStorageAsync();
        this._getProfileFromStorageAsync();
        this._getCategoryFromStorageAsync();
    }

    componentDidMount() {

    }

    _getSessionKeyFromStorageAsync = async () => {
        try {
            var value = await AsyncStorage.getItem('SessionKey');

            if (value !== null) {
                this.setState({
                    SessionKey: JSON.parse(value)
                })
            }
            else {
                this.setState({
                    SessionKey: null,
                })
            }

        } catch (e) {
            console.log(e);
        }
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
                    profile: null,
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

    _saveStorageAsync = async (key, obj) => {
        try {
            await AsyncStorage.setItem(key, obj)
            //alert("Save OK")

        } catch (e) {
            console.log(e);
        }
    }

    _pickImageAsync = async (source, imageNo) => {
        let result = null;

        if (source === 'library') {
            result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
            });
        }
        else {
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
            });
        }

        // console.log(result);
        if (!result.cancelled) {
            switch (imageNo) {
                case '1':
                    console.log(result);
                    this.setState({ postRoomImage1: result.uri });


                    break;
                case '2':
                    this.setState({ postRoomImage2: result.uri });
                    break;
                case '3':
                    this.setState({ postRoomImage3: result.uri });
                    break;
                case '4':
                    this.setState({ postRoomImage4: result.uri });
                    break;
                case '5':
                    this.setState({ postRoomImage5: result.uri });
                    break;
                case '6':
                    this.setState({ postRoomImage6: result.uri });
                    break;
                default:

            }
        }

    };

    _postRoomAsync = async () => {
        //alert(this.state.price.replace('.','').replace('.','').replace('.','').replace('.',''))
        // return

        //Form validation
        if (Platform.OS === 'android') {
            if (this.state.postRoomImage1 === null
                // && this.state.postRoomImage2 === null
                // && this.state.postRoomImage3 === null
                // && this.state.postRoomImage4 === null
                // && this.state.postRoomImage5 === null
                // && this.state.postRoomImage6 === null
            ) {
                ToastAndroid.showWithGravity('Vui lòng chọn hình đại diện', ToastAndroid.SHORT, ToastAndroid.CENTER);
                return;
            }
            if (this.state.searchingMaker.latitude === null) {
                ToastAndroid.showWithGravity('Vui lòng nhập địa chỉ', ToastAndroid.SHORT, ToastAndroid.CENTER);
                return;
            }
            if (this.state.price === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập giá', ToastAndroid.SHORT, ToastAndroid.CENTER);
                return;
            }
            if (this.state.acreage === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập diện tích', ToastAndroid.SHORT, ToastAndroid.CENTER);
                return;
            }
            if (this.state.selectedCategory === '0') {
                ToastAndroid.showWithGravity('Vui lòng chọn loại BĐS', ToastAndroid.SHORT, ToastAndroid.CENTER);
                return;
            }
            if (this.state.detailInfo === '') {
                ToastAndroid.showWithGravity('Vui lòng nhập thông tin chi tiết', ToastAndroid.SHORT, ToastAndroid.CENTER);
                return;
            }
        }
        else { // iOS
            if (this.state.postRoomImage1 === null
                && this.state.postRoomImage2 === null
                && this.state.postRoomImage3 === null
                && this.state.postRoomImage4 === null
                && this.state.postRoomImage5 === null
                && this.state.postRoomImage6 === null
            ) {
                Alert.alert('Vui lòng chọn ít nhất 1 hình ảnh', ToastAndroid.SHORT, ToastAndroid.CENTER);
                return;
            }
            if (this.state.searchingMaker.latitude === null) {
                Alert.alert('Vui lòng nhập địa chỉ');
                return;
            }
            if (this.state.price === '') {
                Alert.alert('Vui lòng nhập giá');
                return;
            }
            if (this.state.acreage === '') {
                Alert.alert('Vui lòng nhập diện tích');
                return;
            }
            if (this.state.selectedCategory === '0') {
                Alert.alert('Vui lòng chọn loại BĐS');
                return;
            }
            if (this.state.detailInfo === '') {
                Alert.alert('Vui lòng nhập thông tin chi tiết');
                return;
            }
        }

        //Loading
        this.popupLoadingIndicator.show();

        //await this._postImage('http://www.google.com/images/srpr/nav_logo66.png');
        //console.log(this.state.postRoomImage1)
        //await this._postImage(this.state.postRoomImage1);

        if (this.state.postRoomImage1 != null) {
            let uploadResponse = await uploadImageAsync(this.state.postRoomImage1);
            let uploadResult = await uploadResponse.json();
            this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.location })
        }
        if (this.state.postRoomImage2 != null) {
            let uploadResponse = await uploadImageAsync(this.state.postRoomImage2);
            let uploadResult = await uploadResponse.json();
            this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.location })
        }
        if (this.state.postRoomImage3 != null) {
            let uploadResponse = await uploadImageAsync(this.state.postRoomImage3);
            let uploadResult = await uploadResponse.json();
            this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.location })
        }

        if (this.state.postRoomImage4 != null) {
            let uploadResponse = await uploadImageAsync(this.state.postRoomImage4);
            let uploadResult = await uploadResponse.json();
            this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.location })
        }
        if (this.state.postRoomImage5 != null) {
            let uploadResponse = await uploadImageAsync(this.state.postRoomImage5);
            let uploadResult = await uploadResponse.json();
            this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.location })
        }
        if (this.state.postRoomImage6 != null) {
            let uploadResponse = await uploadImageAsync(this.state.postRoomImage6);
            let uploadResult = await uploadResponse.json();
            this.setState({ imageUrl: this.state.imageUrl + '|' + uploadResult.location })
        }


        // this.setState({ image: uploadResult.location });

        //alert(this.state.imageUrl)

        //return

        try {
            await fetch("http://nhabaola.vn/api/RoomBox/FO_RoomBox_Add", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    "Title": this.state.imageUrl.split('|')[1],
                    "Images": this.state.imageUrl,
                    "CategoryID": this.state.selectedCategory,
                    "Address": this.state.selectedAddress,
                    "Longitude": this.state.searchingMaker.longitude,
                    "Latitude": this.state.searchingMaker.latitude,
                    "Description": this.state.detailInfo,
                    "Price": this.state.price.replace('.', '').replace('.', '').replace('.', '').replace('.', ''),
                    "Acreage": this.state.acreage,
                    "Toilet": "",
                    "Bedroom": "",
                    "AirConditioner": "",
                    "ContactPhone": "",
                    "FromDate": "2017-10-30",
                    "ToDate": "2017-12-09",
                    "IsTop": "true",
                    "IsPinned": "true",
                    "IsHighlight": "false",
                    "HighlightFromDate": "2017-10-30",
                    "HighlightToDate": "2017-12-09",
                    "IsActive": "true",
                    "CreatedBy": this.state.profile.ID,
                    "UpdatedBy": this.state.SessionKey,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    this.popupLoadingIndicator.dismiss();
                    this.props.navigation.goBack();
                    HomeScreen.refreshRoomBoxAfterPost();
                    //this.props.navigation.navigate("HomeScreen", { tmp: 'Can' })
                }).
                catch((error) => { console.log(error) });
        } catch (error) {
            console.log(error)
        }


    }



    _postImage = async (file) => {
        // var tmp = file.replace('file://', '');
        var postLink = 'http://uploads.im/api?upload=' + file
        //console.log(postLink)


        //Post to register account
        try {
            await fetch(postLink)
                .then((response) => response.json())
                .then((responseJson) => {

                    this.setState({ imageUrl1: responseJson.data.img_url })
                    console.log(responseJson.data.img_url)

                })
                .catch((e) => { console.log(e) });
        } catch (error) {
            console.log(error)
        }


    }

    render() {

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <ScrollView style={{ paddingTop: 10, marginTop: 20, }}>
                    <FormLabel>Hình ảnh</FormLabel>
                    <View style={{
                        height: 120, paddingRight: 20,
                        paddingLeft: 20, flexDirection: 'row', justifyContent: 'space-between',

                    }}>

                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '1' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.7, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage1 && <Image source={{ uri: this.state.postRoomImage1 }} style={{ width: 100, height: 100 }} />}
                            <Text style={{ color: '#73aa2a', fontSize: 12, textAlign: 'center', paddingTop: 5, }}>Hình đại diện</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '2' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage2 && <Image source={{ uri: this.state.postRoomImage2 }} style={{ width: 100, height: 100 }} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '3' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage3 && <Image source={{ uri: this.state.postRoomImage3 }} style={{ width: 100, height: 100 }} />}
                        </TouchableOpacity>

                    </View>
                    <View style={{
                        height: 120, paddingRight: 20,
                        paddingLeft: 20, flexDirection: 'row', justifyContent: 'space-between',

                    }}>

                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '4' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage4 && <Image source={{ uri: this.state.postRoomImage4 }} style={{ width: 100, height: 100 }} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '5' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage5 && <Image source={{ uri: this.state.postRoomImage5 }} style={{ width: 100, height: 100 }} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{}}
                            onPress={async () => {
                                await this.setState({ selectedImages: '6' })
                                this.popupSelectedImage.show();
                            }}
                        >
                            <Ionicons style={{ opacity: 0.4, fontSize: 120, color: '#73aa2a', flex: 1, textAlign: 'center', }} name='ios-image-outline' />
                            {this.state.postRoomImage6 && <Image source={{ uri: this.state.postRoomImage6 }} style={{ width: 100, height: 100 }} />}
                        </TouchableOpacity>

                    </View>
                    {/* <FormLabel style={{ borderBottomWidth: 0.7, borderColor: '#a4d227', marginTop: 15, }}>Địa chỉ</FormLabel> */}
                    <View style={{ height: 270, padding: 20, }}>
                        {/* <FormInput
                containerStyle={{ marginLeft: 0, marginRight: 0, }}
                placeholder='Vui lòng nhập địa chỉ'
                autoCapitalize='sentences'
                maxLength={300}
              /> */}
                        <TouchableOpacity
                            style={{
                                marginBottom: 10,
                                borderWidth: 0.5,
                                padding: 10,
                                borderRadius: 10,
                                borderColor: '#73aa2a'
                            }}
                            onPress={() => { this.popupSearching.show() }}
                        >
                            <Text>{this.state.selectedAddress}</Text>
                        </TouchableOpacity>



                        <MapView
                            style={{ height: 150, alignSelf: 'stretch' }}
                            ref={ref => { this.map = ref; }}
                            region={this.state.mapRegion}
                            provider='google'
                            showsUserLocation={false}
                            showsMyLocationButton={false}
                            followsUserLocation={false}
                        >

                            {this.state.searchingMaker.latitude ?
                                <MapView.Marker
                                    coordinate={this.state.searchingMaker}
                                    title=''
                                    description=''
                                >

                                    <Image
                                        source={require('../assets/images/nbl-here-icon.png')}
                                        style={{ height: height * 0.07, width: width * 0.07 }}
                                        onLayout={() => {
                                            this.setState({ initialRenderCurrentMaker: false })
                                        }}
                                        key={`${this.state.initialRenderCurrentMaker}`}
                                    />

                                </MapView.Marker>
                                : null}


                        </MapView>


                    </View>
                    {/* <FormLabel style={{ borderBottomWidth: 0.7, borderColor: '#a4d227' }}>Thông tin chi tiết</FormLabel> */}
                    <View style={{ height: 200, }}>
                        <View style={{ flexDirection: 'row', }}>
                            <FormLabel style={{}}>Giá:</FormLabel>
                            <TextInputMask
                                ref={'price'}
                                type={'money'}
                                options={{ suffixUnit: '', precision: 0, unit: '', separator: ' ' }}
                                style={{ flex: 1, padding: 5, marginLeft: 30, borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 0, borderColor: '#73aa2a' }}
                                placeholder=''
                                underlineColorAndroid='#73aa2a'
                                value={this.state.price}
                                onChangeText={(price) => this.setState({ price })}
                                blurOnSubmit={true}
                            />
                            <FormLabel>(đồng)</FormLabel>
                        </View>
                        <View style={{ flexDirection: 'row', }}>
                            <FormLabel style={{}}>Diện tích:</FormLabel>
                            <TextInputMask
                                ref={'acreage'}
                                type={'only-numbers'}
                                style={{ flex: 1, padding: 5, borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 0, borderColor: '#73aa2a' }}
                                placeholder=''
                                underlineColorAndroid='#73aa2a'
                                blurOnSubmit={true}
                                value={this.state.acreage}
                                onChangeText={(acreage) => this.setState({ acreage })}
                            />

                            <FormLabel>(mét vuông)</FormLabel>
                        </View>
                        <View style={{ flexDirection: 'row', }}>
                            <FormLabel style={{}}>Loại BĐS:</FormLabel>
                            {Platform.OS === 'ios' ?
                                <TouchableOpacity
                                    style={{ marginTop: 12 }}
                                    onPress={() => {
                                        this.setState({
                                            modalBDS: true
                                        })
                                    }}
                                >
                                    {this.state.selectedCategory === '0'
                                        ?
                                        <Text> -- Chọn loại BĐS --</Text>
                                        :
                                        this.state.roomCategory.map((y, i) => {
                                            return (
                                                y.ID === this.state.selectedCategory ?
                                                    <Text key={i}> {y.CatName}</Text>
                                                    : null

                                                //<Picker.Item key={i} label={y.CatName} value={y.ID} />
                                            )
                                        })

                                    }
                                </TouchableOpacity>
                                :
                                <Picker // Android
                                    style={{ flex: 1, marginTop: -4 }}
                                    mode='dropdown'
                                    selectedValue={this.state.selectedCategory}
                                    onValueChange={(itemValue, itemIndex) => this.setState({ selectedCategory: itemValue })}>
                                    <Picker.Item label='-- Chọn loại BĐS --' value='0' />



                                    {this.state.roomCategory.map((y, i) => {
                                        return (
                                            <Picker.Item key={i} label={y.CatName} value={y.ID} />
                                        )
                                    })}

                                </Picker>
                            }
                        </View>
                        <FormLabel style={{ marginTop: 10, }}>Chi tiết:</FormLabel>
                        <FormInput
                            containerStyle={{ borderWidth: 0.5, borderColor: '#73aa2a', borderRadius: 10, }}
                            inputStyle={{ padding: 10, height: 140 }}
                            placeholder='Vui lòng nhập thông tin chi tiết'
                            multiline={true}
                            autoCapitalize='sentences'
                            //maxLength={300}
                            clearButtonMode='always'
                            underlineColorAndroid='#fff'
                            blurOnSubmit={true}
                            value={this.state.detailInfo}
                            onChangeText={(detailInfo) => this.setState({ detailInfo })}
                        />

                    </View>
                    <View style={{ marginTop: 140, }}>
                        <View style={{ height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 50, }}>
                            <Button
                                buttonStyle={{ backgroundColor: '#9B9D9D', padding: 15, borderRadius: 10 }}
                                icon={{ name: 'ios-backspace', type: 'ionicon' }}
                                onPress={() => {
                                    this.props.navigation.goBack();
                                }}
                                title='Hủy' />
                            <Button
                                buttonStyle={{ backgroundColor: '#73aa2a', padding: 15, borderRadius: 10 }}
                                icon={{ name: 'md-cloud-upload', type: 'ionicon' }}
                                title='Đăng tin'
                                onPress={() => {
                                    //this.popupLoadingIndicator.show();
                                    this._postRoomAsync();
                                    //HomeScreen.refreshRoomBoxAfterPost();

                                }}
                            />
                        </View>
                    </View>
                </ScrollView>
                {/* The view that will animate to match the keyboards height */}
                <KeyboardSpacer />


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

                {/* Popup Searching */}
                <PopupDialog
                    ref={(popupSearching) => { this.popupSearching = popupSearching; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogStyle={{ marginBottom: 100, width: width * 0.9, height: height * 0.6, justifyContent: 'center', padding: 20 }}
                >
                    <GooglePlacesAutocomplete
                        placeholder="Tìm kiếm địa chỉ"
                        minLength={1} // minimum length of text to search
                        autoFocus={false}
                        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                        listViewDisplayed="auto" // true/false/undefined
                        fetchDetails={true}
                        renderDescription={row => row.description} // custom description render
                        onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                            {/* console.log(data); */ }
                            //console.log(details.geometry.location);
                            const address = details.name + ", " + details.formatted_address;
                            this.setState({ selectedAddress: address })
                            // console.log(details.name + ", " + details.formatted_address)

                            this.setState({
                                searchingMaker: {
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                },
                                mapRegion: {
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                    latitudeDelta: LATITUDE_DELTA,
                                    longitudeDelta: LONGITUDE_DELTA,
                                }
                            })


                            this.map.animateToCoordinate(this.state.searchingMaker, 1000)
                            this.popupSearching.dismiss();

                            {/* 
                            let currentMaker = {
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA,
                            }
                            this.map.animateToRegion(currentMaker, 1000); */}

                            {/* this.setState({
                    postRoomAddressMaker: {
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    }
                  })
                  this.map.animateToCoordinate(this.state.postRoomAddressMaker, 1000); */}

                        }}
                        getDefaultValue={() => {
                            return ''; // text input default value
                        }}
                        query={{
                            // available options: https://developers.google.com/places/web-service/autocomplete
                            key: 'AIzaSyC2QhtACfVZ2cr9HVvxQuzxd3HT36NNK3Q',
                            language: 'vi', // language of the results
                            //types: '(cities)', // default: 'geocode'
                        }}
                        styles={{
                            description: {
                                fontWeight: 'bold',
                            },
                            predefinedPlacesDescription: {
                                color: '#1faadb',
                            },
                            textInputContainer: {
                                backgroundColor: '#fff',
                                height: 44,
                                //borderTopColor: '#7e7e7e',
                                borderBottomColor: '#b5b5b5',
                                borderTopWidth: 0,
                                borderBottomWidth: 0.5,
                                flexDirection: 'row',
                            },
                        }}
                        currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
                        currentLocationLabel="Current location"
                        nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                        GoogleReverseGeocodingQuery={{
                            // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                        }}
                        GooglePlacesSearchQuery={{
                            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                            rankby: 'distance',
                            types: 'food',
                        }}
                        filterReverseGeocodingByTypes={[
                            'locality',
                            'administrative_area_level_3',
                        ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
                        //predefinedPlaces={[homePlace, workPlace]}
                        debounce={200}
                    />

                </PopupDialog>



                {/* Popup select image library or camera */}
                <PopupDialog
                    ref={(popupSelectedImage) => { this.popupSelectedImage = popupSelectedImage; }}
                    dialogAnimation={new ScaleAnimation()}
                    dialogStyle={{ marginBottom: 10, width: width * 0.9, height: 130, justifyContent: 'center', padding: 20 }}
                    dismissOnTouchOutside={true}
                >
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignContent: 'center' }}>
                        <TouchableOpacity
                            style={{ flex: 2, justifyContent: 'center', alignContent: 'center' }}
                            onPress={async () => {
                                this.popupSelectedImage.dismiss();
                                this._pickImageAsync('library', this.state.selectedImages)
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
                                this._pickImageAsync('camera', this.state.selectedImages)
                            }}
                        >
                            <Ionicons style={{ fontSize: 40, borderRadius: 10, backgroundColor: '#a4d227', color: '#fff', textAlign: 'center', padding: 10 }} name='md-camera' />
                            <Text style={{ textAlign: 'center', marginTop: 5 }}>Camera</Text>
                        </TouchableOpacity>
                    </View>
                </PopupDialog>

                {/* Modal BDS Ios*/}
                <Modal
                    style={{}}
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.modalBDS}
                    onRequestClose={() => {
                        //alert("Modal has been closed.")
                    }}
                >

                    <Picker // Android
                        style={{
                            flex: 1,
                            marginTop: height * 0.58,
                            backgroundColor: '#fff',
                        }}
                        mode='dropdown'
                        selectedValue={this.state.selectedCategory}
                        onValueChange={(itemValue, itemIndex) =>
                            this.setState({
                                selectedCategory: itemValue,
                                modalBDS: false,
                            })}>
                        {/* <Picker.Item label='-- Chọn loại BĐS --' value='0' /> */}
                        {this.state.roomCategory.map((y, i) => {
                            return (
                                <Picker.Item key={i} label={y.CatName} value={y.ID} />
                            )
                        })}

                    </Picker>
                </Modal>

            </View>

        );

    }
}


const styles = StyleSheet.create({

});

