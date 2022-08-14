import Api from './Api';

class CountryService {
	
	static get = async (params?: any) => Api.createResponse('countries/get',params);
}

export default CountryService;