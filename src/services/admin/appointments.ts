/* eslint-disable @typescript-eslint/no-explicit-any */

import Api from './Api';

class AppointmentsService {
  static get = (params?: any): Promise<any> =>
    Api.createResponse('appointments/get', params);

  static changeStatus = (params?: any): Promise<any> =>
    Api.createResponse('appointments/change-status', params);

  static createRecipe = (params?: any): Promise<any> =>
    Api.createResponse('appointments/create-recipe', params);

  static deleteRecipe = (params?: any): Promise<any> =>
    Api.createResponse('appointments/delete-recipe', params);

  static print = (params?: any): Promise<any> =>
    Api.createResponse('appointments/print-recipe', params);

  static deletePrint = (params?: any): Promise<any> =>
    Api.createResponse('appointments/delete-print', params);

  static send = (params?: any): Promise<any> =>
    Api.createResponse('appointments/send', params);

  static getClient = (params?: any): Promise<any> =>
    Api.createResponse('clients/appointments/get', params);

  static create = (params?: any): Promise<any> =>
    Api.createResponse('clients/appointments/create', params);

  static paymentError = (params?: any): Promise<any> =>
    Api.createResponse('clients/evaluations/payment-error', params);
}

export default AppointmentsService;
