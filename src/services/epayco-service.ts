/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Axios from 'axios';
import {axios} from './axios';

declare let ePayco: any;
declare let window: any;

// Polyfills para que funcione el API de ePayco.
// No vale la pena colocarle tipado.

window.$ = () => ({
  find: () => ({
    prop: () => {
      // Do nothing.
    },
  }),
});

window.$.ajax = ({url, data}: any) => {
  let doneCallback = (data: any) => {
    // Do nothing.
    console.log('$.ajax: uncaught done: ', data);
  };

  let failCallback = (err: any) => {
    // Do nothing.
    console.log('$.ajax: uncaught fail: ', err);
  };

  const fail = (callback: any) => {
    failCallback = callback;
  };

  const done = (callback: any) => {
    doneCallback = callback;

    return {fail};
  };

  Axios.post(url, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(({data}) => {
      doneCallback(data);
    })
    .catch(err => {
      failCallback(err);
    });

  return {done};
};

window.localStorage = {
  _data: {},

  setItem: function(id: any, val: any) {
    return (this._data[id] = val);
  },

  getItem: function(id: any) {
    return this._data[id];
  },

  removeItem: function(id: any) {
    return delete this._data[id];
  },

  clear: function() {
    return (this._data = {});
  },
};

// Inyectar ePayco en window.

Axios.get('https://s3-us-west-2.amazonaws.com/epayco/v1.0/epayco.min.js')
  .then(({data}) => {
    eval(data);
  })
  .catch(err => {
    console.log('Fetching ePayco: ', err);
  });

type CreateTokenRequest = {
  card: {
    name: string;
    last_name: string;
    email: string;
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    doc_type: string;
    doc_number: string;
  };
};

export class EpaycoService {
  static pay(
    name: string,
    lastName: string,
    amount: number,
    email: string,
    documentType: string,
    documentNumber: string,
    userId: number,
    token: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      axios
        .post('epayco/pay', {
          name,
          amount,
          email,
          token,
          document_number: documentNumber,
          document_type: documentType,
          last_name: lastName,
          user_id: userId,
        })
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject);
    });
  }

  static setPublicKey(publicKey: string): Promise<void> {
    if (!ePayco) {
      return Promise.reject('ePayco instance not ready');
    }

    ePayco.setPublicKey(publicKey);
    return Promise.resolve();
  }

  static createToken(req: CreateTokenRequest): Promise<string> {
    if (!ePayco) {
      return Promise.reject('ePayco instance not ready');
    }

    return new Promise((resolve, reject) => {
      // La librería parece no hacer nada si hay fallas de internet.
      // Es por eso que se le coloca el timeout.
      setTimeout(reject, 10000);

      ePayco.token.create(req, (err: unknown, response: string | unknown) => {
        if (err) {
          reject(err);
        }

        if (typeof response === 'string') {
          resolve(response);
        }

        reject(response);
      });
    });
  }
}
