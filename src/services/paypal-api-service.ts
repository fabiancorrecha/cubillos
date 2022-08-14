import axios from 'axios';
import {PAYPAL_SANDBOX_API, PAYPAL_API, PAYPAL_MODE} from 'react-native-dotenv';

export const PayPalApiService = axios.create({
  baseURL: PAYPAL_MODE === 'production' ? PAYPAL_API : PAYPAL_SANDBOX_API,
});
