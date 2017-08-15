import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
}
    from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';



export default class PostDemo extends React.Component {
    constructor(props){
        super(props)
        this.state={
            numberOne:"",
            numberTwo:"",
            result:"..."
        }        
    }

    clickPost(){
    fetch("https://gurujsonrpc.appspot.com/guru",{
        method:"POST",
        headers:{
            "Accept":"application/json",
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            "numberOne":this.state.numberOne,
            "numberTwo":this.state.numberTwo
        })
    }).
    then((response)=>response.json()).
    then((responseJson)=>{
        this.setState({
            result:responseJson
        })
    }).
    catch((error)=>{console.log(error)});

    };

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={()=>{this.clickPost()}}>
                    <Text>Post To Server</Text>
                </TouchableOpacity>
                <Text>{this.state.result}</Text>
            </View>
        ); 
    }
}

const styles = StyleSheet.create({
   container:{
flex:1,
   },
 });