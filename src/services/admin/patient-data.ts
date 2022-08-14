import Api from './Api';

class PatientDataService {
	
	static save = async (params?: any,onError?: () => void) => Api.createResponse('patient-data/save',params,onError);
}

export default PatientDataService;