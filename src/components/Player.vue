<template>
  <v-container>
    <v-layout column>
      <v-toolbar 
        color="white"
        v-if="this.$root.$children[0].authenticated"
      >
        <v-toolbar-title class="font-weight-light">Work it, {{user.name}}!</v-toolbar-title>
      </v-toolbar>

      <v-dialog 
        v-model="dialog"
        width=700
      >
        <v-card>
          <v-container>
            <h2>Signup to watch 6 minute previews of every workout we have</h2>
            <h4>You will also receive a discount code by email</h4>
          </v-container>
          <SignupComponent/>
        </v-card>
      </v-dialog>

      <v-dialog 
        v-model="dialog2"
        width=700
      >
        <v-card>
          <v-container>
            <RegisterComponent/>
          </v-container>
        </v-card>
      </v-dialog>

      <v-flex xs12>
        <v-card>
          <v-container>
            <v-alert v-model="sixMinuteAlert" type="info" dismissible>
            6 minute preview clip plays...
            </v-alert>
            <v-alert v-model="wholeVideoAlert" type="success" dismissible>
            Whole video plays...
            </v-alert>

            <v-img
              v-on:click.native="preview()"
              src="https://shawglobalnews.files.wordpress.com/2018/02/people-working-out.jpg?quality=70&strip=all&w=720&h=379&crop=1"
              height=550px
            >
              <v-container v-if="this.$parent.$parent.$parent.lead && !this.$parent.$parent.$parent.registered && !this.$parent.$parent.$parent.authenticated">
                <v-layout align-end justify-center row fill-height>
                  <span class="headline white--text">6 minute preview</span>
                </v-layout>
              </v-container>
            </v-img>
            <v-card-actions>
              <v-btn 
                v-on:click.native="upgrade()"
                color="orange"
                v-if="!this.$root.$children[0].cardOnFile"
              >
                <span class="mr-2">Subscribe</span>
              </v-btn>
            </v-card-actions>
          </v-container>
        </v-card>
          <!-- <table class="ui table">
            <thead>
              <tr>
                <th>Claim</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(claim, index) in claims"
                :key="index"
              >
                <td>{{claim.claim}}</td>
                <td :id="'claim-' + claim.claim">{{claim.value}}</td>
              </tr>
            </tbody>
          </table> -->
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import atob from 'atob'
import playButton from '@/assets/img/Play.png'
import SignupComponent from '@/components/Signup.vue'
import RegisterComponent from '@/components/Register.vue'

export default {
  name: 'Player',
  data () {
    return {
      user: false,
      payload: false,
      claims: [],
      play: playButton,
      dialog: false,
      dialog2: false,
      sixMinuteAlert: false,
      wholeVideoAlert: false
    }
  },
  components: {
    SignupComponent,
    RegisterComponent
  },
  methods: {
    preview() {
      if (!this.$root.$children[0].authenticated) {
        this.dialog = true
      } else {
        if (!this.$root.$children[0].cardOnFile) {
          // alert('6 minute preview clip plays...')
          this.sixMinuteAlert = true
        } else {
          // alert('video plays...')
          this.wholeVideoAlert = true
        }
      }
    },
    upgrade() {
      this.dialog2 = true
    }
  },
  async created () {
    this.user = await this.$auth.getUser()
    const accessTokenPayload = await this.$auth.getAccessToken()
    if (accessTokenPayload) {
      this.payload = JSON.parse(atob(accessTokenPayload.split('.')[1]))
      this.claims = Object.entries(this.payload).map(entry => ({ claim: entry[0], value: entry[1]}))
    }
  }
}
</script>
