<style scoped>
.v-checkbox .v-label {
    font-size: 10px;
}
</style>
<template>
    <v-container grid-list-xl>
        <v-layout column>
            <h3 style="color:orange;">Already a member? <a href='/login'>Click</a> to login</h3>
            <v-divider/>
            <v-form
                ref="form"
                v-model="valid"
                lazy-validation
            >            
                <v-layout row>
                    <v-flex xs6>
                        <h3>Create Account:</h3>
                        <v-text-field
                        v-model="firstName"
                        :counter="30"
                        :rules="nameRules"
                        label="First Name"
                        required
                        :disabled="registering"
                        ></v-text-field>

                        <v-text-field
                        v-model="lastName"
                        :counter="30"
                        :rules="nameRules"
                        label="Last Name"
                        required
                        :disabled="registering"
                        ></v-text-field>

                        <v-text-field
                        v-model="email"
                        :rules="emailRules"
                        label="E-mail"
                        required
                        :disabled="registering"
                        ></v-text-field>

                        <v-text-field
                            v-model="password"
                            :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                            :rules="passwordRules"
                            :type="showPassword ? 'text' : 'password'"
                            name="input-10-1"
                            label="Password"
                            hint="At least 8 characters"
                            counter
                            :disabled="registering"
                            @click:append="showPassword = !showPassword"
                        ></v-text-field>

                        <v-select
                        v-model="goals"
                        :items="goalItems"
                        :rules="[v => !!v || 'Please select a goal']"
                        label="What are your goals?"
                        required
                        :disabled="registering"
                        ></v-select>

                        <h3>Please check below to agree:</h3>
                        <v-checkbox
                        v-model="checkbox1"
                        :rules="[v => !!v || 'You must agree to continue!']"
                        label="Your credit card will be automatically billed. You can cancel at any time by calling 1(800)123-4567 or visiting www.nitroburn.com"
                        required
                        :disabled="registering"
                        ></v-checkbox>

                        <v-checkbox
                        v-model="checkbox2"
                        :rules="[v => !!v || 'You must agree to continue!']"
                        label="You acknowledge you have read, understand, and agree to the Nitroburn Terms and Conditions and Privacy Policy"
                        required
                        :disabled="registering"
                        ></v-checkbox>
                    </v-flex>
                    <v-divider vertical/>
                    <v-flex xs6>
                        <h3>Payment:</h3>
                        <v-text-field
                        v-model="card"
                        :rules="[v => !!v || 'Please enter card number']"
                        label="Card Number"
                        required
                        :disabled="registering"
                        ></v-text-field>

                        <v-text-field
                        v-model="expiration"
                        :rules="expRules"
                        label="Expiration (MM-YYYY)"
                        required
                        :disabled="registering"
                        ></v-text-field>

                        <v-text-field
                        v-model="cvv"
                        :rules="[v => !!v || 'Enter the card CVV']"
                        label="CVV"
                        required
                        :disabled="registering"
                        ></v-text-field>

                        <v-text-field
                        v-model="zip"
                        :rules="[v => !!v || 'Enter the card billing zip code']"
                        label="Billing Zip Code"
                        required
                        :disabled="registering"
                        ></v-text-field>                        
                    </v-flex>
                </v-layout>
            </v-form>
            <v-btn
                :disabled="!valid && !valid2"
                dark
                color="blue"
                @click="upgrade()"
                >
                <div v-if="!registering">
                Do it
                </div>
                <v-progress-circular
                v-if="registering"
                indeterminate
                color="primary"
                />
            </v-btn>

        </v-layout>
    </v-container>
</template>

<script>
import axios from 'axios'

import OktaAuth from '@okta/okta-auth-js'
import oktaAuthConfig from '@/.config.js'

export default {
    name: 'register',
    data: () => ({
        registering: false,
        user: false,
        valid: true,
        firstName: '',
        lastName: '',
        nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 30) || 'Name must be less than 30 characters'
        ],
        email: '',
        emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid'
        ],
        goals: null,
        goalItems: [
            'Lose weight',
            'Build strength',
            'Feel good about myself',
            'Get big',
            'Get fit',
            'Get ripped',
            'Get thin',
            'Run faster',
            'Jump higher',
            'Throw farther'
        ],
        checkbox1: false,
        checkbox2: false,
        showPassword: false,
        password: 'Password',
        passwordRules: [
        v => !!v || 'Create a password to signin',
        v => /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*])([a-zA-Z0-9!@#\$%\^&\*]+)$/.test(v) || 'Password must contain at least one upper-case letter, one lower-case letter, one number, and one symbol (!@#%^&*)',
        v => v.length >= 8 || 'Min 8 characters'
        ],
        valid2: true,
        card: '',
        expiration: '',
        expRules: [
            v => !!v || 'Please enter expiration month and year',
            v => /^(0[1-9]|1[0-2])-20[1-2][0-9]$/.test(v) || 'Please enter valid month and year'
        ],
        cvv: 'CVV',
        zip: '',
        authClient: false,
    }),
    mounted: function () {
        this.authClient = new OktaAuth({
            url: oktaAuthConfig.base_url || oktaAuthConfig.oidc.issuer.split('oauth2')[0],
            issuer: oktaAuthConfig.oidc.issuer,
            clientId: oktaAuthConfig.oidc.client_id,
            redirectUri: oktaAuthConfig.oidc.redirect_uri
        })
    },
    methods: {
        async upgrade () {
            if (this.$refs.form.validate()) {
                this.registering = true

                const body = {
                    username: this.email,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    password: this.password,
                    goals: this.goals,
                    zip: this.zip
                }
                if (oktaAuthConfig.isRunningLocal) body.mocksubdomain = oktaAuthConfig.mock_subdomain

                const accessToken = await this.$auth.getAccessToken()
                axios({
                    method: 'post',
                    url: 'https://' + oktaAuthConfig.bod_api + '/dev/unidemo/public/bod/register/' + this.user.sub,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + accessToken
                    },
                    data: body
                })
                .then((res) => {
                    var referrerPath = "/"
                    if (window.location.pathname) {
                        referrerPath = window.location.pathname
                        localStorage.setItem('referrerPath', window.location.pathname)
                    }
                    var scp = oktaAuthConfig.oidc.scope.split(' ')
                    const index = scp.indexOf('prospect')
                    if(index>-1) scp.splice(index, 1)
                    scp.push('customer')

                    this.authClient.token.getWithRedirect({
                        responseType: ['id_token', 'token'],
                        scopes: scp
                    })
                })
            }
        },
    },
    async created () {
        this.user = await this.$auth.getUser()
        if (this.user) {
            this.email = this.user.email
            this.firstName = this.user.given_name
            if (this.user.family_name && this.user.family_name != '!') this.lastName = this.user.family_name
        }
    }
}
</script>