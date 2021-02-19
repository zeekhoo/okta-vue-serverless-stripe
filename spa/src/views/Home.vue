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
import WelcomeComponent from '@/views/Welcome.vue'
import BrowseComponent from '@/views/Browse.vue'
import axios from 'axios';

export default {
  name: 'home',
  components: {
    WelcomeComponent,
    BrowseComponent
  },
  data: function () {
    return {
      claims: false,
      ready: false
    }
  },
  created () { 
    this.setup();
  },
  methods: {
    async setup () {
      try {
        this.claims = await this.$auth.getUser();
      } catch {
        this.claims = false;
      }
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
                this.$auth.signInWithRedirect({
                  originalUri: "/",
                  scopes: config.scopes.map(scp=>{
                      if (scp == 'prospect') {
                        return 'customer';
                      } else {
                        return scp
                      }
                    })
                });                  
            } else {
                this.ready = true
            }
      }
    }
  }    
}
</script>
