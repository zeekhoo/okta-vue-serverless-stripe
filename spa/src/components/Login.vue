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

export default {
  name: 'Login',
  mounted: function () {
    this.$nextTick(async function () {
      const appConfig = await this.$configs.getAppConfig();

      var scp = appConfig.oidc.scopes;
      const index = scp.indexOf('prospect')
      if(index>-1) scp.splice(index, 1)
      scp.push('customer')
      const config = {
        baseUrl: appConfig.oidc.base_url || appConfig.oidc.issuer.split('oauth2')[0],
        clientId: appConfig.oidc.clientId,
        redirectUri: appConfig.oidc.redirectUri,
        authParams: {
          responseType: ['code'],
          pkce: true,
          issuer: appConfig.oidc.issuer,
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
