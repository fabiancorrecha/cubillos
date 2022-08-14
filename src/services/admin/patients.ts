import Api from './Api';

class PatientService {
	
	static get = async (params?: any) => Api.createResponse('patients/get',params);
	static create = async (params?: any,onError?: () => void) => Api.createResponse('patients/create',params,onError);
	static edit = async (params?: any,onError?: () => void) => Api.createResponse('patients/edit',params,onError);
	static delete = async (params?: any) => Api.createResponse('patients/delete',params);
	static verified = async (params?: any) => Api.createResponse('patients/verified',params);
	static changeStatus = async (params?: any) => Api.createResponse('patients/change-status',params);
	static changePass = async (params?: any,onError?: () => void) => Api.createResponse('patients/change-password',params,onError);
	static print = async (params?: any) => Api.createResponse('patients/print',params);
	static deletePrint = async (params?: any) => Api.createResponse('patients/delete-print',params);
}

export default PatientService;