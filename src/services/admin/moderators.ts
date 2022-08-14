import Api from './Api';

class ModeratorService {
	
	static get = async (params?: any) => Api.createResponse('moderators/get',params);
	static create = async (params?: any,onError?: () => void) => Api.createResponse('moderators/create',params,onError);
	static edit = async (params?: any,onError?: () => void) => Api.createResponse('moderators/edit',params,onError);
	static delete = async (params?: any) => Api.createResponse('moderators/delete',params);
	static changeStatus = async (params?: any) => Api.createResponse('moderators/change-status',params);
	static changePass = async (params?: any,onError?: () => void) => Api.createResponse('moderators/change-password',params,onError);
	static getPermissions = async (params?: any) => Api.createResponse('moderators/permissions',params);
	static getUserPermissions = async (params?: any) => Api.createResponse('moderators/permissions/user',params);
}

export default ModeratorService;