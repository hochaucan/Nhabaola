import { Permissions, Notifications } from 'expo';


export default (async function deleteImageAsync(imageName) {
    //let apiUrl = 'https://file-upload-example-backend-dkhqoilqqn.now.sh/upload';
    // let apiUrl = 'http://uploads.im/api?upload';
    let apiUrl = 'http://nhabaola.vn/api/Images/FO_Images_Del';

    //let uriParts = uri.split('.');
    // let fileType = uri[uri.length - 1];

    // alert(uri + "  " + fileType)

    // let formData = new FormData();
    // formData.append('photo', {
    //     uri,
    //     name: 'photo.jpg',//`photo.${fileType}`,
    //     type: `image/${fileType}`,
    // });
    //alert(uri + "  " + uri.length + "  " + fileType + "  " + JSON.stringify(formData))
    let options = {
        method: 'POST',
        body: JSON.stringify({
            "ImageName": imageName
        }),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };

    return fetch(apiUrl, options);
});
