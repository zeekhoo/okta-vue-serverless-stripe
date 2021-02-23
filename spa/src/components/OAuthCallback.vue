
<template>
  
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  name: 'OauthCallback',
  async beforeMount () {
    await this.$auth.handleLoginRedirect();
    const referrerPath = localStorage.getItem('referrerPath');
    window.location.href = referrerPath ? referrerPath : '/';
  }
})
</script>