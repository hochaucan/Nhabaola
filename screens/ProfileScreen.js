import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Constants } from 'expo';

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
            <ScrollView style={styles.container}>
                <Text>Oanh Nguyen</Text>
                <Text>{this.props.key}</Text>
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
