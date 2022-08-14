import Api from './Api';

class ChatService {
	
	static get = async (params?: any) => Api.createResponse('chats/get',params);
	static viewed = async (params?: any) => Api.createResponse('chats/viewed',params);
	static messages = async (params?: any) => Api.createResponse('chats/messages',params);
	static count = async (params?: any) => Api.createResponse('chats/count',params);
}

export default ChatService;