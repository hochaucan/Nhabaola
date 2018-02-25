import { Permissions, Notifications } from 'expo';


export default (async function uploadImageAsync(uri) {
    //let apiUrl = 'https://file-upload-example-backend-dkhqoilqqn.now.sh/upload';
    // let apiUrl = 'http://uploads.im/api?upload';
    let apiUrl = 'http://nhabaola.vn/api/Images/FO_Images_Add';

    // Note:
    // Uncomment this if you want to experiment with local server
    //
    // if (Constants.isDevice) {
    //   apiUrl = `https://your-ngrok-subdomain.ngrok.io/upload`;
    // } else {
    //   apiUrl = `http://localhost:3000/upload`
    // }

    let uriParts = uri.split('.');
    let fileType = uri[uri.length - 1];

    // alert(uri + "  " + fileType)

    let formData = new FormData();
    formData.append('photo', {
        uri,
        name: 'photo.jpg',//`photo.${fileType}`,
        type: `image/${fileType}`,
    });
    //alert(uri + "  " + uri.length + "  " + fileType + "  " + JSON.stringify(formData))
    let options = {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
        },
    };

    return fetch(apiUrl, options);
});
