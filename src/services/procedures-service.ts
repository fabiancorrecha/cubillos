import {Procedure} from 'models/procedure';
import {axios} from './axios';

export const ProceduresService = {
  get: (): Promise<Procedure[]> =>
    new Promise((resolve, reject) => {
      axios
        .get('procedures')
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject);
    }),
};
