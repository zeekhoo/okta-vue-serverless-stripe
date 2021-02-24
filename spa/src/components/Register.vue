<style scoped>
.bod-checkbox {
  font-size: 10px;
}
.already-member {
  color: orange;
}
.money-message {
  color: red;
  text-align: center;
}
</style>
<template>
  <v-container grid-list-xl>
    <v-layout column>
      <h3 class="money-message">{{ noMorePreviews }}</h3>
      <h6>&nbsp;</h6>
      <h4 class="already-member" v-if="!cardOnFile">
        Already a member?
        <a href="/login">Click</a> to login
      </h4>
      <h6>&nbsp;</h6>
      <v-form ref="form" v-model="valid" xlazy-validation>
        <v-layout row>
          <v-flex xs12>
            <div v-if="!cardOnFile">
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
                :rules="[(v) => !!v || 'Please select a goal']"
                label="What are your goals?"
                required
                :disabled="registering"
              ></v-select>
            </div>

            <h3>Please check below to agree:</h3>
            <v-checkbox
              class="bod-checkbox"
              v-model="checkbox1"
              :rules="[(v) => !!v || 'You must agree to continue!']"
              label="Your credit card will be automatically billed. You can cancel at any time by calling 1(800)123-4567 or visiting www.nitroburn.com"
              required
              :disabled="registering"
            ></v-checkbox>

            <v-checkbox
              v-model="checkbox2"
              :rules="[(v) => !!v || 'You must agree to continue!']"
              label="You acknowledge you have read, understand, and agree to the Nitroburn Terms and Conditions and Privacy Policy"
              required
              :disabled="registering"
            ></v-checkbox>
          </v-flex>
          <v-divider vertical v-if="!stripe" />
          <v-flex xs12 v-if="!stripe">
            <h3>Payment:</h3>
            <v-text-field
              v-model="card"
              :rules="[(v) => !!v || 'Please enter card number']"
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
              :rules="[(v) => !!v || 'Enter the card CVV']"
              label="CVV"
              required
              :disabled="registering"
            ></v-text-field>

            <v-text-field
              v-model="zip"
              :rules="[(v) => !!v || 'Enter the card billing zip code']"
              label="Billing Zip Code"
              required
              :disabled="registering"
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-form>
      <v-btn :disabled="!valid && !valid2" dark color="blue" @click="upgrade()">
        <div v-if="!registering">Next: Payment</div>
        <v-progress-circular v-if="registering" indeterminate color="primary" />
      </v-btn>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";

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
      (v) => !!v || "Name is required",
      (v) => (v && v.length <= 30) || "Name must be less than 30 characters",
    ],
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+/.test(v) || "E-mail must be valid",
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
      "Throw farther",
    ],
    checkbox1: false,
    checkbox2: false,
    showPassword: false,
    password: null,
    passwordRules: [
      (v) => !!v || "Create a password to signin",
      (v) =>
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*])([a-zA-Z0-9!@#\$%\^&\*]+)$/.test(
          v
        ) ||
        "Password must contain at least one upper-case letter, one lower-case letter, one number, and one symbol (!@#%^&*)",
      (v) => (v && v.length >= 8) || "Min 8 characters",
    ],
    valid2: true,
    card: "",
    expiration: "",
    expRules: [
      (v) => !!v || "Please enter expiration month and year",
      (v) =>
        /^(0[1-9]|1[0-2])-20[1-2][0-9]$/.test(v) ||
        "Please enter valid month and year",
    ],
    cvv: "CVV",
    zip: "",
    messages: null,
    stripe: false,
  }),
  computed: {
    cardOnFile() {
      return this.$root.$children[0].cardOnFile;
    },
    loggedIn() {
      return this.$root.$children[0].loggedIn;
    },
  },
  props: ["noMorePreviews"],
  async mounted() {
    this.appConfig = await this.$configs.getAppConfig();
    if (
      this.appConfig.stripe_publishable_key &&
      this.appConfig.stripe_publishable_key.length > 0
    ) {
      this.stripe = Stripe(this.appConfig.stripe_publishable_key);
    } else {
      // no Stripe integration. Use a bogus payments form.
      this.stripe = null;
    }
    try {
      this.user = await this.$auth.getUser();
    } catch {
      this.user = false;
    }
    if (this.user) {
      this.email = this.user.email;
      this.firstName = this.user.given_name;
      if (this.user.family_name && this.user.family_name != "!") {
        this.lastName = this.user.family_name;
      }
      if (this.user.goals && this.user.goals.length > 0) {
        this.goals = this.user.goals;
      }
    }
  },
  watch: {
    email: function () {
      this.messages = null;
    },
  },
  methods: {
    async subscribe(body) {
      const accessToken = await this.$auth.getAccessToken();
      const sub = this.user.sub;
      const res = await axios({
        method: "post",
        url: this.appConfig.bod_api + "/bod/api/subscribe/" + sub,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        data: body,
      });
      await this.proceedToPayment(res.data.stripeSessionId);
    },
    async upgrade() {
      if (this.$refs.form.validate()) {
        this.registering = true;
        try {
          let body = {
            username: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            password: this.password,
            goals: this.goals,
          };
          if (!this.user) {
            body.name = body.firstName + " " + body.lastName;
            const res = await axios({
              method: "post",
              url: this.appConfig.bod_api + "/bod/api/signup",
              data: body,
            });
            if (res.status == 201) {
              await this.handleSessionToken(res.data.sessionToken);
            } else {
              this.messages = "Email already taken";
              this.registering = false;
              return;
            }
          }

          await this.subscribe(body);
        } catch (e) {
          console.log(e);
        }
      }
    },
    async handleSessionToken(sessionToken) {
      const res = await this.$auth.token.getWithoutPrompt({
        sessionToken: sessionToken,
      });
      this.$auth.tokenManager.setTokens(res.tokens);
      this.user = await this.$auth.getUser();
    },
    async proceedToPayment(stripeSessionId) {
      if (!this.stripe) {
        //replace the "prosepct" scope with the "customer" scope
        let scp = this.appConfig.oidc.scopes.map((scp) => {
          if (scp == "prospect") {
            return "customer";
          } else {
            return scp;
          }
        });
        // then update tokens
        const res = await this.$auth.token.getWithoutPrompt({
          scopes: scp,
        });
        this.$auth.tokenManager.setTokens(res.tokens);
        window.location.href = "/";
      } else if (stripeSessionId) {
        this.stripe.redirectToCheckout({
          sessionId: stripeSessionId,
        });
      } else {
        window.location.href = "/";
      }
    },
  },
};
</script>