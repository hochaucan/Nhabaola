//import { Permissions, Notifications } from 'expo';


export default (function convertAmountToWording(amount) {
    let result = amount;
    let commaCount = result.indexOf('.') ? result.split('.').length - 1 : 0;
    //alert(amount + '  ' + commaCount)

    if (commaCount == 3) { // Hang Ty
        //alert(amount + '  ' + commaCount)
        if (amount.match('00.000.000.000')) {
            result = amount.replace('.000.000.000', ' Tỷ') // Tram Ty
        }
        else if (amount.match('0.000.000.000')) {
            result = amount.replace('.000.000.000', ' Tỷ') // Chuc Ty
        }
        else if (amount.match('.000.000.000')) {
            result = amount.replace('.000.000.000', ' Tỷ') // Ty
        }
        else if (amount.match('00.000.000')) {
            result = amount.replace('00.000.000', ' Tỷ').replace('.', ',') // Ty - tram trieu
        }
        else if (amount.match('0.000.000')) {
            result = amount.replace('0.000.000', ' Tỷ').replace('.', ',') // Ty - chuc trieu
        }
        else {
            result = amount.replace('.000.000', ' Tỷ').replace('.', ',') // Ty - trieu
        }

    }
    else if (commaCount == 2) { // Hang Trieu
        if (amount.match('00.000.000')) {
            result = amount.replace('.000.000', ' Tr') // Tram Trieu
        }
        else if (amount.match('0.000.000')) {
            result = amount.replace('.000.000', ' Tr') // Chuc Trieu
        }
        else if (amount.match('.000.000')) {
            result = amount.replace('.000.000', ' Tr') // Trieu
        }
        else if (amount.match('00.000')) {
            result = amount.replace('00.000', ' Tr').replace('.', ',') // Trieu - tram nghin
        }
        else if (amount.match('0.000')) {
            result = amount.replace('0.000', ' Tr').replace('.', ',') // Trieu - chuc nghin
        }
        else {
            result = amount.replace('.000', ' Tr').replace('.', ',') // Trieu - nghin
        }
    }
    else if (commaCount == 1) { // Hang Nghin
        if (amount.match('00.000')) {
            result = amount.replace('.000', ' Ng') // Tram Nghin
        }
        else if (amount.match('0.000')) {
            result = amount.replace('.000', ' Ng') // Chuc Nghin
        }
        else if (amount.match('.000')) {
            result = amount.replace('.000', ' Ng') // Nghin
        }
        else if (amount.match('00')) {
            result = amount.replace('00', ' Ng').replace('.', ',') // Nghin - tram 
        }
        else if (amount.match('0')) {
            result = amount.replace('0', ' Ng').replace('.', ',') // Nghin - chuc 
        }
        else {
            //result = amount.replace('.000', ' Ng') // Nghin
        }
    }
    else {// Hang Tram
        // if (amount.match('00.000.000.000')) {
        //     result = amount.replace('.000.000.000', ' Tỷ') // Tram Ty
        // }
        // else if (amount.match('0.000.000.000')) {
        //     result = amount.replace('.000.000.000', ' Tỷ') // Chuc Ty
        // }
        // else if (amount.match('.000.000.000')) {
        //     result = amount.replace('.000.000.000', ' Tỷ') // Ty
        // }
        // else if (amount.match('00.000.000')) {
        //     result = amount.replace('00.000.000', ' Tỷ') // Ty - tram trieu
        // }
        // else if (amount.match('0.000.000')) {
        //     result = amount.replace('0.000.000', ' Tỷ') // Ty - chuc trieu
        // }
        // else {
        //     result = amount.replace('.000.000', ' Tỷ') // Ty - trieu
        // }
    }



    // if (amount.match('0.000.000.000')) {
    //     result = amount.replace('.000.000.000', ' Tỷ')
    // }
    // else if (amount.match('.000.000.000')) {
    //     result = amount.replace('.000.000.000', ' Tỷ')
    // }
    // else if (amount.match('0.000.000')) {
    //     result = amount.replace('.000.000', ' Tr')
    // }
    // else if (amount.match('.000.000')) {
    //     result = amount.replace('.000.000', ' Tr')
    // }
    // else if (amount.match('0.000')) {
    //     result = amount.replace('.000', ' K')
    // }
    // else if (amount.match('.000')) {
    //     result = amount.replace('.000', ' K')
    // }

    return result;
});
