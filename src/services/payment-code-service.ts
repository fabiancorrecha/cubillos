import {axios} from './axios';

interface Params {
	user_id: number;
	payment_code: string;
}

export const PaymentCodeService = {
  verify: (data: Params) =>
    new Promise((resolve, reject) => {
      axios
        .post('evaluations/checkcode', data)
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject);
    }),
};
