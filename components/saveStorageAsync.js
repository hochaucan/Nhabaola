
import {
    AsyncStorage,
} from 'react-native'

export default (async function saveStorageAsync(key, obj) {
    try {
        await AsyncStorage.setItem(key, obj)
        //alert("Save OK")

    } catch (e) {
        console.log(e);
    }
});
