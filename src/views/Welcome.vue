<style scoped>
.signup {
  background-image: url('https://img1.beachbodyimages.com/beachbody/image/upload/ola/BBPP-2198/Girl_TShirt-n.jpg');
  background-position: 500px
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
              <SignupComponent/>
            </div>
          </v-flex>
        </v-layout>
    </v-container>
  </div>  
</template>


<script>
  import SignupComponent from '@/components/Signup.vue'
  export default {
    components: {
      SignupComponent
    }
  }
</script>