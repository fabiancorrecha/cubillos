import axios from 'services/admin/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { showAlert } from 'utils';

class Api {
	
	createResponse = (uri: string,params?: any, onError?: () => void) => {	
		if (!params) {
			params = {};
		}

		return new Promise((resolve,reject) => {
			axios.post(uri,params)
				.then((res: AxiosResponse) => {
					resolve(res.data);
				})
				.catch((err: AxiosError) => {
					if (err.response && err.response.status === 422) {
						showAlert('Lo sentimos', err.response.data.error);
					}
					else if (!err.response) {
						showAlert('Lo sentimos', "Ha ocurrido un error de conexión");
					}
					else {
						console.log(err);
						showAlert("Lo sentimos", "Ha ocurrido un error desconocido");
					}
					if (onError) {
						onError();
					}
					reject(err);
				});
		});
	}
}

export default new Api();