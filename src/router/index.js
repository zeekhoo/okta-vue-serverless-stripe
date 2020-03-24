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

import configs from '@/plugins/configs'

import Auth from '@okta/okta-vue'
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
Vue.use(configs, oktaAuthConfig);

const onAuthRequired = async (from, to, next) => {
    if (initAuth) {
        initAuth = false
        const config = await Vue.prototype.$configs.getConfig();
        Vue.use(Auth, config)
    }

    if (from.matched.some(record => record.meta.requiresAuth) && !(await Vue.prototype.$auth.isAuthenticated())) {
        next({
            path: '/login'
        })
    } else {
        next()
    }
}

router.beforeEach(onAuthRequired)

export default router