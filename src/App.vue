<template>
  <v-app ref="myApp">
    <v-toolbar app>
      <v-toolbar-title 
        class="headline text-uppercase" 
      >
        <span>NitroBurn </span>
        <span class="font-weight-light">Extreme Workouts Online</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- <router-link
        to="/"
        v-on:click="window.location.href='/'"
        class="item"
      >
        <v-btn flat>Home</v-btn>
      </router-link> -->
      <v-btn
        flat
        v-on:click="homeButton"
        >
        Home
      </v-btn>

      <router-link
        to="/login"
        class="item"
        v-if="!loggedIn"
      >
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

      <v-btn
        flat
        @click="getBlogUrl()"
        target="_blank"
      >
      Blog
      </v-btn>

      <v-btn
        to='/help'
        flat
      >
        <span class="mr-2">Help</span>
      </v-btn>

    </v-toolbar>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import atob from 'atob'

export default {
  name: 'app',
  data: function () {
    return { 
      authenticated: false,
      loggedIn: false,
      cardOnFile: false
    }
  },
  created () { this.isAuthenticated() },
  watch: {
    // Everytime the route changes, check for auth status
    '$route': 'isAuthenticated'
  },
  methods: {
    getBlogUrl() {
      const subdomain = window.location.host.split('.')[0]
      var newTab = 'https://' + subdomain + '.bodblog.unidemo.live'
      if (this.authenticated) {
        newTab = newTab + '/login'
      }
      window.open(newTab, '_blank')
    },
    async isAuthenticated () {
      if (this.$auth) {
        this.authenticated = await this.$auth.isAuthenticated()
        if (this.authenticated) {
          const token = await this.$auth.getIdToken()
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]))
            if (payload.idp) {
              this.loggedIn = true
            }
            if (payload.groups.includes('Customer')) {
              this.loggedIn = true
              this.cardOnFile = true
            }
          }

        } else {
          this.loggedIn = false
          this.cardOnFile = false
        }
      } else {
        this.authenticated = false
        this.loggedIn = false
        this.cardOnFile = false
      }
    },
    async logout () {
      await this.$auth.logout()
      await this.isAuthenticated()
    },
    homeButton() {
      window.location.href="/"
    }
  }
}
</script>
