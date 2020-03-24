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

        if (!this.isRunningLocal) {
            this.oktaAuthConfig.isRunningLocal = false

            const data = await WellKnownConfigs.getWellKnownConfigs(this.subdomain)
            this.oktaAuthConfig.base_url = data.okta_org_name
            this.oktaAuthConfig.oidc.issuer = data.issuer
            this.oktaAuthConfig.oidc.client_id = data.client_id
            this.oktaAuthConfig.oidc.redirect_uri = data.redirect_uri
            this.oktaAuthConfig.social.fb = data.fbId
            this.oktaAuthConfig.prospect_group_id = data.prospect_group_id
            this.oktaAuthConfig.customer_group_id = data.customer_group_id
        } else {
            this.oktaAuthConfig.isRunningLocal = true;
        }
        this.config = {
            issuer: this.oktaAuthConfig.oidc.issuer,
            client_id: this.oktaAuthConfig.oidc.client_id,
            redirect_uri: this.oktaAuthConfig.oidc.redirect_uri,
            scope: this.oktaAuthConfig.oidc.scope
        }
        return this.config;
    }
}

function install(Vue, config) {
    Vue.prototype.$configs = new Configs(config)
}

export default {
    install
}