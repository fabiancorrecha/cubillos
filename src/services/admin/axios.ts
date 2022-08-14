import _axios from 'axios';
import { ADMIN_URL } from 'react-native-dotenv';

const axios = _axios.create({
	baseURL: ADMIN_URL
});

export default axios;