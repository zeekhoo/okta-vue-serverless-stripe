import axios from 'axios';
import oktaAuthConfig from '@/.config.js'

export default {
	getWellKnownConfigs(subdomain) {
		const path = 'https://' + oktaAuthConfig.udp_api + '/api/configs/' + subdomain  + '/bod/.well-known/default-setting';
		console.log(path)
		return axios.get(path)
		.then((res) => {
			var result = {
				issuer: '',
				base_url: '',
				client_id: '',
				redirect_uri: '',
				fbId: '',
				prospect_group_id: '',
				customer_group_id: ''
			};
			const data = res.data;
			if (Object.keys(data).length > 0) {
				result.issuer=data.config.issuer || '';
				result.base_url=data.config.base_url || '';
				result.client_id=data.config.client_id || '';
				result.redirect_uri=data.config.redirect_uri || '';
				result.fbId=data.config.settings.fbId || '';
				result.prospect_group_id=data.config.settings.prospect_group_id || '';
				result.customer_group_id=data.config.settings.customer_group_id || '';
			}
			return result;
		});
	}
}

