import {Country, fromRawCountry} from 'models/country';
import {axios} from './axios';

export const CountriesService = {
  get: (): Promise<Country[]> =>
    new Promise((resolve, reject) => {
      axios
        .get('countries')
        .then(({data}) => {
          resolve(data.map(fromRawCountry));
        })
        .catch(reject);
    }),
};
