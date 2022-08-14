import axios from 'axios';
import { STRIPE_PUBLIC_KEY } from 'react-native-dotenv';

interface Params {
	number: undefined | string;
	month: undefined | string;
	year: undefined | string;
	cvc: undefined | string;
}

const createToken = (data: Params) => {
	var formBody: any = [];
	const cardDetails: any = {
		'card[number]': data.number,
		'card[exp_month]': data.month,
		'card[exp_year]': data.year,
		'card[cvc]': data.cvc
	}
	for (var property in cardDetails) {
	  var encodedKey = encodeURIComponent(property);
	  var encodedValue = encodeURIComponent(cardDetails[property]);
	  formBody.push(encodedKey + "=" + encodedValue);
	}
	formBody = formBody.join("&");
	return new Promise((resolve,reject) => {
		axios.post('https://api.stripe.com/v1/tokens',formBody,{
			headers: {
		        'Authorization': `Bearer ${ STRIPE_PUBLIC_KEY }`,
		        'Content-Type': 'application/x-www-form-urlencoded',
		    }
		}).then((res: any) => resolve(res.data)).catch(reject);
	});
}

export default {
	createToken
}