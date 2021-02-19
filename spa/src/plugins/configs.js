import WellKnownConfigs from '@/services/api/WellKnownConfigs'

class Configs {
    constructor(config) {
        this.oktaAuthConfig = config;

        this.subdomain = window.location.host.split('.')[0];
        this.isRunningLocal = (/^localhost:\d{4}$/.test(this.subdomain));
        this.config = null;
    }
    async getConfig() {
        if (this.config) return this.config;

        this.oktaAuthConfig.isRunningLocal = false
        if (!this.isRunningLocal) {
            this.oktaAuthConfig.isRunningLocal = false
            const data = await WellKnownConfigs.getWellKnownConfigs(this.subdomain)
            if (data) {
                // Successfully read environment values from the UDP api. Populate the config with it.
                this.oktaAuthConfig.base_url = data.okta_org_name
                this.oktaAuthConfig.oidc.issuer = data.issuer
                this.oktaAuthConfig.oidc.clientId = data.client_id
                this.oktaAuthConfig.oidc.redirectUri = data.redirect_uri
                this.oktaAuthConfig.social.fb = data.fbId
                this.oktaAuthConfig.prospect_group_id = data.prospect_group_id
                this.oktaAuthConfig.customer_group_id = data.customer_group_id    
            } else {
                // could not read from UDP. Default settings to .env file values
                this.oktaAuthConfig.isRunningLocal = true;
            }
        } else {
            this.oktaAuthConfig.isRunningLocal = true;
        }
        this.config = {
            issuer: this.oktaAuthConfig.oidc.issuer,
            clientId: this.oktaAuthConfig.oidc.clientId,
            redirectUri: this.oktaAuthConfig.oidc.redirectUri,
            scopes: this.oktaAuthConfig.oidc.scopes,
            pkce: true
        }
        return this.config;
    }
    async getAppConfig() {
        if (!this.config) {
            await getConfig();
        }
        return this.oktaAuthConfig;
    }
}

function install(Vue, config) {
    Vue.prototype.$configs = new Configs(config)
}

export default {
    install
}