import Api from './Api';

class DocumentTypeService {
	
	static get = async (params?: any) => Api.createResponse('clients/document-types/get',params);
}

export default DocumentTypeService;