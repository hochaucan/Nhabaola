import { Permissions, Notifications } from 'expo';

export default (function FO_Category_GetAllData() {

    return
    fetch("http://nhabaola.vn/api/Category/FO_Category_GetAllData", {
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
            // this.setState({
            //     result: responseJson
            // })
            //return JSON.stringify(responseJson)
            console.log(responseJson)
            return responseJson;
        }).
        catch((error) => { console.log(error) });
});






// fetch("https://gurujsonrpc.appspot.com/guru", {
//     method: "POST",
//     headers: {
//         "Accept": "application/json",
//         "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//         "numberOne": this.state.numberOne,
//         "numberTwo": this.state.numberTwo
//     })
// }).
//     then((response) => response.json()).
//     then((responseJson) => {
//         this.setState({
//             result: responseJson
//         })
//     }).
//     catch((error) => { console.log(error) });