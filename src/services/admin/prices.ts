import Api from './Api';

class PriceService {
	
	static get = async (params?: any) => Api.createResponse('prices/get',params);
	static save = async (params?: any) => Api.createResponse('prices/save',params);
}

export default PriceService;