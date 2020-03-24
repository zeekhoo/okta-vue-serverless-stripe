<template>
  <div class="home">
    <div v-if="!$parent.$parent.$parent.authenticated">
        <WelcomeComponent v-if="ready">
        </WelcomeComponent>
        <BrowseComponent v-if="ready">
        </BrowseComponent>
    </div>
    <div v-if="$parent.$parent.$parent.authenticated">
		<BrowseComponent/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import WelcomeComponent from '@/views/Welcome.vue'
import BrowseComponent from '@/views/Browse.vue'
import AuthJS from '@okta/okta-auth-js';
import axios from 'axios';

export default {
  name: 'home',
  components: {
    WelcomeComponent,
    BrowseComponent
  },
  data: function () {
    return {
      claims: '',
      ready: false
    }
  },
  created () { this.setup() },
  methods: {
    async setup () {
      this.claims = await this.$auth.getUser()
      if (!this.claims) {
            const config = await this.$configs.getConfig();
            const url = config.issuer.split('/oauth2')[0] + '/api/v1/sessions/me';
            let exists = false;
            try {
                const res = await axios.get(url, { withCredentials: true });
                exists = true;
            } catch (e) {
                console.log(e);
            }
            if (exists) {
                this.$auth.loginRedirect("/", {
                    scopes: config.scope.replace('prospect', 'customer').split(' ')
                });
            } else {
                this.ready = true
            }

      }
    }
  }    
}
</script>
