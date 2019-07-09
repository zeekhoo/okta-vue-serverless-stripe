<template>
  <v-container>
    <v-layout column>
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
            <v-alert 
              v-model="showAlert"
              :type="alertType" 
              dismissible>
            {{alertMessage}}
            </v-alert>
            <v-img
              v-on:click.native="preview()"
              :src="vid"
              height=550px
            >
            </v-img>
            <v-card-actions>
              <v-btn 
                v-on:click="upgrade()"
                color="orange"
                v-if="!this.$root.$children[0].cardOnFile"
              >
                <span class="mr-2">Subscribe</span>
              </v-btn>
              <v-btn
                v-on:click="$emit('close-player')"
                >
                <span class="mr-2">Back</span>
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
import oktaAuthConfig from '@/.config.js'
import axios from 'axios'

export default {
  name: 'Player',
  data () {
    return {
      user: false,
      payload: false,
      claims: [],
      image: {
        people: require('@/assets/img/people-working-out.jpg'),
        button: playButton,
      },
      dialog: false,
      dialog2: false,
      showAlert: false,
      alertType: null,
      alertMessage: null
    }
  },
  components: {
    SignupComponent,
    RegisterComponent
  },
  props: ['vid'],
  methods: {
    async preview() {
      if (!this.$root.$children[0].authenticated) {
        this.dialog = true
      } else {
        const access_token = await this.$root.$children[0].$auth.getAccessToken()
        const b_access_token = JSON.parse(atob(access_token.split('.')[1]))
        // console.log(JSON.stringify(b_access_token))
        axios({
            method: 'get',
            url: 'https://' + oktaAuthConfig.bod_api + '/dev/unidemo/public/bod/video-player/play',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        })
        .then(res=>{
          console.log(res.data)
          this.showAlert = true
          this.alertType = res.data.alertType
          this.alertMessage = res.data.message
        })
        .catch(err=>{
          console.log(err)
        })

        if (b_access_token.scp.includes('customer')) {
          // alert('video plays...')
          this.wholeVideoAlert = true
        } else {
          // alert('6 minute preview clip plays...')
          this.sixMinuteAlert = true
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
