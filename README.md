# vue-mlm

## Config file
Add a config file named .config.js under /src
```
export default {
	udp_api: "api.udp-okta.io",
	oidc: {
		issuer: "https://{{subdomain.prodOrPreview}}}.com/oauth2/default",
		client_id: "{{client_id}}}",
		redirect_uri: "http://localhost:8080/implicit/callback",
		scope: "openid profile email"
	},	
	social: {
		fb: "{{facebook IdP Id}}}"
	}
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

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
