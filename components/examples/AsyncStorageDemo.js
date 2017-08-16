import React from 'React';
import Icon from 'react-native-vector-icons/Ionicons';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    AsyncStorage,
}
    from 'react-native';

export default class AsyncStorageDemo extends React.Component {
    save = async () => {
        try {
            await AsyncStorage.setItem("@AAA:key", "FAST & FURIOUS 8")
            alert("Save OK")

        } catch (e) {
            console.log(e);
        }
    }
    get = async () => {
        try {
            var v = await AsyncStorage.getItem("@AAA:key");
            alert(v)
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => { this.save() }}>
                    <Text>SAVE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { this.get() }}>
                    <Text>GET</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    }
})



