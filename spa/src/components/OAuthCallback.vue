
<template>
  
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  name: 'OauthCallback',
  async beforeMount () {
    await this.$auth.handleLoginRedirect();
    let referrerPath = localStorage.getItem('referrerPath');
    if (!referrerPath) referrerPath = '/';
    console.log('referrerPath = ', referrerPath);
    window.location.href = referrerPath;
  }
})
</script>