export default {
	udp_api: process.env.VUE_APP_UDP_API,
	bod_api: process.env.VUE_APP_BOD_API,
	oidc: {
		issuer: process.env.VUE_APP_ISSUER,
		client_id: process.env.VUE_APP_CLIENT_ID,
		redirect_uri: process.env.VUE_APP_REDIRECT_URI,
		scope: "openid profile email prospect"
	},	
	social: {
		fb: process.env.VUE_APP_FB_ID
	},
	prospect_group_id: process.env.VUE_APP_PROSPECT_GROUP_ID,
	customer_group_id: process.env.VUE_APP_CUSTOMER_GROUP_ID,
	client2_id: process.env.VUE_APP_CLIENT2_ID,
	mock_subdomain: process.env.VUE_APP_MOCK
}
