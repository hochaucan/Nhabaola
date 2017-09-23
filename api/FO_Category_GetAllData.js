import { AsyncStorage } from 'react-native';

export default (async function FO_Category_GetAllData() {

    _saveStorageAsync = async (key, obj) => {
        try {
            await AsyncStorage.setItem(key, obj)
            //alert("Save OK")

        } catch (e) {
            console.log(e);
        }
    }


    return
    await fetch("http://nhabaola.vn/api/Category/FO_Category_GetAllData", {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "PageIndex": "0",
            "PageCount": "5",
            "SessionKey": "Olala_SessionKey",
            "UserLogon": "100"
        }),
    })
        .then((response) => response.json())
        .then((responseJson) => {
          
        }).
        catch((error) => { console.log(error) });
});




