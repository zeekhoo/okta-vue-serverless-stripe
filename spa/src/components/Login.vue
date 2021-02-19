<style scoped>
@import '../assets/styles/okta-theme-override.css';

.login {
  background-image: url('http://d2bg6xcfalpw34.cloudfront.net/bod/img/unidemo-login.jpg'); 
  background-repeat: no-repeat; 
  background-size: 100%;
  background-position: center center;
};
</style>

<template>
  <div class="login">
    <div id="okta-signin-container"></div>
  </div>
</template>

<script>
import OktaSignIn from "@okta/okta-signin-widget";
import "@okta/okta-signin-widget/dist/css/okta-sign-in.min.css";

// import authConfig from '@/.config.js'

export default {
  name: 'Login',
  mounted: function () {
    this.$nextTick(async function () {
      const authConfig = await this.$configs.getConfig();
      const appConfig = await this.$configs.getAppConfig();

      var scp = authConfig.scopes;
      const index = scp.indexOf('prospect')
      if(index>-1) scp.splice(index, 1)
      scp.push('customer')
      const config = {
        baseUrl: authConfig.base_url || authConfig.issuer.split('oauth2')[0],
        clientId: authConfig.clientId,
        redirectUri: authConfig.redirectUri,
        authParams: {
          responseType: ['code'],
          pkce: true,
          issuer: authConfig.issuer,
          scopes: scp,
          display: 'page'
        },
        i18n: {
          'en': {
            'primaryauth.title': 'Start Burnin',
            'primaryauth.submit': 'Signin',
            'socialauth.divider.text': 'Or Signin With',
            'socialauth.facebook.label': 'Facebook'
          }
        },
        idps: [
          {'type': 'FACEBOOK', id: appConfig.social.fb}
        ]
      }

      this.widget = new OktaSignIn(config)
      this.widget.renderEl(
        { el: '#okta-signin-container' },
        () => {

        },
        (err) => {
          throw err
        }
      )
    })
  },
  destroyed () {
    // Remove the widget from the DOM on path change
    this.widget.remove()
  }
}
</script>
