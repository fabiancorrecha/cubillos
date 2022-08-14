import globalAxios from 'axios';
import {API_URL} from 'react-native-dotenv';

export const axios = globalAxios.create({baseURL: API_URL});
