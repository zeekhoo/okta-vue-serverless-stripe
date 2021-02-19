<style scoped>
.bod-checkbox {
    font-size: 10px;
}
.already-member {
    color:orange;
}
.money-message {
    color: red;
    text-align: center;
}
</style>
<template>
    <v-container grid-list-xl>
        <v-layout column>
            <h3 class="money-message">{{noMorePreviews}}</h3>
            <h6>&nbsp;</h6>
            <h4 class="already-member">
                Already a member?
                <a href="/login">Click</a> to login
            </h4>
            <h6>&nbsp;</h6>
            <v-form ref="form" v-model="valid" lazy-validation>
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
                            :error-messages="messages"
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
                            class="bod-checkbox"
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
                    <v-divider vertical />
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
            <v-btn :disabled="!valid && !valid2" dark color="blue" @click="upgrade()">
                <div v-if="!registering">Do it</div>
                <v-progress-circular v-if="registering" indeterminate color="primary" />
            </v-btn>
        </v-layout>
    </v-container>
</template>

<script>
import axios from "axios";

// import OktaAuth from "@okta/okta-auth-js";
// import oktaAuthConfig from "@/.config.js";

export default {
    name: "register",
    data: () => ({
        appConfig: null,
        registering: false,
        user: undefined,
        valid: true,
        firstName: "",
        lastName: "",
        nameRules: [
            v => !!v || "Name is required",
            v => (v && v.length <= 30) || "Name must be less than 30 characters"
        ],
        email: "",
        emailRules: [
            v => !!v || "E-mail is required",
            v => /.+@.+/.test(v) || "E-mail must be valid"
        ],
        goals: null,
        goalItems: [
            "Lose weight",
            "Build strength",
            "Feel good about myself",
            "Get big",
            "Get fit",
            "Get ripped",
            "Get thin",
            "Run faster",
            "Jump higher",
            "Throw farther"
        ],
        checkbox1: false,
        checkbox2: false,
        showPassword: false,
        password: null,
        passwordRules: [
            v => !!v || "Create a password to signin",
            v =>
                /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*])([a-zA-Z0-9!@#\$%\^&\*]+)$/.test(
                    v
                ) ||
                "Password must contain at least one upper-case letter, one lower-case letter, one number, and one symbol (!@#%^&*)",
            v => v && v.length >= 8 || "Min 8 characters"
        ],
        valid2: true,
        card: "",
        expiration: "",
        expRules: [
            v => !!v || "Please enter expiration month and year",
            v =>
                /^(0[1-9]|1[0-2])-20[1-2][0-9]$/.test(v) ||
                "Please enter valid month and year"
        ],
        cvv: "CVV",
        zip: "",
        authClient: false,
        messages: null
    }),
    props: ["noMorePreviews"],
    mounted: async function() {
        this.appConfig = await this.$configs.getAppConfig();
        // this.authClient = new OktaAuth({
        //     url:
        //         this.appConfig.base_url ||
        //         this.appConfig.oidc.issuer.split("oauth2")[0],
        //     issuer: this.appConfig.oidc.issuer,
        //     clientId: this.appConfig.oidc.clientId,
        //     redirectUri: this.appConfig.oidc.redirectUri
        // });
    },
    watch: {
        email: function() {
            this.messages = null;
        }
    },
    methods: {
        async upgrade() {
            if (this.$refs.form.validate()) {
                this.registering = true;

                let body = {
                    username: this.email,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    password: this.password,
                    goals: this.goals,
                    zip: this.zip
                };
                if (this.appConfig.isRunningLocal)
                    body.mocksubdomain = this.appConfig.mock_subdomain;

                const accessToken = await this.$auth.getAccessToken();
                if (this.user) {
                    const sub = this.user.sub;
                    axios({
                        method: "post",
                        url:
                            this.appConfig.bod_api +
                            "/bod/api/register/" +
                            sub,
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + accessToken
                        },
                        data: body
                    }).then(res => {
                        this.getWithRedirect();
                    });
                } else {
                    body.name = body.firstName + " " + body.lastName;
                    axios({
                        method: "post",
                        url:
                            this.appConfig.bod_api +
                            "/bod/api/signup",
                        data: body
                    })
                        .then(res => {
                            if (res.status == 201) {
                                this.getWithRedirect(res.data.sessionToken);
                            } else {
                                this.messages = "Email already taken";
                                this.registering = false;
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }
            }
        },
        getWithRedirect(sessionToken) {
            if (window.location.pathname) {
                localStorage.setItem("referrerPath", window.location.pathname);
            }
            let scp = this.appConfig.oidc.scopes;
            const index = scp.indexOf("prospect");
            if (index > -1) scp.splice(index, 1);
            scp.push("customer");

            let requestOptions = {
                responseType: ["id_token", "token"],
                scopes: scp
            };
            if (sessionToken != undefined) {
                requestOptions.sessionToken = sessionToken;
            }
            this.$auth.token.getWithRedirect(requestOptions);
        }
    },
    async created() {
        try {
            this.user = await this.$auth.getUser();
        } catch {
            this.user = false;
        }
        if (this.user) {
            this.email = this.user.email;
            this.firstName = this.user.given_name;
            if (this.user.family_name && this.user.family_name != "!")
                this.lastName = this.user.family_name;
        }
    }
};
</script>