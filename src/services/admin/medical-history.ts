/* eslint-disable @typescript-eslint/no-explicit-any */

import Api from './Api';

class MedicalHistoryService {
  static get = (params?: any): Promise<any> =>
    Api.createResponse('medical-history/get', params);

  static create = (params?: any): Promise<any> =>
    Api.createResponse('medical-history/create', params);

  static edit = (params?: any): Promise<any> =>
    Api.createResponse('medical-history/edit', params);

  static delete = (params?: any): Promise<any> =>
    Api.createResponse('medical-history/delete', params);
}

export default MedicalHistoryService;
