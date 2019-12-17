<template>
  <div class="NHS">
    <div v-for="message in messages" :key="message.sap" style="padding: 4px">
      <msg :title='message.title' :message='message.body' :deviceid='message.deviceid' :sap='message.sap' v-if='!message.isAllowedRoad'/>
    </div>
  </div>
</template>
<script>
import S from '@/store'
import msg from '../../helpers/msg'
import { mapGetters } from 'vuex'
export default {
  name: 'NotificationHighSpeed',
  components: {
    msg
  },
  data () {
    return {
      messages: []
    }
  },
  watch: {
    devicesOnMap: function (val, oldVal) {
      this.messages = []
      for (var i = 0; i < val.length; i++) {
        if (val[i].options.speed > S.getters.settings.speedLimit) {
          this.messages.push({
            title: 'Внимание!',
            body:
              ' Превышение: ' +
              val[i].options.driver +
              '  Скорость: ' +
              parseInt(val[i].options.speed),
            deviceid: val[i].options.deviceid,
            sap: val[i].options.sap
          })
        }
      }
    }
  },
  computed: {
    ...mapGetters(['devicesOnMap'])
  }
}
</script>
<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.NHS {
  position: absolute;
  z-index: 10000;
  top: 10px;
  right: 10px;
  max-height: 400px;
}
</style>
