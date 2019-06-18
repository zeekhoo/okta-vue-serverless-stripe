<style scoped>
@import '../assets/styles/okta-theme-override.css';

.login {
  background-image: url('https://gladstonemrm.com.au/wp-content/uploads/2018/08/2018-08-gym-member-retention.jpg'); 
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
import OktaSignIn from '@okta/okta-signin-widget'
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css'
import '@okta/okta-signin-widget/dist/css/okta-theme.css'
import authConfig from '@/.config.js'

export default {
  name: 'Login',
  mounted: function () {
    this.$nextTick(function () {
      var scp = authConfig.oidc.scope.split(' ')
      scp.push('customer')
      const config = {
        baseUrl: authConfig.base_url || authConfig.oidc.issuer.split('oauth2')[0],
        clientId: authConfig.oidc.client_id,
        redirectUri: authConfig.oidc.redirect_uri,
        authParams: {
          responseType: ['id_token', 'token'],
          issuer: authConfig.oidc.issuer,
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
          {'type': 'FACEBOOK', id: authConfig.social.fb}
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
