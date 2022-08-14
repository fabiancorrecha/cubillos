/* eslint-disable @typescript-eslint/camelcase */

import {Price} from 'models/price';
import {axios} from './axios';

type IndexRequest = {
  type?: 'evaluation' | 'appointment';
  currencyId?: number;
};

export class PricesService {
  static index({type, currencyId}: IndexRequest): Promise<Price[]> {
    return new Promise((resolve, reject) => {
      axios
        .get('prices', {
          params: {
            type,
            currency_id: currencyId,
          },
        })
        .then(({data}) => {
          resolve(data.map(Price.fromRaw));
        })
        .catch(reject);
    });
  }
}
