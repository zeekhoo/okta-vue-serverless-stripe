<style scoped>
.signup {
  background-image: url("../assets/img/bod-welcome.png");
  background-position: 420px 15px;
}
</style>

<template>
  <div id="welcome">
    <v-container grid-list-xl fluid>
      <v-layout row>
        <v-flex xs9>
          <div class="signup">
            <h2>Signup today for our best deals of the year!</h2>
            <h4>Receive your offer code by email</h4>
            <SignupComponent />
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>


<script>
import SignupComponent from "@/components/Signup.vue";
export default {
  components: {
    SignupComponent,
  },
};
</script>