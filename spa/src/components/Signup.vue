<style scoped>
.social-fb {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0OTgwNWRkZS01NTg1LTRmYWQtODY4Yi1kZGVhYzc2YTJmZDAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzU1RjBDNjY2Mzg0MTFFNTk2Mzc5RTNDMENCMzM2N0MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzU1RjBDNjU2Mzg0MTFFNTk2Mzc5RTNDMENCMzM2N0MiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowNDQzY2M3Ny1hZjY4LTQzNDMtOGFlMi1kN2EyMmUyMWM3NmMiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDoyMmI0OTQ1Zi1hYmU4LTExNzgtODk2NC1lZmEyNzk1NWFiOTEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7o79aIAAAAmElEQVR42mL8//8/w0AAxlGLB7vFLECcDMRxQKwFxALIZtLKYmYg3gTEXrjMJMoUkMUk4oz/+AFR5pDj4+NAbIEvFGkV1F+AmBvK/gfE+kB8hR6JC1nDR7SERTeL/wAxKy0tJtZ1D4BYkRiFTFQuFw4Rq5DaFu8fqKBWhAY3zRMX8SXVqMWjFo9aPGrxiLR4tEE/tCwGCDAAWb3MV8wFfI4AAAAASUVORK5CYII=) no-repeat 10px,linear-gradient(90deg,#344f84 50px,#45679f 0)
}
.social-fb-text {
  margin-left: 45px;
}
</style>

<template>
<v-container align-content-center grid-list-xl>
    <v-layout md4>
        <v-flex md4>
            <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            >
              <v-text-field
                  v-model="name"
                  :counter="30"
                  :rules="nameRules"
                  label="Name"
                  required
                  :disabled="signingUp"
              ></v-text-field>
              <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail"
                  required
                  :disabled="signingUp"
                  :error-messages="messages"
              ></v-text-field>
              <v-checkbox
                  v-model="checkbox"
                  :rules="[v => !!v || 'You must agree to continue!']"
                  label="You acknowledge you have read, understand and agree to the NITROBURN Terms and Conditions and Privacy Policy"
                  required
                  :disabled="signingUp"
              ></v-checkbox>
              <v-btn
                  :disabled="!valid || signingUp"
                  color="orange"
                  @click="signup()"
              >
                Get Started
              </v-btn>
              <v-progress-circular
                v-if="signingUp"
                indeterminate
                color="orange" size="16"
              />
              <div>
              <v-btn
                  class="social-fb"
                  color="blue" dark
                  @click="signinWithFb()"
                  :disabled="signingUp"
              >
                <div class="social-fb-text">Signin With Facebook</div>
              </v-btn>
              </div>
            </v-form>
        </v-flex>
    </v-layout>
    
    <h4 class="ui header">Already a member? <a href='/login'>Click</a> to login</h4>

</v-container>
</template>


<script>
import axios from 'axios'

export default {
  name: 'signup',
  data: () => ({
    appConfig: null,
    valid: true,
    signingUp: false,
    name: '',
    nameRules: [
      v => !!v || 'Name is required',
      v => (v && v.length <= 30) || 'Name must be less than 30 characters'
    ],
    email: '',
    emailRules: [
      v => !!v || 'E-mail is required',
      v => /.+@.+/.test(v) || 'E-mail must be valid'
    ],
    messages: null,
    checkbox: false
  }),
  async mounted() {
    this.appConfig = await this.$configs.getAppConfig();
  },
  watch: {
    email: function() {this.messages=null}
  },
  methods: {
    alert() {
      if(this.$refs.form.validate()) {
          alert(this.email)
      }
    },
    signup() {
      this.messages = null
      if (this.$refs.form.validate()) {
        this.signingUp = true
        if (this.email && this.name) {
          //add user
          let authnBody = {
              name: this.name,
              username: this.email
          }
          if (this.appConfig.isRunningLocal) {
            authnBody.mocksubdomain = this.appConfig.mock_subdomain
          }
          axios({
            method: 'post',
            url: this.appConfig.bod_api + '/bod/api/signup',
            data: authnBody
          })
          .then((res) => {
            if (res.status == 201) {
              var referrerPath = "/"
              if (window.location.pathname) referrerPath = window.location.pathname
              localStorage.setItem('referrerPath', referrerPath);
              this.$auth.signInWithRedirect({
                originalUri: referrerPath,
                sessionToken: res.data.sessionToken
              });
            } else {
              this.messages = 'Email already taken'
              this.signingUp = false
            }
          })
          .catch((err) => {
            console.log(err)
          })
        }
      }
    },
    async signinWithFb() {
      this.$auth.loginRedirect("/", {idp: this.appConfig.social.fb})
    }  
  }
}
</script>