import WellKnownConfigs from '@/services/api/WellKnownConfigs'

class Configs {
  constructor(config) {
    this.appConfig = config;
    if (!this.appConfig.oidc.redirectUri) this.appConfig.oidc.redirectUri = 'http://localhost:8080/login/callback'
    if (!this.appConfig.bod_api) this.appConfig.bod_api = 'http://localhost:3000/dev'

    this.subdomain = window.location.host.split('.')[0];
    this.isRunningLocal = (/^localhost:\d{4}$/.test(this.subdomain));
    this.config = null;
  }
  async getConfig() {
    if (this.config) return this.config;

    this.appConfig.isRunningLocal = false
    if (!this.isRunningLocal) {
      this.appConfig.isRunningLocal = false
      const data = await WellKnownConfigs.getWellKnownConfigs(this.subdomain)
      if (data) {
        // Successfully read environment values from the UDP api. Populate the config with it.
        this.appConfig.base_url = data.okta_org_name
        this.appConfig.oidc.issuer = data.issuer
        this.appConfig.oidc.clientId = data.client_id
        this.appConfig.oidc.redirectUri = data.redirect_uri
        this.appConfig.social.fb = data.fbId
        this.appConfig.prospect_group_id = data.prospect_group_id
        this.appConfig.customer_group_id = data.customer_group_id
      } else {
        // could not read from UDP. Default settings to .env file values
        this.appConfig.isRunningLocal = true;
      }
    } else {
      this.appConfig.isRunningLocal = true;
    }
    this.config = {
      issuer: this.appConfig.oidc.issuer,
      clientId: this.appConfig.oidc.clientId,
      redirectUri: this.appConfig.oidc.redirectUri,
      scopes: this.appConfig.oidc.scopes,
      pkce: true
    }
    return this.config;
  }
  async getAppConfig() {
    if (!this.config) {
      await getConfig();
    }
    return this.appConfig;
  }
}

function install(Vue, config) {
  Vue.prototype.$configs = new Configs(config)
}

export default {
  install
}