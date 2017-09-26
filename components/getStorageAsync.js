
import {
    AsyncStorage,
} from 'react-native'

export default (async function getStorageAsync(key) {

    try {
        var value = await AsyncStorage.getItem(key);
        if (value !== null) {
            return JSON.stringify(value);
        }
    } catch (e) {
        console.log(e);
    }
    return null;
});
