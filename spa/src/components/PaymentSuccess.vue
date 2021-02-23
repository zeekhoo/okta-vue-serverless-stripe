<style scoped>
.polling {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: 0.5;
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
<template>
  <v-card flat height=600>
    <div
      class="d-flex polling display-3 white--text"
    >
      <v-progress-circular
        indeterminate
        color="orange"
        :size="100"
        :width="12"
      ></v-progress-circular>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "payment-success",
  data() {
    return {
      counter: 0
    };
  },
  async created() {
    const appConfig = await this.$configs.getAppConfig();  
    //replace the "prosepct" scope with the "customer" scope
    let scp = appConfig.oidc.scopes.map((scp) => {
      if (scp == "prospect") {
        return "customer";
      } else {
        return scp;
      }
    });
    this.pollStatus(scp, this.counter);
  },
  methods: {
    async pollStatus(scp) {
      window.setTimeout(async (self, scp)=>{
        self.counter++;

        const res = await self.$auth.token.getWithoutPrompt({
          scopes: scp,
        });
        try {
          const claims = res.tokens.idToken.claims;
          if (claims.stripeCustomerId) {
            // the stripe customerId has been set if we see it in the token. 
            // Update the token storage and return to home
            self.$auth.tokenManager.setTokens(res.tokens);
            window.location.href = '/';
          } else {
            if (self.counter < 3) {
              // poll for changes at most 3 times. If longer, the webhook must have failed.
              self.pollStatus(scp);
            }
          }
        } catch(e) {
          console.log('EXCEPTION:', e);
        }
      }, 2000, this, scp);
    },
  }
};
</script>