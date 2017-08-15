import React from 'react';
import { ScrollView, StyleSheet,Text } from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants } from 'expo';

export default class RoomDetailScreen extends React.Component {

    static navigationOptions = {
        // title: 'Links',
        header: null,
    };



    render() {
        return (
            <ScrollView style={styles.container}>
                <Text>Room Detail</Text>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
});
