import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import LoginComponent from '@/components/Login'
import PlayerComponent from '@/components/Player'
import SignupComponent from '@/components/Signup'
import RegisterComponent from '@/components/Register'
import HelpComponent from '@/views/Help.vue'

import configs from '@/plugins/configs'

import OktaVue from '@okta/okta-vue'
// import { LoginCallback } from '@okta/okta-vue'
import { OktaAuth } from '@okta/okta-auth-js'
import OAuthCallback from '@/components/OAuthCallback'
import oktaAuthConfig from '@/.config.js'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [{
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
            path: '/login/callback',
            component: OAuthCallback
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
Vue.use(configs, oktaAuthConfig);

const onAuthRequired = async (from, to, next) => {
    if (initAuth) {
        initAuth = false
        const config = await Vue.prototype.$configs.getConfig()
        const oktaAuth = new OktaAuth(config)

        Vue.use(OktaVue, {
            oktaAuth,
            onAuthRequired: (oktaAuth) => {
                router.push({ path: '/login' })
            }
        })
    }
    next();
    // if (from.matched.some(record => record.meta.requiresAuth) && !(await Vue.prototype.$auth.isAuthenticated())) {
    //     next({
    //         path: '/login'
    //     })
    // } else {
    //     next()
    // }
}

router.beforeEach(onAuthRequired)

export default router