<template>
  <p class="help">{{text}}</p>
</template>
<script>
export default {
  name: 'msg',
  props: ['text']
}
</script>
<style scoped>
  .help {
    border: 1px solid #aaaaaa;
    border-radius: 3px;
    padding: 20px;
  }
</style>
