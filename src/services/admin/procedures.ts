import Api from './Api';
import { objectToFormData } from '../object-to-form-data';

class ProcedureService {
	
	static get = async (params?: any) => Api.createResponse('procedures/get',params);
	static create = async (params?: any,onError?: () => void) => Api.createResponse('procedures/create',objectToFormData(params),onError);
	static edit = async (params?: any,onError?: () => void) => Api.createResponse('procedures/edit',objectToFormData(params),onError);
	static delete = async (params?: any) => Api.createResponse('procedures/delete',params);
}

export default ProcedureService;