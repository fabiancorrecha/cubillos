import {axios} from './axios';

export const TypePhotoService = {
  get: (procedures: number[]): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .post('type-photos',{
        	procedures
        })
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject);
    }),

  all: (): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .post('type-photos/all')
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject);
    }),
};
