# vue-mlm

## Config file
Create `src/.config.js` and fill in the values below:
```
export default {
	oidc: {
		issuer: "https://{{subdomain.okta-or-oktapreview}}}.com/oauth2/default",
		client_id: "{{client_id}}}",
		redirect_uri: "http://localhost:8080/implicit/callback",
		scope: "openid profile email"
	},	
	social: {
		fb: "{{facebook IdP Id}}}"
	},
	prospect_group_id: '{id of the "Prospect" group id}',
	customer_group_id: '{id of the "Customer" group id}'
}
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```