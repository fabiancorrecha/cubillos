import {DocumentType} from 'models/document-type';
import {axios} from './axios';

export class DocumentTypesService {
  static index(): Promise<DocumentType[]> {
    return new Promise((resolve, reject) => {
      axios
        .get('document-types')
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject);
    });
  }
}
