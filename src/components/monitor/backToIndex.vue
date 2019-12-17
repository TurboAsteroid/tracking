<template>
    <el-button @click="back" class="backToIndex" :type='type'>На главную</el-button>
</template>

<script>
export default {
  name: 'backToIndex',
  props: [ 'type' ],
  methods: {
    back () {
      this.$router.push('/monitor')
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
  .backToIndex {
    position: absolute;
    z-index: 4100;
    top: 18px;
    left: 436px;
  }
</style>
