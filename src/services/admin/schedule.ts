import Api from './Api';

class ScheduleService {
	
	static get = async (params?: any) => Api.createResponse('schedule/get',params);
	static save = async (params?: any) => Api.createResponse('schedule/save',params);
	static all = async (params?: any) => Api.createResponse('clients/schedules/all',params);
}

export default ScheduleService;