<template>
  <div class="home">
    <div v-if="!this.$parent.$parent.$parent.authenticated">
    	<WelcomeComponent/>
      <BrowseComponent/>
    </div>
    <div v-if="this.$parent.$parent.$parent.authenticated">
		  <BrowseComponent/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import WelcomeComponent from '@/views/Welcome.vue'
import BrowseComponent from '@/views/Browse.vue'
export default {
  name: 'home',
  components: {
    WelcomeComponent,
    BrowseComponent
  },
  data: function () {
    return {
      claims: ''
    }
  },
  created () { this.setup() },
  methods: {
    async setup () {
      this.claims = await this.$auth.getUser()
    }
  }    
}
</script>
