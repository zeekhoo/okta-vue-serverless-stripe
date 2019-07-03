<style scoped>
.social-fb {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0OTgwNWRkZS01NTg1LTRmYWQtODY4Yi1kZGVhYzc2YTJmZDAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzU1RjBDNjY2Mzg0MTFFNTk2Mzc5RTNDMENCMzM2N0MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzU1RjBDNjU2Mzg0MTFFNTk2Mzc5RTNDMENCMzM2N0MiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowNDQzY2M3Ny1hZjY4LTQzNDMtOGFlMi1kN2EyMmUyMWM3NmMiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDoyMmI0OTQ1Zi1hYmU4LTExNzgtODk2NC1lZmEyNzk1NWFiOTEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7o79aIAAAAmElEQVR42mL8//8/w0AAxlGLB7vFLECcDMRxQKwFxALIZtLKYmYg3gTEXrjMJMoUkMUk4oz/+AFR5pDj4+NAbIEvFGkV1F+AmBvK/gfE+kB8hR6JC1nDR7SERTeL/wAxKy0tJtZ1D4BYkRiFTFQuFw4Rq5DaFu8fqKBWhAY3zRMX8SXVqMWjFo9aPGrxiLR4tEE/tCwGCDAAWb3MV8wFfI4AAAAASUVORK5CYII=) no-repeat 10px,linear-gradient(90deg,#344f84 50px,#45679f 0)
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
              ></v-text-field>
              <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail"
                  required
              ></v-text-field>
              <v-checkbox
                  v-model="checkbox"
                  :rules="[v => !!v || 'You must agree to continue!']"
                  label="You acknowledge you have read, understand and agree to the NITROBURN Terms and Conditions and Privacy Policy"
                  required
              ></v-checkbox>
              <v-btn
                  :disabled="!valid"
                  color="orange"
                  @click="signup()"
              >
                  Get Started
              </v-btn>
              <div>
              <v-btn
                  class="social-fb"
                  color="blue" dark
                  @click="signinWithFb()"
              >
                  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Signin With Facebook
              </v-btn>
              </div>
            </v-form>
        </v-flex>
    </v-layout>
    
    <h4 class="ui header">Already a member? <a href='/login'>Click</a> to login</h4>

</v-container>
</template>


<script>
import oktaAuthConfig from '@/.config.js'
import axios from 'axios'

export default {
  name: 'signup',
  data: () => ({
    valid: true,
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
    checkbox: false
  }),
  methods: {
    alert() {
      if(this.$refs.form.validate()) {
          alert(this.email)
      }
    },
    signup() {
      if (this.$refs.form.validate()) {
        this.snackbar = true

        if (this.email && this.name) {
          //add user
          const authnBody = {
              name: this.name,
              username: this.email,
              groupId: oktaAuthConfig.prospect_group_id,
              baseUrl: oktaAuthConfig.base_url
          }
          axios({
            method: 'post',
            url: 'https://' + oktaAuthConfig.bod_api + '/dev/unidemo/public/bod/signup',
            data: authnBody
          })
          .then(
            (res) => {
              var referrerPath = "/"
              if (window.location.pathname) {
                referrerPath = window.location.pathname
              }

              this.$auth.loginRedirect(referrerPath, {
                sessionToken: res.data.sessionToken
              })
            }
          )
        }
      }
    },
    signinWithFb() {
      console.log('idp id: ' + oktaAuthConfig.social.fb)
      this.$auth.loginRedirect("/", {idp: oktaAuthConfig.social.fb})
    }  
  }
}
</script>