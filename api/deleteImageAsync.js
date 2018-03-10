import { Permissions, Notifications } from 'expo';


export default (async function deleteImageAsync(imageName) {
    try {
        await fetch("http://nhabaola.vn/api/Images/FO_Images_Del", {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "ImageName": imageName

            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {

                // if (JSON.stringify(responseJson.ErrorCode) === "12") {
                //     if (Platform.OS === 'android') {
                //         ToastAndroid.showWithGravity('Xóa thành công!', ToastAndroid.SHORT, ToastAndroid.CENTER);
                //     }
                //     else {
                //         Alert.alert('Xóa thành công!');
                //     }



                // }

                alert(JSON.stringify(responseJson))
                //return JSON.stringify(responseJson);


            }).
            catch((error) => { console.log(error) });
    } catch (error) {
        console.log(error)
    }
});
