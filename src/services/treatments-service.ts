import {axios} from './axios';

export const TreatmentService = {
  get: (): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .get('treatments')
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject);
    })
};
