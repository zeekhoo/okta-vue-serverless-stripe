<template>
  <v-app ref="myApp">
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>NitroBurn</span>
        <span class="font-weight-light">Extreme Workouts Online</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn flat v-on:click="homeButton">Home</v-btn>

      <router-link to="/login" class="item" v-if="!loggedIn">
        <v-btn flat>Login</v-btn>
      </router-link>

      <router-link
        to="/"
        id="logout-button"
        class="item"
        v-if="loggedIn"
        v-on:click.native="logout()"
      >
        <v-btn flat>Logout</v-btn>
      </router-link>

      <v-btn flat @click="getBlogUrl()" v-if="linkBlog" target="_blank">Blog</v-btn>

    </v-toolbar>

    <v-content>
      <router-view />
      <v-footer v-if="showFooter" padless fixed height="55">
        <v-card flat width="100%" class="yellow lighten-3">
          <v-card-text class="footer-center">
            Number of previews remaining:
            <strong>{{ numPreviews }}</strong>
          </v-card-text>
        </v-card>
      </v-footer>
    </v-content>
  </v-app>
</template>

<script>
import atob from "atob";

export default {
  name: "app",
  data: function () {
    return {
      appConfig: null,
      linkBlog: false,
      authenticated: false,
      token: null,
      groups: null,
      loggedIn: false,
      cardOnFile: false,
      stripeCustomerId: null,
      footer: false,
      numFreebiesAvailable: null,
    };
  },
  computed: {
    showFooter() {
      if (this.footer) return true;

      if (!this.authenticated) return false;

      if (this.cardOnFile) return false;

      // display the footer when the freebies start to count down
      return this.numFreebiesAvailable < 3;
    },
    numPreviews() {
      if (!this.numFreebiesAvailable) return 0;

      return this.numFreebiesAvailable <= 0 ? 0 : this.numFreebiesAvailable;
    },
  },
  async created() {
    this.appConfig = await this.$configs.getAppConfig();
    this.linkBlog = this.appConfig.client2_id != undefined;
    this.isAuthenticated();
  },
  watch: {
    // Everytime the route changes, check for auth status
    $route: "isAuthenticated",
  },
  async updated() {
    this.isAuthenticated();
  },
  methods: {
    async getBlogUrl() {
      const subdomain = window.location.host.split(".")[0];
      let newTab = "https://" + subdomain + ".bodblog." + this.appConfig.bodblog_domain;
      if (this.authenticated) {
        newTab = newTab + "/login";
      }
      window.open(newTab, "_blank");
    },
    async isAuthenticated() {
      if (this.$auth) {
        this.authenticated = await this.$auth.isAuthenticated();
        if (this.authenticated) {
          this.token = await this.$auth.getIdToken();
          if (this.token) {
            const payload = JSON.parse(atob(this.token.split(".")[1]));
            if (payload.idp) {
              this.loggedIn = true;
            }
            this.stripeCustomerId = payload.stripeCustomerId;
            this.groups = payload.groups;
            this.groups.forEach((grp) => {
              if (grp.includes("Customer")) {
                this.loggedIn = true;

                // If has Stripe Integration
                if (this.appConfig.stripe_publishable_key && this.appConfig.stripe_publishable_key.length > 0) {
                  // Has Stripe CustomerId means payment has been made.
                  if (this.stripeCustomerId) {
                    this.cardOnFile = true;
                  }
                } else {
                  // No Stripe integration. Use bogus Payments form.
                  this.cardOnFile = true;
                }
              }
            });
            this.numFreebiesAvailable = payload.numFreebiesAvailable;

          }
        } else {
          this.loggedIn = false;
          this.cardOnFile = false;
        }
      } else {
        this.authenticated = false;
        this.loggedIn = false;
        this.cardOnFile = false;
      }
    },
    async logout() {
      await this.$auth.signOut();
      await this.isAuthenticated();
    },
    homeButton() {
      window.location.href = "/";
    },
  },
};
</script>

<style scoped>
.footer-center {
  text-align: center;
}
</style>