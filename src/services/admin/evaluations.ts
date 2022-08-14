import Api from './Api';

class EvaluationService {
	
	static get = async (params?: any) => Api.createResponse('evaluations/get',params);
	static finish = async (params?: any,onError?: () => void) => Api.createResponse('evaluations/finish',params,onError);
}

export default EvaluationService;