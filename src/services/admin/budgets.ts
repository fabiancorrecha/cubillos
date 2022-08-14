import Api from './Api';

class BudgetService {
	
	static create = async (params?: any,onError?: () => void) => Api.createResponse('budgets/create',params,onError);
	static print = async (params?: any) => Api.createResponse('budgets/print',params);
	static deletePrint = async (params?: any) => Api.createResponse('budgets/delete-print',params);
}

export default BudgetService;