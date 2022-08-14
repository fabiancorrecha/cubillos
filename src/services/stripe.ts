import {axios} from './axios';

interface Params {
	user_id: number;
	token: string;
	total: number;
}

export const StripeService = {
  create: (data: Params) =>
    new Promise((resolve, reject) => {
      axios
        .post('stripe/create',data)
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject);
    }),
};
