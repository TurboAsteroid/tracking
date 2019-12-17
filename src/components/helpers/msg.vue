<template>
  <div @click="toTracker">
    <el-card>
      <div slot="header">
        <span class="title"><i class="el-icon-warning"></i> {{title}}</span>
      </div>
      <div class="msg">
        {{sap}} {{deviceid}} {{message}}
      </div>
    </el-card>
  </div>
</template>
<script>
import S from '@/store'
export default {
  name: 'msg',
  props: ['message', 'title', 'deviceid', 'sap'],
  methods: {
    toTracker () {
      S.commit('setPair', {
        id: this.deviceid,
        sap: this.sap
      })
    }
  }
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
