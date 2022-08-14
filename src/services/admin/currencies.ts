import Api from './Api';

class CurrencyService {
	
	static get = async (params?: any) => Api.createResponse('currencies/get',params);
}

export default CurrencyService;