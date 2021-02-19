export default {
	udp_api: process.env.VUE_APP_UDP_API,
	bod_api: process.env.VUE_APP_BOD_API,
	oidc: {
		issuer: process.env.VUE_APP_ISSUER,
		clientId: process.env.VUE_APP_CLIENT_ID,
		redirectUri: process.env.VUE_APP_REDIRECT_URI,
		scopes: ["openid", "profile", "email", "prospect"]
	},	
	social: {
		fb: process.env.VUE_APP_FB_ID
	},
	prospect_group_id: process.env.VUE_APP_PROSPECT_GROUP_ID,
	customer_group_id: process.env.VUE_APP_CUSTOMER_GROUP_ID,
	client2_id: process.env.VUE_APP_CLIENT2_ID,
	bodblog_domain: "unidemo.live",
	mock_subdomain: process.env.VUE_APP_MOCK
}
