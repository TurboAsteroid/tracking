<template>
  <div>
    <el-card>
      <div slot="header">
        <span class="title"><i v-bind:class='icon'></i> {{title}}</span>
      </div>
      <div class="msg">
        {{message}}
      </div>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'msgHelper',
  props: ['message', 'title', 'icon']
}
</script>
<style scoped>
.msg {
  font-size: 12px;
}
.title {
  font-size: 16px;
  font-weight: 600;
  color: #ff4136;
}
</style>
