import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import LoginComponent from '@/components/Login'
import PlayerComponent from '@/components/Player'
import SignupComponent from '@/components/Signup'
import RegisterComponent from '@/components/Register'
import HelpComponent from '@/views/Help.vue'

var subdomain = window.location.host.split('.')[0]
var isRunningLocal = false
if (/^localhost:\d{4}$/.test(subdomain)) {
  isRunningLocal = true
}

import WellKnownConfigs from '../services/api/WellKnownConfigs'

import Auth from '@okta/okta-vue'
import oktaAuthConfig from '@/.config.js'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      component: LoginComponent
    },
    {
      path: '/signup',
      component: SignupComponent
    },
    {
      path: '/register',
      component: RegisterComponent
    },
    {
      path: '/implicit/callback',
      component: Auth.handleCallback()
    },
    {
      path: '/player',
      component: PlayerComponent
    },
    {
      path: '/help',
      component: HelpComponent
    }
  ]
})

var initAuth = true
const onAuthRequired = async (from, to, next) => {
  if (initAuth) {
    initAuth = false
    if (!isRunningLocal) {
      const data = await WellKnownConfigs.getWellKnownConfigs(subdomain)
      oktaAuthConfig.base_url=data.base_url
      oktaAuthConfig.oidc.issuer=data.issuer
      oktaAuthConfig.oidc.client_id=data.client_id
      oktaAuthConfig.oidc.redirect_uri=data.redirect_uri
      oktaAuthConfig.social.fb=data.fbId
      oktaAuthConfig.prospect_group_id=data.prospect_group_id
      oktaAuthConfig.customer_group_id=data.customer_group_id
    }
    Vue.use(Auth, {
      issuer: oktaAuthConfig.oidc.issuer,
      client_id: oktaAuthConfig.oidc.client_id,
      redirect_uri: oktaAuthConfig.oidc.redirect_uri,
      scope: oktaAuthConfig.oidc.scope
    })
  }

  if (from.matched.some(record => record.meta.requiresAuth) && !(await Vue.prototype.$auth.isAuthenticated())) {
    next({ path: '/login' })
  } else {
    next()
  }
}

router.beforeEach(onAuthRequired)

export default router