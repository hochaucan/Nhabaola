//import { Permissions, Notifications } from 'expo';


export default (function convertAmountToWording(amount) {
    let result = amount;

    if (amount.match('.000.000.000')) {
        result = amount.replace('.000.000.000', ' Tỷ')
    }
    else if (amount.match('00.000.000')) {
        result = amount.replace('00.000.000', ' Tỷ')
    }
    else if (amount.match('.000.000')) {
        result = amount.replace('.000.000', ' Tr')
    }
    else if (amount.match('00.000')) {
        result = amount.replace('00.000', ' Tr')
    }
    else if (amount.match('.000')) {
        result = amount.replace('.000', ' K')
    }

    return result;
});
